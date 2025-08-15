import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  collection, 
  query, 
  where, 
  getDocs,
  Timestamp,
  addDoc
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Company, User, CleanerProfile, COLLECTIONS } from '@/types/database';

export class CompanyService {
  private static instance: CompanyService;

  public static getInstance(): CompanyService {
    if (!CompanyService.instance) {
      CompanyService.instance = new CompanyService();
    }
    return CompanyService.instance;
  }

  private constructor() {}

  /**
   * Create a new company
   */
  public async createCompany(companyData: {
    name: string;
    email: string;
    phone?: string;
    ownerId: string;
    address?: {
      street: string;
      city: string;
      state: string;
      zipCode: string;
    };
  }): Promise<Company> {
    try {
      const companyId = doc(collection(db, COLLECTIONS.COMPANIES)).id;
      const inviteCode = this.generateInviteCode();

      const company: Company = {
        id: companyId,
        name: companyData.name,
        email: companyData.email,
        phone: companyData.phone,
        address: companyData.address,
        ownerId: companyData.ownerId,
        settings: {
          timezone: 'America/New_York',
          currency: 'USD',
          defaultServiceArea: [],
          branding: {
            primaryColor: '#7c2429',
            secondaryColor: '#991b1b'
          }
        },
        subscription: {
          plan: 'free',
          status: 'active'
        },
        inviteCode,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Filter out undefined values for Firestore
      const firestoreData = this.filterUndefinedValues({
        ...company,
        createdAt: Timestamp.fromDate(company.createdAt),
        updatedAt: Timestamp.fromDate(company.updatedAt)
      });

      await setDoc(doc(db, COLLECTIONS.COMPANIES, companyId), firestoreData);

      return company;
    } catch (error) {
      console.error('Error creating company:', error);
      throw error;
    }
  }

  /**
   * Get company by ID
   */
  public async getCompany(companyId: string): Promise<Company | null> {
    try {
      const docRef = doc(db, COLLECTIONS.COMPANIES, companyId);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        return null;
      }

      const data = docSnap.data();
      return {
        ...data,
        id: docSnap.id,
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate()
      } as Company;
    } catch (error) {
      console.error('Error getting company:', error);
      throw error;
    }
  }

  /**
   * Get company by invite code
   */
  public async getCompanyByInviteCode(inviteCode: string): Promise<Company | null> {
    try {
      const q = query(
        collection(db, COLLECTIONS.COMPANIES),
        where('inviteCode', '==', inviteCode)
      );
      
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        return null;
      }

      const doc = querySnapshot.docs[0];
      const data = doc.data();
      
      return {
        ...data,
        id: doc.id,
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate()
      } as Company;
    } catch (error) {
      console.error('Error getting company by invite code:', error);
      throw error;
    }
  }

  /**
   * Update company information
   */
  public async updateCompany(companyId: string, updates: Partial<Company>): Promise<void> {
    try {
      const docRef = doc(db, COLLECTIONS.COMPANIES, companyId);
      const updateData = {
        ...updates,
        updatedAt: Timestamp.fromDate(new Date())
      };

      // Remove id and dates that shouldn't be updated directly
      delete updateData.id;
      delete updateData.createdAt;

      await updateDoc(docRef, updateData);
    } catch (error) {
      console.error('Error updating company:', error);
      throw error;
    }
  }

  /**
   * Generate a unique invite code for the company
   */
  private generateInviteCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  /**
   * Regenerate invite code for a company
   */
  public async regenerateInviteCode(companyId: string): Promise<string> {
    try {
      const newInviteCode = this.generateInviteCode();
      await this.updateCompany(companyId, { inviteCode: newInviteCode });
      return newInviteCode;
    } catch (error) {
      console.error('Error regenerating invite code:', error);
      throw error;
    }
  }

  /**
   * Add a cleaner to a company
   */
  public async addCleanerToCompany(cleanerId: string, companyId: string): Promise<void> {
    try {
      // Update user's companyId
      const userRef = doc(db, COLLECTIONS.USERS, cleanerId);
      await updateDoc(userRef, {
        companyId,
        updatedAt: Timestamp.fromDate(new Date())
      });

      // Update cleaner profile
      const cleanerProfileRef = doc(db, COLLECTIONS.CLEANER_PROFILES, cleanerId);
      await updateDoc(cleanerProfileRef, {
        companyId,
        updatedAt: Timestamp.fromDate(new Date())
      });
    } catch (error) {
      console.error('Error adding cleaner to company:', error);
      throw error;
    }
  }

  /**
   * Remove a cleaner from a company
   */
  public async removeCleanerFromCompany(cleanerId: string): Promise<void> {
    try {
      // Remove companyId from user
      const userRef = doc(db, COLLECTIONS.USERS, cleanerId);
      await updateDoc(userRef, {
        companyId: null,
        updatedAt: Timestamp.fromDate(new Date())
      });

      // Remove companyId from cleaner profile
      const cleanerProfileRef = doc(db, COLLECTIONS.CLEANER_PROFILES, cleanerId);
      await updateDoc(cleanerProfileRef, {
        companyId: null,
        updatedAt: Timestamp.fromDate(new Date())
      });
    } catch (error) {
      console.error('Error removing cleaner from company:', error);
      throw error;
    }
  }

  /**
   * Get all cleaners for a company
   */
  public async getCompanyCleaners(companyId: string): Promise<User[]> {
    try {
      const q = query(
        collection(db, COLLECTIONS.USERS),
        where('companyId', '==', companyId),
        where('role', '==', 'cleaner')
      );

      const querySnapshot = await getDocs(q);
      const cleaners: User[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        cleaners.push({
          ...data,
          id: doc.id,
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate(),
          lastLoginAt: data.lastLoginAt?.toDate()
        } as User);
      });

      return cleaners;
    } catch (error) {
      console.error('Error getting company cleaners:', error);
      throw error;
    }
  }

  /**
   * Filter out undefined values from an object for Firestore compatibility
   */
  private filterUndefinedValues(obj: any): any {
    const filtered: any = {};
    
    for (const [key, value] of Object.entries(obj)) {
      if (value !== undefined) {
        if (value !== null && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date) && !(value as any)?.toDate) {
          // Recursively filter nested objects, but skip Firestore Timestamps
          filtered[key] = this.filterUndefinedValues(value);
        } else {
          filtered[key] = value;
        }
      }
    }
    
    return filtered;
  }
}
