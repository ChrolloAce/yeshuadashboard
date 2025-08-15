import { 
  collection, 
  doc, 
  addDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  onSnapshot,
  QuerySnapshot,
  DocumentData
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Job, Quote, COLLECTIONS, JobStatus, PaymentStatus } from '@/types/database';
import { ClientService } from './ClientService';

export class JobService {
  private static instance: JobService;
  private clientService: ClientService;

  private constructor() {
    this.clientService = ClientService.getInstance();
  }

  public static getInstance(): JobService {
    if (!JobService.instance) {
      JobService.instance = new JobService();
    }
    return JobService.instance;
  }

  // Create a new job from an accepted quote
  public async createJobFromQuote(quote: Quote): Promise<Job> {
    try {
      const now = new Date();
      const job: Omit<Job, 'id'> = {
        quoteId: quote.id,
        clientId: quote.clientId,
        client: quote.client,
        service: quote.service,
        address: quote.address,
        pricing: quote.pricing,
        schedule: {
          ...quote.schedule,
          actualStartTime: undefined,
          actualEndTime: undefined
        },
        addOns: quote.addOns,
        specialInstructions: quote.specialInstructions,
        parkingInstructions: quote.parkingInstructions,
        status: 'pending',
        payment: {
          status: 'pending'
        },
        createdAt: now,
        updatedAt: now
      };

      // Filter out undefined values for Firestore
      const firestoreData = this.cleanDataForFirestore({
        ...job,
        createdAt: Timestamp.fromDate(job.createdAt),
        updatedAt: Timestamp.fromDate(job.updatedAt),
        schedule: {
          ...job.schedule,
          date: Timestamp.fromDate(job.schedule.date)
        }
      });

      const docRef = await addDoc(collection(db, COLLECTIONS.JOBS), firestoreData);

      // Update client statistics
      await this.updateClientJobStats(quote.clientId);

      return {
        id: docRef.id,
        ...job
      };
    } catch (error) {
      console.error('Error creating job from quote:', error);
      throw new Error('Failed to create job from quote');
    }
  }

  // Create a direct job (not from quote)
  public async createJob(jobData: Omit<Job, 'id' | 'createdAt' | 'updatedAt'>): Promise<Job> {
    try {
      const now = new Date();
      const job: Omit<Job, 'id'> = {
        ...jobData,
        createdAt: now,
        updatedAt: now
      };

      // Filter out undefined values for Firestore
      const firestoreData = this.cleanDataForFirestore({
        ...job,
        createdAt: Timestamp.fromDate(job.createdAt),
        updatedAt: Timestamp.fromDate(job.updatedAt),
        schedule: {
          ...job.schedule,
          date: Timestamp.fromDate(job.schedule.date),
          actualStartTime: job.schedule.actualStartTime ? Timestamp.fromDate(job.schedule.actualStartTime) : null,
          actualEndTime: job.schedule.actualEndTime ? Timestamp.fromDate(job.schedule.actualEndTime) : null
        },
        completedAt: job.completedAt ? Timestamp.fromDate(job.completedAt) : null,
        payment: {
          ...job.payment,
          paidAt: job.payment.paidAt ? Timestamp.fromDate(job.payment.paidAt) : null
        }
      });

      const docRef = await addDoc(collection(db, COLLECTIONS.JOBS), firestoreData);

      // Update client statistics
      await this.updateClientJobStats(jobData.clientId);

      return {
        id: docRef.id,
        ...job
      };
    } catch (error) {
      console.error('Error creating job:', error);
      throw new Error('Failed to create job');
    }
  }

