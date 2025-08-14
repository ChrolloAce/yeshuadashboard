import { Job, JobStatus, JobPriority, PaymentStatus, JobFilters } from '@/types/jobs';

export class JobsManager {
  private jobs: Job[] = [];
  private listeners: Set<() => void> = new Set();

  constructor() {
    // Initialize with sample data
    this.initializeSampleJobs();
  }

  private initializeSampleJobs(): void {
    const sampleJobs: Job[] = [
      {
        id: '1',
        jobNumber: 'YC-2024-001',
        status: JobStatus.PENDING,
        priority: JobPriority.NORMAL,
        client: {
          id: 'c1',
          firstName: 'Sarah',
          lastName: 'Johnson',
          email: 'sarah.johnson@email.com',
          phone: '(555) 123-4567'
        },
        address: {
          street: '123 Oak Street',
          apartment: 'Apt 2B',
          city: 'Arlington',
          state: 'VA',
          zipCode: '22201'
        },
        service: {
          bedrooms: 2,
          bathrooms: 1,
          cleaningType: 'Regular Cleaning',
          estimatedDuration: '1h 30m',
          specialInstructions: 'Please be careful around the antique vase in the living room',
          parkingInstructions: 'Park in visitor spot #15'
        },
        pricing: {
          baseRate: 120,
          addOns: 25,
          total: 145
        },
        scheduledDate: new Date('2024-01-15'),
        scheduledTime: '10:00',
        frequency: 'One-time',
        createdAt: new Date('2024-01-10'),
        updatedAt: new Date('2024-01-10'),
        invoiceSent: false,
        paymentStatus: PaymentStatus.PENDING
      },
      {
        id: '2',
        jobNumber: 'YC-2024-002',
        status: JobStatus.ASSIGNED,
        priority: JobPriority.HIGH,
        client: {
          id: 'c2',
          firstName: 'Mike',
          lastName: 'Davis',
          email: 'mike.davis@email.com',
          phone: '(555) 234-5678'
        },
        address: {
          street: '456 Pine Avenue',
          city: 'Alexandria',
          state: 'VA',
          zipCode: '22302'
        },
        service: {
          bedrooms: 3,
          bathrooms: 2,
          cleaningType: 'Deep Cleaning',
          estimatedDuration: '3h 15m',
          specialInstructions: 'Focus on kitchen and bathrooms - recent renovation',
          parkingInstructions: 'Driveway available'
        },
        pricing: {
          baseRate: 200,
          addOns: 60,
          total: 260
        },
        scheduledDate: new Date('2024-01-16'),
        scheduledTime: '09:00',
        frequency: 'One-time',
        assignedTeam: {
          id: 't1',
          name: 'Team Alpha',
          members: ['Maria Rodriguez', 'James Wilson']
        },
        createdAt: new Date('2024-01-11'),
        updatedAt: new Date('2024-01-12'),
        invoiceSent: true,
        paymentStatus: PaymentStatus.PAID
      },
      {
        id: '3',
        jobNumber: 'YC-2024-003',
        status: JobStatus.IN_PROGRESS,
        priority: JobPriority.NORMAL,
        client: {
          id: 'c3',
          firstName: 'Emma',
          lastName: 'Wilson',
          email: 'emma.wilson@email.com',
          phone: '(555) 345-6789'
        },
        address: {
          street: '789 Maple Drive',
          city: 'Falls Church',
          state: 'VA',
          zipCode: '22043'
        },
        service: {
          bedrooms: 1,
          bathrooms: 1,
          cleaningType: 'Regular Cleaning',
          estimatedDuration: '1h 15m'
        },
        pricing: {
          baseRate: 100,
          addOns: 0,
          total: 100
        },
        scheduledDate: new Date(),
        scheduledTime: '14:00',
        frequency: 'Weekly',
        assignedTeam: {
          id: 't2',
          name: 'Team Beta',
          members: ['Carlos Martinez', 'Lisa Chen']
        },
        createdAt: new Date('2024-01-08'),
        updatedAt: new Date(),
        invoiceSent: true,
        paymentStatus: PaymentStatus.PAID
      },
      {
        id: '4',
        jobNumber: 'YC-2024-004',
        status: JobStatus.COMPLETED,
        priority: JobPriority.NORMAL,
        client: {
          id: 'c4',
          firstName: 'David',
          lastName: 'Brown',
          email: 'david.brown@email.com',
          phone: '(555) 456-7890'
        },
        address: {
          street: '321 Cedar Lane',
          city: 'McLean',
          state: 'VA',
          zipCode: '22101'
        },
        service: {
          bedrooms: 4,
          bathrooms: 3,
          cleaningType: 'Move-out Cleaning',
          estimatedDuration: '4h 30m',
          specialInstructions: 'Property must be ready for final inspection'
        },
        pricing: {
          baseRate: 300,
          addOns: 80,
          total: 380
        },
        scheduledDate: new Date('2024-01-13'),
        scheduledTime: '08:00',
        frequency: 'One-time',
        assignedTeam: {
          id: 't1',
          name: 'Team Alpha',
          members: ['Maria Rodriguez', 'James Wilson']
        },
        createdAt: new Date('2024-01-09'),
        updatedAt: new Date('2024-01-13'),
        completedAt: new Date('2024-01-13'),
        invoiceSent: true,
        paymentStatus: PaymentStatus.PAID
      }
    ];

    this.jobs = sampleJobs;
  }

