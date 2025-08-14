import React from 'react';
import { 
  Clock, 
  Users, 
  Calendar,
  MapPin,
  DollarSign,
  Filter,
  Search,
  MoreVertical,
  Bookmark,
  BookmarkCheck
} from 'lucide-react';
import { JobsManager } from '@/services/jobs/JobsManager';
import { Job, JobStatus, JobPriority } from '@/types/jobs';

interface JobsTabState {
  jobs: Job[];
  filteredJobs: Job[];
  selectedStatus: string;
  searchQuery: string;
  selectedJob: Job | null;
  showJobDetails: boolean;
}

interface JobCardProps {
  job: Job;
  onStatusChange: (jobId: string, status: JobStatus) => void;
  onViewDetails: (job: Job) => void;
}

class JobCard extends React.Component<JobCardProps> {
  private getStatusColor = (status: JobStatus): string => {
    switch (status) {
      case JobStatus.PENDING:
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case JobStatus.CONFIRMED:
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case JobStatus.ASSIGNED:
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case JobStatus.IN_PROGRESS:
        return 'bg-orange-50 text-orange-700 border-orange-200';
      case JobStatus.COMPLETED:
        return 'bg-green-50 text-green-700 border-green-200';
      case JobStatus.CANCELLED:
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  private formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  private formatTime = (time: string): string => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  public render(): React.ReactNode {
    const { job, onViewDetails } = this.props;

    return (
      <div className="bg-white rounded-xl border border-gray-100 p-6 hover:shadow-lg hover:border-primary-200 transition-all duration-300 cursor-pointer group">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-50 flex items-center justify-center">
                <img 
                  src="/house.png" 
                  alt="House" 
                  className="w-8 h-8 object-contain"
                />
              </div>
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-1">
                <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
                  {job.service.cleaningType}
                </h3>
                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${this.getStatusColor(job.status)}`}>
                  {job.status.replace('_', ' ').toUpperCase()}
                </span>
              </div>
              <p className="text-gray-600 font-medium">{job.client.firstName} {job.client.lastName}</p>
              <p className="text-sm text-gray-500">{job.jobNumber}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors opacity-0 group-hover:opacity-100">
              <Bookmark className="w-4 h-4 text-gray-400" />
            </button>
            <button className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
              <MoreVertical className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        </div>

        <div className="space-y-3 mb-4">
          <div className="flex items-center text-sm text-gray-600">
            <MapPin className="w-4 h-4 mr-3 text-gray-400" />
            <span>{job.address.street}, {job.address.city}, {job.address.state}</span>
          </div>
          
          <div className="flex items-center text-sm text-gray-600">
            <Calendar className="w-4 h-4 mr-3 text-gray-400" />
            <span>{this.formatDate(job.scheduledDate)} at {this.formatTime(job.scheduledTime)}</span>
          </div>

          <div className="flex items-center text-sm text-gray-600">
            <Clock className="w-4 h-4 mr-3 text-gray-400" />
            <span>{job.service.estimatedDuration} • {job.service.bedrooms} bed, {job.service.bathrooms} bath</span>
          </div>

          {job.assignedTeam && (
            <div className="flex items-center text-sm text-gray-600">
              <Users className="w-4 h-4 mr-3 text-gray-400" />
              <span>{job.assignedTeam.name} • {job.assignedTeam.members.join(', ')}</span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex items-center space-x-4">
            <div className="text-xl font-bold text-primary-600">
              ${job.pricing.total}
            </div>
            <div className="text-sm text-gray-500">
              / {job.frequency.toLowerCase()}
            </div>
          </div>
          
          <button
            onClick={() => onViewDetails(job)}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
          >
            Apply Job
          </button>
        </div>
      </div>
    );
  }
}

interface JobDetailsModalProps {
  job: Job;
  onClose: () => void;
  onStatusChange: (jobId: string, status: JobStatus) => void;
}

class JobDetailsModal extends React.Component<JobDetailsModalProps> {
  private handleStatusChange = (status: JobStatus): void => {
    this.props.onStatusChange(this.props.job.id, status);
  };

  public render(): React.ReactNode {
    const { job, onClose } = this.props;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg max-w-2xl w-full max-h-screen overflow-y-auto">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Job Details</h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-6">
              {/* Job Header */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold">{job.jobNumber}</h3>
                  <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                    {job.status.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
                <p className="text-gray-600">Created {job.createdAt.toLocaleDateString()}</p>
              </div>

              {/* Client Information */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Client Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Name</p>
                    <p className="font-medium">{job.client.firstName} {job.client.lastName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Phone</p>
                    <p className="font-medium">{job.client.phone}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-medium">{job.client.email}</p>
                  </div>
                </div>
              </div>

              {/* Service Details */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Service Details</h4>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-600">Service Type</p>
                    <p className="font-medium">{job.service.cleaningType}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Duration</p>
                    <p className="font-medium">{job.service.estimatedDuration}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Property</p>
                    <p className="font-medium">{job.service.bedrooms} bed, {job.service.bathrooms} bath</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Frequency</p>
                    <p className="font-medium">{job.frequency}</p>
                  </div>
                </div>

                {job.service.specialInstructions && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-600">Special Instructions</p>
                    <p className="font-medium">{job.service.specialInstructions}</p>
                  </div>
                )}

                {job.service.parkingInstructions && (
                  <div>
                    <p className="text-sm text-gray-600">Parking Instructions</p>
                    <p className="font-medium">{job.service.parkingInstructions}</p>
                  </div>
                )}
              </div>

              {/* Address */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Service Address</h4>
                <p className="font-medium">
                  {job.address.street}
                  {job.address.apartment && `, ${job.address.apartment}`}
                </p>
                <p className="text-gray-600">
                  {job.address.city}, {job.address.state} {job.address.zipCode}
                </p>
              </div>

              {/* Pricing */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Pricing</h4>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex justify-between mb-2">
                    <span>Base Rate</span>
                    <span>${job.pricing.baseRate}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span>Add-ons</span>
                    <span>${job.pricing.addOns}</span>
                  </div>
                  <div className="flex justify-between font-semibold text-lg pt-2 border-t">
                    <span>Total</span>
                    <span>${job.pricing.total}</span>
                  </div>
                </div>
              </div>

              {/* Team Assignment */}
              {job.assignedTeam && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Assigned Team</h4>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="font-medium">{job.assignedTeam.name}</p>
                    <p className="text-gray-600">{job.assignedTeam.members.join(', ')}</p>
                  </div>
                </div>
              )}

              {/* Status Actions */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Update Status</h4>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => this.handleStatusChange(JobStatus.CONFIRMED)}
                    className="px-3 py-2 bg-blue-100 text-blue-800 rounded-lg hover:bg-blue-200 transition-colors"
                  >
                    Confirm
                  </button>
                  <button
                    onClick={() => this.handleStatusChange(JobStatus.ASSIGNED)}
                    className="px-3 py-2 bg-purple-100 text-purple-800 rounded-lg hover:bg-purple-200 transition-colors"
                  >
                    Assign Team
                  </button>
                  <button
                    onClick={() => this.handleStatusChange(JobStatus.IN_PROGRESS)}
                    className="px-3 py-2 bg-orange-100 text-orange-800 rounded-lg hover:bg-orange-200 transition-colors"
                  >
                    Start Job
                  </button>
                  <button
                    onClick={() => this.handleStatusChange(JobStatus.COMPLETED)}
                    className="px-3 py-2 bg-green-100 text-green-800 rounded-lg hover:bg-green-200 transition-colors"
                  >
                    Complete
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export class JobsTab extends React.Component<{}, JobsTabState> {
  private jobsManager: JobsManager;
  private unsubscribe?: () => void;

  constructor(props: {}) {
    super(props);
    this.jobsManager = new JobsManager();
    this.state = {
      jobs: this.jobsManager.getAllJobs(),
      filteredJobs: this.jobsManager.getAllJobs(),
      selectedStatus: 'all',
      searchQuery: '',
      selectedJob: null,
      showJobDetails: false
    };
  }

  public componentDidMount(): void {
    this.unsubscribe = this.jobsManager.subscribe(() => {
      const jobs = this.jobsManager.getAllJobs();
      this.setState({ jobs }, () => {
        this.applyFilters();
      });
    });
  }

  public componentWillUnmount(): void {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  }

  private applyFilters = (): void => {
    let filtered = [...this.state.jobs];

    // Apply status filter
    if (this.state.selectedStatus !== 'all') {
      filtered = filtered.filter(job => job.status === this.state.selectedStatus);
    }

    // Apply search filter
    if (this.state.searchQuery.trim()) {
      const query = this.state.searchQuery.toLowerCase();
      filtered = filtered.filter(job =>
        job.jobNumber.toLowerCase().includes(query) ||
        job.client.firstName.toLowerCase().includes(query) ||
        job.client.lastName.toLowerCase().includes(query) ||
        job.address.street.toLowerCase().includes(query) ||
        job.service.cleaningType.toLowerCase().includes(query)
      );
    }

    this.setState({ filteredJobs: filtered });
  };

  private handleStatusFilter = (status: string): void => {
    this.setState({ selectedStatus: status }, this.applyFilters);
  };

  private handleSearch = (e: React.ChangeEvent<HTMLInputElement>): void => {
    this.setState({ searchQuery: e.target.value }, this.applyFilters);
  };

  private handleStatusChange = (jobId: string, status: JobStatus): void => {
    this.jobsManager.updateJobStatus(jobId, status);
  };

  private handleViewDetails = (job: Job): void => {
    this.setState({ selectedJob: job, showJobDetails: true });
  };

  private handleCloseDetails = (): void => {
    this.setState({ selectedJob: null, showJobDetails: false });
  };

  private getStatusCounts = (): Record<string, number> => {
    const counts: Record<string, number> = {
      all: this.state.jobs.length,
      pending: 0,
      confirmed: 0,
      assigned: 0,
      in_progress: 0,
      completed: 0
    };

    this.state.jobs.forEach(job => {
      counts[job.status] = (counts[job.status] || 0) + 1;
    });

    return counts;
  };

  public render(): React.ReactNode {
    const { filteredJobs, selectedStatus, searchQuery, selectedJob, showJobDetails } = this.state;

    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Find Job</h1>
                <p className="text-gray-600 mt-1">Let's find your dream job</p>
              </div>
              <div className="flex items-center space-x-4">
                <button className="px-4 py-2 text-gray-600 hover:text-gray-900 font-medium">
                  History
                </button>
                <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">YC</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-8 py-8">
          <div className="flex gap-8">
            {/* Main Content */}
            <div className="flex-1">
              {/* Search Bar */}
              <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
                <div className="flex items-center space-x-4">
                  <div className="flex-1 relative">
                    <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 transform -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Job Title, Company, or Anything"
                      value={searchQuery}
                      onChange={this.handleSearch}
                      className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  <div className="relative">
                    <MapPin className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 transform -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Location"
                      className="pl-12 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  <div className="relative">
                    <DollarSign className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 transform -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Salary Range"
                      className="pl-12 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  <button className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium">
                    Search
                  </button>
                </div>
              </div>

              {/* Job Results */}
              <div className="space-y-6">
                {filteredJobs.map(job => (
                  <JobCard
                    key={job.id}
                    job={job}
                    onStatusChange={this.handleStatusChange}
                    onViewDetails={this.handleViewDetails}
                  />
                ))}

                {filteredJobs.length === 0 && (
                  <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <img 
                        src="/house.png" 
                        alt="House" 
                        className="w-8 h-8 object-contain opacity-50"
                      />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No jobs found</h3>
                    <p className="text-gray-600">Try adjusting your search criteria or filters.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Job Filter Sidebar */}
            <div className="w-80">
              <div className="bg-white rounded-xl border border-gray-200 p-6 sticky top-8">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Job Filter</h3>
                  <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                    Clear all
                  </button>
                </div>

                {/* Job Type Filter */}
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-medium text-gray-900">Job Type</h4>
                    <button className="text-primary-600 hover:text-primary-700 text-sm">
                      Clear
                    </button>
                  </div>
                  <div className="space-y-3">
                    {[
                      { key: 'all', label: 'All Jobs', count: this.state.jobs.length },
                      { key: 'pending', label: 'Pending', count: this.state.jobs.filter(j => j.status === 'pending').length },
                      { key: 'assigned', label: 'Assigned', count: this.state.jobs.filter(j => j.status === 'assigned').length },
                      { key: 'in_progress', label: 'In Progress', count: this.state.jobs.filter(j => j.status === 'in_progress').length }
                    ].map(filter => (
                      <label key={filter.key} className="flex items-center">
                        <input
                          type="radio"
                          name="jobType"
                          checked={selectedStatus === filter.key}
                          onChange={() => this.handleStatusFilter(filter.key)}
                          className="w-4 h-4 text-primary-600 border-gray-300 focus:ring-primary-500"
                        />
                        <span className="ml-3 text-gray-700">{filter.label}</span>
                        <span className="ml-auto text-sm text-gray-500">{filter.count} Jobs</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Experience Filter */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-medium text-gray-900">Experience</h4>
                    <button className="text-primary-600 hover:text-primary-700 text-sm">
                      Clear
                    </button>
                  </div>
                  <div className="space-y-3">
                    {[
                      { label: 'Under 1 Year', count: 321 },
                      { label: '1 - 2 Year', count: 563 },
                      { label: '2 - 6 Year', count: 192 },
                      { label: 'Over 6 Years', count: 192 }
                    ].map((exp, index) => (
                      <label key={index} className="flex items-center">
                        <input
                          type="checkbox"
                          className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                        />
                        <span className="ml-3 text-gray-700">{exp.label}</span>
                        <span className="ml-auto text-sm text-gray-500">{exp.count} Jobs</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Job Details Modal */}
        {showJobDetails && selectedJob && (
          <JobDetailsModal
            job={selectedJob}
            onClose={this.handleCloseDetails}
            onStatusChange={this.handleStatusChange}
          />
        )}
      </div>
    );
  }
}
