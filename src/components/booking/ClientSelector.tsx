'use client';

import React, { useState, useEffect } from 'react';
import { User, Plus, Search } from 'lucide-react';
import { useFirebaseClients } from '@/hooks/useFirebaseClients';
import { Client } from '@/types/database';
import { ContactInfo } from '@/types/booking';
import { ThemedButton } from '@/components/ui/ThemedButton';
import { ThemedCard } from '@/components/ui/ThemedCard';

interface ClientSelectorProps {
  onClientSelect: (client: Client | null) => void;
  onNewClient: () => void;
  selectedClientId?: string;
}

export const ClientSelector: React.FC<ClientSelectorProps> = ({
  onClientSelect,
  onNewClient,
  selectedClientId
}) => {
  const { clients, loading: isLoading } = useFirebaseClients();
  const [searchQuery, setSearchQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const filteredClients = clients.filter(client => 
    `${client.firstName} ${client.lastName} ${client.email}`
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  const selectedClient = clients.find(client => client.id === selectedClientId);

  const handleClientSelect = (client: Client) => {
    onClientSelect(client);
    setIsDropdownOpen(false);
    setSearchQuery('');
  };

  const handleNewClient = () => {
    onClientSelect(null);
    onNewClient();
    setIsDropdownOpen(false);
    setSearchQuery('');
  };

  return (
    <ThemedCard className="p-6 mb-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
        <User className="w-5 h-5 mr-2 text-primary-600" />
        Select Client
      </h2>

      <div className="space-y-4">
        {/* Selected Client Display */}
        {selectedClient ? (
          <div className="flex items-center justify-between p-4 bg-primary-50 border border-primary-200 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold text-sm">
                  {selectedClient.firstName.charAt(0)}{selectedClient.lastName.charAt(0)}
                </span>
              </div>
              <div>
                <p className="font-medium text-gray-900">
                  {selectedClient.firstName} {selectedClient.lastName}
                </p>
                <p className="text-sm text-gray-600">{selectedClient.email}</p>
                {selectedClient.phone && (
                  <p className="text-sm text-gray-600">{selectedClient.phone}</p>
                )}
              </div>
            </div>
            <ThemedButton
              variant="outline"
              size="sm"
              onClick={() => setIsDropdownOpen(true)}
            >
              Change Client
            </ThemedButton>
          </div>
        ) : (
          /* Client Selector */
          <div className="relative">
            <div className="flex space-x-2">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search existing clients..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsDropdownOpen(true)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <ThemedButton
                variant="primary"
                onClick={handleNewClient}
                className="flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>New Client</span>
              </ThemedButton>
            </div>

            {/* Dropdown */}
            {isDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
                {isLoading ? (
                  <div className="p-4 text-center text-gray-500">Loading clients...</div>
                ) : filteredClients.length > 0 ? (
                  <>
                    {filteredClients.map((client) => (
                      <div
                        key={client.id}
                        onClick={() => handleClientSelect(client)}
                        className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                            <span className="text-gray-600 font-medium text-xs">
                              {client.firstName.charAt(0)}{client.lastName.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {client.firstName} {client.lastName}
                            </p>
                            <p className="text-sm text-gray-600">{client.email}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </>
                ) : (
                  <div className="p-4 text-center text-gray-500">
                    {searchQuery ? 'No clients found' : 'No clients available'}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Click outside to close dropdown */}
      {isDropdownOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsDropdownOpen(false)}
        />
      )}
    </ThemedCard>
  );
};
