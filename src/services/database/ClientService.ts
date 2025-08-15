import { 
  collection, 
  doc, 
  addDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  onSnapshot,
  QuerySnapshot,
  DocumentData
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Client, COLLECTIONS } from '@/types/database';
import { BookingData } from '@/types/booking';

export class ClientService {
  private static instance: ClientService;

  private constructor() {}

  public static getInstance(): ClientService {
    if (!ClientService.instance) {
      ClientService.instance = new ClientService();
    }
    return ClientService.instance;
  }

  // Create a new client from booking data
  public async createClient(bookingData: BookingData, companyId: string): Promise<Client> {
    try {
      // Check if client already exists by email within this company
      const existingClient = await this.getClientByEmailAndCompany(bookingData.contact.email, companyId);
      if (existingClient) {
        return existingClient;
      }

      const now = new Date();
      const client: Omit<Client, 'id'> = {
        companyId,
        email: bookingData.contact.email,
        firstName: bookingData.contact.firstName,
        lastName: bookingData.contact.lastName,
        phone: bookingData.contact.phone,
        address: {
          street: bookingData.address.street,
          city: bookingData.address.city,
          state: bookingData.address.state,
          zipCode: bookingData.address.zipCode
        },
        createdAt: now,
        updatedAt: now,
        totalJobs: 0,
        totalSpent: 0,
        notes: ''
      };

      const docRef = await addDoc(collection(db, COLLECTIONS.CLIENTS), {
        ...client,
        createdAt: Timestamp.fromDate(client.createdAt),
        updatedAt: Timestamp.fromDate(client.updatedAt)
      });

      return {
        id: docRef.id,
        ...client
      };
    } catch (error) {
      console.error('Error creating client:', error);
      throw new Error('Failed to create client');
    }
  }

