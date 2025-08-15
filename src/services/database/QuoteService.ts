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
import { Quote, COLLECTIONS, QuoteStatus } from '@/types/database';
import { BookingData, PricingBreakdown } from '@/types/booking';

export class QuoteService {
  private static instance: QuoteService;
  private listeners: Map<string, () => void> = new Map();

  private constructor() {}

  public static getInstance(): QuoteService {
    if (!QuoteService.instance) {
      QuoteService.instance = new QuoteService();
    }
    return QuoteService.instance;
  }

  // Create a new quote from booking data
  public async createQuote(bookingData: BookingData): Promise<Quote> {
    try {
      const now = new Date();
      const expiresAt = new Date(now.getTime() + (7 * 24 * 60 * 60 * 1000)); // 7 days from now

      // Calculate pricing from booking data
      const pricingBreakdown = this.calculatePricing(bookingData);

      const quote: Omit<Quote, 'id'> = {
        clientId: '', // Will be set after client creation
        client: {
          email: bookingData.contact.email,
          firstName: bookingData.contact.firstName,
          lastName: bookingData.contact.lastName,
          phone: bookingData.contact.phone
        },
        service: {
          type: this.mapServiceType(bookingData.service.cleaningType),
          bedrooms: bookingData.service.bedrooms,
          bathrooms: bookingData.service.bathrooms,
          squareFootage: undefined, // Not in current BookingData
          frequency: this.mapFrequency(bookingData.schedule.frequency)
        },
        address: {
          street: bookingData.address.street,
          city: bookingData.address.city,
          state: bookingData.address.state,
          zipCode: bookingData.address.zipCode
        },
        pricing: {
          basePrice: pricingBreakdown.baseRate,
          addOns: this.mapExtrasToAddOns(bookingData.extras),
          totalPrice: pricingBreakdown.subtotal,
          discount: pricingBreakdown.discount,
          finalPrice: pricingBreakdown.total
        },
        schedule: {
          date: bookingData.schedule.date,
          timeSlot: bookingData.schedule.time,
          estimatedDuration: this.calculateEstimatedDuration(bookingData)
        },
        addOns: this.getSelectedExtrasNames(bookingData.extras),
        specialInstructions: bookingData.specialInstructions,
        parkingInstructions: bookingData.parkingInstructions,
        status: 'pending',
        createdAt: now,
        updatedAt: now,
        expiresAt
      };

      const docRef = await addDoc(collection(db, COLLECTIONS.QUOTES), {
        ...quote,
        createdAt: Timestamp.fromDate(quote.createdAt),
        updatedAt: Timestamp.fromDate(quote.updatedAt),
        expiresAt: Timestamp.fromDate(quote.expiresAt),
        schedule: {
          ...quote.schedule,
          date: Timestamp.fromDate(quote.schedule.date)
        }
      });

      return {
        id: docRef.id,
        ...quote
      };
    } catch (error) {
      console.error('Error creating quote:', error);
      throw new Error('Failed to create quote');
    }
  }

