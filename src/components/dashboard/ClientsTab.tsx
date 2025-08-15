'use client';

import React, { useState } from 'react';
import { User, Plus, Search, Mail, Phone, MapPin, Calendar, RefreshCw } from 'lucide-react';
import { useFirebaseClients } from '@/hooks/useFirebaseClients';
import { Client } from '@/types/database';
import { ThemedCard, ThemedButton, ThemedInput, LoadingSpinner } from '@/components/ui';

interface ClientCardProps {
  client: Client;
  onViewDetails: (client: Client) => void;
}

const ClientCard: React.FC<ClientCardProps> = ({ client, onViewDetails }) => {
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <ThemedCard className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => onViewDetails(client)}>
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center">
              <span className="text-white font-semibold text-lg">
                {client.firstName.charAt(0)}{client.lastName.charAt(0)}
              </span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {client.firstName} {client.lastName}
              </h3>
              <p className="text-sm text-gray-500">Client since {formatDate(client.createdAt)}</p>
            </div>
          </div>
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Mail className="w-4 h-4" />
            <span>{client.email}</span>
          </div>
          {client.phone && (
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Phone className="w-4 h-4" />
              <span>{client.phone}</span>
            </div>
          )}
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <MapPin className="w-4 h-4" />
            <span>{client.address.city}, {client.address.state}</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="text-sm text-gray-500">
            <Calendar className="w-4 h-4 inline mr-1" />
            Last updated: {formatDate(client.updatedAt)}
          </div>
        </div>
      </div>
    </ThemedCard>
  );
};

export const ClientsTab: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  
  const { clients, loading, error, refresh } = useFirebaseClients({ 
    realTime: true,
    searchTerm: searchQuery 
  });

  const handleViewDetails = (client: Client) => {
    setSelectedClient(client);
  };

  const handleAddClient = () => {
    // TODO: Implement add client functionality
    alert('Add client functionality coming soon!');
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {clients.map((client) => (
            <ClientCard
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
    </div>
  );
};
