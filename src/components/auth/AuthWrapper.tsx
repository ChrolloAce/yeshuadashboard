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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg border border-gray-100 mx-auto mb-4">
            <img 
              src="/logo.png" 
              alt="Yeshua Cleaning" 
              className="h-16 w-16 object-contain"
            />
          </div>
          <p className="text-gray-600">Loading...</p>
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