  public getAllJobs(): Job[] {
    return [...this.jobs];
  }

  public getJobsByStatus(status: JobStatus): Job[] {
    return this.jobs.filter(job => job.status === status);
  }

  public getJobsByTeam(teamId: string): Job[] {
    return this.jobs.filter(job => job.assignedTeam?.id === teamId);
  }

  public getFilteredJobs(filters: JobFilters): Job[] {
    let filteredJobs = [...this.jobs];

    if (filters.status && filters.status.length > 0) {
      filteredJobs = filteredJobs.filter(job => filters.status!.includes(job.status));
    }

    if (filters.priority && filters.priority.length > 0) {
      filteredJobs = filteredJobs.filter(job => filters.priority!.includes(job.priority));
    }

    if (filters.assignedTeam) {
      filteredJobs = filteredJobs.filter(job => job.assignedTeam?.id === filters.assignedTeam);
    }

    if (filters.paymentStatus && filters.paymentStatus.length > 0) {
      filteredJobs = filteredJobs.filter(job => filters.paymentStatus!.includes(job.paymentStatus));
    }

    if (filters.dateRange) {
      filteredJobs = filteredJobs.filter(job => {
        const jobDate = job.scheduledDate;
        return jobDate >= filters.dateRange!.start && jobDate <= filters.dateRange!.end;
      });
    }

    return filteredJobs;
  }

  public updateJobStatus(jobId: string, status: JobStatus): void {
    const job = this.jobs.find(j => j.id === jobId);
    if (job) {
      job.status = status;
      job.updatedAt = new Date();
      
      if (status === JobStatus.COMPLETED) {
        job.completedAt = new Date();
      }
      
      this.notifyListeners();
    }
  }

  public assignTeam(jobId: string, team: Job['assignedTeam']): void {
    const job = this.jobs.find(j => j.id === jobId);
    if (job) {
      job.assignedTeam = team;
      job.status = JobStatus.ASSIGNED;
      job.updatedAt = new Date();
      this.notifyListeners();
    }
  }

  public updateJobPriority(jobId: string, priority: JobPriority): void {
    const job = this.jobs.find(j => j.id === jobId);
    if (job) {
      job.priority = priority;
      job.updatedAt = new Date();
      this.notifyListeners();
    }
  }

  public addJob(job: Omit<Job, 'id' | 'jobNumber' | 'createdAt' | 'updatedAt'>): Job {
    const newJob: Job = {
      ...job,
      id: Math.random().toString(36).substr(2, 9),
      jobNumber: `YC-${new Date().getFullYear()}-${String(this.jobs.length + 1).padStart(3, '0')}`,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.jobs.unshift(newJob);
    this.notifyListeners();
    return newJob;
  }

  public getJobStats(): {
    total: number;
    pending: number;
    inProgress: number;
    completed: number;
    todayJobs: number;
  } {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return {
      total: this.jobs.length,
      pending: this.jobs.filter(job => job.status === JobStatus.PENDING).length,
      inProgress: this.jobs.filter(job => job.status === JobStatus.IN_PROGRESS).length,
      completed: this.jobs.filter(job => job.status === JobStatus.COMPLETED).length,
      todayJobs: this.jobs.filter(job => {
        const jobDate = new Date(job.scheduledDate);
        jobDate.setHours(0, 0, 0, 0);
        return jobDate.getTime() === today.getTime();
      }).length
    };
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener());
  }
}
