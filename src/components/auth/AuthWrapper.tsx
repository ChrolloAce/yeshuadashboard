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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-lg border border-gray-100 mx-auto mb-6">
            <img 
              src="/yc (1).png" 
              alt="Yeshua Cleaning" 
              className="h-20 w-20 object-contain"
            />
          </div>
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Restoring your session...</p>
          <p className="text-gray-400 text-sm mt-2">Please wait while we log you in</p>
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
