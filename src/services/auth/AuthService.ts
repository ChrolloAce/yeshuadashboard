import { 
  User, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail,
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
  setPersistence,
  browserLocalPersistence
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, Timestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { COLLECTIONS } from '@/types/database';

export interface UserProfile {
  uid: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'company_owner' | 'company_admin' | 'cleaner';
  phone?: string;
  avatar?: string;
  companyId?: string;
  isActive: boolean;
  permissions?: string[];
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: 'company_owner' | 'cleaner';
  phone?: string;
  // For company owners
  companyName?: string;
  // For cleaners
  inviteCode?: string;
}

export class AuthService {
  private static instance: AuthService;
  private currentUser: User | null = null;
  private userProfile: UserProfile | null = null;
  private listeners: Set<(user: User | null, profile: UserProfile | null) => void> = new Set();
  private googleProvider!: GoogleAuthProvider;
  private isInitialized: boolean = false;

  private constructor() {
    this.initializeAuth();
  }

  private async initializeAuth(): Promise<void> {
    try {
      // Set persistence to local storage for login state preservation
      await setPersistence(auth, browserLocalPersistence);
      console.log('Firebase persistence set to local storage');
    } catch (error) {
      console.warn('Failed to set Firebase persistence:', error);
    }

    // Initialize Google provider
    this.googleProvider = new GoogleAuthProvider();
    this.googleProvider.addScope('email');
    this.googleProvider.addScope('profile');
    
    // Configure for better popup handling
    this.googleProvider.setCustomParameters({
      prompt: 'select_account'
    });

    // Listen to auth state changes for automatic login restoration
    onAuthStateChanged(auth, async (user) => {
      console.log('Auth state changed:', user ? `User: ${user.uid}` : 'No user');
      this.currentUser = user;
      
      if (user) {
        // Load user profile from Firestore
        console.log('Loading user profile...');
        const existingProfile = await this.loadUserProfile(user.uid);
        
        // Debug: Log profile details
        if (existingProfile) {
          console.log('Profile details:', {
            hasCompanyId: !!existingProfile.companyId,
            companyId: existingProfile.companyId,
            companyIdType: typeof existingProfile.companyId,
            role: existingProfile.role
          });
        }
        
        // Migration: If existing user doesn't have companyId, create company (regardless of role)
        if (existingProfile && (!existingProfile.companyId || existingProfile.companyId === null || existingProfile.companyId === undefined)) {
          console.log('🔄 Main auth: Migrating existing user to have companyId...');
          try {
            const { CompanyService } = await import('../company/CompanyService');
            const companyService = CompanyService.getInstance();
            
            // Create company for any existing user without one
            const company = await companyService.createCompany({
              name: `${existingProfile.firstName} ${existingProfile.lastName}'s Company`,
              email: existingProfile.email,
              ownerId: user.uid
            });
            
            // Update existing profile with companyId and set role to company_owner
            await updateDoc(doc(db, COLLECTIONS.USERS, user.uid), {
              companyId: company.id,
              role: 'company_owner', // Make them company owner of their new company
              updatedAt: Timestamp.fromDate(new Date())
            });
            
            existingProfile.companyId = company.id;
            existingProfile.role = 'company_owner'; // Update local profile too
            this.userProfile = existingProfile;
            this.notifyListeners();
            console.log('✅ Main auth: Existing user migrated with companyId:', company.id);
          } catch (error) {
            console.error('Error during user migration:', error);
          }
        }
        
        // If no profile exists, create a basic one
        if (!existingProfile && user.email) {
          console.log('No profile found, creating basic profile...');
          const names = (user.displayName || user.email.split('@')[0]).split(' ');
          const firstName = names[0] || '';
          const lastName = names.slice(1).join(' ') || '';

          const basicProfile = {
            uid: user.uid,
            email: user.email,
            firstName,
            lastName,
            role: 'company_owner' as const, // Default to company owner for Google sign-ins
            avatar: user.photoURL || undefined,
            isActive: true,
            permissions: [],
            lastLoginAt: new Date(),
            createdAt: new Date(),
            updatedAt: new Date()
          };

          try {
            await setDoc(doc(db, COLLECTIONS.USERS, user.uid), {
              ...basicProfile,
              createdAt: Timestamp.fromDate(basicProfile.createdAt),
              updatedAt: Timestamp.fromDate(basicProfile.updatedAt),
              lastLoginAt: Timestamp.fromDate(basicProfile.lastLoginAt!)
            });
            this.userProfile = basicProfile;
            console.log('Basic user profile created');
          } catch (error) {
            console.error('Failed to create basic profile:', error);
          }
        }
        
        console.log('User profile loaded:', this.userProfile);
      } else {
        this.userProfile = null;
      }
      
      // Mark as initialized after first auth state change
      this.isInitialized = true;
      
      // Notify all listeners
      this.notifyListeners();
    });
  }

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }



  public async login(credentials: LoginCredentials): Promise<UserProfile> {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth, 
        credentials.email, 
        credentials.password
      );
      
      await this.loadUserProfile(userCredential.user.uid);
      
      if (!this.userProfile) {
        throw new Error('User profile not found');
      }
      
      return this.userProfile;
    } catch (error: any) {
      throw new Error(this.getAuthErrorMessage(error.code));
    }
  }

  public async loginWithGoogle(): Promise<UserProfile> {
    try {
      console.log('Starting Google sign-in...');
      
      // Use signInWithPopup with timeout
      const result = await Promise.race([
        signInWithPopup(auth, this.googleProvider),
        new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error('Google sign-in timeout')), 30000)
        )
      ]);
      
      const user = result.user;
      console.log('Google sign-in successful:', user.uid);

      // Optimistically set user profile from Google data
      const names = (user.displayName || '').split(' ');
      const firstName = names[0] || '';
      const lastName = names.slice(1).join(' ') || '';

      const tempProfile: UserProfile = {
        uid: user.uid,
        email: user.email || '',
        firstName,
        lastName,
        role: 'company_owner', // Default to company owner for Google sign-ins
        avatar: user.photoURL || undefined,
        isActive: true,
        permissions: [],
        lastLoginAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Set profile immediately for faster UI response
      this.userProfile = tempProfile;
      this.notifyListeners();

      // Check if user profile exists in background
      try {
        const existingProfile = await this.loadUserProfile(user.uid);
        
        // Migration: If existing user doesn't have companyId, create company (regardless of role)
        if (existingProfile && (!existingProfile.companyId || existingProfile.companyId === null || existingProfile.companyId === undefined)) {
          console.log('🔄 Google sign-in: Migrating existing user to have companyId...');
          const { CompanyService } = await import('../company/CompanyService');
          const companyService = CompanyService.getInstance();
          
          // Create company for any existing user without one
          const company = await companyService.createCompany({
            name: `${existingProfile.firstName} ${existingProfile.lastName}'s Company`,
            email: existingProfile.email,
            ownerId: user.uid
          });
          
          // Update existing profile with companyId and set role to company_owner
          await updateDoc(doc(db, COLLECTIONS.USERS, user.uid), {
            companyId: company.id,
            role: 'company_owner', // Make them company owner of their new company
            updatedAt: Timestamp.fromDate(new Date())
          });
          
          existingProfile.companyId = company.id;
          existingProfile.role = 'company_owner'; // Update local profile too
          this.userProfile = existingProfile;
          this.notifyListeners();
          console.log('✅ Google sign-in: Existing user migrated with companyId:', company.id);
        }
        
        if (!existingProfile) {
          console.log('Creating new user profile and company in background...');
          
          // Create company first for company owners
          let companyId: string | undefined;
          if (tempProfile.role === 'company_owner') {
            const { CompanyService } = await import('../company/CompanyService');
            const companyService = CompanyService.getInstance();
            
            const company = await companyService.createCompany({
              name: `${tempProfile.firstName} ${tempProfile.lastName}'s Company`,
              email: tempProfile.email,
              ownerId: user.uid
            });
            
            companyId = company.id;
            console.log('Company created:', companyId);
          }

          // Update profile with companyId
          const profileWithCompany: UserProfile = {
            ...tempProfile,
            companyId,
            createdAt: new Date(),
            updatedAt: new Date()
          };

          // Create profile in Firestore
          await setDoc(doc(db, COLLECTIONS.USERS, user.uid), {
            ...profileWithCompany,
            createdAt: Timestamp.fromDate(profileWithCompany.createdAt),
            updatedAt: Timestamp.fromDate(profileWithCompany.updatedAt),
            lastLoginAt: Timestamp.fromDate(profileWithCompany.lastLoginAt!)
          });
          
          this.userProfile = profileWithCompany;
          this.notifyListeners();
          console.log('User profile created successfully with companyId:', companyId);
        }
      } catch (error) {
        console.warn('Profile check failed, using temporary profile:', error);
      }

      return this.userProfile;
    } catch (error: any) {
      console.error('Google sign-in error:', error);
      
      // Handle specific errors
      if (error.message === 'Google sign-in timeout') {
        throw new Error('Google sign-in is taking too long. Please try again.');
      }
      
      if (error.code === 'auth/popup-blocked' || error.code === 'auth/popup-closed-by-user') {
        throw new Error('Google sign-in was blocked. Please allow popups and try again.');
      }
      
      if (error.code === 'auth/network-request-failed') {
        throw new Error('Network error. Please check your connection and try again.');
      }
      
      throw new Error(this.getAuthErrorMessage(error.code));
    }
  }

  public async register(data: RegisterData): Promise<UserProfile> {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        data.email,
        data.password
      );

      const user = userCredential.user;

      // Update display name
      await updateProfile(user, {
        displayName: `${data.firstName} ${data.lastName}`
      });

      let companyId: string | undefined;

      // Handle company owner registration
      if (data.role === 'company_owner') {
        if (!data.companyName) {
          throw new Error('Company name is required for company owners');
        }

        // Create company
        const { CompanyService } = await import('../company/CompanyService');
        const companyService = CompanyService.getInstance();
        
        const company = await companyService.createCompany({
          name: data.companyName,
          email: data.email,
          phone: data.phone,
          ownerId: user.uid
        });

        companyId = company.id;
      }

      // Handle cleaner registration
      if (data.role === 'cleaner') {
        // Validate invite code if provided
        if (data.inviteCode) {
          const { CompanyService } = await import('../company/CompanyService');
          const companyService = CompanyService.getInstance();
          
          const company = await companyService.getCompanyByInviteCode(data.inviteCode);
          if (company) {
            companyId = company.id;
          } else {
            throw new Error('Invalid invite code');
          }
        }

        // Create cleaner profile
        const { CleanerService } = await import('../cleaner/CleanerService');
        const cleanerService = CleanerService.getInstance();
        
        await cleanerService.createCleanerProfile(user.uid, {
          skills: [],
          certifications: [],
        });
      }

      // Create user profile in Firestore
      const userProfile: UserProfile = {
        uid: user.uid,
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        role: data.role,
        phone: data.phone,
        companyId,
        isActive: true,
        permissions: [],
        lastLoginAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await setDoc(doc(db, COLLECTIONS.USERS, user.uid), {
        ...userProfile,
        createdAt: Timestamp.fromDate(userProfile.createdAt),
        updatedAt: Timestamp.fromDate(userProfile.updatedAt),
        lastLoginAt: Timestamp.fromDate(userProfile.lastLoginAt!)
      });

      this.userProfile = userProfile;
      return userProfile;
    } catch (error: any) {
      console.error('Registration error:', error);
      throw new Error(error.message || this.getAuthErrorMessage(error.code));
    }
  }

  public async logout(): Promise<void> {
    try {
      await signOut(auth);
      this.userProfile = null;
    } catch (error) {
      throw new Error('Failed to logout');
    }
  }

  public async updateUserProfile(updates: Partial<UserProfile>): Promise<void> {
    if (!this.currentUser || !this.userProfile) {
      throw new Error('No authenticated user');
    }

    try {
      const updatedProfile = {
        ...updates,
        updatedAt: new Date()
      };

      await updateDoc(doc(db, 'users', this.currentUser.uid), updatedProfile);

      // Update display name if firstName or lastName changed
      if (updates.firstName || updates.lastName) {
        const firstName = updates.firstName || this.userProfile.firstName;
        const lastName = updates.lastName || this.userProfile.lastName;
        await updateProfile(this.currentUser, {
          displayName: `${firstName} ${lastName}`
        });
      }

      // Reload profile
      await this.loadUserProfile(this.currentUser.uid);
    } catch (error) {
      throw new Error('Failed to update profile');
    }
  }

  public async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    if (!this.currentUser || !this.currentUser.email) {
      throw new Error('No authenticated user');
    }

    try {
      // Re-authenticate user
      const credential = EmailAuthProvider.credential(
        this.currentUser.email,
        currentPassword
      );
      await reauthenticateWithCredential(this.currentUser, credential);

      // Update password
      await updatePassword(this.currentUser, newPassword);
    } catch (error: any) {
      throw new Error(this.getAuthErrorMessage(error.code));
    }
  }

  public async resetPassword(email: string): Promise<void> {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error: any) {
      throw new Error(this.getAuthErrorMessage(error.code));
    }
  }

  public getCurrentUser(): User | null {
    return this.currentUser;
  }

  public getUserProfile(): UserProfile | null {
    return this.userProfile;
  }

  public isAuthenticated(): boolean {
    return !!this.currentUser;
  }

  public hasRole(role: UserProfile['role']): boolean {
    return this.userProfile?.role === role;
  }

  public isCompanyOwner(): boolean {
    return this.hasRole('company_owner');
  }

  public isCompanyAdmin(): boolean {
    return this.hasRole('company_admin');
  }

  public isCleaner(): boolean {
    return this.hasRole('cleaner');
  }

  public isCompanyUser(): boolean {
    return this.isCompanyOwner() || this.isCompanyAdmin();
  }

  public hasCompany(): boolean {
    return !!this.userProfile?.companyId;
  }

  // Legacy method for backward compatibility
  public isAdmin(): boolean {
    return this.isCompanyOwner() || this.isCompanyAdmin();
  }



  public isAuthInitialized(): boolean {
    return this.isInitialized;
  }

  public subscribe(listener: (user: User | null, profile: UserProfile | null) => void): () => void {
    this.listeners.add(listener);
    // Immediately call with current state
    listener(this.currentUser, this.userProfile);
    
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => {
      listener(this.currentUser, this.userProfile);
    });
  }

  private async loadUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      const docRef = doc(db, COLLECTIONS.USERS, userId);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        return null;
      }

      const data = docSnap.data();
      const profile: UserProfile = {
        ...data,
        uid: docSnap.id,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
        lastLoginAt: data.lastLoginAt?.toDate()
      } as UserProfile;

      this.userProfile = profile;
      return profile;
    } catch (error) {
      console.error('Error loading user profile:', error);
      return null;
    }
  }

  private getAuthErrorMessage(errorCode: string): string {
    switch (errorCode) {
      case 'auth/user-not-found':
        return 'No account found with this email address';
      case 'auth/wrong-password':
        return 'Incorrect password';
      case 'auth/email-already-in-use':
        return 'An account with this email already exists';
      case 'auth/weak-password':
        return 'Password should be at least 6 characters';
      case 'auth/invalid-email':
        return 'Invalid email address';
      case 'auth/too-many-requests':
        return 'Too many failed attempts. Please try again later';
      case 'auth/requires-recent-login':
        return 'Please log in again to perform this action';
      default:
        return 'Authentication failed. Please try again';
    }
  }
}
