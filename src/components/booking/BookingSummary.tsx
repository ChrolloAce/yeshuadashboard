import React from 'react';
import { PricingBreakdown, CleaningType, Frequency, ServiceExtras } from '@/types/booking';

interface BookingSummaryProps {
  cleaningType: CleaningType;
  bedrooms: number;
  bathrooms: number;
  date: Date;
  time: string;
  frequency: Frequency;
  estimatedDuration: string;
  pricing: PricingBreakdown;
  extras: ServiceExtras;
  promoCode: string;
  isPromoApplied: boolean;
  onPromoCodeChange: (value: string) => void;
  onPromoCodeApply: () => void;
  onSendInvoice: () => void;
  onBookNow: () => void;
  isProcessing: boolean;
}

interface BookingSummaryState {
  isApplyingPromo: boolean;
  isEditingTotal: boolean;
  editableTotal: string;
}

export class BookingSummary extends React.Component<BookingSummaryProps, BookingSummaryState> {
  constructor(props: BookingSummaryProps) {
    super(props);
    this.state = {
      isApplyingPromo: false,
      isEditingTotal: false,
      editableTotal: props.pricing.total.toString()
    };
  }

  public componentDidUpdate(prevProps: BookingSummaryProps): void {
    // Update editable total when pricing changes (but not when user is editing)
    if (prevProps.pricing.total !== this.props.pricing.total && !this.state.isEditingTotal) {
      this.setState({ editableTotal: this.props.pricing.total.toString() });
    }
  }

  private formatCleaningType = (type: CleaningType): string => {
    const typeMap = {
      [CleaningType.REGULAR]: 'Regular Cleaning',
      [CleaningType.DEEP]: 'Deep Cleaning',
      [CleaningType.MOVE_IN_OUT]: 'Move-in/Move-out',
      [CleaningType.POST_CONSTRUCTION]: 'Post-construction'
    };
    return typeMap[type];
  };

  private formatFrequency = (frequency: Frequency): string => {
    const frequencyMap = {
      [Frequency.ONE_TIME]: 'One-time',
      [Frequency.WEEKLY]: 'Weekly',
      [Frequency.BIWEEKLY]: 'Bi-weekly',
      [Frequency.MONTHLY]: 'Monthly'
    };
    return frequencyMap[frequency];
  };

  private formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  private formatTime = (time: string): string => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  private renderExtrasLineItems = (): React.ReactNode[] => {
    const { extras } = this.props;
    const lineItems: React.ReactNode[] = [];

    if (!extras) return lineItems;

    if (extras.insideFridge) {
      lineItems.push(
        <div key="insideFridge" className="flex justify-between">
          <span className="text-gray-600">• Inside Fridge</span>
          <span>$25</span>
        </div>
      );
    }

    if (extras.insideOven) {
      lineItems.push(
        <div key="insideOven" className="flex justify-between">
          <span className="text-gray-600">• Inside Oven</span>
          <span>$20</span>
        </div>
      );
    }

    if (extras.cabinets) {
      lineItems.push(
        <div key="cabinets" className="flex justify-between">
          <span className="text-gray-600">• Inside Cabinets</span>
          <span>$30</span>
        </div>
      );
    }

    if (extras.walls) {
      lineItems.push(
        <div key="walls" className="flex justify-between">
          <span className="text-gray-600">• Walls</span>
          <span>$40</span>
        </div>
      );
    }

    if (extras.petHairRemoval) {
      lineItems.push(
        <div key="petHairRemoval" className="flex justify-between">
          <span className="text-gray-600">• Pet Hair Removal</span>
          <span>$35</span>
        </div>
      );
    }

    if (extras.windows > 0) {
      lineItems.push(
        <div key="windows" className="flex justify-between">
          <span className="text-gray-600">• Windows ({extras.windows}x)</span>
          <span>${extras.windows * 5}</span>
        </div>
      );
    }

    if (extras.laundry > 0) {
      lineItems.push(
        <div key="laundry" className="flex justify-between">
          <span className="text-gray-600">• Laundry ({extras.laundry} load{extras.laundry > 1 ? 's' : ''})</span>
          <span>${extras.laundry * 15}</span>
        </div>
      );
    }

    return lineItems;
  };

