'use client';

import React, { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, LogIn } from 'lucide-react';
import { ThemedButton } from '@/components/ui/ThemedButton';
import { ThemedInput } from '@/components/ui/ThemedInput';
import { ThemedCard } from '@/components/ui/ThemedCard';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { AccountSelector } from './AccountSelector';
import { useMultiAccountAuth } from '@/hooks/useMultiAccountAuth';

interface MultiAccountLoginFormProps {
  onSuccess?: () => void;
  onShowRegister?: () => void;
}

export const MultiAccountLoginForm: React.FC<MultiAccountLoginFormProps> = ({
  onSuccess,
  onShowRegister
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{
    email?: string;
    password?: string;
  }>({});

  const {
    login,
    selectAccount,
    cancelSelection,
    accounts,
    showAccountSelector,
    loading,
    error,
    userProfile
  } = useMultiAccountAuth();

  // If login successful, call onSuccess
  React.useEffect(() => {
    if (userProfile && onSuccess) {
      onSuccess();
    }
  }, [userProfile, onSuccess]);

  const validateForm = (): boolean => {
    const errors: { email?: string; password?: string } = {};

    if (!email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (!password) {
      errors.password = 'Password is required';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    await login(email, password);
  };

  const handleAccountSelect = async (account: any) => {
    await selectAccount(account);
  };

  // Show account selector if multiple accounts found
  if (showAccountSelector && accounts.length > 0) {
    return (
      <AccountSelector
        accounts={accounts}
        onSelectAccount={handleAccountSelect}
        loading={loading}
        error={error}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <LogIn className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Welcome Back</h1>
          <p className="text-gray-600 mt-2">Sign in to your account</p>
        </div>

        <ThemedCard className="p-6">
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              {/* Global Error */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}

              {/* Email Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <ThemedInput
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="pl-10"
                    error={!!validationErrors.email}
                  />
                </div>
                {validationErrors.email && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.email}</p>
                )}
              </div>

              {/* Password Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <ThemedInput
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="pl-10 pr-10"
                    error={!!validationErrors.password}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    )}
                  </button>
                </div>
                {validationErrors.password && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.password}</p>
                )}
              </div>

              {/* Submit Button */}
              <ThemedButton
                type="submit"
                variant="primary"
                className="w-full"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center">
                    <LoadingSpinner size="sm" />
                    <span className="ml-2">Signing in...</span>
                  </div>
                ) : (
                  <>
                    <LogIn className="w-4 h-4 mr-2" />
                    Sign In
                  </>
                )}
              </ThemedButton>
            </div>
          </form>
        </ThemedCard>

        {/* Register Link */}
        {onShowRegister && (
          <p className="text-center text-sm text-gray-500 mt-6">
            Don't have an account?{' '}
            <button 
              onClick={onShowRegister}
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              Sign up here
            </button>
          </p>
        )}

        {/* Account Selection Cancel */}
        {showAccountSelector && (
          <div className="text-center mt-4">
            <ThemedButton
              variant="outline"
              onClick={cancelSelection}
            >
              Back to Login
            </ThemedButton>
          </div>
        )}
      </div>
    </div>
  );
};
