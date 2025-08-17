'use client';

import React, { useState, useEffect } from 'react';
import { X, User, Star, MapPin, Clock, DollarSign } from 'lucide-react';
import { ThemedCard, ThemedButton, ThemedBadge } from '@/components/ui';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Job, User as UserType } from '@/types/database';
import { CompanyService } from '@/services/company/CompanyService';
import { useAuth } from '@/hooks/useAuth';

interface AssignJobModalProps {
  job: Job | null;
  isOpen: boolean;
  onClose: () => void;
  onAssign: (jobId: string, assignment: {
    cleanerId: string;
    cleanerName: string;
    teamId?: string;
  }) => Promise<void>;
}

export const AssignJobModal: React.FC<AssignJobModalProps> = ({
  job,
  isOpen,
  onClose,
  onAssign
}) => {
  const { userProfile } = useAuth();
  const [cleaners, setCleaners] = useState<UserType[]>([]);
  const [selectedCleaner, setSelectedCleaner] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const companyService = CompanyService.getInstance();

  useEffect(() => {
    if (isOpen && userProfile?.companyId) {
      loadCleaners();
    }
  }, [isOpen, userProfile?.companyId]);

  useEffect(() => {
    if (isOpen && job?.assignedTo) {
      // Pre-select currently assigned cleaner
      const assignedCleaner = cleaners.find(c => c.id === job.assignedTo?.cleanerId);
      setSelectedCleaner(assignedCleaner || null);
    } else {
      setSelectedCleaner(null);
    }
  }, [isOpen, job?.assignedTo, cleaners]);

  const loadCleaners = async () => {
    if (!userProfile?.companyId) return;

    try {
      setLoading(true);
      setError(null);
      const companyCleaners = await companyService.getCompanyCleaners(userProfile.companyId);
      setCleaners(companyCleaners);
    } catch (err: any) {
      console.error('Error loading cleaners:', err);
      setError(err.message || 'Failed to load cleaners');
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async () => {
    if (!job || !selectedCleaner) return;

    try {
      setAssigning(true);
      setError(null);

      await onAssign(job.id, {
        cleanerId: selectedCleaner.id,
        cleanerName: `${selectedCleaner.firstName} ${selectedCleaner.lastName}`,
        teamId: undefined // TODO: Add team support later
      });

      onClose();
    } catch (err: any) {
      console.error('Error assigning job:', err);
      setError(err.message || 'Failed to assign job');
    } finally {
      setAssigning(false);
    }
  };

  const calculateDistance = (jobAddress: Job['address']): string => {
    // TODO: Implement actual distance calculation based on cleaner location
    // For now, return a placeholder
    return `${Math.floor(Math.random() * 20) + 1} mi`;
  };

  const getCleanerAvailability = (cleaner: UserType): 'available' | 'busy' | 'unavailable' => {
    // TODO: Implement actual availability check based on cleaner's schedule
    // For now, return random availability
    const statuses = ['available', 'busy', 'unavailable'] as const;
    return statuses[Math.floor(Math.random() * statuses.length)];
  };

  const getAvailabilityColor = (availability: string): 'success' | 'warning' | 'error' => {
    switch (availability) {
      case 'available': return 'success';
      case 'busy': return 'warning';
      case 'unavailable': return 'error';
      default: return 'warning';
    }
  };

  if (!isOpen || !job) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose} />

        {/* Modal panel */}
        <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full sm:p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Assign Job to Cleaner
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                {job.client.firstName} {job.client.lastName} • {job.address.city}, {job.address.state}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Job Summary */}
          <ThemedCard className="mb-6 p-4 bg-gray-50">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <div className="flex items-center space-x-1">
                    <MapPin className="w-4 h-4" />
                    <span>{job.address.street}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="w-4 h-4" />
                    <span>{new Date(job.schedule.date).toLocaleDateString()} at {job.schedule.timeSlot}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <DollarSign className="w-4 h-4" />
                    <span>${job.pricing.finalPrice}</span>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {job.service.type} • {job.service.bedrooms} bed, {job.service.bathrooms} bath
                </p>
              </div>
              <ThemedBadge variant="info" className="ml-4">
                {job.status}
              </ThemedBadge>
            </div>
          </ThemedCard>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Cleaners List */}
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-900 mb-3">Available Cleaners</h4>
            
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <LoadingSpinner size="md" />
                <span className="ml-3 text-gray-600">Loading cleaners...</span>
              </div>
            ) : cleaners.length === 0 ? (
              <div className="text-center py-8">
                <User className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600">No cleaners available</p>
                <p className="text-sm text-gray-500">Add cleaners to your company to assign jobs</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {cleaners.map((cleaner) => {
                  const availability = getCleanerAvailability(cleaner);
                  const distance = calculateDistance(job.address);
                  const isSelected = selectedCleaner?.id === cleaner.id;
                  const isCurrentlyAssigned = job.assignedTo?.cleanerId === cleaner.id;

                  return (
                    <ThemedCard
                      key={cleaner.id}
                      className={`p-4 cursor-pointer transition-all duration-200 hover:shadow-md ${
                        isSelected
                          ? 'ring-2 ring-primary-500 border-primary-300 bg-primary-50'
                          : isCurrentlyAssigned
                          ? 'ring-1 ring-blue-300 border-blue-200 bg-blue-50'
                          : 'hover:border-gray-300'
                      }`}
                      onClick={() => setSelectedCleaner(cleaner)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                            <User className="w-5 h-5 text-primary-600" />
                          </div>
                          <div>
                            <div className="flex items-center space-x-2">
                              <h5 className="font-medium text-gray-900">
                                {cleaner.firstName} {cleaner.lastName}
                              </h5>
                              {isCurrentlyAssigned && (
                                <ThemedBadge variant="info" className="text-xs">
                                  Currently Assigned
                                </ThemedBadge>
                              )}
                            </div>
                            <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                              <div className="flex items-center space-x-1">
                                <Star className="w-3 h-3" />
                                <span>4.8 (12 reviews)</span> {/* TODO: Get actual rating */}
                              </div>
                              <div className="flex items-center space-x-1">
                                <MapPin className="w-3 h-3" />
                                <span>{distance} away</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <ThemedBadge 
                            variant={getAvailabilityColor(availability)}
                            className="text-xs"
                          >
                            {availability}
                          </ThemedBadge>
                          {isSelected && (
                            <div className="w-5 h-5 bg-primary-600 rounded-full flex items-center justify-center">
                              <div className="w-2 h-2 bg-white rounded-full" />
                            </div>
                          )}
                        </div>
                      </div>
                    </ThemedCard>
                  );
                })}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-3">
            <ThemedButton
              variant="outline"
              onClick={onClose}
              disabled={assigning}
            >
              Cancel
            </ThemedButton>
            <ThemedButton
              variant="primary"
              onClick={handleAssign}
              disabled={!selectedCleaner || assigning}
              className="min-w-24"
            >
              {assigning ? (
                <div className="flex items-center space-x-2">
                  <LoadingSpinner size="sm" />
                  <span>Assigning...</span>
                </div>
              ) : (
                selectedCleaner && job.assignedTo?.cleanerId === selectedCleaner.id
                  ? 'Update Assignment'
                  : 'Assign Job'
              )}
            </ThemedButton>
          </div>
        </div>
      </div>
    </div>
  );
};
