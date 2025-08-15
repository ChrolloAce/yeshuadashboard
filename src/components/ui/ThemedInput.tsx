'use client';

import React from 'react';
import { useTheme } from './ThemeProvider';

interface ThemedInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  variant?: 'default' | 'error' | 'success';
  inputSize?: 'sm' | 'md' | 'lg';
  label?: string;
  error?: string;
  helpText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const ThemedInput: React.FC<ThemedInputProps> = ({
  variant = 'default',
  inputSize = 'md',
  label,
  error,
  helpText,
  leftIcon,
  rightIcon,
  className = '',
  id,
  ...props
}) => {
  const { getComponentClass } = useTheme();
  
  const inputClass = getComponentClass('input', error ? 'error' : variant, inputSize);
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className="space-y-1">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      
      <div className="relative">
        {leftIcon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-gray-400">{leftIcon}</span>
          </div>
        )}
        
        <input
          id={inputId}
          className={`${inputClass} ${leftIcon ? 'pl-10' : ''} ${rightIcon ? 'pr-10' : ''} ${className}`.trim()}
          {...props}
        />
        
        {rightIcon && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <span className="text-gray-400">{rightIcon}</span>
          </div>
        )}
      </div>
      
      {error && (
        <p className="text-sm text-error-600">{error}</p>
      )}
      
      {helpText && !error && (
        <p className="text-sm text-gray-500">{helpText}</p>
      )}
    </div>
  );
};
