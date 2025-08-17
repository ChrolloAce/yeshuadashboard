'use client';

import React, { useState, useEffect } from 'react';
import { MapPin, Clock, DollarSign, Star, Check, X, Filter, Search, AlertCircle } from 'lucide-react';
import { ThemedCard, ThemedButton, ThemedBadge } from '@/components/ui';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useFirebaseJobs } from '@/hooks/useFirebaseJobs';
import { useAuth } from '@/hooks/useAuth';
import { Job } from '@/types/database';
import { format } from 'date-fns';

export const JobDiscovery: React.FC = () => {
  const { userProfile } = useAuth();
  const { jobs, loading, error, assignJob } = useFirebaseJobs({ realTime: true });
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedServiceType, setSelectedServiceType] = useState<string>('all');
  const [maxDistance, setMaxDistance] = useState<number>(25);
  const [showFilters, setShowFilters] = useState(false);
  const [acceptingJob, setAcceptingJob] = useState<string | null>(null);
  const [decliningJob, setDecliningJob] = useState<string | null>(null);

  // Filter available jobs (not assigned or assigned to current cleaner)
  const availableJobs = jobs.filter(job => 
    // Job is not assigned to anyone, or is in pending/confirmed state
    (!job.assignedTo && (job.status === 'pending' || job.status === 'confirmed')) ||
    // Or job is assigned to current cleaner (show as "Your Job")
    (job.assignedTo?.cleanerId === userProfile?.uid)
  );

  // Apply filters
  const filteredJobs = availableJobs.filter(job => {
    const matchesSearch = searchQuery === '' || 
      job.client.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.client.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.address.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.address.street.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesServiceType = selectedServiceType === 'all' || job.service.type === selectedServiceType;
    
    // TODO: Implement actual distance calculation
    const matchesDistance = true; // For now, show all jobs
    
    return matchesSearch && matchesServiceType && matchesDistance;
  });

  const serviceTypes = [
    { value: 'all', label: 'All Services' },
    { value: 'standard', label: 'Standard Cleaning' },
    { value: 'deep', label: 'Deep Cleaning' },
    { value: 'move-in', label: 'Move-in Cleaning' },
    { value: 'move-out', label: 'Move-out Cleaning' },
    { value: 'post-construction', label: 'Post-construction' }
  ];

  const calculateDistance = (jobAddress: Job['address']): string => {
    // TODO: Implement actual distance calculation based on cleaner location
    // For now, return a placeholder
    return `${Math.floor(Math.random() * maxDistance) + 1} mi`;
  };

  const calculateEstimatedEarnings = (job: Job): number => {
    // Assuming cleaners get 70% of the job price
    return job.pricing.finalPrice * 0.7;
  };

  const handleAcceptJob = async (job: Job) => {
    if (!userProfile) return;

    try {
      setAcceptingJob(job.id);
      
      await assignJob(job.id, {
        cleanerId: userProfile.uid,
        cleanerName: `${userProfile.firstName} ${userProfile.lastName}`,
        teamId: undefined
      });

      console.log('✅ Job accepted successfully');
    } catch (error) {
      console.error('Error accepting job:', error);
    } finally {
      setAcceptingJob(null);
    }
  };

  const handleDeclineJob = (job: Job) => {
    setDecliningJob(job.id);
    // For now, just hide the job. In a real app, you might want to track declined jobs
    setTimeout(() => {
      setDecliningJob(null);
    }, 1000);
  };

  const JobDiscoveryCard: React.FC<{ job: Job }> = ({ job }) => {
    const distance = calculateDistance(job.address);
    const estimatedEarnings = calculateEstimatedEarnings(job);
    const isAssignedToMe = job.assignedTo?.cleanerId === userProfile?.uid;
    const isAccepting = acceptingJob === job.id;
    const isDeclining = decliningJob === job.id;

    if (isDeclining) {
      return null; // Hide declined jobs
    }

    return (
      <ThemedCard className={`p-6 transition-all duration-200 hover:shadow-lg ${
        isAssignedToMe ? 'ring-2 ring-green-500 border-green-300 bg-green-50' : ''
      }`}>
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 capitalize">
              {job.service.type.replace('-', ' ')} Cleaning
            </h3>
            <p className="text-sm text-gray-600">
              {job.client.firstName} {job.client.lastName}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            {isAssignedToMe && (
              <ThemedBadge variant="success" className="text-xs">
                Your Job
              </ThemedBadge>
            )}
            <ThemedBadge variant="info" className="text-xs">
              {job.status.replace('-', ' ').toUpperCase()}
            </ThemedBadge>
          </div>
        </div>

        {/* Job Details */}
        <div className="space-y-3 mb-4">
          <div className="flex items-center text-sm text-gray-600">
            <Clock className="w-4 h-4 mr-2" />
            <span>{format(new Date(job.schedule.date), 'MMM dd, yyyy')} at {job.schedule.timeSlot}</span>
          </div>
          
          <div className="flex items-center text-sm text-gray-600">
            <MapPin className="w-4 h-4 mr-2" />
            <span>{job.address.street}, {job.address.city}, {job.address.state} ({distance} away)</span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center text-gray-600">
              <DollarSign className="w-4 h-4 mr-1" />
              <span>Est. earnings: ${estimatedEarnings.toFixed(0)}</span>
            </div>
            <div className="text-gray-500">
              {job.service.bedrooms} bed, {job.service.bathrooms} bath
            </div>
          </div>
        </div>

        {/* Special Instructions Preview */}
        {job.specialInstructions && (
          <div className="mb-4 p-3 bg-gray-50 rounded-md">
            <p className="text-xs text-gray-600 font-medium mb-1">Special Instructions:</p>
            <p className="text-sm text-gray-700 line-clamp-2">
              {job.specialInstructions}
            </p>
          </div>
        )}

        {/* Action Buttons */}
        {!isAssignedToMe && (
          <div className="flex items-center space-x-3">
            <ThemedButton
              variant="primary"
              onClick={() => handleAcceptJob(job)}
              disabled={isAccepting}
              className="flex-1"
            >
              {isAccepting ? (
                <div className="flex items-center justify-center space-x-2">
                  <LoadingSpinner size="sm" />
                  <span>Accepting...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center space-x-2">
                  <Check className="w-4 h-4" />
                  <span>Accept Job</span>
                </div>
              )}
            </ThemedButton>
            
            <ThemedButton
              variant="outline"
              onClick={() => handleDeclineJob(job)}
              className="px-4"
            >
              <X className="w-4 h-4" />
            </ThemedButton>
          </div>
        )}

        {isAssignedToMe && (
          <div className="bg-green-100 border border-green-200 rounded-md p-3">
            <div className="flex items-center space-x-2">
              <Check className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-green-800">
                You've accepted this job! Check your dashboard for details.
              </span>
            </div>
          </div>
        )}
      </ThemedCard>
    );
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
          <span className="ml-3 text-gray-600">Loading available jobs...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
          <h3 className="text-lg font-semibold text-red-800 mb-2">Error Loading Jobs</h3>
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Job Discovery</h1>
        <p className="text-gray-600 mt-2">
          Find and accept cleaning jobs near you. {filteredJobs.length} jobs available.
        </p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by client name or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>

          {/* Service Type Filter */}
          <div className="sm:w-48">
            <select
              value={selectedServiceType}
              onChange={(e) => setSelectedServiceType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              {serviceTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          {/* Distance Filter */}
          <div className="sm:w-32">
            <select
              value={maxDistance}
              onChange={(e) => setMaxDistance(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value={10}>10 miles</option>
              <option value={25}>25 miles</option>
              <option value={50}>50 miles</option>
              <option value={100}>100 miles</option>
            </select>
          </div>
        </div>
      </div>

      {/* Jobs Grid */}
      {filteredJobs.length === 0 ? (
        <ThemedCard className="p-12 text-center">
          <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs found</h3>
          <p className="text-gray-600">
            {availableJobs.length === 0
              ? 'No jobs are currently available in your area.'
              : 'Try adjusting your search filters to see more jobs.'
            }
          </p>
        </ThemedCard>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredJobs.map(job => (
            <JobDiscoveryCard key={job.id} job={job} />
          ))}
        </div>
      )}
    </div>
  );
};
