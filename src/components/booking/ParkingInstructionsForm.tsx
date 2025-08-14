import React from 'react';

interface ParkingInstructionsFormProps {
  value: string;
  onChange: (value: string) => void;
}

export class ParkingInstructionsForm extends React.Component<ParkingInstructionsFormProps> {
  private handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>): void => {
    this.props.onChange(e.target.value);
  };

  public render(): React.ReactNode {
    const { value } = this.props;

    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Special Instructions</h3>
        
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">
            Parking Instructions & Notes (Optional)
          </label>
          <textarea
            value={value}
            onChange={this.handleChange}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
            placeholder="Any special parking instructions, gate codes, or additional notes for our team..."
          />
          <p className="text-xs text-gray-500">
            Include parking details, gate codes, pet information, or any other special instructions.
          </p>
        </div>
      </div>
    );
  }
}
