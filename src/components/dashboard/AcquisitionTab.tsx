import React from 'react';
import { useBooking } from '@/hooks/useBooking';
import { ContactForm } from '@/components/booking/ContactForm';
import { AddressForm } from '@/components/booking/AddressForm';
import { ServiceSelectionForm } from '@/components/booking/ServiceSelectionForm';
import { ExtrasForm } from '@/components/booking/ExtrasForm';
import { ScheduleForm } from '@/components/booking/ScheduleForm';
import { ParkingInstructionsForm } from '@/components/booking/ParkingInstructionsForm';
import { SpecialInstructionsForm } from '@/components/booking/SpecialInstructionsForm';
import { BookingSummary } from '@/components/booking/BookingSummary';

interface AcquisitionTabState {
  isProcessing: boolean;
}

interface AcquisitionContentProps {
  isProcessing: boolean;
  onBookingSubmit: () => void;
  onSendInvoice: () => void;
}

function AcquisitionContent({ isProcessing, onBookingSubmit, onSendInvoice }: AcquisitionContentProps) {
  const booking = useBooking();

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">New Booking</h1>
        <p className="text-gray-600 mt-2">Create a new cleaning service booking for your customers.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Booking Form */}
        <div className="lg:col-span-2 space-y-6">
          <div className="form-section">
            <ContactForm
              data={booking.bookingData.contact!}
              onChange={booking.updateContact}
            />
          </div>

          <div className="form-section">
            <AddressForm
              data={booking.bookingData.address!}
              onChange={booking.updateAddress}
            />
          </div>

          <div className="form-section">
            <ParkingInstructionsForm
              value={booking.bookingData.parkingInstructions || ''}
              onChange={booking.updateParkingInstructions}
            />
          </div>

          <div className="form-section">
            <ServiceSelectionForm
              data={booking.bookingData.service!}
              onChange={booking.updateService}
            />
          </div>

          <div className="form-section">
            <ExtrasForm
              data={booking.bookingData.extras!}
              onChange={booking.updateExtras}
            />
          </div>

          <div className="form-section">
            <ScheduleForm
              data={booking.bookingData.schedule!}
              onChange={booking.updateSchedule}
            />
          </div>

          <div className="form-section">
            <SpecialInstructionsForm
              value={booking.bookingData.specialInstructions || ''}
              onChange={booking.updateSpecialInstructions}
            />
          </div>
        </div>

        {/* Right Column - Summary */}
        <div className="lg:col-span-1">
          <BookingSummary
            cleaningType={booking.bookingData.service!.cleaningType}
            bedrooms={booking.bookingData.service!.bedrooms}
            bathrooms={booking.bookingData.service!.bathrooms}
            date={booking.bookingData.schedule!.date}
            time={booking.bookingData.schedule!.time}
            frequency={booking.bookingData.schedule!.frequency}
            estimatedDuration={booking.estimatedDuration}
            pricing={booking.pricing}
            extras={booking.bookingData.extras!}
            promoCode={booking.bookingData.promoCode || ''}
            isPromoApplied={booking.isPromoApplied}
            onPromoCodeChange={booking.updatePromoCode}
            onPromoCodeApply={booking.applyPromoCode}
            onSendInvoice={onSendInvoice}
            onBookNow={onBookingSubmit}
            isProcessing={isProcessing}
          />
        </div>
      </div>
    </div>
  );
}

export class AcquisitionTab extends React.Component<{}, AcquisitionTabState> {
  constructor(props: {}) {
    super(props);
    this.state = {
      isProcessing: false
    };
  }

  private handleBookingSubmit = async (): Promise<void> => {
    this.setState({ isProcessing: true });

    try {
      // Simulate booking processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      alert('Booking confirmed! You will receive a confirmation email shortly.');
      
    } catch (error) {
      alert('Booking failed. Please try again.');
    } finally {
      this.setState({ isProcessing: false });
    }
  };

  private handleSendInvoice = async (): Promise<void> => {
    this.setState({ isProcessing: true });

    try {
      // Simulate invoice generation and sending
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      alert('Invoice sent successfully! The customer will receive it via email.');
      
    } catch (error) {
      alert('Failed to send invoice. Please try again.');
    } finally {
      this.setState({ isProcessing: false });
    }
  };

  public render(): React.ReactNode {
    return (
      <AcquisitionContent 
        isProcessing={this.state.isProcessing}
        onBookingSubmit={this.handleBookingSubmit}
        onSendInvoice={this.handleSendInvoice}
      />
    );
  }
}