  private handlePromoCodeChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    this.props.onPromoCodeChange(e.target.value.toUpperCase());
  };

  private handlePromoApply = async (): Promise<void> => {
    this.setState({ isApplyingPromo: true });
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    this.props.onPromoCodeApply();
    this.setState({ isApplyingPromo: false });
  };

  private handlePromoKeyPress = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Enter') {
      e.preventDefault();
      this.handlePromoApply();
    }
  };

  private handleEditTotalClick = (): void => {
    this.setState({ 
      isEditingTotal: true,
      editableTotal: this.props.pricing.total.toString()
    });
  };

  private handleTotalChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const value = e.target.value.replace(/[^0-9.]/g, ''); // Only allow numbers and decimal
    this.setState({ editableTotal: value });
  };

  private handleTotalSave = (): void => {
    const newTotal = parseFloat(this.state.editableTotal);
    if (!isNaN(newTotal) && newTotal >= 0) {
      this.setState({ 
        isEditingTotal: false,
        editableTotal: newTotal.toString()
      });
    } else {
      // Reset to original if invalid
      this.setState({ 
        isEditingTotal: false,
        editableTotal: this.props.pricing.total.toString()
      });
    }
  };

  private handleTotalKeyPress = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Enter') {
      this.handleTotalSave();
    } else if (e.key === 'Escape') {
      this.setState({ 
        isEditingTotal: false,
        editableTotal: this.props.pricing.total.toString()
      });
    }
  };

  private getDisplayTotal = (): number => {
    return this.state.isEditingTotal ? 
      this.props.pricing.total : 
      parseFloat(this.state.editableTotal) || this.props.pricing.total;
  };

  public render(): React.ReactNode {
    const {
      cleaningType,
      bedrooms,
      bathrooms,
      date,
      time,
      frequency,
      estimatedDuration,
      pricing
    } = this.props;

    return (
      <div className="bg-white rounded-lg shadow-soft border border-gray-200 p-6 sticky top-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Booking Summary</h2>
        
        {/* Service Details */}
        <div className="space-y-3 mb-6">
          <div className="flex justify-between">
            <span className="text-gray-600">Service:</span>
            <span className="font-medium">{this.formatCleaningType(cleaningType)}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-gray-600">Property:</span>
            <span className="font-medium">
              {bedrooms} bed, {bathrooms} bath
            </span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-gray-600">Date & Time:</span>
            <div className="text-right">
              <div className="font-medium">{this.formatDate(date)}</div>
              <div className="text-sm text-gray-500">{this.formatTime(time)}</div>
            </div>
          </div>
          
          <div className="flex justify-between">
            <span className="text-gray-600">Duration:</span>
            <span className="font-medium">{estimatedDuration}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-gray-600">Frequency:</span>
            <span className="font-medium">{this.formatFrequency(frequency)}</span>
          </div>
        </div>

        {/* Promo Code Section */}
        <div className="border-t border-gray-200 pt-4 pb-4">
          <h3 className="font-semibold text-gray-900 mb-3">Promo Code</h3>
          <div className="flex space-x-2">
            <div className="flex-1">
              <input
                value={this.props.promoCode}
                onChange={this.handlePromoCodeChange}
                onKeyPress={this.handlePromoKeyPress}
                placeholder="Enter promo code"
                disabled={this.props.isPromoApplied}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-50 disabled:text-gray-500 text-sm"
              />
            </div>
            <button
              onClick={this.handlePromoApply}
              disabled={!this.props.promoCode.trim() || this.props.isPromoApplied || this.state.isApplyingPromo}
              className="px-4 py-2 text-sm font-medium rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {this.state.isApplyingPromo ? 'Applying...' : this.props.isPromoApplied ? 'Applied' : 'Apply'}
            </button>
          </div>

          {this.props.isPromoApplied && (
            <div className="mt-2 bg-green-50 border border-green-200 rounded-md p-2">
              <div className="flex items-center">
                <svg className="h-4 w-4 text-green-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-sm font-medium text-green-800">
                  Promo code applied!
                </span>
              </div>
            </div>
          )}

          <div className="mt-2 text-xs text-gray-500">
            <strong>Popular codes:</strong> FIRST20 (20% off), WELCOME15 (15% off), SAVE10 (10% off)
          </div>
        </div>

        {/* Pricing Breakdown */}
        <div className="border-t border-gray-200 pt-4">
          <h3 className="font-semibold text-gray-900 mb-3">Price Breakdown</h3>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Base Rate</span>
              <span>${pricing.baseRate}</span>
            </div>
            
            {/* Individual Add-on Line Items */}
            {this.renderExtrasLineItems()}
            
            <div className="flex justify-between">
              <span className="text-gray-600">Travel Fee</span>
              <span>${pricing.travelFee}</span>
            </div>
            
            {pricing.rushFee > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600">Rush Fee</span>
                <span>${pricing.rushFee}</span>
              </div>
            )}
            
            <div className="flex justify-between text-gray-500">
              <span>Subtotal</span>
              <span>${pricing.subtotal}</span>
            </div>
            
            {pricing.discount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Discount</span>
                <span>-${pricing.discount}</span>
              </div>
            )}
          </div>
          
          <div className="border-t border-gray-200 mt-3 pt-3">
            <div className="flex justify-between items-center text-lg font-bold text-gray-900">
              <span>Total</span>
              <div className="flex items-center space-x-2">
                {this.state.isEditingTotal ? (
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-600">$</span>
                    <input
                      type="text"
                      value={this.state.editableTotal}
                      onChange={this.handleTotalChange}
                      onKeyPress={this.handleTotalKeyPress}
                      onBlur={this.handleTotalSave}
                      className="w-20 px-2 py-1 text-right border border-primary-300 rounded focus:outline-none focus:ring-1 focus:ring-primary-500 text-lg font-bold"
                      autoFocus
                    />
                    <button
                      onClick={this.handleTotalSave}
                      className="text-green-600 hover:text-green-700"
                      title="Save"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <span>${this.getDisplayTotal()}</span>
                    <button
                      onClick={this.handleEditTotalClick}
                      className="text-gray-400 hover:text-primary-600 transition-colors"
                      title="Edit total amount"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Floating Action Buttons */}
        <div className="mt-6 space-y-3">
          <button
            onClick={this.props.onSendInvoice}
            disabled={this.props.isProcessing}
            className="w-full bg-white border-2 border-primary-600 text-primary-600 font-semibold py-3 px-6 rounded-lg hover:bg-primary-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>Send Invoice</span>
          </button>

          <button
            onClick={this.props.onBookNow}
            disabled={this.props.isProcessing}
            className="w-full bg-primary-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {this.props.isProcessing ? (
              <>
                <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Processing...</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Book Now - ${this.getDisplayTotal()}</span>
              </>
            )}
          </button>
        </div>

      </div>
    );
  }
}