  // Get all quotes with optional filtering
  public async getQuotes(filters?: {
    status?: QuoteStatus;
    clientId?: string;
    limit?: number;
  }): Promise<Quote[]> {
    try {
      let q = query(
        collection(db, COLLECTIONS.QUOTES),
        orderBy('createdAt', 'desc')
      );

      if (filters?.status) {
        q = query(q, where('status', '==', filters.status));
      }

      if (filters?.clientId) {
        q = query(q, where('clientId', '==', filters.clientId));
      }

      if (filters?.limit) {
        q = query(q, limit(filters.limit));
      }

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => this.convertFirestoreQuote(doc.id, doc.data()));
    } catch (error) {
      console.error('Error getting quotes:', error);
      throw new Error('Failed to get quotes');
    }
  }

  // Get a single quote by ID
  public async getQuote(id: string): Promise<Quote | null> {
    try {
      const docRef = doc(db, COLLECTIONS.QUOTES, id);
      const snapshot = await getDoc(docRef);
      
      if (!snapshot.exists()) {
        return null;
      }

      return this.convertFirestoreQuote(snapshot.id, snapshot.data());
    } catch (error) {
      console.error('Error getting quote:', error);
      throw new Error('Failed to get quote');
    }
  }

  // Update quote status
  public async updateQuoteStatus(id: string, status: QuoteStatus): Promise<void> {
    try {
      const docRef = doc(db, COLLECTIONS.QUOTES, id);
      const updates: any = {
        status,
        updatedAt: Timestamp.fromDate(new Date())
      };

      if (status === 'sent') {
        updates.sentAt = Timestamp.fromDate(new Date());
      }

      if (status === 'accepted' || status === 'declined') {
        updates.respondedAt = Timestamp.fromDate(new Date());
      }

      await updateDoc(docRef, updates);
    } catch (error) {
      console.error('Error updating quote status:', error);
      throw new Error('Failed to update quote status');
    }
  }

  // Update quote pricing
  public async updateQuotePricing(id: string, pricing: Quote['pricing']): Promise<void> {
    try {
      const docRef = doc(db, COLLECTIONS.QUOTES, id);
      await updateDoc(docRef, {
        pricing,
        updatedAt: Timestamp.fromDate(new Date())
      });
    } catch (error) {
      console.error('Error updating quote pricing:', error);
      throw new Error('Failed to update quote pricing');
    }
  }

  // Delete a quote
  public async deleteQuote(id: string): Promise<void> {
    try {
      const docRef = doc(db, COLLECTIONS.QUOTES, id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting quote:', error);
      throw new Error('Failed to delete quote');
    }
  }

  // Subscribe to quotes changes
  public subscribeToQuotes(
    callback: (quotes: Quote[]) => void,
    filters?: {
      status?: QuoteStatus;
      clientId?: string;
      limit?: number;
    }
  ): () => void {
    let q = query(
      collection(db, COLLECTIONS.QUOTES),
      orderBy('createdAt', 'desc')
    );

    if (filters?.status) {
      q = query(q, where('status', '==', filters.status));
    }

    if (filters?.clientId) {
      q = query(q, where('clientId', '==', filters.clientId));
    }

    if (filters?.limit) {
      q = query(q, limit(filters.limit));
    }

    const unsubscribe = onSnapshot(q, (snapshot: QuerySnapshot<DocumentData>) => {
      const quotes = snapshot.docs.map(doc => 
        this.convertFirestoreQuote(doc.id, doc.data())
      );
      callback(quotes);
    });

    return unsubscribe;
  }

  // Helper methods
  private mapServiceType(cleaningType: any): Quote['service']['type'] {
    const typeMap: Record<string, Quote['service']['type']> = {
      'regular': 'standard',
      'deep': 'deep',
      'move-in-out': 'move-out',
      'post-construction': 'post-construction'
    };
    return typeMap[cleaningType] || 'standard';
  }

  private mapFrequency(frequency: any): Quote['service']['frequency'] {
    const frequencyMap: Record<string, Quote['service']['frequency']> = {
      'one-time': 'one-time',
      'weekly': 'weekly',
      'biweekly': 'bi-weekly',
      'monthly': 'monthly'
    };
    return frequencyMap[frequency] || 'one-time';
  }

  private calculatePricing(bookingData: BookingData): PricingBreakdown {
    // Use the existing PricingEngine logic
    const baseRate = this.calculateBaseRate(bookingData);
    const extrasTotal = this.calculateExtrasTotal(bookingData.extras);
    const travelFee = 0; // Could be calculated based on address
    const rushFee = 0; // Could be calculated based on schedule
    const discount = 0; // Could be applied from promo code
    const subtotal = baseRate + extrasTotal + travelFee + rushFee;
    const total = subtotal - discount;

    return {
      baseRate,
      extrasTotal,
      travelFee,
      rushFee,
      discount,
      subtotal,
      total
    };
  }

  private calculateBaseRate(bookingData: BookingData): number {
    let baseRate = 80; // Base rate
    
    // Add for bedrooms and bathrooms
    baseRate += (bookingData.service.bedrooms - 1) * 20;
    baseRate += (bookingData.service.bathrooms - 1) * 15;
    
    // Adjust for cleaning type
    switch (bookingData.service.cleaningType) {
      case 'deep':
        baseRate *= 1.5;
        break;
      case 'move-in-out':
        baseRate *= 1.3;
        break;
      case 'post-construction':
        baseRate *= 2;
        break;
    }

    return baseRate;
  }

  private calculateExtrasTotal(extras: any): number {
    let total = 0;
    
    if (extras.insideFridge) total += 25;
    if (extras.insideOven) total += 25;
    if (extras.windows > 0) total += extras.windows * 5;
    if (extras.cabinets) total += 30;
    if (extras.laundry > 0) total += extras.laundry * 15;
    if (extras.walls) total += 40;
    if (extras.petHairRemoval) total += 20;
    
    return total;
  }

  private mapExtrasToAddOns(extras: any): Array<{ name: string; price: number }> {
    const addOns: Array<{ name: string; price: number }> = [];
    
    if (extras.insideFridge) addOns.push({ name: 'Inside Fridge', price: 25 });
    if (extras.insideOven) addOns.push({ name: 'Inside Oven', price: 25 });
    if (extras.windows > 0) addOns.push({ name: `${extras.windows} Windows`, price: extras.windows * 5 });
    if (extras.cabinets) addOns.push({ name: 'Inside Cabinets', price: 30 });
    if (extras.laundry > 0) addOns.push({ name: `${extras.laundry} Loads of Laundry`, price: extras.laundry * 15 });
    if (extras.walls) addOns.push({ name: 'Walls', price: 40 });
    if (extras.petHairRemoval) addOns.push({ name: 'Pet Hair Removal', price: 20 });
    
    return addOns;
  }

  private getSelectedExtrasNames(extras: any): string[] {
    const names: string[] = [];
    
    if (extras.insideFridge) names.push('Inside Fridge');
    if (extras.insideOven) names.push('Inside Oven');
    if (extras.windows > 0) names.push(`${extras.windows} Windows`);
    if (extras.cabinets) names.push('Inside Cabinets');
    if (extras.laundry > 0) names.push(`${extras.laundry} Loads of Laundry`);
    if (extras.walls) names.push('Walls');
    if (extras.petHairRemoval) names.push('Pet Hair Removal');
    
    return names;
  }

  private calculateEstimatedDuration(bookingData: BookingData): number {
    // Base time calculation in minutes
    let duration = 60; // Base 1 hour
    
    // Add time based on service type
    switch (bookingData.service.cleaningType) {
      case 'deep':
        duration += 60;
        break;
      case 'move-in-out':
        duration += 30;
        break;
      case 'post-construction':
        duration += 90;
        break;
    }
    
    // Add time based on size
    duration += bookingData.service.bedrooms * 20;
    duration += bookingData.service.bathrooms * 15;
    
    // Add time for extras
    const extrasCount = Object.values(bookingData.extras).filter(value => 
      typeof value === 'boolean' ? value : (typeof value === 'number' && value > 0)
    ).length;
    duration += extrasCount * 15;
    
    return duration;
  }

  private convertFirestoreQuote(id: string, data: DocumentData): Quote {
    return {
      id,
      clientId: data.clientId,
      client: data.client,
      service: data.service,
      address: data.address,
      pricing: data.pricing,
      schedule: {
        ...data.schedule,
        date: data.schedule.date.toDate()
      },
      addOns: data.addOns,
      specialInstructions: data.specialInstructions,
      parkingInstructions: data.parkingInstructions,
      status: data.status,
      createdAt: data.createdAt.toDate(),
      updatedAt: data.updatedAt.toDate(),
      sentAt: data.sentAt?.toDate(),
      respondedAt: data.respondedAt?.toDate(),
      expiresAt: data.expiresAt.toDate()
    };
  }
}
