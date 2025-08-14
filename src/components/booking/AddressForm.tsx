import React from 'react';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { ServiceAddress } from '@/types/booking';

interface AddressFormProps {
  data: ServiceAddress;
  onChange: (data: Partial<ServiceAddress>) => void;
  errors?: Record<string, string>;
}

export class AddressForm extends React.Component<AddressFormProps> {
  private readonly stateOptions = [
    { value: 'AL', label: 'Alabama' },
    { value: 'AK', label: 'Alaska' },
    { value: 'AZ', label: 'Arizona' },
    { value: 'AR', label: 'Arkansas' },
    { value: 'CA', label: 'California' },
    { value: 'CO', label: 'Colorado' },
    { value: 'CT', label: 'Connecticut' },
    { value: 'DE', label: 'Delaware' },
    { value: 'FL', label: 'Florida' },
    { value: 'GA', label: 'Georgia' },
    { value: 'HI', label: 'Hawaii' },
    { value: 'ID', label: 'Idaho' },
    { value: 'IL', label: 'Illinois' },
    { value: 'IN', label: 'Indiana' },
    { value: 'IA', label: 'Iowa' },
    { value: 'KS', label: 'Kansas' },
    { value: 'KY', label: 'Kentucky' },
    { value: 'LA', label: 'Louisiana' },
    { value: 'ME', label: 'Maine' },
    { value: 'MD', label: 'Maryland' },
    { value: 'MA', label: 'Massachusetts' },
    { value: 'MI', label: 'Michigan' },
    { value: 'MN', label: 'Minnesota' },
    { value: 'MS', label: 'Mississippi' },
    { value: 'MO', label: 'Missouri' },
    { value: 'MT', label: 'Montana' },
    { value: 'NE', label: 'Nebraska' },
    { value: 'NV', label: 'Nevada' },
    { value: 'NH', label: 'New Hampshire' },
    { value: 'NJ', label: 'New Jersey' },
    { value: 'NM', label: 'New Mexico' },
    { value: 'NY', label: 'New York' },
    { value: 'NC', label: 'North Carolina' },
    { value: 'ND', label: 'North Dakota' },
    { value: 'OH', label: 'Ohio' },
    { value: 'OK', label: 'Oklahoma' },
    { value: 'OR', label: 'Oregon' },
    { value: 'PA', label: 'Pennsylvania' },
    { value: 'RI', label: 'Rhode Island' },
    { value: 'SC', label: 'South Carolina' },
    { value: 'SD', label: 'South Dakota' },
    { value: 'TN', label: 'Tennessee' },
    { value: 'TX', label: 'Texas' },
    { value: 'UT', label: 'Utah' },
    { value: 'VT', label: 'Vermont' },
    { value: 'VA', label: 'Virginia' },
    { value: 'WA', label: 'Washington' },
    { value: 'WV', label: 'West Virginia' },
    { value: 'WI', label: 'Wisconsin' },
    { value: 'WY', label: 'Wyoming' }
  ];

  private handleInputChange = (field: keyof ServiceAddress) => (
    e: React.ChangeEvent<HTMLInputElement>
  ): void => {
    this.props.onChange({ [field]: e.target.value });
  };

  private handleStateChange = (value: string): void => {
    this.props.onChange({ state: value });
  };

  public render(): React.ReactNode {
    const { data, errors = {} } = this.props;

    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Service Address</h3>
        
        <Input
          label="Street Address"
          required
          value={data.street}
          onChange={this.handleInputChange('street')}
          error={errors.street}
          placeholder="Enter street address"
        />

        <Input
          label="Apartment/Unit (Optional)"
          value={data.apartment || ''}
          onChange={this.handleInputChange('apartment')}
          error={errors.apartment}
          placeholder="Apt, suite, unit, etc."
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            label="City"
            required
            value={data.city}
            onChange={this.handleInputChange('city')}
            error={errors.city}
            placeholder="Enter city"
          />

          <Select
            label="State"
            required
            value={data.state}
            onChange={this.handleStateChange}
            error={errors.state}
            options={this.stateOptions}
            placeholder="Select state"
          />

          <Input
            label="Zip Code"
            required
            value={data.zipCode}
            onChange={this.handleInputChange('zipCode')}
            error={errors.zipCode}
            placeholder="Enter zip code"
            maxLength={10}
          />
        </div>
      </div>
    );
  }
}