  // Get all jobs with optional filtering
  public async getJobs(filters?: {
    status?: JobStatus;
    clientId?: string;
    assignedTo?: string;
    limit?: number;
    startDate?: Date;
    endDate?: Date;
  }): Promise<Job[]> {
    try {
      let q = query(
        collection(db, COLLECTIONS.JOBS),
        orderBy('schedule.date', 'desc')
      );

      if (filters?.status) {
        q = query(q, where('status', '==', filters.status));
      }

      if (filters?.clientId) {
        q = query(q, where('clientId', '==', filters.clientId));
      }

      if (filters?.assignedTo) {
        q = query(q, where('assignedTo.cleanerId', '==', filters.assignedTo));
      }

      if (filters?.limit) {
        q = query(q, limit(filters.limit));
      }

      const snapshot = await getDocs(q);
      let jobs = snapshot.docs.map(doc => this.convertFirestoreJob(doc.id, doc.data()));

      // Apply date filters client-side
      if (filters?.startDate) {
        jobs = jobs.filter(job => job.schedule.date >= filters.startDate!);
      }

      if (filters?.endDate) {
        jobs = jobs.filter(job => job.schedule.date <= filters.endDate!);
      }

      return jobs;
    } catch (error) {
      console.error('Error getting jobs:', error);
      throw new Error('Failed to get jobs');
    }
  }

  // Get a single job by ID
  public async getJob(id: string): Promise<Job | null> {
    try {
      const docRef = doc(db, COLLECTIONS.JOBS, id);
      const snapshot = await getDoc(docRef);
      
      if (!snapshot.exists()) {
        return null;
      }

      return this.convertFirestoreJob(snapshot.id, snapshot.data());
    } catch (error) {
      console.error('Error getting job:', error);
      throw new Error('Failed to get job');
    }
  }

  // Update job status
  public async updateJobStatus(id: string, status: JobStatus): Promise<void> {
    try {
      const docRef = doc(db, COLLECTIONS.JOBS, id);
      const updates: any = {
        status,
        updatedAt: Timestamp.fromDate(new Date())
      };

      if (status === 'completed') {
        updates.completedAt = Timestamp.fromDate(new Date());
      }

      await updateDoc(docRef, updates);

      // Update client statistics when job is completed
      if (status === 'completed') {
        const job = await this.getJob(id);
        if (job) {
          await this.updateClientJobStats(job.clientId);
        }
      }
    } catch (error) {
      console.error('Error updating job status:', error);
      throw new Error('Failed to update job status');
    }
  }

  // Assign job to cleaner/team
  public async assignJob(id: string, assignment: {
    cleanerId: string;
    cleanerName: string;
    teamId?: string;
  }): Promise<void> {
    try {
      const docRef = doc(db, COLLECTIONS.JOBS, id);
      await updateDoc(docRef, {
        assignedTo: assignment,
        status: 'assigned',
        updatedAt: Timestamp.fromDate(new Date())
      });
    } catch (error) {
      console.error('Error assigning job:', error);
      throw new Error('Failed to assign job');
    }
  }

  // Update job payment status
  public async updatePaymentStatus(
    id: string, 
    paymentStatus: PaymentStatus,
    paymentDetails?: {
      method?: 'card' | 'cash' | 'check';
      transactionId?: string;
    }
  ): Promise<void> {
    try {
      const docRef = doc(db, COLLECTIONS.JOBS, id);
      const updates: any = {
        'payment.status': paymentStatus,
        updatedAt: Timestamp.fromDate(new Date())
      };

      if (paymentStatus === 'paid') {
        updates['payment.paidAt'] = Timestamp.fromDate(new Date());
      }

      if (paymentDetails?.method) {
        updates['payment.method'] = paymentDetails.method;
      }

      if (paymentDetails?.transactionId) {
        updates['payment.transactionId'] = paymentDetails.transactionId;
      }

      await updateDoc(docRef, updates);
    } catch (error) {
      console.error('Error updating payment status:', error);
      throw new Error('Failed to update payment status');
    }
  }

