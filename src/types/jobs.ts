export interface JobAddress {
  street: string;
  apartment?: string;
  city: string;
  state: string;
  zipCode: string;
}

export interface JobClient {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

export interface JobService {
  bedrooms: number;
  bathrooms: number;
  cleaningType: string;
  estimatedDuration: string;
  specialInstructions?: string;
  parkingInstructions?: string;
}

export interface JobPricing {
  baseRate: number;
  addOns: number;
  total: number;
}

export interface JobTeam {
  id: string;
  name: string;
  members: string[];
  avatar?: string;
}

export interface Job {
  id: string;
  jobNumber: string;
  status: JobStatus;
  priority: JobPriority;
  client: JobClient;
  address: JobAddress;
  service: JobService;
  pricing: JobPricing;
  scheduledDate: Date;
  scheduledTime: string;
  frequency: string;
  assignedTeam?: JobTeam;
  createdAt: Date;
  updatedAt: Date;
  notes?: string;
  completedAt?: Date;
  invoiceSent: boolean;
  paymentStatus: PaymentStatus;
}

export enum JobStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  ASSIGNED = 'assigned',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  RESCHEDULED = 'rescheduled'
}

export enum JobPriority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
  URGENT = 'urgent'
}

export enum PaymentStatus {
  PENDING = 'pending',
  PAID = 'paid',
  OVERDUE = 'overdue',
  REFUNDED = 'refunded'
}

export interface JobFilters {
  status?: JobStatus[];
  priority?: JobPriority[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  assignedTeam?: string;
  paymentStatus?: PaymentStatus[];
}
