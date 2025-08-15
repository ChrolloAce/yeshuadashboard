import { useState, useEffect } from 'react';
import { JobService } from '@/services/database/JobService';
import { Job, JobStatus } from '@/types/database';

interface UseFirebaseJobsOptions {
  status?: JobStatus;
  limit?: number;
  realTime?: boolean;
}

interface UseFirebaseJobsReturn {
  jobs: Job[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  deleteJob: (jobId: string) => Promise<void>;
  updateJobStatus: (jobId: string, status: JobStatus) => Promise<void>;
  assignJob: (jobId: string, assignment: {
    cleanerId: string;
    cleanerName: string;
    teamId?: string;
  }) => Promise<void>;
}

export const useFirebaseJobs = (options: UseFirebaseJobsOptions = {}): UseFirebaseJobsReturn => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const jobService = JobService.getInstance();

  const loadJobs = async () => {
    try {
      setLoading(true);
      setError(null);
      const fetchedJobs = await jobService.getJobs({
        status: options.status,
        limit: options.limit
      });
      setJobs(fetchedJobs);
    } catch (err: any) {
      console.error('Error loading jobs:', err);
      setError(err.message || 'Failed to load jobs');
    } finally {
      setLoading(false);
    }
  };

  const deleteJob = async (jobId: string) => {
    try {
      await jobService.deleteJob(jobId);
      setJobs(prevJobs => prevJobs.filter(job => job.id !== jobId));
    } catch (err: any) {
      console.error('Error deleting job:', err);
      setError(err.message || 'Failed to delete job');
      throw err;
    }
  };

  const updateJobStatus = async (jobId: string, status: JobStatus) => {
    try {
      await jobService.updateJobStatus(jobId, status);
      setJobs(prevJobs => 
        prevJobs.map(job => 
          job.id === jobId ? { ...job, status, updatedAt: new Date() } : job
        )
      );
    } catch (err: any) {
      console.error('Error updating job status:', err);
      setError(err.message || 'Failed to update job status');
      throw err;
    }
  };

  const assignJob = async (jobId: string, assignment: {
    cleanerId: string;
    cleanerName: string;
    teamId?: string;
  }) => {
    try {
      await jobService.assignJob(jobId, assignment);
      setJobs(prevJobs => 
        prevJobs.map(job => 
          job.id === jobId ? { 
            ...job, 
            assignedTo: assignment, 
            status: 'assigned' as JobStatus,
            updatedAt: new Date() 
          } : job
        )
      );
    } catch (err: any) {
      console.error('Error assigning job:', err);
      setError(err.message || 'Failed to assign job');
      throw err;
    }
  };

  useEffect(() => {
    if (options.realTime) {
      // Set up real-time subscription
      const unsubscribe = jobService.subscribeToJobs(
        (updatedJobs) => {
          setJobs(updatedJobs);
          setLoading(false);
        },
        {
          status: options.status,
          limit: options.limit
        }
      );

      return () => unsubscribe();
    } else {
      // Load jobs once
      loadJobs();
    }
  }, [options.status, options.limit, options.realTime]);

  return {
    jobs,
    loading,
    error,
    refresh: loadJobs,
    deleteJob,
    updateJobStatus,
    assignJob
  };
};