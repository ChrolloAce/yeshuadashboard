'use client';

import { useState, useEffect } from 'react';
import { ClientService } from '@/services/database/ClientService';
import { Client } from '@/types/database';

interface UseFirebaseClientsOptions {
  realTime?: boolean;
  searchTerm?: string;
  limit?: number;
}

interface UseFirebaseClientsReturn {
  clients: Client[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export const useFirebaseClients = (options: UseFirebaseClientsOptions = {}): UseFirebaseClientsReturn => {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const clientService = ClientService.getInstance();

  const fetchClients = async () => {
    try {
      setError(null);
      const fetchedClients = await clientService.getClients({
        limit: options.limit,
        searchTerm: options.searchTerm
      });
      setClients(fetchedClients);
    } catch (err) {
      console.error('Error fetching clients:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch clients');
    } finally {
      setLoading(false);
    }
  };

  const refresh = async () => {
    setLoading(true);
    await fetchClients();
  };

  useEffect(() => {
    fetchClients();
  }, [options.searchTerm, options.limit]);

  // Set up real-time listener if requested
  useEffect(() => {
    if (!options.realTime) return;

    // For now, we'll poll every 30 seconds for updates
    // In a production app, you'd use Firestore real-time listeners
    const interval = setInterval(() => {
      fetchClients();
    }, 30000);

    return () => clearInterval(interval);
  }, [options.realTime]);

  return {
    clients,
    loading,
    error,
    refresh
  };
};
