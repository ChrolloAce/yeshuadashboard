import React from 'react';
import { 
  Calendar,
  Users,
  DollarSign,
  Clock
} from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
}

class StatCard extends React.Component<StatCardProps> {
  public render(): React.ReactNode {
    const { title, value, icon, change, changeType = 'neutral' } = this.props;

    return (
      <div className="bg-white rounded-lg shadow-soft border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
            {change && (
              <p className={`text-sm mt-2 ${
                changeType === 'positive' ? 'text-green-600' : 
                changeType === 'negative' ? 'text-red-600' : 
                'text-gray-500'
              }`}>
                {change}
              </p>
            )}
          </div>
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
              <span className="text-primary-600">
                {icon}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export class DashboardHome extends React.Component {
  public render(): React.ReactNode {
    return (
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">Welcome back! Here's what's happening with your business.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Today's Bookings"
            value="12"
            icon={<Calendar className="w-6 h-6" />}
            change="+2 from yesterday"
            changeType="positive"
          />
          
          <StatCard
            title="Active Clients"
            value="248"
            icon={<Users className="w-6 h-6" />}
            change="+12 this month"
            changeType="positive"
          />
          
          <StatCard
            title="Revenue Today"
            value="$1,840"
            icon={<DollarSign className="w-6 h-6" />}
            change="+8.2% from yesterday"
            changeType="positive"
          />
          
          <StatCard
            title="Avg. Service Time"
            value="2.5h"
            icon={<Clock className="w-6 h-6" />}
            change="Same as yesterday"
            changeType="neutral"
          />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-soft border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                <div className="font-medium text-gray-900">Create New Booking</div>
                <div className="text-sm text-gray-500">Add a new cleaning appointment</div>
              </button>
              <button className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                <div className="font-medium text-gray-900">View Today's Schedule</div>
                <div className="text-sm text-gray-500">See all appointments for today</div>
              </button>
              <button className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                <div className="font-medium text-gray-900">Send Invoices</div>
                <div className="text-sm text-gray-500">Process pending invoices</div>
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-soft border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <div>
                  <p className="text-sm font-medium text-gray-900">New booking from Sarah Johnson</p>
                  <p className="text-xs text-gray-500">2 minutes ago</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Invoice sent to Mike Davis</p>
                  <p className="text-xs text-gray-500">15 minutes ago</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Service completed for Emma Wilson</p>
                  <p className="text-xs text-gray-500">1 hour ago</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
