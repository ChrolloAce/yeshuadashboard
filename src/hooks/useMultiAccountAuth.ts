import { useState, useCallback } from 'react';
import { AuthService, UserProfile } from '@/services/auth/AuthService';
import { MultiAccountService, AccountOption } from '@/services/auth/MultiAccountService';

interface UseMultiAccountAuthResult {
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  selectAccount: (account: AccountOption) => Promise<void>;
  cancelSelection: () => void;
  accounts: AccountOption[];
  showAccountSelector: boolean;
  loading: boolean;
  error: string | null;
  userProfile: UserProfile | null;
}

export const useMultiAccountAuth = (): UseMultiAccountAuthResult => {
  const [accounts, setAccounts] = useState<AccountOption[]>([]);
  const [showAccountSelector, setShowAccountSelector] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  const authService = AuthService.getInstance();
  const multiAccountService = MultiAccountService.getInstance();

  const login = useCallback(async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);

      const result = await authService.login({ email, password });

      if (result === 'MULTIPLE_ACCOUNTS') {
        // Get accounts for selection
        const userAccounts = await authService.getAccountsForPendingLogin();
        const sortedAccounts = multiAccountService.sortAccountsByPriority(userAccounts);
        
        setAccounts(sortedAccounts);
        setShowAccountSelector(true);
      } else {
        // Single account login successful
        setUserProfile(result);
        setShowAccountSelector(false);
      }
    } catch (err: any) {
      console.error('Multi-account login error:', err);
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  }, [authService, multiAccountService]);

  const selectAccount = useCallback(async (account: AccountOption) => {
    try {
      setLoading(true);
      setError(null);

      const profile = await authService.loginWithSelectedAccount(account.uid);
      
      setUserProfile(profile);
      setShowAccountSelector(false);
      setAccounts([]);
    } catch (err: any) {
      console.error('Account selection error:', err);
      setError(err.message || 'Failed to select account');
    } finally {
      setLoading(false);
    }
  }, [authService]);

  const loginWithGoogle = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await authService.loginWithGoogle();
      
      // Check if there are multiple accounts for this email
      if (result && result.email) {
        const userAccounts = await multiAccountService.getAccountsByEmail(result.email);
        
        if (userAccounts.length > 1) {
          const sortedAccounts = multiAccountService.sortAccountsByPriority(userAccounts);
          setAccounts(sortedAccounts);
          setShowAccountSelector(true);
        } else {
          // Single account, proceed normally
          setUserProfile(result);
          setShowAccountSelector(false);
        }
      } else {
        setUserProfile(result);
        setShowAccountSelector(false);
      }
    } catch (err: any) {
      console.error('Multi-account Google login error:', err);
      setError(err.message || 'Google login failed');
    } finally {
      setLoading(false);
    }
  }, [authService, multiAccountService]);

  const cancelSelection = useCallback(() => {
    authService.cancelAccountSelection();
    setShowAccountSelector(false);
    setAccounts([]);
    setError(null);
  }, [authService]);

  return {
    login,
    loginWithGoogle,
    selectAccount,
    cancelSelection,
    accounts,
    showAccountSelector,
    loading,
    error,
    userProfile
  };
};
