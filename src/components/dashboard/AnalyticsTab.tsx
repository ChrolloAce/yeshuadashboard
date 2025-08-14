import React from 'react';
import { BarChart3, TrendingUp } from 'lucide-react';

export class AnalyticsTab extends React.Component {
  public render(): React.ReactNode {
    return (
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-600 mt-2">Track your business performance and growth.</p>
        </div>

        {/* Empty State */}
        <div className="bg-white rounded-lg shadow-soft border border-gray-200 p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <BarChart3 className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Analytics Coming Soon</h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            We're building powerful analytics tools to help you understand your business better. Track revenue, customer satisfaction, and growth trends.
          </p>
          <div className="inline-flex items-center space-x-2 text-primary-600">
            <TrendingUp className="w-4 h-4" />
            <span className="font-medium">In Development</span>
          </div>
        </div>
      </div>
    );
  }
}
