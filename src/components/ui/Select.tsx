import React from 'react';
import { clsx } from 'clsx';

interface SelectOption {
  value: string | number;
  label: string;
}

interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'onChange'> {
  label?: string;
  error?: string;
  required?: boolean;
  options: SelectOption[];
  placeholder?: string;
  onChange?: (value: string) => void;
}

export class Select extends React.Component<SelectProps> {
  private handleChange = (e: React.ChangeEvent<HTMLSelectElement>): void => {
    this.props.onChange?.(e.target.value);
  };

  public render(): React.ReactNode {
    const { label, error, required, options, placeholder, className, onChange, ...props } = this.props;

    return (
      <div className="space-y-1">
        {label && (
          <label className="block text-sm font-medium text-gray-700">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <select
          className={clsx(
            'w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm',
            'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500',
            'disabled:bg-gray-50 disabled:text-gray-500',
            error && 'border-red-300 focus:ring-red-500 focus:border-red-500',
            className
          )}
          onChange={this.handleChange}
          {...props}
        >
          {placeholder && (
            <option value="">{placeholder}</option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}
      </div>
    );
  }
}
