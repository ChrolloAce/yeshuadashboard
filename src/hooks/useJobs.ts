import { useState, useEffect, useMemo } from 'react';
import { JobsManager } from '@/services/jobs/JobsManager';
import { Job, JobStatus, JobPriority, JobFilters } from '@/types/jobs';

export const useJobs = () => {
  const [jobsManager] = useState(() => new JobsManager());
  const [jobs, setJobs] = useState<Job[]>(() => jobsManager.getAllJobs());

  useEffect(() => {
    const unsubscribe = jobsManager.subscribe(() => {
      setJobs(jobsManager.getAllJobs());
    });

    return unsubscribe;
  }, [jobsManager]);

  const stats = useMemo(() => {
    return jobsManager.getJobStats();
  }, [jobs, jobsManager]);

  const getJobsByStatus = (status: JobStatus): Job[] => {
    return jobsManager.getJobsByStatus(status);
  };

  const getJobsByTeam = (teamId: string): Job[] => {
    return jobsManager.getJobsByTeam(teamId);
  };

  const getFilteredJobs = (filters: JobFilters): Job[] => {
    return jobsManager.getFilteredJobs(filters);
  };

  const updateJobStatus = (jobId: string, status: JobStatus): void => {
    jobsManager.updateJobStatus(jobId, status);
  };

  const assignTeam = (jobId: string, team: Job['assignedTeam']): void => {
    jobsManager.assignTeam(jobId, team);
  };

  const updateJobPriority = (jobId: string, priority: JobPriority): void => {
    jobsManager.updateJobPriority(jobId, priority);
  };

  const addJob = (job: Omit<Job, 'id' | 'jobNumber' | 'createdAt' | 'updatedAt'>): Job => {
    return jobsManager.addJob(job);
  };

  return {
    jobs,
    stats,
    getJobsByStatus,
    getJobsByTeam,
    getFilteredJobs,
    updateJobStatus,
    assignTeam,
    updateJobPriority,
    addJob
  };
};
