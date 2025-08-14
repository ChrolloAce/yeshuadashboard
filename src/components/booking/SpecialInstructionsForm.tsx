import React from 'react';

interface SpecialInstructionsFormProps {
  value: string;
  onChange: (value: string) => void;
}

export class SpecialInstructionsForm extends React.Component<SpecialInstructionsFormProps> {
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
            Additional Notes or Special Requests (Optional)
          </label>
          <textarea
            value={value}
            onChange={this.handleChange}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
            placeholder="Any special cleaning requests, areas of focus, items to avoid, allergies, or other important information for our team..."
          />
          <p className="text-xs text-gray-500">
            Let us know about any specific cleaning preferences, fragile items, allergies, or special areas that need attention.
          </p>
        </div>
      </div>
    );
  }
}
