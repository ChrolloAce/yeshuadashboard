import React from 'react';
import { 
  Briefcase, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Users, 
  Calendar,
  MapPin,
  DollarSign,
  Filter,
  Search,
  MoreVertical
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
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case JobStatus.CONFIRMED:
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case JobStatus.ASSIGNED:
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case JobStatus.IN_PROGRESS:
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case JobStatus.COMPLETED:
        return 'bg-green-100 text-green-800 border-green-200';
      case JobStatus.CANCELLED:
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  private getPriorityColor = (priority: JobPriority): string => {
    switch (priority) {
      case JobPriority.URGENT:
        return 'text-red-600';
      case JobPriority.HIGH:
        return 'text-orange-600';
      case JobPriority.NORMAL:
        return 'text-blue-600';
      case JobPriority.LOW:
        return 'text-gray-600';
      default:
        return 'text-gray-600';
    }
  };

  private formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
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
      <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                <Briefcase className="w-5 h-5 text-primary-600" />
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{job.jobNumber}</h3>
              <p className="text-sm text-gray-600">{job.client.firstName} {job.client.lastName}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${this.getStatusColor(job.status)}`}>
              {job.status.replace('_', ' ').toUpperCase()}
            </span>
            <button className="p-1 hover:bg-gray-100 rounded">
              <MoreVertical className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm text-gray-600">
            <MapPin className="w-4 h-4 mr-2" />
            <span>{job.address.street}, {job.address.city}</span>
          </div>
          
          <div className="flex items-center text-sm text-gray-600">
            <Calendar className="w-4 h-4 mr-2" />
            <span>{this.formatDate(job.scheduledDate)} at {this.formatTime(job.scheduledTime)}</span>
          </div>

          <div className="flex items-center text-sm text-gray-600">
            <Clock className="w-4 h-4 mr-2" />
            <span>{job.service.estimatedDuration} • {job.service.cleaningType}</span>
          </div>

          {job.assignedTeam && (
            <div className="flex items-center text-sm text-gray-600">
              <Users className="w-4 h-4 mr-2" />
              <span>{job.assignedTeam.name}</span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="flex items-center space-x-2">
            <DollarSign className="w-4 h-4 text-green-600" />
            <span className="font-semibold text-green-600">${job.pricing.total}</span>
            <span className={`text-xs font-medium ${this.getPriorityColor(job.priority)}`}>
              {job.priority.toUpperCase()}
            </span>
          </div>
          
          <button
            onClick={() => onViewDetails(job)}
            className="text-primary-600 hover:text-primary-700 text-sm font-medium"
          >
            View Details
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
    const statusCounts = this.getStatusCounts();

    return (
      <div className="p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Jobs Management</h1>
            <p className="text-gray-600 mt-2">Track and manage all cleaning jobs and assignments.</p>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
            <div className="text-2xl font-bold text-gray-900">{statusCounts.all}</div>
            <div className="text-sm text-gray-600">Total Jobs</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">{statusCounts.pending}</div>
            <div className="text-sm text-gray-600">Pending</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">{statusCounts.assigned}</div>
            <div className="text-sm text-gray-600">Assigned</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">{statusCounts.in_progress}</div>
            <div className="text-sm text-gray-600">In Progress</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{statusCounts.completed}</div>
            <div className="text-sm text-gray-600">Completed</div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div className="flex items-center space-x-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <div className="flex space-x-2">
                {[
                  { key: 'all', label: 'All Jobs' },
                  { key: 'pending', label: 'Pending' },
                  { key: 'assigned', label: 'Assigned' },
                  { key: 'in_progress', label: 'In Progress' },
                  { key: 'completed', label: 'Completed' }
                ].map(filter => (
                  <button
                    key={filter.key}
                    onClick={() => this.handleStatusFilter(filter.key)}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                      selectedStatus === filter.key
                        ? 'bg-primary-100 text-primary-700'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="relative">
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search jobs..."
                value={searchQuery}
                onChange={this.handleSearch}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>
        </div>

        {/* Jobs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredJobs.map(job => (
            <JobCard
              key={job.id}
              job={job}
              onStatusChange={this.handleStatusChange}
              onViewDetails={this.handleViewDetails}
            />
          ))}
        </div>

        {filteredJobs.length === 0 && (
          <div className="text-center py-12">
            <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No jobs found</h3>
            <p className="text-gray-600">Try adjusting your filters or search criteria.</p>
          </div>
        )}

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
