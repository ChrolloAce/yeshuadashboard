'use client';

import React, { useState } from 'react';
import { Calendar, CheckCircle, Clock, MapPin, Phone, Mail, User, Star, DollarSign, AlertCircle } from 'lucide-react';
import { ThemedCard } from '@/components/ui/ThemedCard';
import { ThemedButton } from '@/components/ui/ThemedButton';
import { ThemedBadge } from '@/components/ui/ThemedBadge';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useAuth } from '@/hooks/useAuth';
import { useFirebaseJobs } from '@/hooks/useFirebaseJobs';
import { Job } from '@/types/database';
import { format } from 'date-fns';

export const CleanerDashboard: React.FC = () => {
  const { userProfile } = useAuth();
  const { jobs, loading, error } = useFirebaseJobs({ 
    realTime: true
  });

  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  // Filter jobs for cleaner
  const assignedJobs = jobs.filter(job => 
    job.assignedTo?.cleanerId === userProfile?.uid
  );

  const todayJobs = assignedJobs.filter(job => {
    const jobDate = new Date(job.schedule.date);
    const today = new Date();
    return jobDate.toDateString() === today.toDateString();
  });

  const upcomingJobs = assignedJobs.filter(job => {
    const jobDate = new Date(job.schedule.date);
    const today = new Date();
    return jobDate > today;
  }).slice(0, 5);

  const completedJobs = assignedJobs.filter(job => job.status === 'completed');
  const totalEarnings = completedJobs.reduce((sum, job) => sum + job.pricing.finalPrice, 0);

  const getStatusColor = (status: string): 'default' | 'primary' | 'success' | 'warning' | 'error' | 'info' => {
    switch (status) {
      case 'completed': return 'success';
      case 'in-progress': return 'warning';
      case 'confirmed': return 'info';
      case 'assigned': return 'info';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  const JobCard: React.FC<{ job: Job; compact?: boolean }> = ({ job, compact = false }) => (
    <ThemedCard className={`p-4 hover:shadow-md transition-shadow cursor-pointer ${compact ? '' : 'mb-4'}`} 
              onClick={() => setSelectedJob(job)}>
      <div className="flex items-start justify-between mb-3">
        <div>
          <h4 className="font-semibold text-gray-900 capitalize">
            {job.service.type.replace('-', ' ')} Cleaning
          </h4>
          <p className="text-sm text-gray-600">
            {job.client.firstName} {job.client.lastName}
          </p>
        </div>
        <ThemedBadge variant={getStatusColor(job.status)}>
          {job.status.replace('-', ' ').toUpperCase()}
        </ThemedBadge>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex items-center text-gray-600">
          <Calendar className="w-4 h-4 mr-2" />
          {format(new Date(job.schedule.date), 'MMM dd, yyyy')} at {job.schedule.timeSlot}
        </div>
        <div className="flex items-center text-gray-600">
          <MapPin className="w-4 h-4 mr-2" />
          {job.address.street}, {job.address.city}, {job.address.state}
        </div>
        <div className="flex items-center text-gray-600">
          <DollarSign className="w-4 h-4 mr-2" />
          ${job.pricing.finalPrice}
        </div>
      </div>

      {!compact && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">
              {job.service.bedrooms} bed, {job.service.bathrooms} bath
            </span>
            <span className="text-sm text-gray-500">
              ~{Math.round(job.schedule.estimatedDuration / 60)}h
            </span>
          </div>
        </div>
      )}
    </ThemedCard>
  );

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
          <h3 className="text-lg font-semibold text-red-800 mb-2">Error Loading Dashboard</h3>
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {userProfile?.firstName}!
        </h1>
        <p className="text-gray-600 mt-2">Here's your cleaning schedule and progress</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <ThemedCard className="p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">{todayJobs.length}</p>
              <p className="text-sm text-gray-600">Today's Jobs</p>
            </div>
          </div>
        </ThemedCard>

        <ThemedCard className="p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">{completedJobs.length}</p>
              <p className="text-sm text-gray-600">Completed Jobs</p>
            </div>
          </div>
        </ThemedCard>

        <ThemedCard className="p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">{upcomingJobs.length}</p>
              <p className="text-sm text-gray-600">Upcoming Jobs</p>
            </div>
          </div>
        </ThemedCard>

        <ThemedCard className="p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">${totalEarnings.toFixed(0)}</p>
              <p className="text-sm text-gray-600">Total Earnings</p>
            </div>
          </div>
        </ThemedCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Today's Schedule */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Today's Schedule</h2>
          {todayJobs.length > 0 ? (
            <div className="space-y-4">
              {todayJobs.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
          ) : (
            <ThemedCard className="p-8 text-center">
              <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs today</h3>
              <p className="text-gray-600">Enjoy your day off!</p>
            </ThemedCard>
          )}
        </div>

        {/* Upcoming Jobs */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Upcoming Jobs</h2>
          {upcomingJobs.length > 0 ? (
            <div className="space-y-4">
              {upcomingJobs.map((job) => (
                <JobCard key={job.id} job={job} compact />
              ))}
            </div>
          ) : (
            <ThemedCard className="p-8 text-center">
              <Clock className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No upcoming jobs</h3>
              <p className="text-gray-600">Check back later for new assignments</p>
            </ThemedCard>
          )}
        </div>
      </div>

      {/* Job Details Modal */}
      {selectedJob && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 capitalize">
                    {selectedJob.service.type.replace('-', ' ')} Cleaning
                  </h3>
                  <p className="text-gray-600">Job #{selectedJob.id.slice(-8)}</p>
                </div>
                <button
                  onClick={() => setSelectedJob(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Client Info */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Client Information</h4>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <User className="w-4 h-4 text-gray-400 mr-2" />
                      <span>{selectedJob.client.firstName} {selectedJob.client.lastName}</span>
                    </div>
                    {selectedJob.client.email && (
                      <div className="flex items-center">
                        <Mail className="w-4 h-4 text-gray-400 mr-2" />
                        <span>{selectedJob.client.email}</span>
                      </div>
                    )}
                    {selectedJob.client.phone && (
                      <div className="flex items-center">
                        <Phone className="w-4 h-4 text-gray-400 mr-2" />
                        <span>{selectedJob.client.phone}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Job Details */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Job Details</h4>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                      <span>{format(new Date(selectedJob.schedule.date), 'MMM dd, yyyy')} at {selectedJob.schedule.timeSlot}</span>
                    </div>
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 text-gray-400 mr-2" />
                      <span>{selectedJob.address.street}, {selectedJob.address.city}, {selectedJob.address.state} {selectedJob.address.zipCode}</span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 text-gray-400 mr-2" />
                      <span>~{Math.round(selectedJob.schedule.estimatedDuration / 60)} hours</span>
                    </div>
                    <div className="flex items-center">
                      <DollarSign className="w-4 h-4 text-gray-400 mr-2" />
                      <span>${selectedJob.pricing.finalPrice}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Special Instructions */}
              {(selectedJob.specialInstructions || selectedJob.parkingInstructions) && (
                <div className="mt-6">
                  <h4 className="font-semibold text-gray-900 mb-3">Instructions</h4>
                  {selectedJob.specialInstructions && (
                    <div className="mb-2">
                      <p className="text-sm font-medium text-gray-700">Special Instructions:</p>
                      <p className="text-gray-600">{selectedJob.specialInstructions}</p>
                    </div>
                  )}
                  {selectedJob.parkingInstructions && (
                    <div>
                      <p className="text-sm font-medium text-gray-700">Parking Instructions:</p>
                      <p className="text-gray-600">{selectedJob.parkingInstructions}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex space-x-3">
                  <ThemedButton variant="outline" onClick={() => setSelectedJob(null)} className="flex-1">
                    Close
                  </ThemedButton>
                  {selectedJob.status === 'assigned' && (
                    <ThemedButton variant="primary" className="flex-1">
                      Start Job
                    </ThemedButton>
                  )}
                  {selectedJob.status === 'in-progress' && (
                    <ThemedButton variant="success" className="flex-1">
                      Mark Complete
                    </ThemedButton>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};