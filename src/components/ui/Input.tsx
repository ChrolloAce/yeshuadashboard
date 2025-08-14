import React from 'react';
import { clsx } from 'clsx';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  required?: boolean;
}

export class Input extends React.Component<InputProps> {
  public render(): React.ReactNode {
    const { label, error, required, className, ...props } = this.props;

    return (
      <div className="space-y-1">
        {label && (
          <label className="block text-sm font-medium text-gray-700">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <input
          className={clsx(
            'w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm',
            'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500',
            'disabled:bg-gray-50 disabled:text-gray-500',
            error && 'border-red-300 focus:ring-red-500 focus:border-red-500',
            className
          )}
          {...props}
        />
        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}
      </div>
    );
  }
}
