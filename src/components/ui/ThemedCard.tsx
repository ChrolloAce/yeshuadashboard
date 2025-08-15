'use client';

import React from 'react';
import { useTheme } from './ThemeProvider';

interface ThemedCardProps {
  variant?: 'default' | 'elevated' | 'interactive';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export const ThemedCard: React.FC<ThemedCardProps> = ({
  variant = 'default',
  padding = 'md',
  children,
  className = '',
  onClick,
  ...props
}) => {
  const { getComponentClass } = useTheme();
  
  const cardClass = getComponentClass('card', variant);
  
  const paddingClasses = {
    none: '',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
    xl: 'p-8'
  };
  
  const finalClassName = `${cardClass} ${paddingClasses[padding]} ${className}`.trim();

  const CardElement = onClick ? 'button' : 'div';

  return (
    <CardElement
      className={finalClassName}
      onClick={onClick}
      {...props}
    >
      {children}
    </CardElement>
  );
};
