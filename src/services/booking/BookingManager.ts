import { BookingData, PricingBreakdown, CleaningType, Frequency } from '@/types/booking';
import { PricingEngine } from '../pricing/PricingEngine';

export class BookingManager {
  private pricingEngine: PricingEngine;
  private bookingData: Partial<BookingData>;
  private listeners: Set<() => void>;

  constructor() {
    this.pricingEngine = new PricingEngine();
    this.bookingData = {
      contact: {
        firstName: '',
        lastName: '',
        email: '',
        phone: ''
      },
      address: {
        street: '',
        apartment: '',
        city: '',
        state: '',
        zipCode: ''
      },
      service: {
        bedrooms: 1,
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
        time: '09:00',
        frequency: Frequency.ONE_TIME
      },
      promoCode: '',
      parkingInstructions: '',
      specialInstructions: ''
    };
    this.listeners = new Set();
  }

  public getBookingData(): Partial<BookingData> {
    return { ...this.bookingData };
  }

  public updateContact(contact: Partial<BookingData['contact']>): void {
    this.bookingData.contact = { ...this.bookingData.contact!, ...contact };
    this.notifyListeners();
  }

  public updateAddress(address: Partial<BookingData['address']>): void {
    this.bookingData.address = { ...this.bookingData.address!, ...address };
    this.notifyListeners();
  }

  public updateService(service: Partial<BookingData['service']>): void {
    this.bookingData.service = { ...this.bookingData.service!, ...service };
    this.notifyListeners();
  }

  public updateExtras(extras: Partial<BookingData['extras']>): void {
    this.bookingData.extras = { ...this.bookingData.extras!, ...extras };
    this.notifyListeners();
  }

  public updateSchedule(schedule: Partial<BookingData['schedule']>): void {
    this.bookingData.schedule = { ...this.bookingData.schedule!, ...schedule };
    this.notifyListeners();
  }

  public updatePromoCode(promoCode: string): void {
    this.bookingData.promoCode = promoCode;
    this.notifyListeners();
  }

  public updateParkingInstructions(instructions: string): void {
    this.bookingData.parkingInstructions = instructions;
    this.notifyListeners();
  }

  public updateSpecialInstructions(instructions: string): void {
    this.bookingData.specialInstructions = instructions;
    this.notifyListeners();
  }

  public calculatePricing(): PricingBreakdown {
    if (!this.bookingData.service || !this.bookingData.extras || !this.bookingData.schedule) {
      throw new Error('Incomplete booking data');
    }

    const isRushOrder = this.isRushOrder();
    
    return this.pricingEngine.calculatePricing(
      this.bookingData.service,
      this.bookingData.extras,
      this.bookingData.schedule.frequency,
      this.bookingData.promoCode,
      isRushOrder
    );
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  public getEstimatedDuration(): string {
    if (!this.bookingData.service) return '2-3 hours';

    const { bedrooms, bathrooms, cleaningType } = this.bookingData.service;
    const baseTime = bedrooms * 30 + bathrooms * 20; // minutes
    
    const multipliers = {
      [CleaningType.REGULAR]: 1,
      [CleaningType.DEEP]: 1.5,
      [CleaningType.MOVE_IN_OUT]: 1.8,
      [CleaningType.POST_CONSTRUCTION]: 2.2
    };

    const totalMinutes = Math.round(baseTime * multipliers[cleaningType]);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    if (minutes === 0) {
      return `${hours} hour${hours !== 1 ? 's' : ''}`;
    }
    
    return `${hours}h ${minutes}m`;
  }

  public validateBooking(): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!this.bookingData.contact?.firstName) errors.push('First name is required');
    if (!this.bookingData.contact?.lastName) errors.push('Last name is required');
    if (!this.bookingData.contact?.email) errors.push('Email is required');
    if (!this.bookingData.contact?.phone) errors.push('Phone is required');

    if (!this.bookingData.address?.street) errors.push('Street address is required');
    if (!this.bookingData.address?.city) errors.push('City is required');
    if (!this.bookingData.address?.state) errors.push('State is required');
    if (!this.bookingData.address?.zipCode) errors.push('Zip code is required');

    if (!this.bookingData.schedule?.date) errors.push('Date is required');
    if (!this.bookingData.schedule?.time) errors.push('Time is required');

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  private isRushOrder(): boolean {
    if (!this.bookingData.schedule?.date) return false;
    
    const now = new Date();
    const scheduledDate = new Date(this.bookingData.schedule.date);
    const timeDiff = scheduledDate.getTime() - now.getTime();
    const hoursDiff = timeDiff / (1000 * 3600);
    
    return hoursDiff < 24; // Rush if less than 24 hours notice
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener());
  }
}
