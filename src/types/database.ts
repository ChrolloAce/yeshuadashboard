// Database Types for Yeshua Cleaning Dashboard

export interface Client {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  createdAt: Date;
  updatedAt: Date;
  totalJobs: number;
  totalSpent: number;
  notes?: string;
}

export interface Quote {
  id: string;
  clientId: string;
  client: {
    email: string;
    firstName: string;
    lastName: string;
    phone?: string;
  };
  service: {
    type: 'standard' | 'deep' | 'move-in' | 'move-out' | 'post-construction';
    bedrooms: number;
    bathrooms: number;
    squareFootage?: number;
    frequency: 'one-time' | 'weekly' | 'bi-weekly' | 'monthly';
  };
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  pricing: {
    basePrice: number;
    addOns: Array<{
      name: string;
      price: number;
    }>;
    totalPrice: number;
    discount?: number;
    finalPrice: number;
  };
  schedule: {
    date: Date;
    timeSlot: string;
    estimatedDuration: number; // in minutes
  };
  addOns: string[];
  specialInstructions?: string;
  parkingInstructions?: string;
  status: 'pending' | 'sent' | 'accepted' | 'declined' | 'expired';
  createdAt: Date;
  updatedAt: Date;
  sentAt?: Date;
  respondedAt?: Date;
  expiresAt: Date;
}

export interface Job {
  id: string;
  quoteId?: string; // Reference to original quote if created from quote
  clientId: string;
  client: {
    email: string;
    firstName: string;
    lastName: string;
    phone?: string;
  };
  service: {
    type: 'standard' | 'deep' | 'move-in' | 'move-out' | 'post-construction';
    bedrooms: number;
    bathrooms: number;
    squareFootage?: number;
    frequency: 'one-time' | 'weekly' | 'bi-weekly' | 'monthly';
  };
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  pricing: {
    basePrice: number;
    addOns: Array<{
      name: string;
      price: number;
    }>;
    totalPrice: number;
    discount?: number;
    finalPrice: number;
  };
  schedule: {
    date: Date;
    timeSlot: string;
    estimatedDuration: number; // in minutes
    actualStartTime?: Date;
    actualEndTime?: Date;
  };
  addOns: string[];
  specialInstructions?: string;
  parkingInstructions?: string;
  status: 'pending' | 'confirmed' | 'assigned' | 'in-progress' | 'completed' | 'cancelled' | 'rescheduled';
  assignedTo?: {
    cleanerId: string;
    cleanerName: string;
    teamId?: string;
  };
  payment: {
    status: 'pending' | 'paid' | 'failed' | 'refunded';
    method?: 'card' | 'cash' | 'check';
    transactionId?: string;
    paidAt?: Date;
  };
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
  notes?: string;
  beforePhotos?: string[]; // URLs to photos
  afterPhotos?: string[]; // URLs to photos
  rating?: number; // 1-5 stars
  review?: string;
}

export interface Team {
  id: string;
  name: string;
  leaderId: string; // User ID of team leader
  members: string[]; // Array of User IDs
  specialties: string[]; // Types of cleaning they specialize in
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Enums for better type safety
export type ServiceType = 'standard' | 'deep' | 'move-in' | 'move-out' | 'post-construction';
export type ServiceFrequency = 'one-time' | 'weekly' | 'bi-weekly' | 'monthly';
export type QuoteStatus = 'pending' | 'sent' | 'accepted' | 'declined' | 'expired';
export type JobStatus = 'pending' | 'confirmed' | 'assigned' | 'in-progress' | 'completed' | 'cancelled' | 'rescheduled';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

// Database collection names
export const COLLECTIONS = {
  USERS: 'users',
  CLIENTS: 'clients', 
  QUOTES: 'quotes',
  JOBS: 'jobs',
  TEAMS: 'teams'
} as const;