  // Update job schedule
  public async updateJobSchedule(id: string, schedule: {
    date?: Date;
    timeSlot?: string;
    actualStartTime?: Date;
    actualEndTime?: Date;
  }): Promise<void> {
    try {
      const docRef = doc(db, COLLECTIONS.JOBS, id);
      const updates: any = {
        updatedAt: Timestamp.fromDate(new Date())
      };

      if (schedule.date) {
        updates['schedule.date'] = Timestamp.fromDate(schedule.date);
      }

      if (schedule.timeSlot) {
        updates['schedule.timeSlot'] = schedule.timeSlot;
      }

      if (schedule.actualStartTime) {
        updates['schedule.actualStartTime'] = Timestamp.fromDate(schedule.actualStartTime);
      }

      if (schedule.actualEndTime) {
        updates['schedule.actualEndTime'] = Timestamp.fromDate(schedule.actualEndTime);
      }

      await updateDoc(docRef, updates);
    } catch (error) {
      console.error('Error updating job schedule:', error);
      throw new Error('Failed to update job schedule');
    }
  }

  // Add job notes
  public async addJobNote(id: string, note: string): Promise<void> {
    try {
      const job = await this.getJob(id);
      if (!job) {
        throw new Error('Job not found');
      }

      const existingNotes = job.notes || '';
      const timestamp = new Date().toLocaleString();
      const newNote = `[${timestamp}] ${note}`;
      const updatedNotes = existingNotes 
        ? `${existingNotes}\n${newNote}` 
        : newNote;

      const docRef = doc(db, COLLECTIONS.JOBS, id);
      await updateDoc(docRef, {
        notes: updatedNotes,
        updatedAt: Timestamp.fromDate(new Date())
      });
    } catch (error) {
      console.error('Error adding job note:', error);
      throw new Error('Failed to add job note');
    }
  }

  // Add job rating and review
  public async addJobReview(id: string, rating: number, review?: string): Promise<void> {
    try {
      const docRef = doc(db, COLLECTIONS.JOBS, id);
      await updateDoc(docRef, {
        rating,
        review,
        updatedAt: Timestamp.fromDate(new Date())
      });
    } catch (error) {
      console.error('Error adding job review:', error);
      throw new Error('Failed to add job review');
    }
  }

  // Delete a job
  public async deleteJob(id: string): Promise<void> {
    try {
      const job = await this.getJob(id);
      const docRef = doc(db, COLLECTIONS.JOBS, id);
      await deleteDoc(docRef);

      // Update client statistics
      if (job) {
        await this.updateClientJobStats(job.clientId);
      }
    } catch (error) {
      console.error('Error deleting job:', error);
      throw new Error('Failed to delete job');
    }
  }

  // Subscribe to jobs changes
  public subscribeToJobs(
    callback: (jobs: Job[]) => void,
    filters?: {
      status?: JobStatus;
      clientId?: string;
      assignedTo?: string;
      limit?: number;
    }
  ): () => void {
    let q = query(
      collection(db, COLLECTIONS.JOBS),
      orderBy('schedule.date', 'desc')
    );

    if (filters?.status) {
      q = query(q, where('status', '==', filters.status));
    }

    if (filters?.clientId) {
      q = query(q, where('clientId', '==', filters.clientId));
    }

    if (filters?.assignedTo) {
      q = query(q, where('assignedTo.cleanerId', '==', filters.assignedTo));
    }

    if (filters?.limit) {
      q = query(q, limit(filters.limit));
    }

    const unsubscribe = onSnapshot(q, (snapshot: QuerySnapshot<DocumentData>) => {
      const jobs = snapshot.docs.map(doc => 
        this.convertFirestoreJob(doc.id, doc.data())
      );
      callback(jobs);
    });

    return unsubscribe;
  }

