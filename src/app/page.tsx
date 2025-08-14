'use client';

import React from 'react';
import { useBooking } from '@/hooks/useBooking';
import { ContactForm } from '@/components/booking/ContactForm';
import { AddressForm } from '@/components/booking/AddressForm';
import { ServiceSelectionForm } from '@/components/booking/ServiceSelectionForm';
import { ExtrasForm } from '@/components/booking/ExtrasForm';
import { ScheduleForm } from '@/components/booking/ScheduleForm';
import { PromoCodeForm } from '@/components/booking/PromoCodeForm';
import { BookingSummary } from '@/components/booking/BookingSummary';
import { ParkingInstructionsForm } from '@/components/booking/ParkingInstructionsForm';
import { SpecialInstructionsForm } from '@/components/booking/SpecialInstructionsForm';

interface BookingPageState {
  isProcessing: boolean;
}

export default class BookingPage extends React.Component<{}, BookingPageState> {
  private bookingHook: ReturnType<typeof useBooking> | null = null;

  constructor(props: {}) {
    super(props);
    this.state = {
      isProcessing: false
    };
  }



  private handleBookingSubmit = async (): Promise<void> => {
    if (!this.bookingHook) return;

    const validation = this.bookingHook.validateBooking();
    if (!validation.isValid) {
      alert('Please fill in all required fields:\n' + validation.errors.join('\n'));
      return;
    }

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
    if (!this.bookingHook) return;

    const validation = this.bookingHook.validateBooking();
    if (!validation.isValid) {
      alert('Please fill in all required fields:\n' + validation.errors.join('\n'));
      return;
    }

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
    // This is a workaround for using hooks in a class component
    return (
      <BookingPageContent 
        isProcessing={this.state.isProcessing}
        onBookingSubmit={this.handleBookingSubmit}
        onSendInvoice={this.handleSendInvoice}
      />
    );
  }
}

interface BookingPageContentProps {
  isProcessing: boolean;
  onBookingSubmit: () => void;
  onSendInvoice: () => void;
}

function BookingPageContent({ isProcessing, onBookingSubmit, onSendInvoice }: BookingPageContentProps) {
  const booking = useBooking();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="container-custom py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <img 
                src="/logo.png" 
                alt="Yeshua Cleaning" 
                className="h-12 w-auto"
              />
            </div>

          </div>
        </div>
      </header>

      <main className="container-custom py-8">
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
          <div className="lg:col-span-1 space-y-6">
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
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="container-custom py-8">
          <div className="text-center text-gray-500">
            <p className="text-sm">
              © 2024 Yeshua Cleaning. All rights reserved. | 
              <a href="#" className="text-primary-600 hover:text-primary-700 ml-1">Terms</a> | 
              <a href="#" className="text-primary-600 hover:text-primary-700 ml-1">Privacy</a>
            </p>
            <p className="text-xs mt-2">
              Questions? Call us at (555) 123-4567 or email hello@yeshuacleaning.com
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
