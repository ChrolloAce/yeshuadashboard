import React from 'react';
import { CogIcon, UserIcon, BellIcon, CreditCardIcon } from 'lucide-react';

export class SettingsTab extends React.Component {
  public render(): React.ReactNode {
    return (
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-2">Configure your account and business preferences.</p>
        </div>

        {/* Settings Categories */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-soft border border-gray-200 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                <UserIcon className="w-5 h-5 text-primary-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Profile Settings</h3>
                <p className="text-sm text-gray-600">Manage your account information</p>
              </div>
            </div>
            <button className="text-primary-600 hover:text-primary-700 font-medium text-sm">
              Configure →
            </button>
          </div>

          <div className="bg-white rounded-lg shadow-soft border border-gray-200 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                <BellIcon className="w-5 h-5 text-primary-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
                <p className="text-sm text-gray-600">Email and SMS preferences</p>
              </div>
            </div>
            <button className="text-primary-600 hover:text-primary-700 font-medium text-sm">
              Configure →
            </button>
          </div>

          <div className="bg-white rounded-lg shadow-soft border border-gray-200 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                <CreditCardIcon className="w-5 h-5 text-primary-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Payment Settings</h3>
                <p className="text-sm text-gray-600">Configure payment methods</p>
              </div>
            </div>
            <button className="text-primary-600 hover:text-primary-700 font-medium text-sm">
              Configure →
            </button>
          </div>

          <div className="bg-white rounded-lg shadow-soft border border-gray-200 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                <CogIcon className="w-5 h-5 text-primary-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Business Settings</h3>
                <p className="text-sm text-gray-600">Pricing, services, and operations</p>
              </div>
            </div>
            <button className="text-primary-600 hover:text-primary-700 font-medium text-sm">
              Configure →
            </button>
          </div>
        </div>
      </div>
    );
  }
}