  // Get job statistics
  public async getJobStats(): Promise<{
    totalJobs: number;
    completedJobs: number;
    pendingJobs: number;
    totalRevenue: number;
    averageJobValue: number;
    completionRate: number;
  }> {
    try {
      const jobs = await this.getJobs();
      
      const totalJobs = jobs.length;
      const completedJobs = jobs.filter(job => job.status === 'completed').length;
      const pendingJobs = jobs.filter(job => ['pending', 'confirmed', 'assigned'].includes(job.status)).length;
      
      const totalRevenue = jobs
        .filter(job => job.payment.status === 'paid')
        .reduce((sum, job) => sum + job.pricing.finalPrice, 0);
      
      const averageJobValue = totalJobs > 0 ? totalRevenue / totalJobs : 0;
      const completionRate = totalJobs > 0 ? (completedJobs / totalJobs) * 100 : 0;

      return {
        totalJobs,
        completedJobs,
        pendingJobs,
        totalRevenue,
        averageJobValue,
        completionRate
      };
    } catch (error) {
      console.error('Error getting job stats:', error);
      throw new Error('Failed to get job stats');
    }
  }

  // Private helper methods
  private async updateClientJobStats(clientId: string): Promise<void> {
    try {
      const clientJobs = await this.getJobs({ clientId });
      const totalJobs = clientJobs.length;
      const totalSpent = clientJobs
        .filter(job => job.payment.status === 'paid')
        .reduce((sum, job) => sum + job.pricing.finalPrice, 0);

      await this.clientService.updateClientStats(clientId, totalJobs, totalSpent);
    } catch (error) {
      console.error('Error updating client job stats:', error);
      // Don't throw here to avoid breaking the main operation
    }
  }

  private convertFirestoreJob(id: string, data: DocumentData): Job {
    return {
      id,
      quoteId: data.quoteId,
      clientId: data.clientId,
      client: data.client,
      service: data.service,
      address: data.address,
      pricing: data.pricing,
      schedule: {
        ...data.schedule,
        date: this.convertToDate(data.schedule.date),
        actualStartTime: data.schedule.actualStartTime ? this.convertToDate(data.schedule.actualStartTime) : undefined,
        actualEndTime: data.schedule.actualEndTime ? this.convertToDate(data.schedule.actualEndTime) : undefined
      },
      addOns: data.addOns,
      specialInstructions: data.specialInstructions,
      parkingInstructions: data.parkingInstructions,
      status: data.status,
      assignedTo: data.assignedTo,
      payment: {
        ...data.payment,
        paidAt: data.payment.paidAt ? this.convertToDate(data.payment.paidAt) : undefined
      },
      createdAt: this.convertToDate(data.createdAt),
      updatedAt: this.convertToDate(data.updatedAt),
      completedAt: data.completedAt ? this.convertToDate(data.completedAt) : undefined,
      notes: data.notes,
      beforePhotos: data.beforePhotos || [],
      afterPhotos: data.afterPhotos || [],
      rating: data.rating,
      review: data.review
    };
  }

  // Helper method to convert various date formats to Date object
  private convertToDate(dateValue: any): Date {
    if (!dateValue) {
      return new Date();
    }
    
    // If it's already a Date object
    if (dateValue instanceof Date) {
      return dateValue;
    }
    
    // If it's a Firestore Timestamp
    if (dateValue && typeof dateValue.toDate === 'function') {
      return dateValue.toDate();
    }
    
    // If it's a string or number, convert to Date
    if (typeof dateValue === 'string' || typeof dateValue === 'number') {
      return new Date(dateValue);
    }
    
    // If it has seconds property (Firestore Timestamp-like object)
    if (dateValue && typeof dateValue.seconds === 'number') {
      return new Date(dateValue.seconds * 1000);
    }
    
    console.warn('Unknown date format:', dateValue);
    return new Date();
  }

  // Helper method to remove undefined values for Firestore
  private cleanDataForFirestore(obj: any): any {
    if (obj === null || obj === undefined) {
      return null;
    }
    
    if (Array.isArray(obj)) {
      return obj.map(item => this.cleanDataForFirestore(item));
    }
    
    if (typeof obj === 'object') {
      const cleaned: any = {};
      for (const [key, value] of Object.entries(obj)) {
        if (value !== undefined) {
          cleaned[key] = this.cleanDataForFirestore(value);
        }
      }
      return cleaned;
    }
    
    return obj;
  }
}
