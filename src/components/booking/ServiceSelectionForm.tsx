import React from 'react';
import { Select } from '../ui/Select';
import { ServiceSelection, CleaningType } from '@/types/booking';

interface ServiceSelectionFormProps {
  data: ServiceSelection;
  onChange: (data: Partial<ServiceSelection>) => void;
  errors?: Record<string, string>;
}

export class ServiceSelectionForm extends React.Component<ServiceSelectionFormProps> {
  private readonly bedroomOptions = [
    { value: 1, label: '1 Bedroom' },
    { value: 2, label: '2 Bedrooms' },
    { value: 3, label: '3 Bedrooms' },
    { value: 4, label: '4 Bedrooms' },
    { value: 5, label: '5+ Bedrooms' }
  ];

  private readonly bathroomOptions = [
    { value: 1, label: '1 Bathroom' },
    { value: 2, label: '2 Bathrooms' },
    { value: 3, label: '3 Bathrooms' },
    { value: 4, label: '4+ Bathrooms' }
  ];

  private readonly cleaningTypeOptions = [
    { value: CleaningType.REGULAR, label: 'Regular Cleaning' },
    { value: CleaningType.DEEP, label: 'Deep Cleaning' },
    { value: CleaningType.MOVE_IN_OUT, label: 'Move-in/Move-out' },
    { value: CleaningType.POST_CONSTRUCTION, label: 'Post-construction' }
  ];

  private handleBedroomsChange = (value: string): void => {
    this.props.onChange({ bedrooms: parseInt(value, 10) });
  };

  private handleBathroomsChange = (value: string): void => {
    this.props.onChange({ bathrooms: parseInt(value, 10) });
  };

  private handleCleaningTypeChange = (value: string): void => {
    this.props.onChange({ cleaningType: value as CleaningType });
  };

  public render(): React.ReactNode {
    const { data, errors = {} } = this.props;

    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Choose Your Service</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label="Bedrooms"
            required
            value={data.bedrooms}
            onChange={this.handleBedroomsChange}
            error={errors.bedrooms}
            options={this.bedroomOptions}
          />

          <Select
            label="Bathrooms"
            required
            value={data.bathrooms}
            onChange={this.handleBathroomsChange}
            error={errors.bathrooms}
            options={this.bathroomOptions}
          />
        </div>

        <Select
          label="Cleaning Type"
          required
          value={data.cleaningType}
          onChange={this.handleCleaningTypeChange}
          error={errors.cleaningType}
          options={this.cleaningTypeOptions}
        />

        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">Service Descriptions:</h4>
          <div className="text-sm text-blue-800 space-y-1">
            <p><strong>Regular:</strong> Standard cleaning for maintained homes</p>
            <p><strong>Deep:</strong> Thorough cleaning including baseboards, light fixtures</p>
            <p><strong>Move-in/out:</strong> Complete cleaning for moving situations</p>
            <p><strong>Post-construction:</strong> Heavy-duty cleaning after renovations</p>
          </div>
        </div>
      </div>
    );
  }
}
