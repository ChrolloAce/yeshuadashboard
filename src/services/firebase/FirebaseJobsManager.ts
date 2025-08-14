import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  Timestamp,
  QueryConstraint
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Job, JobStatus, JobPriority, JobFilters } from '@/types/jobs';

export class FirebaseJobsManager {
  private static instance: FirebaseJobsManager;
  private listeners: Map<string, () => void> = new Map();

  private constructor() {}

  public static getInstance(): FirebaseJobsManager {
    if (!FirebaseJobsManager.instance) {
      FirebaseJobsManager.instance = new FirebaseJobsManager();
    }
    return FirebaseJobsManager.instance;
  }

  // Convert Firestore document to Job object
  private docToJob(doc: any): Job {
    const data = doc.data();
    return {
      ...data,
      id: doc.id,
      scheduledDate: data.scheduledDate?.toDate() || new Date(),
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
      completedAt: data.completedAt?.toDate() || null,
    } as Job;
  }

  // Convert Job object to Firestore document
  private jobToDoc(job: Omit<Job, 'id'>): any {
    return {
      ...job,
      scheduledDate: Timestamp.fromDate(job.scheduledDate),
      createdAt: Timestamp.fromDate(job.createdAt),
      updatedAt: Timestamp.fromDate(job.updatedAt),
      completedAt: job.completedAt ? Timestamp.fromDate(job.completedAt) : null,
    };
  }

  public async getAllJobs(): Promise<Job[]> {
    try {
      const jobsRef = collection(db, 'jobs');
      const q = query(jobsRef, orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => this.docToJob(doc));
    } catch (error) {
      console.error('Error fetching jobs:', error);
      throw new Error('Failed to fetch jobs');
    }
  }

  public async getJobById(jobId: string): Promise<Job | null> {
    try {
      const jobDoc = await getDoc(doc(db, 'jobs', jobId));
      return jobDoc.exists() ? this.docToJob(jobDoc) : null;
    } catch (error) {
      console.error('Error fetching job:', error);
      throw new Error('Failed to fetch job');
    }
  }

  public async getJobsByStatus(status: JobStatus): Promise<Job[]> {
    try {
      const jobsRef = collection(db, 'jobs');
      const q = query(
        jobsRef,
        where('status', '==', status),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => this.docToJob(doc));
    } catch (error) {
      console.error('Error fetching jobs by status:', error);
      throw new Error('Failed to fetch jobs by status');
    }
  }

