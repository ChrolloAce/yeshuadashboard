// Database Types for Yeshua Cleaning Dashboard

// Company and User Management
export interface Company {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  logo?: string;
  website?: string;
  ownerId: string; // User ID of company owner
  settings: {
    timezone: string;
    currency: string;
    defaultServiceArea: string[];
    branding: {
      primaryColor: string;
      secondaryColor: string;
    };
  };
  subscription: {
    plan: 'free' | 'basic' | 'pro' | 'enterprise';
    status: 'active' | 'inactive' | 'suspended';
    expiresAt?: Date;
  };
  inviteCode: string; // For cleaners to join
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatar?: string;
  role: 'company_owner' | 'company_admin' | 'cleaner';
  companyId?: string; // For cleaners and company employees
  isActive: boolean;
  permissions?: string[]; // For granular permissions
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CleanerProfile {
  id: string;
  userId: string;
  companyId?: string; // Company they're currently working for
  skills: string[];
  certifications: string[];
  hourlyRate?: number;
  availability: {
    monday: { start: string; end: string; available: boolean };
    tuesday: { start: string; end: string; available: boolean };
    wednesday: { start: string; end: string; available: boolean };
    thursday: { start: string; end: string; available: boolean };
    friday: { start: string; end: string; available: boolean };
    saturday: { start: string; end: string; available: boolean };
    sunday: { start: string; end: string; available: boolean };
  };
  rating: number;
  totalJobs: number;
  joinRequests: Array<{
    companyId: string;
    companyName: string;
    status: 'pending' | 'accepted' | 'declined';
    requestedAt: Date;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

export interface Client {
  id: string;
  companyId: string; // Company this client belongs to
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
  companyId: string; // Company this quote belongs to
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
  companyId: string; // Company this job belongs to
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
  companyId: string; // Company this team belongs to
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
export type UserRole = 'company_owner' | 'company_admin' | 'cleaner';
export type CompanyPlan = 'free' | 'basic' | 'pro' | 'enterprise';
export type SubscriptionStatus = 'active' | 'inactive' | 'suspended';
export type JoinRequestStatus = 'pending' | 'accepted' | 'declined';

// Database collection names
export const COLLECTIONS = {
  USERS: 'users',
  COMPANIES: 'companies',
  CLEANER_PROFILES: 'cleaner_profiles',
  CLIENTS: 'clients', 
  QUOTES: 'quotes',
  JOBS: 'jobs',
  TEAMS: 'teams',
  ANALYTICS_SNAPSHOTS: 'analytics_snapshots',
  FINANCIAL_RECORDS: 'financial_records',
  COMPANY_METRICS: 'company_metrics'
} as const;

// Analytics Persistence Interfaces
export interface AnalyticsSnapshot {
  id: string;
  companyId: string;
  date: Date; // Daily snapshot date
  period: 'daily' | 'weekly' | 'monthly' | 'yearly';
  metrics: {
    totalRevenue: number;
    totalJobs: number;
    completedJobs: number;
    activeClients: number;
    newClients: number;
    totalQuotes: number;
    approvedQuotes: number;
    totalPaidToCleaners: number;
    totalProfit: number;
    averageJobValue: number;
  };
  breakdown: {
    revenueByService: Record<string, number>; // 'regular': 1500, 'deep': 800
    jobsByStatus: Record<JobStatus, number>;
    paymentsByMethod: Record<string, number>;
  };
  createdAt: Date;
}

export interface FinancialRecord {
  id: string;
  companyId: string;
  type: 'income' | 'expense' | 'payment_to_cleaner';
  category: 'job_payment' | 'cleaner_payment' | 'refund' | 'adjustment';
  amount: number;
  currency: string;
  description: string;
  
  // Related entities
  jobId?: string;
  clientId?: string;
  cleanerId?: string;
  
  // Payment details
  paymentMethod?: string;
  transactionId?: string;
  
  // Accounting fields
  accountingPeriod: string; // '2024-01', '2024-Q1'
  isReconciled: boolean;
  reconciledAt?: Date;
  reconciledBy?: string;
  
  // Audit trail
  createdAt: Date;
  createdBy: string;
  updatedAt?: Date;
  updatedBy?: string;
}

export interface CompanyMetrics {
  id: string; // companyId
  companyId: string;
  
  // Lifetime totals (never decreases)
  lifetimeRevenue: number;
  lifetimePaidToCleaners: number;
  lifetimeProfit: number;
  lifetimeJobs: number;
  lifetimeClients: number;
  
  // Current period (monthly)
  currentMonth: {
    year: number;
    month: number; // 1-12
    revenue: number;
    paidToCleaners: number;
    profit: number;
    jobsCompleted: number;
    newClients: number;
    quotesGenerated: number;
  };
  
  // Performance metrics
  averageJobValue: number;
  clientRetentionRate: number;
  quoteApprovalRate: number;
  
  // Last updated
  lastUpdated: Date;
  lastJobProcessed?: string; // jobId of last processed job
}
