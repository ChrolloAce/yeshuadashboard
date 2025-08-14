import React from 'react';
import { User, Plus } from 'lucide-react';

export class ClientsTab extends React.Component {
  public render(): React.ReactNode {
    return (
      <div className="p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Clients</h1>
            <p className="text-gray-600 mt-2">Manage your customer relationships and history.</p>
          </div>
          <button className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors flex items-center space-x-2">
            <Plus className="w-4 h-4" />
            <span>Add Client</span>
          </button>
        </div>

        {/* Empty State */}
        <div className="bg-white rounded-lg shadow-soft border border-gray-200 p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No clients yet</h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Start building your client database. Add clients manually or they'll be automatically created from bookings.
          </p>
          <button className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors">
            Add Your First Client
          </button>
        </div>
      </div>
    );
  }
}