  public async getJobsByTeam(teamId: string): Promise<Job[]> {
    try {
      const jobsRef = collection(db, 'jobs');
      const q = query(
        jobsRef,
        where('assignedTeam.id', '==', teamId),
        orderBy('scheduledDate', 'asc')
      );
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => this.docToJob(doc));
    } catch (error) {
      console.error('Error fetching jobs by team:', error);
      throw new Error('Failed to fetch jobs by team');
    }
  }

  public async getFilteredJobs(filters: JobFilters): Promise<Job[]> {
    try {
      const jobsRef = collection(db, 'jobs');
      const constraints: QueryConstraint[] = [];

      // Add status filter
      if (filters.status && filters.status.length > 0) {
        constraints.push(where('status', 'in', filters.status));
      }

      // Add priority filter
      if (filters.priority && filters.priority.length > 0) {
        constraints.push(where('priority', 'in', filters.priority));
      }

      // Add team filter
      if (filters.assignedTeam) {
        constraints.push(where('assignedTeam.id', '==', filters.assignedTeam));
      }

      // Add payment status filter
      if (filters.paymentStatus && filters.paymentStatus.length > 0) {
        constraints.push(where('paymentStatus', 'in', filters.paymentStatus));
      }

      // Add date range filter
      if (filters.dateRange) {
        constraints.push(
          where('scheduledDate', '>=', Timestamp.fromDate(filters.dateRange.start)),
          where('scheduledDate', '<=', Timestamp.fromDate(filters.dateRange.end))
        );
      }

      constraints.push(orderBy('createdAt', 'desc'));

      const q = query(jobsRef, ...constraints);
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => this.docToJob(doc));
    } catch (error) {
      console.error('Error fetching filtered jobs:', error);
      throw new Error('Failed to fetch filtered jobs');
    }
  }

  public async addJob(job: Omit<Job, 'id' | 'jobNumber' | 'createdAt' | 'updatedAt'>): Promise<Job> {
    try {
      // Generate job number
      const jobCount = await this.getJobCount();
      const jobNumber = `YC-${new Date().getFullYear()}-${String(jobCount + 1).padStart(3, '0')}`;

      const newJob: Omit<Job, 'id'> = {
        ...job,
        jobNumber,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const docRef = await addDoc(collection(db, 'jobs'), this.jobToDoc(newJob));
      
      return {
        ...newJob,
        id: docRef.id
      };
    } catch (error) {
      console.error('Error adding job:', error);
      throw new Error('Failed to add job');
    }
  }

  public async updateJob(jobId: string, updates: Partial<Job>): Promise<void> {
    try {
      const updatedData = {
        ...updates,
        updatedAt: new Date()
      };

      await updateDoc(doc(db, 'jobs', jobId), this.jobToDoc(updatedData as any));
    } catch (error) {
      console.error('Error updating job:', error);
      throw new Error('Failed to update job');
    }
  }

  public async updateJobStatus(jobId: string, status: JobStatus): Promise<void> {
    try {
      const updates: any = {
        status,
        updatedAt: new Date()
      };

      if (status === JobStatus.COMPLETED) {
        updates.completedAt = new Date();
      }

      await updateDoc(doc(db, 'jobs', jobId), updates);
    } catch (error) {
      console.error('Error updating job status:', error);
      throw new Error('Failed to update job status');
    }
  }

  public async assignTeam(jobId: string, team: Job['assignedTeam']): Promise<void> {
    try {
      await updateDoc(doc(db, 'jobs', jobId), {
        assignedTeam: team,
        status: JobStatus.ASSIGNED,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Error assigning team:', error);
      throw new Error('Failed to assign team');
    }
  }

  public async updateJobPriority(jobId: string, priority: JobPriority): Promise<void> {
    try {
      await updateDoc(doc(db, 'jobs', jobId), {
        priority,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Error updating job priority:', error);
      throw new Error('Failed to update job priority');
    }
  }

  public async deleteJob(jobId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'jobs', jobId));
    } catch (error) {
      console.error('Error deleting job:', error);
      throw new Error('Failed to delete job');
    }
  }

  public async getJobStats(): Promise<{
    total: number;
    pending: number;
    inProgress: number;
    completed: number;
    todayJobs: number;
  }> {
    try {
      const jobs = await this.getAllJobs();
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      return {
        total: jobs.length,
        pending: jobs.filter(job => job.status === JobStatus.PENDING).length,
        inProgress: jobs.filter(job => job.status === JobStatus.IN_PROGRESS).length,
        completed: jobs.filter(job => job.status === JobStatus.COMPLETED).length,
        todayJobs: jobs.filter(job => {
          const jobDate = new Date(job.scheduledDate);
          jobDate.setHours(0, 0, 0, 0);
          return jobDate.getTime() === today.getTime();
        }).length
      };
    } catch (error) {
      console.error('Error getting job stats:', error);
      throw new Error('Failed to get job stats');
    }
  }

  private async getJobCount(): Promise<number> {
    try {
      const jobsRef = collection(db, 'jobs');
      const querySnapshot = await getDocs(jobsRef);
      return querySnapshot.size;
    } catch (error) {
      console.error('Error getting job count:', error);
      return 0;
    }
  }

  // Real-time listeners
  public subscribeToJobs(callback: (jobs: Job[]) => void): () => void {
    const jobsRef = collection(db, 'jobs');
    const q = query(jobsRef, orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const jobs = querySnapshot.docs.map(doc => this.docToJob(doc));
      callback(jobs);
    }, (error) => {
      console.error('Error in jobs subscription:', error);
    });

    return unsubscribe;
  }

  public subscribeToJobsByStatus(status: JobStatus, callback: (jobs: Job[]) => void): () => void {
    const jobsRef = collection(db, 'jobs');
    const q = query(
      jobsRef,
      where('status', '==', status),
      orderBy('createdAt', 'desc')
    );
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const jobs = querySnapshot.docs.map(doc => this.docToJob(doc));
      callback(jobs);
    }, (error) => {
      console.error('Error in jobs by status subscription:', error);
    });

    return unsubscribe;
  }

  public subscribeToJobsByTeam(teamId: string, callback: (jobs: Job[]) => void): () => void {
    const jobsRef = collection(db, 'jobs');
    const q = query(
      jobsRef,
      where('assignedTeam.id', '==', teamId),
      orderBy('scheduledDate', 'asc')
    );
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const jobs = querySnapshot.docs.map(doc => this.docToJob(doc));
      callback(jobs);
    }, (error) => {
      console.error('Error in jobs by team subscription:', error);
    });

    return unsubscribe;
  }
}
