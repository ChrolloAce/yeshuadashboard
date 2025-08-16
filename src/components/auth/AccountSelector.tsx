'use client';

import React, { useState } from 'react';
import { User, Building, Crown, Shield, Users, ChevronRight, Clock } from 'lucide-react';
import { ThemedButton } from '@/components/ui/ThemedButton';
import { ThemedCard } from '@/components/ui/ThemedCard';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { AccountOption } from '@/services/auth/MultiAccountService';

interface AccountSelectorProps {
  accounts: AccountOption[];
  onSelectAccount: (account: AccountOption) => void;
  loading?: boolean;
  error?: string | null;
}

export const AccountSelector: React.FC<AccountSelectorProps> = ({
  accounts,
  onSelectAccount,
  loading = false,
  error = null
}) => {
  const [selectedAccount, setSelectedAccount] = useState<AccountOption | null>(null);

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'company_owner':
        return <Crown className="w-5 h-5 text-yellow-600" />;
      case 'company_admin':
        return <Shield className="w-5 h-5 text-blue-600" />;
      case 'cleaner':
        return <Users className="w-5 h-5 text-green-600" />;
      default:
        return <User className="w-5 h-5 text-gray-600" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'company_owner':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'company_admin':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      case 'cleaner':
        return 'bg-green-50 border-green-200 text-green-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const getRoleText = (role: string) => {
    switch (role) {
      case 'company_owner':
        return 'Company Owner';
      case 'company_admin':
        return 'Administrator';
      case 'cleaner':
        return 'Cleaner';
      default:
        return role;
    }
  };

  const formatLastLogin = (lastLogin?: Date) => {
    if (!lastLogin) return 'Never';
    
    const now = new Date();
    const diffMs = now.getTime() - lastLogin.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return lastLogin.toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-2xl w-full">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-primary-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <User className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Choose Your Account</h1>
          <p className="text-lg text-gray-600 max-w-md mx-auto">
            You have multiple accounts with this email. Select which one to use:
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {/* Account List */}
        <div className="max-w-lg mx-auto space-y-3 mb-8">
          {accounts.map((account, index) => (
            <div key={account.uid}>
              <ThemedCard
                className={`p-4 cursor-pointer transition-all duration-200 hover:shadow-md ${
                  selectedAccount?.uid === account.uid
                    ? 'ring-2 ring-primary-500 border-primary-300 bg-primary-50'
                    : 'hover:border-gray-300'
                }`}
                onClick={() => setSelectedAccount(account)}
              >
                <div className="flex items-center space-x-4">
                  {getRoleIcon(account.role)}
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-medium text-gray-900 truncate">
                        {account.firstName} {account.lastName}
                      </h3>
                      <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getRoleColor(account.role)}`}>
                        {getRoleText(account.role)}
                      </div>
                    </div>
                    
                    {account.companyName && (
                      <p className="text-sm text-gray-600 truncate">
                        {account.companyName}
                      </p>
                    )}
                  </div>

                  <ChevronRight className={`w-5 h-5 transition-colors duration-200 ${
                    selectedAccount?.uid === account.uid ? 'text-primary-600' : 'text-gray-400'
                  }`} />
                </div>
            </ThemedCard>
            
            {/* Simple separator between accounts (except for the last one) */}
            {index < accounts.length - 1 && (
              <div className="flex justify-center my-3">
                <div className="w-12 h-px bg-gray-200"></div>
              </div>
            )}
          </div>
          ))}
        </div>

        {/* Continue Button */}
        <div className="text-center">
          <ThemedButton
            variant="primary"
            className="w-full max-w-md mx-auto py-4 text-lg font-semibold"
            disabled={!selectedAccount || loading}
            onClick={() => selectedAccount && onSelectAccount(selectedAccount)}
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <LoadingSpinner size="sm" />
                <span className="ml-3">Signing in...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center">
                Continue as {selectedAccount ? `${selectedAccount.firstName}` : '...'}
                <ChevronRight className="w-5 h-5 ml-2" />
              </div>
            )}
          </ThemedButton>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-gray-500 mt-6">
          Don't see the account you're looking for?{' '}
          <button 
            onClick={() => window.location.reload()}
            className="text-primary-600 hover:text-primary-700 font-medium"
          >
            Try again
          </button>
        </p>
      </div>
    </div>
  );
};
