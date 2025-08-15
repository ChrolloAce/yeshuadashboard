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
    </div>
  );
};