  // Get client by email and company (for multi-tenant support)
  public async getClientByEmailAndCompany(email: string, companyId: string): Promise<Client | null> {
    try {
      const q = query(
        collection(db, COLLECTIONS.CLIENTS),
        where('email', '==', email),
        where('companyId', '==', companyId),
        limit(1)
      );

      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        return null;
      }

      const doc = querySnapshot.docs[0];
      const data = doc.data();
      
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate()
      } as Client;
    } catch (error) {
      console.error('Error getting client by email and company:', error);
      return null;
    }
  }

  // Get client by email (legacy method - now searches across all companies)
  public async getClientByEmail(email: string): Promise<Client | null> {
    try {
      const q = query(
        collection(db, COLLECTIONS.CLIENTS),
        where('email', '==', email),
        limit(1)
      );
      
      const snapshot = await getDocs(q);
      if (snapshot.empty) {
        return null;
      }

      const doc = snapshot.docs[0];
      return this.convertFirestoreClient(doc.id, doc.data());
    } catch (error) {
      console.error('Error getting client by email:', error);
      throw new Error('Failed to get client');
    }
  }

  // Get all clients for a specific company with optional filtering
  public async getClients(companyId: string, filters?: {
    limit?: number;
    searchTerm?: string;
  }): Promise<Client[]> {
    try {
      let q = query(
        collection(db, COLLECTIONS.CLIENTS),
        where('companyId', '==', companyId),
        orderBy('createdAt', 'desc')
      );

      if (filters?.limit) {
        q = query(q, limit(filters.limit));
      }

      const snapshot = await getDocs(q);
      let clients = snapshot.docs.map(doc => this.convertFirestoreClient(doc.id, doc.data()));

      // Apply search filter client-side (Firestore doesn't support full-text search)
      if (filters?.searchTerm) {
        const searchLower = filters.searchTerm.toLowerCase();
        clients = clients.filter(client => 
          client.firstName.toLowerCase().includes(searchLower) ||
          client.lastName.toLowerCase().includes(searchLower) ||
          client.email.toLowerCase().includes(searchLower) ||
          client.phone?.toLowerCase().includes(searchLower)
        );
      }

      return clients;
    } catch (error) {
      console.error('Error getting clients:', error);
      throw new Error('Failed to get clients');
    }
  }

  // Get a single client by ID
  public async getClient(id: string): Promise<Client | null> {
    try {
      const docRef = doc(db, COLLECTIONS.CLIENTS, id);
      const snapshot = await getDoc(docRef);
      
      if (!snapshot.exists()) {
        return null;
      }

      return this.convertFirestoreClient(snapshot.id, snapshot.data());
    } catch (error) {
      console.error('Error getting client:', error);
      throw new Error('Failed to get client');
    }
  }

  // Update client information
  public async updateClient(id: string, updates: Partial<Omit<Client, 'id' | 'createdAt'>>): Promise<void> {
    try {
      const docRef = doc(db, COLLECTIONS.CLIENTS, id);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: Timestamp.fromDate(new Date())
      });
    } catch (error) {
      console.error('Error updating client:', error);
      throw new Error('Failed to update client');
    }
  }

  // Update client job statistics
  public async updateClientStats(id: string, totalJobs: number, totalSpent: number): Promise<void> {
    try {
      const docRef = doc(db, COLLECTIONS.CLIENTS, id);
      await updateDoc(docRef, {
        totalJobs,
        totalSpent,
        updatedAt: Timestamp.fromDate(new Date())
      });
    } catch (error) {
      console.error('Error updating client stats:', error);
      throw new Error('Failed to update client stats');
    }
  }

  // Add notes to client
  public async addClientNote(id: string, note: string): Promise<void> {
    try {
      const client = await this.getClient(id);
      if (!client) {
        throw new Error('Client not found');
      }

      const existingNotes = client.notes || '';
      const timestamp = new Date().toLocaleString();
      const newNote = `[${timestamp}] ${note}`;
      const updatedNotes = existingNotes 
        ? `${existingNotes}\n${newNote}` 
        : newNote;

      await this.updateClient(id, { notes: updatedNotes });
    } catch (error) {
      console.error('Error adding client note:', error);
      throw new Error('Failed to add client note');
    }
  }

  // Delete a client
  public async deleteClient(id: string): Promise<void> {
    try {
      const docRef = doc(db, COLLECTIONS.CLIENTS, id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting client:', error);
      throw new Error('Failed to delete client');
    }
  }

  // Subscribe to clients changes
  public subscribeToClients(
    companyId: string,
    callback: (clients: Client[]) => void,
    filters?: {
      limit?: number;
    }
  ): () => void {
    let q = query(
      collection(db, COLLECTIONS.CLIENTS),
      where('companyId', '==', companyId),
      orderBy('createdAt', 'desc')
    );

    if (filters?.limit) {
      q = query(q, limit(filters.limit));
    }

    const unsubscribe = onSnapshot(q, (snapshot: QuerySnapshot<DocumentData>) => {
      const clients = snapshot.docs.map(doc => 
        this.convertFirestoreClient(doc.id, doc.data())
      );
      callback(clients);
    });

    return unsubscribe;
  }

  // Get client statistics
  public async getClientStats(companyId: string): Promise<{
    totalClients: number;
    newClientsThisMonth: number;
    averageJobValue: number;
    topClients: Client[];
  }> {
    try {
      const clients = await this.getClients(companyId);
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      const totalClients = clients.length;
      const newClientsThisMonth = clients.filter(
        client => client.createdAt >= startOfMonth
      ).length;

      const totalSpent = clients.reduce((sum, client) => sum + client.totalSpent, 0);
      const totalJobs = clients.reduce((sum, client) => sum + client.totalJobs, 0);
      const averageJobValue = totalJobs > 0 ? totalSpent / totalJobs : 0;

      const topClients = clients
        .filter(client => client.totalSpent > 0)
        .sort((a, b) => b.totalSpent - a.totalSpent)
        .slice(0, 5);

      return {
        totalClients,
        newClientsThisMonth,
        averageJobValue,
        topClients
      };
    } catch (error) {
      console.error('Error getting client stats:', error);
      throw new Error('Failed to get client stats');
    }
  }

  // Helper method to convert Firestore document to Client
  private convertFirestoreClient(id: string, data: DocumentData): Client {
    return {
      id,
      companyId: data.companyId,
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone,
      address: data.address,
      createdAt: data.createdAt.toDate(),
      updatedAt: data.updatedAt.toDate(),
      totalJobs: data.totalJobs || 0,
      totalSpent: data.totalSpent || 0,
      notes: data.notes || ''
    };
  }
}
