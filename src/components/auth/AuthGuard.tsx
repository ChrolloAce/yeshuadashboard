'use client';

import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

interface AuthGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  requireAuth?: boolean;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({
  children,
  fallback,
  requireAuth = true
}) => {
  const { loading, isAuthenticated } = useAuth();

  // Show loading spinner while auth state is being restored
  if (loading) {
    return fallback || (
      <LoadingSpinner 
        fullScreen 
        size="lg" 
        text="Restoring your session..." 
      />
    );
  }

  // If auth is required and user is not authenticated, show fallback
  if (requireAuth && !isAuthenticated) {
    return fallback || null;
  }

  // If auth is not required or user is authenticated, show children
  return <>{children}</>;
};
