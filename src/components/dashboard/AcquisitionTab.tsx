import React, { useState } from 'react';
import { useBooking } from '@/hooks/useBooking';
import { Client } from '@/types/database';
import { ClientSelector } from '@/components/booking/ClientSelector';
import { TeamSelector } from '@/components/booking/TeamSelector';
import { ContactForm } from '@/components/booking/ContactForm';
import { AddressForm } from '@/components/booking/AddressForm';
import { ServiceSelectionForm } from '@/components/booking/ServiceSelectionForm';
import { ExtrasForm } from '@/components/booking/ExtrasForm';
import { ScheduleForm } from '@/components/booking/ScheduleForm';
import { ParkingInstructionsForm } from '@/components/booking/ParkingInstructionsForm';
import { SpecialInstructionsForm } from '@/components/booking/SpecialInstructionsForm';
import { BookingSummary } from '@/components/booking/BookingSummary';
import { BookingToFirebaseService } from '@/services/booking/BookingToFirebaseService';

export const AcquisitionTab: React.FC = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [selectedTeamId, setSelectedTeamId] = useState<string | undefined>();
  const [isNewClient, setIsNewClient] = useState(true);
  const booking = useBooking();
  const bookingService = BookingToFirebaseService.getInstance();

  const handleClientSelect = (client: Client | null) => {
    setSelectedClient(client);
    setIsNewClient(client === null);
    
    if (client) {
      // Auto-fill contact and address information
      booking.updateContact({
        firstName: client.firstName,
        lastName: client.lastName,
        email: client.email,
        phone: client.phone || ''
      });
      
      booking.updateAddress({
        street: client.address.street,
        apartment: '', // Client address doesn't have apartment field
        city: client.address.city,
        state: client.address.state,
        zipCode: client.address.zipCode
      });
    }
  };

  const handleNewClient = () => {
    setIsNewClient(true);
    setSelectedClient(null);
    // Clear the form when creating new client
    booking.updateContact({
      firstName: '',
      lastName: '',
      email: '',
      phone: ''
    });
    booking.updateAddress({
      street: '',
      apartment: '',
      city: '',
      state: '',
      zipCode: ''
    });
  };

  const handleTeamSelect = (team: any) => {
    setSelectedTeamId(team?.id);
  };

  const validateBookingData = (bookingData: any): boolean => {
    return !!(
      bookingData.contact?.firstName &&
      bookingData.contact?.lastName &&
      bookingData.contact?.email &&
      bookingData.address?.street &&
      bookingData.address?.city &&
      bookingData.address?.state &&
      bookingData.address?.zipCode &&
      bookingData.service?.bedrooms &&
      bookingData.service?.bathrooms &&
      bookingData.schedule?.date &&
      bookingData.schedule?.time
    );
  };

  const handleBookingSubmit = async (): Promise<void> => {
    setIsProcessing(true);

    try {
      const bookingData = booking.bookingData;
      
      if (!validateBookingData(bookingData)) {
        alert('Please fill in all required fields before booking.');
        return;
      }

      console.log('Creating immediate booking...', bookingData);
      
      // Create job immediately (Book Now) - cast as complete BookingData since we validated it
      const job = await bookingService.bookNow(bookingData as any, booking.pricing);
      
      console.log('✅ Job created successfully:', job);
      alert(`Booking confirmed! Job #${job.id} has been created. The customer will receive a confirmation email shortly.`);
      
      // Trigger analytics refresh
      console.log('🔄 Triggering analytics refresh...');
      window.dispatchEvent(new CustomEvent('analytics-data-updated'));
      
      // Optionally refresh the page or reset the form
      setTimeout(() => {
        window.location.reload();
      }, 1000); // Small delay to let analytics update
      
    } catch (error: any) {
      console.error('Booking failed:', error);
      alert(`Booking failed: ${error.message}. Please try again.`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSendInvoice = async (): Promise<void> => {
    setIsProcessing(true);

    try {
      const bookingData = booking.bookingData;
      
      if (!validateBookingData(bookingData)) {
        alert('Please fill in all required fields before sending invoice.');
        return;
      }

      console.log('Sending invoice...', bookingData);
      
      // Send invoice (create quote and mark as sent) - cast as complete BookingData since we validated it
      const quote = await bookingService.sendInvoice(bookingData as any, booking.pricing);
      
      console.log('✅ Quote created successfully:', quote);
      alert(`Invoice sent successfully! Quote #${quote.id} has been created and sent to ${bookingData.contact?.email}.`);
      
      // Trigger analytics refresh
      console.log('🔄 Triggering analytics refresh...');
      window.dispatchEvent(new CustomEvent('analytics-data-updated'));
      
      // Optionally refresh the page or reset the form
      setTimeout(() => {
        window.location.reload();
      }, 1000); // Small delay to let analytics update
      
    } catch (error: any) {
      console.error('Failed to send invoice:', error);
      alert(`Failed to send invoice: ${error.message}. Please try again.`);
    } finally {
      setIsProcessing(false);
    }
  };

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
          {/* Client Selector */}
          <ClientSelector
            onClientSelect={handleClientSelect}
            onNewClient={handleNewClient}
            selectedClientId={selectedClient?.id}
          />

          {/* Team Selector */}
          <TeamSelector
            onTeamSelect={handleTeamSelect}
            selectedTeamId={selectedTeamId}
          />

          {/* Contact Form - only show if new client or no client selected */}
          {isNewClient && (
            <div className="form-section">
              <ContactForm
                data={booking.bookingData.contact!}
                onChange={booking.updateContact}
              />
            </div>
          )}

          {/* Address Form - only show if new client or no client selected */}
          {isNewClient && (
            <div className="form-section">
              <AddressForm
                data={booking.bookingData.address!}
                onChange={booking.updateAddress}
              />
            </div>
          )}

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
            onSendInvoice={handleSendInvoice}
            onBookNow={handleBookingSubmit}
            isProcessing={isProcessing}
          />
        </div>
      </div>
    </div>
  );
};


