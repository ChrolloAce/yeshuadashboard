import React from 'react';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';

interface PromoCodeFormProps {
  value: string;
  onChange: (value: string) => void;
  onApply: () => void;
  isApplied: boolean;
  error?: string;
}

interface PromoCodeFormState {
  isApplying: boolean;
}

export class PromoCodeForm extends React.Component<PromoCodeFormProps, PromoCodeFormState> {
  constructor(props: PromoCodeFormProps) {
    super(props);
    this.state = {
      isApplying: false
    };
  }

  private handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    this.props.onChange(e.target.value.toUpperCase());
  };

  private handleApply = async (): Promise<void> => {
    this.setState({ isApplying: true });
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    this.props.onApply();
    this.setState({ isApplying: false });
  };

  private handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Enter') {
      e.preventDefault();
      this.handleApply();
    }
  };

  public render(): React.ReactNode {
    const { value, isApplied, error } = this.props;
    const { isApplying } = this.state;

    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Promo Code</h3>
        
        <div className="flex space-x-2">
          <div className="flex-1">
            <Input
              value={value}
              onChange={this.handleInputChange}
              onKeyPress={this.handleKeyPress}
              error={error}
              placeholder="Enter promo code"
              disabled={isApplied}
            />
          </div>
          <Button
            onClick={this.handleApply}
            loading={isApplying}
            disabled={!value.trim() || isApplied}
            variant="outline"
          >
            {isApplied ? 'Applied' : 'Apply'}
          </Button>
        </div>

        {isApplied && (
          <div className="bg-green-50 border border-green-200 rounded-md p-3">
            <div className="flex items-center">
              <svg className="h-4 w-4 text-green-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-sm font-medium text-green-800">
                Promo code applied successfully!
              </span>
            </div>
          </div>
        )}

        <div className="bg-blue-50 p-3 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Popular codes:</strong> FIRST20 (20% off first service), WELCOME15 (15% off), SAVE10 (10% off)
          </p>
        </div>
      </div>
    );
  }
}
