import { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { AuthService, UserProfile, LoginCredentials, RegisterData } from '@/services/auth/AuthService';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const authService = AuthService.getInstance();

  useEffect(() => {
    const unsubscribe = authService.subscribe((user, profile) => {
      setUser(user);
      setUserProfile(profile);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = async (credentials: LoginCredentials): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      await authService.login(credentials);
    } catch (error: any) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (data: RegisterData): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      await authService.register(data);
    } catch (error: any) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      await authService.loginWithGoogle();
    } catch (error: any) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      await authService.logout();
    } catch (error: any) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>): Promise<void> => {
    try {
      setError(null);
      await authService.updateUserProfile(updates);
    } catch (error: any) {
      setError(error.message);
      throw error;
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string): Promise<void> => {
    try {
      setError(null);
      await authService.changePassword(currentPassword, newPassword);
    } catch (error: any) {
      setError(error.message);
      throw error;
    }
  };

  const resetPassword = async (email: string): Promise<void> => {
    try {
      setError(null);
      await authService.resetPassword(email);
    } catch (error: any) {
      setError(error.message);
      throw error;
    }
  };

  const clearError = (): void => {
    setError(null);
  };

  return {
    user,
    userProfile,
    loading,
    error,
    isAuthenticated: !loading && !!user, // Only consider authenticated after loading is complete
    isAdmin: !loading && authService.isAdmin(),
    isCleaner: !loading && authService.isCleaner(),
    isCustomer: !loading && authService.isCustomer(),
    login,
    loginWithGoogle,
    register,
    logout,
    updateProfile,
    changePassword,
    resetPassword,
    clearError
  };
};
