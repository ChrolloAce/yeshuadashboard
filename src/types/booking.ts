export interface ContactInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

export interface ServiceAddress {
  street: string;
  apartment?: string;
  city: string;
  state: string;
  zipCode: string;
}

export interface ServiceSelection {
  bedrooms: number;
  bathrooms: number;
  cleaningType: CleaningType;
}

export interface ServiceExtras {
  insideFridge: boolean;
  insideOven: boolean;
  windows: number;
  cabinets: boolean;
  laundry: number;
  walls: boolean;
  petHairRemoval: boolean;
}

export interface BookingSchedule {
  date: Date;
  time: string;
  frequency: Frequency;
}

export interface PaymentDetails {
  cardNumber: string;
  cvc: string;
  expiryDate: string;
}

export interface BookingData {
  contact: ContactInfo;
  address: ServiceAddress;
  service: ServiceSelection;
  extras: ServiceExtras;
  schedule: BookingSchedule;
  payment?: PaymentDetails;
  promoCode?: string;
  parkingInstructions?: string;
  specialInstructions?: string;
}

export interface PricingBreakdown {
  baseRate: number;
  extrasTotal: number;
  travelFee: number;
  rushFee: number;
  discount: number;
  subtotal: number;
  total: number;
}

export enum CleaningType {
  REGULAR = 'regular',
  DEEP = 'deep',
  MOVE_IN_OUT = 'move-in-out',
  POST_CONSTRUCTION = 'post-construction'
}

export enum Frequency {
  ONE_TIME = 'one-time',
  WEEKLY = 'weekly',
  BIWEEKLY = 'biweekly',
  MONTHLY = 'monthly'
}
