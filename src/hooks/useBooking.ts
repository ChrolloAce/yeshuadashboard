import { useState, useEffect, useMemo } from 'react';
import { BookingManager } from '@/services/booking/BookingManager';
import { BookingData, PricingBreakdown, CleaningType, Frequency } from '@/types/booking';

export const useBooking = () => {
  const [bookingManager] = useState(() => new BookingManager());
  const [bookingData, setBookingData] = useState<Partial<BookingData>>(() => 
    bookingManager.getBookingData()
  );
  const [isPromoApplied, setIsPromoApplied] = useState(false);

  useEffect(() => {
    const unsubscribe = bookingManager.subscribe(() => {
      setBookingData(bookingManager.getBookingData());
    });

    return unsubscribe;
  }, [bookingManager]);

  const pricing = useMemo((): PricingBreakdown => {
    try {
      return bookingManager.calculatePricing();
    } catch {
      return {
        baseRate: 0,
        extrasTotal: 0,
        travelFee: 0,
        rushFee: 0,
        discount: 0,
        subtotal: 0,
        total: 0
      };
    }
  }, [bookingData, bookingManager]);

  const estimatedDuration = useMemo(() => {
    return bookingManager.getEstimatedDuration();
  }, [bookingData?.service, bookingManager]);

  const updateContact = (contact: Partial<BookingData['contact']>) => {
    bookingManager.updateContact(contact);
  };

  const updateAddress = (address: Partial<BookingData['address']>) => {
    bookingManager.updateAddress(address);
  };

  const updateService = (service: Partial<BookingData['service']>) => {
    bookingManager.updateService(service);
  };

  const updateExtras = (extras: Partial<BookingData['extras']>) => {
    bookingManager.updateExtras(extras);
  };

  const updateSchedule = (schedule: Partial<BookingData['schedule']>) => {
    bookingManager.updateSchedule(schedule);
  };

  const updatePromoCode = (promoCode: string) => {
    bookingManager.updatePromoCode(promoCode);
  };

  const applyPromoCode = () => {
    setIsPromoApplied(true);
  };

  const updateParkingInstructions = (instructions: string) => {
    bookingManager.updateParkingInstructions(instructions);
  };

  const updateSpecialInstructions = (instructions: string) => {
    bookingManager.updateSpecialInstructions(instructions);
  };

  const validateBooking = () => {
    return bookingManager.validateBooking();
  };

  return {
    bookingData,
    pricing,
    estimatedDuration,
    isPromoApplied,
    updateContact,
    updateAddress,
    updateService,
    updateExtras,
    updateSchedule,
    updatePromoCode,
    updateParkingInstructions,
    updateSpecialInstructions,
    applyPromoCode,
    validateBooking
  };
};
