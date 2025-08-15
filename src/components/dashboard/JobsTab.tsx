'use client';

import React, { useState } from 'react';
import { 
  Clock, 
  Users, 
  Calendar,
  MapPin,
  DollarSign,
  Filter,
  Search,
  MoreVertical,
  Trash2,
  Eye,
  Edit,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { useFirebaseJobs } from '@/hooks/useFirebaseJobs';
import { Job, JobStatus } from '@/types/database';
import { ThemedCard, ThemedButton, ThemedBadge } from '@/components/ui';

interface JobCardProps {
  job: Job;
  onStatusChange: (jobId: string, status: JobStatus) => void;
  onDelete: (jobId: string) => void;
  onViewDetails: (job: Job) => void;
}

const JobCard: React.FC<JobCardProps> = ({ job, onStatusChange, onDelete, onViewDetails }) => {
  const [showActions, setShowActions] = useState(false);

  const getStatusColor = (status: JobStatus): 'default' | 'primary' | 'success' | 'warning' | 'error' | 'info' => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'confirmed':
        return 'info';
      case 'assigned':
        return 'primary';
      case 'in-progress':
        return 'info';
      case 'completed':
        return 'success';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    }).format(date);
  };

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete job for ${job.client.firstName} ${job.client.lastName}?`)) {
      try {
        await onDelete(job.id);
      } catch (error) {
        console.error('Failed to delete job:', error);
      }
    }
  };

  const handleStatusChange = async (newStatus: JobStatus) => {
    try {
      await onStatusChange(job.id, newStatus);
      setShowActions(false);
    } catch (error) {
      console.error('Failed to update job status:', error);
    }
  };

  return (
    <ThemedCard variant="default" padding="md" className="relative">
      {/* Job Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <img 
            src="/house.png" 
            alt="House" 
            className="w-12 h-12 object-contain"
          />
          <div>
            <h3 className="font-semibold text-gray-900">
              {job.client.firstName} {job.client.lastName}
            </h3>
            <p className="text-sm text-gray-500 flex items-center">
              <MapPin className="w-4 h-4 mr-1" />
              {job.address.city}, {job.address.state}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <ThemedBadge variant={getStatusColor(job.status)}>
            {job.status.replace('-', ' ').toUpperCase()}
          </ThemedBadge>
          
          <div className="relative">
            <button
              onClick={() => setShowActions(!showActions)}
              className="p-1 rounded-md hover:bg-gray-100 transition-colors"
            >
              <MoreVertical className="w-4 h-4 text-gray-400" />
            </button>
            
            {showActions && (
              <div className="absolute right-0 top-8 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10 min-w-[150px]">
                <button
                  onClick={() => onViewDetails(job)}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  View Details
                </button>
                
                {job.status !== 'completed' && (
                  <button
                    onClick={() => handleStatusChange('completed')}
                    className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center text-green-600"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Mark Complete
                  </button>
                )}
                
                {job.status !== 'cancelled' && job.status !== 'completed' && (
                  <button
                    onClick={() => handleStatusChange('cancelled')}
                    className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center text-red-600"
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Cancel Job
                  </button>
                )}
                
                <hr className="my-1" />
                
                <button
                  onClick={handleDelete}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center text-red-600"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Job
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Job Details */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500 flex items-center">
            <Calendar className="w-4 h-4 mr-1" />
            {formatDate(job.schedule.date)}
          </span>
          <span className="text-gray-500 flex items-center">
            <Clock className="w-4 h-4 mr-1" />
            {job.schedule.estimatedDuration} min
          </span>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">
            {job.service.type.charAt(0).toUpperCase() + job.service.type.slice(1)} Cleaning
          </span>
          <span className="font-semibold text-gray-900 flex items-center">
            <DollarSign className="w-4 h-4" />
            {job.pricing.finalPrice}
          </span>
        </div>

        <div className="text-sm text-gray-500">
          {job.service.bedrooms} bed, {job.service.bathrooms} bath
        </div>

        {job.assignedTo && (
          <div className="flex items-center text-sm text-gray-600 bg-gray-50 rounded-md px-2 py-1">
            <Users className="w-4 h-4 mr-1" />
            Assigned to {job.assignedTo.cleanerName}
          </div>
        )}

        {job.addOns.length > 0 && (
          <div className="text-sm text-gray-500">
            Add-ons: {job.addOns.join(', ')}
          </div>
        )}
      </div>
    </ThemedCard>
  );
};

export const JobsTab: React.FC = () => {
  const { 
    jobs, 
    loading, 
    error, 
    refresh, 
    deleteJob, 
    updateJobStatus 
  } = useFirebaseJobs({ realTime: true });

  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  const statusOptions = [
    { value: 'all', label: 'All Jobs', count: jobs.length },
    { value: 'pending', label: 'Pending', count: jobs.filter(j => j.status === 'pending').length },
    { value: 'confirmed', label: 'Confirmed', count: jobs.filter(j => j.status === 'confirmed').length },
    { value: 'assigned', label: 'Assigned', count: jobs.filter(j => j.status === 'assigned').length },
    { value: 'in-progress', label: 'In Progress', count: jobs.filter(j => j.status === 'in-progress').length },
    { value: 'completed', label: 'Completed', count: jobs.filter(j => j.status === 'completed').length },
  ];

  const filteredJobs = jobs.filter(job => {
    const matchesStatus = selectedStatus === 'all' || job.status === selectedStatus;
    const matchesSearch = searchQuery === '' || 
      job.client.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.client.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.address.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.client.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesStatus && matchesSearch;
  });

  const handleViewDetails = (job: Job) => {
    setSelectedJob(job);
  };

  const handleDeleteJob = async (jobId: string) => {
    await deleteJob(jobId);
  };

  const handleStatusChange = async (jobId: string, status: JobStatus) => {
    await updateJobStatus(jobId, status);
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          <span className="ml-3 text-gray-600">Loading jobs...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-600 mb-4">{error}</p>
            <ThemedButton onClick={refresh} variant="primary">
              Try Again
            </ThemedButton>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Jobs Management</h1>
        <p className="text-gray-600 mt-2">
          Manage and track all cleaning jobs. {jobs.length} total jobs.
        </p>
      </div>

      {/* Filters */}
      <div className="mb-6 space-y-4">
        {/* Status Filter */}
        <div className="flex flex-wrap gap-2">
          {statusOptions.map(option => (
            <button
              key={option.value}
              onClick={() => setSelectedStatus(option.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedStatus === option.value
                  ? 'bg-primary-100 text-primary-700 border border-primary-200'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {option.label} ({option.count})
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by client name, email, or location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>

        <div className="flex justify-between items-center">
          <p className="text-sm text-gray-500">
            Showing {filteredJobs.length} of {jobs.length} jobs
          </p>
          <ThemedButton onClick={refresh} variant="outline" size="sm">
            Refresh
          </ThemedButton>
        </div>
      </div>

      {/* Jobs Grid */}
      {filteredJobs.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Calendar className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs found</h3>
          <p className="text-gray-500 mb-6">
            {searchQuery || selectedStatus !== 'all' 
              ? 'Try adjusting your filters to see more jobs.'
              : 'No jobs have been created yet. Use the Acquisition tab to create your first job.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredJobs.map(job => (
            <JobCard
              key={job.id}
              job={job}
              onStatusChange={handleStatusChange}
              onDelete={handleDeleteJob}
              onViewDetails={handleViewDetails}
            />
          ))}
        </div>
      )}

      {/* Job Details Modal */}
      {selectedJob && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Job Details</h2>
                <button
                  onClick={() => setSelectedJob(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Client Info */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">Client Information</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Name:</span> {selectedJob.client.firstName} {selectedJob.client.lastName}
                    </div>
                    <div>
                      <span className="font-medium">Email:</span> {selectedJob.client.email}
                    </div>
                    <div>
                      <span className="font-medium">Phone:</span> {selectedJob.client.phone || 'N/A'}
                    </div>
                    <div>
                      <span className="font-medium">Status:</span> 
                      <ThemedBadge variant={getStatusColor(selectedJob.status)} className="ml-2">
                        {selectedJob.status.replace('-', ' ').toUpperCase()}
                      </ThemedBadge>
                    </div>
                  </div>
                </div>

                {/* Service Details */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">Service Details</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Type:</span> {selectedJob.service.type} cleaning
                    </div>
                    <div>
                      <span className="font-medium">Bedrooms:</span> {selectedJob.service.bedrooms}
                    </div>
                    <div>
                      <span className="font-medium">Bathrooms:</span> {selectedJob.service.bathrooms}
                    </div>
                    <div>
                      <span className="font-medium">Frequency:</span> {selectedJob.service.frequency}
                    </div>
                  </div>
                </div>

                {/* Address */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">Address</h3>
                  <p className="text-sm">
                    {selectedJob.address.street}<br />
                    {selectedJob.address.city}, {selectedJob.address.state} {selectedJob.address.zipCode}
                  </p>
                </div>

                {/* Schedule */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">Schedule</h3>
                  <div className="text-sm">
                    <p><span className="font-medium">Date:</span> {selectedJob.schedule.date.toLocaleDateString()}</p>
                    <p><span className="font-medium">Time:</span> {selectedJob.schedule.timeSlot}</p>
                    <p><span className="font-medium">Duration:</span> {selectedJob.schedule.estimatedDuration} minutes</p>
                  </div>
                </div>

                {/* Pricing */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">Pricing</h3>
                  <div className="text-sm space-y-1">
                    <div className="flex justify-between">
                      <span>Base Price:</span>
                      <span>${selectedJob.pricing.basePrice}</span>
                    </div>
                    {selectedJob.pricing.addOns.map((addon, index) => (
                      <div key={index} className="flex justify-between">
                        <span>{addon.name}:</span>
                        <span>${addon.price}</span>
                      </div>
                    ))}
                    {selectedJob.pricing.discount && selectedJob.pricing.discount > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Discount:</span>
                        <span>-${selectedJob.pricing.discount}</span>
                      </div>
                    )}
                    <hr />
                    <div className="flex justify-between font-semibold">
                      <span>Total:</span>
                      <span>${selectedJob.pricing.finalPrice}</span>
                    </div>
                  </div>
                </div>

                {/* Instructions */}
                {(selectedJob.specialInstructions || selectedJob.parkingInstructions) && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Instructions</h3>
                    {selectedJob.specialInstructions && (
                      <div className="mb-2">
                        <span className="font-medium">Special Instructions:</span>
                        <p className="text-sm mt-1">{selectedJob.specialInstructions}</p>
                      </div>
                    )}
                    {selectedJob.parkingInstructions && (
                      <div>
                        <span className="font-medium">Parking Instructions:</span>
                        <p className="text-sm mt-1">{selectedJob.parkingInstructions}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

function getStatusColor(status: JobStatus): 'default' | 'primary' | 'success' | 'warning' | 'error' | 'info' {
  switch (status) {
    case 'pending':
      return 'warning';
    case 'confirmed':
      return 'info';
    case 'assigned':
      return 'primary';
    case 'in-progress':
      return 'info';
    case 'completed':
      return 'success';
    case 'cancelled':
      return 'error';
    default:
      return 'default';
  }
}