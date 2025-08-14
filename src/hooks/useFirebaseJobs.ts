import { useState, useEffect, useMemo } from 'react';
import { FirebaseJobsManager } from '@/services/firebase/FirebaseJobsManager';
import { Job, JobStatus, JobPriority, JobFilters } from '@/types/jobs';

export const useFirebaseJobs = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const firebaseJobsManager = FirebaseJobsManager.getInstance();

  useEffect(() => {
    // Subscribe to real-time job updates
    const unsubscribe = firebaseJobsManager.subscribeToJobs((updatedJobs) => {
      setJobs(updatedJobs);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const stats = useMemo(() => {
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
  }, [jobs]);

  const getJobById = async (jobId: string): Promise<Job | null> => {
    try {
      setError(null);
      return await firebaseJobsManager.getJobById(jobId);
    } catch (error: any) {
      setError(error.message);
      return null;
    }
  };

  const getJobsByStatus = (status: JobStatus): Job[] => {
    return jobs.filter(job => job.status === status);
  };

  const getJobsByTeam = (teamId: string): Job[] => {
    return jobs.filter(job => job.assignedTeam?.id === teamId);
  };

  const getFilteredJobs = (filters: JobFilters): Job[] => {
    let filteredJobs = [...jobs];

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
  };

  const addJob = async (job: Omit<Job, 'id' | 'jobNumber' | 'createdAt' | 'updatedAt'>): Promise<Job | null> => {
    try {
      setError(null);
      return await firebaseJobsManager.addJob(job);
    } catch (error: any) {
      setError(error.message);
      return null;
    }
  };

  const updateJob = async (jobId: string, updates: Partial<Job>): Promise<boolean> => {
    try {
      setError(null);
      await firebaseJobsManager.updateJob(jobId, updates);
      return true;
    } catch (error: any) {
      setError(error.message);
      return false;
    }
  };

  const updateJobStatus = async (jobId: string, status: JobStatus): Promise<boolean> => {
    try {
      setError(null);
      await firebaseJobsManager.updateJobStatus(jobId, status);
      return true;
    } catch (error: any) {
      setError(error.message);
      return false;
    }
  };

  const assignTeam = async (jobId: string, team: Job['assignedTeam']): Promise<boolean> => {
    try {
      setError(null);
      await firebaseJobsManager.assignTeam(jobId, team);
      return true;
    } catch (error: any) {
      setError(error.message);
      return false;
    }
  };

  const updateJobPriority = async (jobId: string, priority: JobPriority): Promise<boolean> => {
    try {
      setError(null);
      await firebaseJobsManager.updateJobPriority(jobId, priority);
      return true;
    } catch (error: any) {
      setError(error.message);
      return false;
    }
  };

  const deleteJob = async (jobId: string): Promise<boolean> => {
    try {
      setError(null);
      await firebaseJobsManager.deleteJob(jobId);
      return true;
    } catch (error: any) {
      setError(error.message);
      return false;
    }
  };

  const clearError = (): void => {
    setError(null);
  };

  // Real-time subscriptions
  const subscribeToJobsByStatus = (status: JobStatus, callback: (jobs: Job[]) => void): (() => void) => {
    return firebaseJobsManager.subscribeToJobsByStatus(status, callback);
  };

  const subscribeToJobsByTeam = (teamId: string, callback: (jobs: Job[]) => void): (() => void) => {
    return firebaseJobsManager.subscribeToJobsByTeam(teamId, callback);
  };

  return {
    jobs,
    loading,
    error,
    stats,
    getJobById,
    getJobsByStatus,
    getJobsByTeam,
    getFilteredJobs,
    addJob,
    updateJob,
    updateJobStatus,
    assignTeam,
    updateJobPriority,
    deleteJob,
    clearError,
    subscribeToJobsByStatus,
    subscribeToJobsByTeam
  };
};
