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
  updatePassword
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

export interface UserProfile {
  uid: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'cleaner' | 'customer';
  phone?: string;
  avatar?: string;
  teamId?: string;
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
  role: 'admin' | 'cleaner' | 'customer';
  phone?: string;
  teamId?: string;
}

export class AuthService {
  private static instance: AuthService;
  private currentUser: User | null = null;
  private userProfile: UserProfile | null = null;
  private listeners: Set<(user: User | null, profile: UserProfile | null) => void> = new Set();
  private googleProvider: GoogleAuthProvider;

  private constructor() {
    // Initialize Google provider
    this.googleProvider = new GoogleAuthProvider();
    this.googleProvider.addScope('email');
    this.googleProvider.addScope('profile');
    
    // Configure for better popup handling
    this.googleProvider.setCustomParameters({
      prompt: 'select_account'
    });
    // Listen to auth state changes
    onAuthStateChanged(auth, async (user) => {
      console.log('Auth state changed:', user ? `User: ${user.uid}` : 'No user');
      this.currentUser = user;
      
      if (user) {
        // Load user profile from Firestore
        console.log('Loading user profile...');
        await this.loadUserProfile(user.uid);
        console.log('User profile loaded:', this.userProfile);
      } else {
        this.userProfile = null;
      }
      
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

  private async loadUserProfile(uid: string): Promise<UserProfile | null> {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists()) {
        const data = userDoc.data();
        const profile = {
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as UserProfile;
        
        this.userProfile = profile;
        return profile;
      }
      return null;
    } catch (error) {
      console.error('Error loading user profile:', error);
      return null;
    }
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
        role: 'customer',
        avatar: user.photoURL || undefined,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Set profile immediately for faster UI response
      this.userProfile = tempProfile;
      this.notifyListeners();

      // Check if user profile exists in background
      try {
        const existingProfile = await this.loadUserProfile(user.uid);
        if (!existingProfile) {
          console.log('Creating new user profile in background...');
          // Create profile in background without blocking UI
          setDoc(doc(db, 'users', user.uid), tempProfile).catch(error => {
            console.error('Failed to save user profile:', error);
          });
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

      // Create user profile in Firestore
      const userProfile: UserProfile = {
        uid: user.uid,
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        role: data.role,
        phone: data.phone,
        teamId: data.teamId,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await setDoc(doc(db, 'users', user.uid), {
        ...userProfile,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      this.userProfile = userProfile;
      return userProfile;
    } catch (error: any) {
      throw new Error(this.getAuthErrorMessage(error.code));
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

  public isAdmin(): boolean {
    return this.hasRole('admin');
  }

  public isCleaner(): boolean {
    return this.hasRole('cleaner');
  }

  public isCustomer(): boolean {
    return this.hasRole('customer');
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
