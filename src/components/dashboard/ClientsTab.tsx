'use client';

import React, { useState } from 'react';
import { User, Plus, Search, Mail, Phone, MapPin, Calendar, RefreshCw, X } from 'lucide-react';
import { useFirebaseClients } from '@/hooks/useFirebaseClients';
import { Client } from '@/types/database';
import { ThemedCard, ThemedButton, ThemedInput, LoadingSpinner } from '@/components/ui';
import { ClientService } from '@/services/database/ClientService';
import { useAuth } from '@/hooks/useAuth';

interface ClientCardProps {
  client: Client;
  onViewDetails: (client: Client) => void;
}

const ClientRow: React.FC<ClientCardProps> = ({ client, onViewDetails }) => {
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div 
      className="bg-white border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer"
      onClick={() => onViewDetails(client)}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {/* Avatar */}
          <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-white font-semibold text-sm">
              {client.firstName.charAt(0)}{client.lastName.charAt(0)}
            </span>
          </div>

          {/* Client Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-4">
              <div>
                <h3 className="text-base font-semibold text-gray-900">
                  {client.firstName} {client.lastName}
                </h3>
                <p className="text-sm text-gray-500">Client since {formatDate(client.createdAt)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact & Location Info */}
        <div className="flex items-center space-x-8 text-sm text-gray-600">
          <div className="flex items-center space-x-2">
            <Mail className="w-4 h-4" />
            <span className="hidden sm:inline">{client.email}</span>
          </div>
          
          {client.phone && (
            <div className="flex items-center space-x-2">
              <Phone className="w-4 h-4" />
              <span className="hidden md:inline">{client.phone}</span>
            </div>
          )}
          
          <div className="flex items-center space-x-2">
            <MapPin className="w-4 h-4" />
            <span className="hidden lg:inline">{client.address.city}, {client.address.state}</span>
          </div>

          <div className="flex items-center space-x-2 text-xs text-gray-400">
            <Calendar className="w-4 h-4" />
            <span className="hidden xl:inline">{formatDate(client.updatedAt)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export const ClientsTab: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [showAddClientModal, setShowAddClientModal] = useState(false);
  const [newClientData, setNewClientData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    zipCode: ''
  });
  
  const { clients, loading, error, refresh } = useFirebaseClients({ 
    realTime: true,
    searchTerm: searchQuery 
  });
  const { userProfile } = useAuth();
  const clientService = ClientService.getInstance();

  const handleViewDetails = (client: Client) => {
    setSelectedClient(client);
  };

  const handleAddClient = () => {
    setShowAddClientModal(true);
  };

  const handleCloseModal = () => {
    setShowAddClientModal(false);
    setNewClientData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      street: '',
      city: '',
      state: '',
      zipCode: ''
    });
  };

  const handleCreateClient = async () => {
    try {
      if (!userProfile?.companyId) {
        alert('No company ID available');
        return;
      }

      if (!newClientData.firstName || !newClientData.lastName || !newClientData.email) {
        alert('Please fill in required fields: First Name, Last Name, and Email');
        return;
      }

      const clientData = {
        firstName: newClientData.firstName,
        lastName: newClientData.lastName,
        email: newClientData.email,
        phone: newClientData.phone || undefined,
        address: {
          street: newClientData.street,
          city: newClientData.city,
          state: newClientData.state,
          zipCode: newClientData.zipCode
        }
      };

      await clientService.createClientDirect(userProfile.companyId, clientData);
      handleCloseModal();
      refresh(); // Refresh the client list
      console.log('✅ Client created successfully');
    } catch (error) {
      console.error('❌ Error creating client:', error);
      alert('Failed to create client. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <h3 className="text-lg font-semibold text-red-800 mb-2">Error Loading Clients</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <ThemedButton variant="secondary" onClick={refresh}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </ThemedButton>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Clients</h1>
          <p className="text-gray-600 mt-2">
            Manage your customer relationships and history. {clients.length} total clients.
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <ThemedButton variant="secondary" onClick={refresh}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </ThemedButton>
          <ThemedButton variant="primary" onClick={handleAddClient}>
            <Plus className="w-4 h-4 mr-2" />
            Add Client
          </ThemedButton>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <ThemedInput
            type="text"
            placeholder="Search clients by name, email, or location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Client List or Empty State */}
      {clients.length === 0 ? (
        <div className="bg-white rounded-lg shadow-soft border border-gray-200 p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {searchQuery ? 'No clients found' : 'No clients yet'}
          </h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            {searchQuery 
              ? `No clients match "${searchQuery}". Try a different search term.`
              : 'Start building your client database. Add clients manually or they\'ll be automatically created from bookings.'
            }
          </p>
          {!searchQuery && (
            <ThemedButton variant="primary" onClick={handleAddClient}>
              Add Your First Client
            </ThemedButton>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {/* Table Header */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between text-sm font-medium text-gray-500 uppercase tracking-wide">
              <div className="flex items-center space-x-4">
                <div className="w-10"></div> {/* Avatar space */}
                <div>Client</div>
              </div>
              <div className="flex items-center space-x-8">
                <div className="hidden sm:block">Email</div>
                <div className="hidden md:block">Phone</div>
                <div className="hidden lg:block">Location</div>
                <div className="hidden xl:block">Updated</div>
              </div>
            </div>
          </div>

          {/* Client Rows */}
          {clients.map((client) => (
            <ClientRow
              key={client.id}
              client={client}
              onViewDetails={handleViewDetails}
            />
          ))}
        </div>
      )}

      {/* Client Details Modal - TODO: Implement */}
      {selectedClient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Client Details</h3>
            <p className="text-gray-600 mb-4">
              Detailed client view coming soon!
            </p>
            <ThemedButton
              variant="secondary"
              onClick={() => setSelectedClient(null)}
              className="w-full"
            >
              Close
            </ThemedButton>
          </div>
        </div>
      )}

      {/* Add Client Modal */}
      {showAddClientModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Add New Client</h2>
                <button
                  onClick={handleCloseModal}
                  className="p-1 rounded-md hover:bg-gray-100 transition-colors"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              {/* Form */}
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      First Name *
                    </label>
                    <ThemedInput
                      type="text"
                      value={newClientData.firstName}
                      onChange={(e) => setNewClientData(prev => ({ ...prev, firstName: e.target.value }))}
                      placeholder="John"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name *
                    </label>
                    <ThemedInput
                      type="text"
                      value={newClientData.lastName}
                      onChange={(e) => setNewClientData(prev => ({ ...prev, lastName: e.target.value }))}
                      placeholder="Doe"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <ThemedInput
                    type="email"
                    value={newClientData.email}
                    onChange={(e) => setNewClientData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="john.doe@email.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone
                  </label>
                  <ThemedInput
                    type="tel"
                    value={newClientData.phone}
                    onChange={(e) => setNewClientData(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="(555) 123-4567"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Street Address
                  </label>
                  <ThemedInput
                    type="text"
                    value={newClientData.street}
                    onChange={(e) => setNewClientData(prev => ({ ...prev, street: e.target.value }))}
                    placeholder="123 Main St"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      City
                    </label>
                    <ThemedInput
                      type="text"
                      value={newClientData.city}
                      onChange={(e) => setNewClientData(prev => ({ ...prev, city: e.target.value }))}
                      placeholder="Miami"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      State
                    </label>
                    <ThemedInput
                      type="text"
                      value={newClientData.state}
                      onChange={(e) => setNewClientData(prev => ({ ...prev, state: e.target.value }))}
                      placeholder="FL"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ZIP Code
                  </label>
                  <ThemedInput
                    type="text"
                    value={newClientData.zipCode}
                    onChange={(e) => setNewClientData(prev => ({ ...prev, zipCode: e.target.value }))}
                    placeholder="33101"
                  />
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end space-x-3 mt-6 pt-6 border-t">
                <ThemedButton variant="secondary" onClick={handleCloseModal}>
                  Cancel
                </ThemedButton>
                <ThemedButton variant="primary" onClick={handleCreateClient}>
                  Add Client
                </ThemedButton>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
