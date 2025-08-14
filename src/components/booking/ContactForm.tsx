import React from 'react';
import { Input } from '../ui/Input';
import { ContactInfo } from '@/types/booking';

interface ContactFormProps {
  data: ContactInfo;
  onChange: (data: Partial<ContactInfo>) => void;
  errors?: Record<string, string>;
}

export class ContactForm extends React.Component<ContactFormProps> {
  private handleInputChange = (field: keyof ContactInfo) => (
    e: React.ChangeEvent<HTMLInputElement>
  ): void => {
    this.props.onChange({ [field]: e.target.value });
  };

  public render(): React.ReactNode {
    const { data, errors = {} } = this.props;

    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Contact Information</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="First Name"
            required
            value={data.firstName}
            onChange={this.handleInputChange('firstName')}
            error={errors.firstName}
            placeholder="Enter your first name"
          />
          
          <Input
            label="Last Name"
            required
            value={data.lastName}
            onChange={this.handleInputChange('lastName')}
            error={errors.lastName}
            placeholder="Enter your last name"
          />
        </div>

        <Input
          label="Email Address"
          type="email"
          required
          value={data.email}
          onChange={this.handleInputChange('email')}
          error={errors.email}
          placeholder="Enter your email address"
        />

        <Input
          label="Phone Number"
          type="tel"
          required
          value={data.phone}
          onChange={this.handleInputChange('phone')}
          error={errors.phone}
          placeholder="Enter your phone number"
        />
      </div>
    );
  }
}
