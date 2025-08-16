import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { LoginFormWithAuth } from './LoginForm';

interface AuthWrapperProps {
  children: React.ReactNode;
}

export const AuthWrapper: React.FC<AuthWrapperProps> = ({ children }) => {
  const { user, userProfile, loading, isAuthenticated } = useAuth();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center shadow-xl border border-gray-200 mx-auto mb-8">
            <img 
              src="/yc (1).png" 
              alt="Yeshua Cleaning" 
              className="h-24 w-24 object-contain"
            />
          </div>
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent mx-auto mb-6"></div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Welcome back!</h2>
          <p className="text-gray-600 font-medium mb-1">Restoring your session...</p>
          <p className="text-gray-500 text-sm">Please wait while we securely log you in</p>
          
          {/* Loading dots animation */}
          <div className="flex justify-center space-x-1 mt-6">
            <div className="w-2 h-2 bg-primary-600 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-primary-600 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
            <div className="w-2 h-2 bg-primary-600 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
          </div>
        </div>
      </div>
    );
  }

  // Show login form if not authenticated
  if (!isAuthenticated || !user) {
    return <LoginFormWithAuth />;
  }

  // Show authenticated content
  return <>{children}</>;
};
