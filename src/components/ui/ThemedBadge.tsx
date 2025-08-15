import React from 'react';
import { useTheme } from './ThemeProvider';

interface ThemedBadgeProps {
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'error' | 'info';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  className?: string;
  icon?: React.ReactNode;
}

export const ThemedBadge: React.FC<ThemedBadgeProps> = ({
  variant = 'default',
  size = 'md',
  children,
  className = '',
  icon,
  ...props
}) => {
  const { getComponentClass } = useTheme();
  
  const badgeClass = getComponentClass('badge', variant);
  
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-0.5 text-xs',
    lg: 'px-3 py-1 text-sm'
  };
  
  const finalClassName = `${badgeClass} ${sizeClasses[size]} ${className}`.trim();

  return (
    <span className={finalClassName} {...props}>
      <div className="flex items-center">
        {icon && <span className="mr-1">{icon}</span>}
        {children}
      </div>
    </span>
  );
};
