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
      
      // If we reach here, it means single account - proceed normally
      setUserProfile(result);
      setShowAccountSelector(false);
    } catch (err: any) {
      console.error('Multi-account Google login error:', err);
      
      if (err.message === 'MULTIPLE_ACCOUNTS') {
        // Handle multiple accounts case
        console.log('🔄 Google login detected multiple accounts, showing selector...');
        
        const googleEmail = authService.getPendingGoogleEmail();
        if (googleEmail) {
          try {
            const userAccounts = await multiAccountService.getAccountsByEmail(googleEmail);
            const sortedAccounts = multiAccountService.sortAccountsByPriority(userAccounts);
            setAccounts(sortedAccounts);
            setShowAccountSelector(true);
            setError(null); // Clear any previous errors
          } catch (accountError) {
            setError('Failed to load account options. Please try again.');
          }
        } else {
          setError('Multiple accounts detected. Please use email login to select your account.');
        }
      } else {
        setError(err.message || 'Google login failed');
      }
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
