import { 
  collection, 
  query, 
  where, 
  getDocs,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  Timestamp
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { COLLECTIONS } from '@/types/database';
import { UserProfile } from './AuthService';

export interface AccountOption {
  uid: string;
  email: string;
  firebaseEmail?: string; // The actual Firebase Auth email (may be different for additional accounts)
  firstName: string;
  lastName: string;
  role: 'company_owner' | 'company_admin' | 'cleaner';
  companyId?: string;
  companyName?: string;
  isActive: boolean;
  lastLoginAt?: Date;
}

export interface MultiAccountData {
  email: string;
  accounts: AccountOption[];
  lastSelectedAccount?: string;
}

export class MultiAccountService {
  private static instance: MultiAccountService;

  public static getInstance(): MultiAccountService {
    if (!MultiAccountService.instance) {
      MultiAccountService.instance = new MultiAccountService();
    }
    return MultiAccountService.instance;
  }

  private constructor() {}

  /**
   * Get all accounts for a given email address
   */
  public async getAccountsByEmail(email: string): Promise<AccountOption[]> {
    try {
      console.log('🔍 MultiAccount: Searching for accounts with email:', email);
      
      const q = query(
        collection(db, COLLECTIONS.USERS),
        where('email', '==', email.toLowerCase().trim())
      );

      const querySnapshot = await getDocs(q);
      const accounts: AccountOption[] = [];

      for (const docSnap of querySnapshot.docs) {
        const userData = docSnap.data();
        
        // Get company name if user has a company
        let companyName: string | undefined;
        if (userData.companyId) {
          try {
            const companyDoc = await getDoc(doc(db, COLLECTIONS.COMPANIES, userData.companyId));
            if (companyDoc.exists()) {
              companyName = companyDoc.data().name;
            }
          } catch (error) {
            console.warn('Failed to fetch company name:', error);
          }
        }

        const account: AccountOption = {
          uid: docSnap.id,
          email: userData.email,
          firebaseEmail: userData.firebaseEmail || userData.email, // Use firebaseEmail if available, fallback to email
          firstName: userData.firstName,
          lastName: userData.lastName,
          role: userData.role,
          companyId: userData.companyId,
          companyName,
          isActive: userData.isActive,
          lastLoginAt: userData.lastLoginAt?.toDate()
        };

        accounts.push(account);
      }

      console.log(`📊 MultiAccount: Found ${accounts.length} accounts for email:`, email);
      return accounts;
    } catch (error) {
      console.error('💥 MultiAccount: Error getting accounts by email:', error);
      throw error;
    }
  }

  /**
   * Check if email has multiple accounts
   */
  public async hasMultipleAccounts(email: string): Promise<boolean> {
    const accounts = await this.getAccountsByEmail(email);
    return accounts.length > 1;
  }

  /**
   * Store user's last selected account preference
   */
  public async setLastSelectedAccount(email: string, accountUid: string): Promise<void> {
    try {
      const multiAccountId = this.getMultiAccountId(email);
      
      await setDoc(doc(db, 'multi_accounts', multiAccountId), {
        email: email.toLowerCase().trim(),
        lastSelectedAccount: accountUid,
        updatedAt: Timestamp.fromDate(new Date())
      }, { merge: true });

      console.log('✅ MultiAccount: Last selected account saved:', accountUid);
    } catch (error) {
      console.error('💥 MultiAccount: Error saving last selected account:', error);
      // Don't throw - this is not critical
    }
  }

  /**
   * Get user's last selected account preference
   */
  public async getLastSelectedAccount(email: string): Promise<string | null> {
    try {
      const multiAccountId = this.getMultiAccountId(email);
      const docSnap = await getDoc(doc(db, 'multi_accounts', multiAccountId));
      
      if (docSnap.exists()) {
        return docSnap.data().lastSelectedAccount || null;
      }
      
      return null;
    } catch (error) {
      console.warn('MultiAccount: Error getting last selected account:', error);
      return null;
    }
  }

  /**
   * Create a unique ID for multi-account document based on email
   */
  private getMultiAccountId(email: string): string {
    return email.toLowerCase().trim().replace(/[^a-zA-Z0-9]/g, '_');
  }

  /**
   * Update account last login time
   */
  public async updateAccountLastLogin(accountUid: string): Promise<void> {
    try {
      await updateDoc(doc(db, COLLECTIONS.USERS, accountUid), {
        lastLoginAt: Timestamp.fromDate(new Date())
      });
    } catch (error) {
      console.warn('MultiAccount: Error updating last login time:', error);
      // Don't throw - this is not critical
    }
  }

  /**
   * Get account display name
   */
  public getAccountDisplayName(account: AccountOption): string {
    const name = `${account.firstName} ${account.lastName}`.trim() || account.email;
    const roleText = this.getRoleDisplayText(account.role);
    const companyText = account.companyName ? ` at ${account.companyName}` : '';
    
    return `${name} (${roleText}${companyText})`;
  }

  /**
   * Get role display text
   */
  private getRoleDisplayText(role: string): string {
    switch (role) {
      case 'company_owner':
        return 'Owner';
      case 'company_admin':
        return 'Admin';
      case 'cleaner':
        return 'Cleaner';
      default:
        return role;
    }
  }

  /**
   * Sort accounts by priority (owner > admin > cleaner, then by last login)
   */
  public sortAccountsByPriority(accounts: AccountOption[]): AccountOption[] {
    const rolePriority = {
      'company_owner': 3,
      'company_admin': 2,
      'cleaner': 1
    };

    return accounts.sort((a, b) => {
      // First sort by role priority
      const roleDiff = (rolePriority[b.role] || 0) - (rolePriority[a.role] || 0);
      if (roleDiff !== 0) return roleDiff;

      // Then by last login (most recent first)
      const aLastLogin = a.lastLoginAt?.getTime() || 0;
      const bLastLogin = b.lastLoginAt?.getTime() || 0;
      return bLastLogin - aLastLogin;
    });
  }
}
