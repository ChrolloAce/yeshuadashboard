import React from 'react';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { PaymentDetails } from '@/types/booking';

interface PaymentFormProps {
  data: PaymentDetails;
  onChange: (data: Partial<PaymentDetails>) => void;
  errors?: Record<string, string>;
  onSubmit: () => void;
  isProcessing: boolean;
  total: number;
}

export class PaymentForm extends React.Component<PaymentFormProps> {
  private handleInputChange = (field: keyof PaymentDetails) => (
    e: React.ChangeEvent<HTMLInputElement>
  ): void => {
    let value = e.target.value;
    
    // Format card number with spaces
    if (field === 'cardNumber') {
      value = value.replace(/\s/g, '').replace(/(.{4})/g, '$1 ').trim();
      value = value.slice(0, 19); // Max 16 digits + 3 spaces
    }
    
    // Format expiry date
    if (field === 'expiryDate') {
      value = value.replace(/\D/g, '').replace(/(\d{2})(\d)/, '$1/$2').slice(0, 5);
    }
    
    // Format CVC
    if (field === 'cvc') {
      value = value.replace(/\D/g, '').slice(0, 4);
    }
    
    this.props.onChange({ [field]: value });
  };

  private handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    this.props.onSubmit();
  };

  public render(): React.ReactNode {
    const { data, errors = {}, isProcessing, total } = this.props;

    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Payment Details</h3>
        
        <form onSubmit={this.handleSubmit} className="space-y-4">
          <Input
            label="Card Number"
            required
            value={data.cardNumber}
            onChange={this.handleInputChange('cardNumber')}
            error={errors.cardNumber}
            placeholder="1234 5678 9012 3456"
            maxLength={19}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Expiry Date"
              required
              value={data.expiryDate}
              onChange={this.handleInputChange('expiryDate')}
              error={errors.expiryDate}
              placeholder="MM/YY"
              maxLength={5}
            />

            <Input
              label="CVC"
              required
              value={data.cvc}
              onChange={this.handleInputChange('cvc')}
              error={errors.cvc}
              placeholder="123"
              maxLength={4}
            />
          </div>

          {/* Security Logos */}
          <div className="flex items-center justify-center space-x-4 py-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-2">
              <svg className="w-8 h-5" viewBox="0 0 32 20" fill="none">
                <rect width="32" height="20" rx="4" fill="#1434CB"/>
                <path d="M13.5 7.5H18.5V12.5H13.5V7.5Z" fill="white"/>
                <path d="M12 7.5H13.5V12.5H12C11.1716 12.5 10.5 11.8284 10.5 11V9C10.5 8.17157 11.1716 7.5 12 7.5Z" fill="#EB001B"/>
                <path d="M18.5 7.5H20C20.8284 7.5 21.5 8.17157 21.5 9V11C21.5 11.8284 20.8284 12.5 20 12.5H18.5V7.5Z" fill="#F79E1B"/>
              </svg>
              <svg className="w-8 h-5" viewBox="0 0 32 20" fill="none">
                <rect width="32" height="20" rx="4" fill="#0066B2"/>
                <path d="M8 7H12L10 13H6L8 7ZM16 7L14 13H18L20 7H16ZM22 7H26L24 13H20L22 7Z" fill="white"/>
              </svg>
              <svg className="w-8 h-5" viewBox="0 0 32 20" fill="none">
                <rect width="32" height="20" rx="4" fill="#00579F"/>
                <circle cx="12" cy="10" r="3" fill="white"/>
                <circle cx="20" cy="10" r="3" fill="white"/>
              </svg>
            </div>
            <div className="text-xs text-gray-500">
              <div className="flex items-center">
                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
                SSL Secured
              </div>
            </div>
          </div>

          <Button
            type="submit"
            size="lg"
            loading={isProcessing}
            className="w-full"
          >
            {isProcessing ? 'Processing...' : `Book Now - $${total}`}
          </Button>

          <p className="text-xs text-gray-500 text-center">
            By clicking "Book Now", you agree to our Terms of Service and Privacy Policy. 
            Your payment will be processed securely via Stripe.
          </p>
        </form>
      </div>
    );
  }
}
