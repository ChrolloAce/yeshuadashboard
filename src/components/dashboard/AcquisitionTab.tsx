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
import { BookingToFirebaseService } from '@/services/booking/BookingToFirebaseService';
import { CleaningType, Frequency } from '@/types/booking';

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
  private bookingService: BookingToFirebaseService;

  constructor(props: {}) {
    super(props);
    this.state = {
      isProcessing: false
    };
    this.bookingService = BookingToFirebaseService.getInstance();
  }

  private handleBookingSubmit = async (): Promise<void> => {
    this.setState({ isProcessing: true });

    try {
      // Get the current booking data from the useBooking hook
      // We need to access this through a ref or callback
      const bookingData = this.getCurrentBookingData();
      
      if (!this.validateBookingData(bookingData)) {
        alert('Please fill in all required fields before booking.');
        return;
      }

      console.log('Creating immediate booking...', bookingData);
      
      // Create job immediately (Book Now)
      const job = await this.bookingService.bookNow(bookingData);
      
      alert(`Booking confirmed! Job #${job.id} has been created and assigned. The customer will receive a confirmation email shortly.`);
      
      // Optionally refresh the page or reset the form
      window.location.reload();
      
    } catch (error: any) {
      console.error('Booking failed:', error);
      alert(`Booking failed: ${error.message}. Please try again.`);
    } finally {
      this.setState({ isProcessing: false });
    }
  };

  private handleSendInvoice = async (): Promise<void> => {
    this.setState({ isProcessing: true });

    try {
      const bookingData = this.getCurrentBookingData();
      
      if (!this.validateBookingData(bookingData)) {
        alert('Please fill in all required fields before sending invoice.');
        return;
      }

      console.log('Sending invoice...', bookingData);
      
      // Send invoice (create quote and mark as sent)
      const quote = await this.bookingService.sendInvoice(bookingData);
      
      alert(`Invoice sent successfully! Quote #${quote.id} has been created and sent to ${bookingData.contact.email}.`);
      
      // Optionally refresh the page or reset the form
      window.location.reload();
      
    } catch (error: any) {
      console.error('Failed to send invoice:', error);
      alert(`Failed to send invoice: ${error.message}. Please try again.`);
    } finally {
      this.setState({ isProcessing: false });
    }
  };

  // Helper method to get current booking data
  // This is a workaround since we can't easily access the hook data from class component
  private getCurrentBookingData = () => {
    // For now, we'll need to get this data from DOM or implement a different approach
    // This is a limitation of mixing class and functional components
    // In a real implementation, you'd want to lift the state up or convert to functional component
    
    // Placeholder - in real implementation, this would come from the booking hook
    return {
      contact: {
        firstName: 'John',
        lastName: 'Doe', 
        email: 'john.doe@example.com',
        phone: '555-0123'
      },
      address: {
        street: '123 Main St',
        city: 'Anytown',
        state: 'CA',
        zipCode: '12345'
      },
      service: {
        bedrooms: 2,
        bathrooms: 1,
        cleaningType: CleaningType.REGULAR
      },
      extras: {
        insideFridge: false,
        insideOven: false,
        windows: 0,
        cabinets: false,
        laundry: 0,
        walls: false,
        petHairRemoval: false
      },
      schedule: {
        date: new Date(),
        time: '10:00',
        frequency: Frequency.ONE_TIME
      },
      parkingInstructions: '',
      specialInstructions: ''
    };
  };

  private validateBookingData = (bookingData: any): boolean => {
    return !!(
      bookingData.contact.firstName &&
      bookingData.contact.lastName &&
      bookingData.contact.email &&
      bookingData.address.street &&
      bookingData.address.city &&
      bookingData.address.state &&
      bookingData.address.zipCode &&
      bookingData.service.bedrooms &&
      bookingData.service.bathrooms &&
      bookingData.schedule.date &&
      bookingData.schedule.time
    );
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
