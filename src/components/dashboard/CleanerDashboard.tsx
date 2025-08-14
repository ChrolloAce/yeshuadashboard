import React from 'react';
import { 
  MapPin, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Navigation,
  Phone,
  MessageSquare,
  Camera,
  Star
} from 'lucide-react';
import { Job, JobStatus } from '@/types/jobs';
import { JobsManager } from '@/services/jobs/JobsManager';

interface CleanerDashboardState {
  assignedJobs: Job[];
  currentJob: Job | null;
  selectedTeamId: string;
}

interface CleanerJobCardProps {
  job: Job;
  onStartJob: (jobId: string) => void;
  onCompleteJob: (jobId: string) => void;
  onViewDetails: (job: Job) => void;
  isActive: boolean;
}

class CleanerJobCard extends React.Component<CleanerJobCardProps> {
  private formatTime = (time: string): string => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  private getStatusColor = (status: JobStatus): string => {
    switch (status) {
      case JobStatus.ASSIGNED:
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case JobStatus.IN_PROGRESS:
        return 'bg-green-100 text-green-800 border-green-200';
      case JobStatus.COMPLETED:
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };

  public render(): React.ReactNode {
    const { job, onStartJob, onCompleteJob, onViewDetails, isActive } = this.props;

    return (
      <div className={`bg-white rounded-lg border-2 p-4 transition-all ${
        isActive ? 'border-primary-300 shadow-lg' : 'border-gray-200 hover:shadow-md'
      }`}>
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="font-semibold text-gray-900">{job.jobNumber}</h3>
            <p className="text-sm text-gray-600">{job.client.firstName} {job.client.lastName}</p>
          </div>
          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${this.getStatusColor(job.status)}`}>
            {job.status.replace('_', ' ').toUpperCase()}
          </span>
        </div>

        <div className="space-y-3 mb-4">
          <div className="flex items-start">
            <MapPin className="w-4 h-4 text-gray-400 mt-0.5 mr-2 flex-shrink-0" />
            <div className="text-sm">
              <p className="font-medium text-gray-900">{job.address.street}</p>
              <p className="text-gray-600">{job.address.city}, {job.address.state}</p>
            </div>
          </div>

          <div className="flex items-center text-sm text-gray-600">
            <Clock className="w-4 h-4 mr-2" />
            <span>{this.formatTime(job.scheduledTime)} • {job.service.estimatedDuration}</span>
          </div>

          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-sm font-medium text-gray-900 mb-1">{job.service.cleaningType}</p>
            <p className="text-xs text-gray-600">{job.service.bedrooms} bed, {job.service.bathrooms} bath</p>
            {job.service.specialInstructions && (
              <p className="text-xs text-gray-600 mt-2">
                <strong>Special:</strong> {job.service.specialInstructions}
              </p>
            )}
          </div>
        </div>

        <div className="flex space-x-2">
          <button
            onClick={() => onViewDetails(job)}
            className="flex-1 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Details
          </button>
          
          {job.status === JobStatus.ASSIGNED && (
            <button
              onClick={() => onStartJob(job.id)}
              className="flex-1 px-3 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors"
            >
              Start Job
            </button>
          )}
          
          {job.status === JobStatus.IN_PROGRESS && (
            <button
              onClick={() => onCompleteJob(job.id)}
              className="flex-1 px-3 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
            >
              Complete
            </button>
          )}
        </div>
      </div>
    );
  }
}

export class CleanerDashboard extends React.Component<{}, CleanerDashboardState> {
  private jobsManager: JobsManager;
  private unsubscribe?: () => void;

  constructor(props: {}) {
    super(props);
    this.jobsManager = new JobsManager();
    
    // For demo purposes, we'll use Team Alpha's ID
    const teamId = 't1';
    
    this.state = {
      assignedJobs: this.jobsManager.getJobsByTeam(teamId),
      currentJob: null,
      selectedTeamId: teamId
    };
  }

  public componentDidMount(): void {
    this.unsubscribe = this.jobsManager.subscribe(() => {
      this.setState({
        assignedJobs: this.jobsManager.getJobsByTeam(this.state.selectedTeamId)
      });
    });
  }

  public componentWillUnmount(): void {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  }

  private handleStartJob = (jobId: string): void => {
    this.jobsManager.updateJobStatus(jobId, JobStatus.IN_PROGRESS);
    const job = this.state.assignedJobs.find(j => j.id === jobId);
    if (job) {
      this.setState({ currentJob: job });
    }
  };

  private handleCompleteJob = (jobId: string): void => {
    this.jobsManager.updateJobStatus(jobId, JobStatus.COMPLETED);
    this.setState({ currentJob: null });
  };

  private handleViewDetails = (job: Job): void => {
    this.setState({ currentJob: job });
  };

  private getTodayJobs = (): Job[] => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return this.state.assignedJobs.filter(job => {
      const jobDate = new Date(job.scheduledDate);
      jobDate.setHours(0, 0, 0, 0);
      return jobDate.getTime() === today.getTime();
    });
  };

  public render(): React.ReactNode {
    const { assignedJobs, currentJob } = this.state;
    const todayJobs = this.getTodayJobs();
    const inProgressJobs = assignedJobs.filter(job => job.status === JobStatus.IN_PROGRESS);
    const upcomingJobs = assignedJobs.filter(job => 
      job.status === JobStatus.ASSIGNED && 
      new Date(job.scheduledDate) >= new Date()
    );

    return (
      <div className="p-8 max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Cleaner Dashboard</h1>
          <p className="text-gray-600 mt-2">Team Alpha - Maria Rodriguez & James Wilson</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{todayJobs.length}</div>
            <div className="text-sm text-gray-600">Today's Jobs</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{inProgressJobs.length}</div>
            <div className="text-sm text-gray-600">In Progress</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">{upcomingJobs.length}</div>
            <div className="text-sm text-gray-600">Upcoming</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">4.8</div>
            <div className="text-sm text-gray-600">Avg Rating</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Today's Schedule */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Today's Schedule</h2>
            <div className="space-y-4">
              {todayJobs.length > 0 ? (
                todayJobs.map(job => (
                  <CleanerJobCard
                    key={job.id}
                    job={job}
                    onStartJob={this.handleStartJob}
                    onCompleteJob={this.handleCompleteJob}
                    onViewDetails={this.handleViewDetails}
                    isActive={currentJob?.id === job.id}
                  />
                ))
              ) : (
                <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
                  <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No jobs today!</h3>
                  <p className="text-gray-600">Enjoy your day off or check upcoming assignments.</p>
                </div>
              )}
            </div>
          </div>

          {/* Current Job Details or Upcoming Jobs */}
          <div>
            {currentJob ? (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Current Job Details</h2>
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">{currentJob.jobNumber}</h3>
                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                      IN PROGRESS
                    </span>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Customer</h4>
                      <p className="text-gray-600">{currentJob.client.firstName} {currentJob.client.lastName}</p>
                      <div className="flex space-x-4 mt-2">
                        <button className="flex items-center text-primary-600 hover:text-primary-700">
                          <Phone className="w-4 h-4 mr-1" />
                          Call
                        </button>
                        <button className="flex items-center text-primary-600 hover:text-primary-700">
                          <MessageSquare className="w-4 h-4 mr-1" />
                          Message
                        </button>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Address</h4>
                      <p className="text-gray-600">{currentJob.address.street}</p>
                      <p className="text-gray-600">{currentJob.address.city}, {currentJob.address.state}</p>
                      <button className="flex items-center text-primary-600 hover:text-primary-700 mt-2">
                        <Navigation className="w-4 h-4 mr-1" />
                        Get Directions
                      </button>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Service Details</h4>
                      <p className="text-gray-600">{currentJob.service.cleaningType}</p>
                      <p className="text-gray-600">{currentJob.service.bedrooms} bed, {currentJob.service.bathrooms} bath</p>
                      <p className="text-gray-600">Est. {currentJob.service.estimatedDuration}</p>
                    </div>

                    {currentJob.service.specialInstructions && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Special Instructions</h4>
                        <p className="text-gray-600">{currentJob.service.specialInstructions}</p>
                      </div>
                    )}

                    <div className="pt-4 border-t border-gray-200">
                      <div className="flex space-x-3">
                        <button className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center">
                          <Camera className="w-4 h-4 mr-2" />
                          Add Photos
                        </button>
                        <button
                          onClick={() => this.handleCompleteJob(currentJob.id)}
                          className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Complete Job
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Upcoming Jobs</h2>
                <div className="space-y-4">
                  {upcomingJobs.slice(0, 3).map(job => (
                    <CleanerJobCard
                      key={job.id}
                      job={job}
                      onStartJob={this.handleStartJob}
                      onCompleteJob={this.handleCompleteJob}
                      onViewDetails={this.handleViewDetails}
                      isActive={false}
                    />
                  ))}
                  
                  {upcomingJobs.length === 0 && (
                    <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
                      <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">No upcoming jobs</h3>
                      <p className="text-gray-600">New assignments will appear here when scheduled.</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button className="p-4 text-center bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <Clock className="w-6 h-6 text-gray-600 mx-auto mb-2" />
              <span className="text-sm font-medium text-gray-900">Log Time</span>
            </button>
            <button className="p-4 text-center bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <Camera className="w-6 h-6 text-gray-600 mx-auto mb-2" />
              <span className="text-sm font-medium text-gray-900">Upload Photos</span>
            </button>
            <button className="p-4 text-center bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <MessageSquare className="w-6 h-6 text-gray-600 mx-auto mb-2" />
              <span className="text-sm font-medium text-gray-900">Report Issue</span>
            </button>
            <button className="p-4 text-center bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <Star className="w-6 h-6 text-gray-600 mx-auto mb-2" />
              <span className="text-sm font-medium text-gray-900">View Feedback</span>
            </button>
          </div>
        </div>
      </div>
    );
  }
}
