import { BookingData } from '@/types/booking';
import { QuoteService } from '@/services/database/QuoteService';
import { ClientService } from '@/services/database/ClientService';
import { JobService } from '@/services/database/JobService';
import { Quote, Job, Client } from '@/types/database';

export class BookingToFirebaseService {
  private static instance: BookingToFirebaseService;
  private quoteService: QuoteService;
  private clientService: ClientService;
  private jobService: JobService;

  private constructor() {
    this.quoteService = QuoteService.getInstance();
    this.clientService = ClientService.getInstance();
    this.jobService = JobService.getInstance();
  }

  public static getInstance(): BookingToFirebaseService {
    if (!BookingToFirebaseService.instance) {
      BookingToFirebaseService.instance = new BookingToFirebaseService();
    }
    return BookingToFirebaseService.instance;
  }

  /**
   * Book now - create job immediately
   */
  public async bookNow(bookingData: BookingData, actualPricing?: any): Promise<Job> {
    const result = await this.processBooking(bookingData, { 
      createJobImmediately: true,
      skipQuote: true 
    }, actualPricing);
    
    if (!result.job) {
      throw new Error('Failed to create job');
    }
    
    return result.job;
  }

  /**
   * Send invoice - create quote first
   */
  public async sendInvoice(bookingData: BookingData, actualPricing?: any): Promise<Quote> {
    const result = await this.processBooking(bookingData, { 
      createJobImmediately: false,
      skipQuote: false 
    }, actualPricing);
    
    if (!result.quote) {
      throw new Error('Failed to create quote');
    }
    
    return result.quote;
  }

  /**
   * Complete booking flow: Create client, quote, and optionally convert to job
   */
  public async processBooking(
    bookingData: BookingData,
    options: {
      createJobImmediately?: boolean;
      skipQuote?: boolean;
    } = {},
    actualPricing?: any
  ): Promise<{
    client: Client;
    quote?: Quote;
    job?: Job;
  }> {
    try {
      console.log('Processing booking submission...', bookingData);

      // Get current user's company ID
      const { AuthService } = await import('../auth/AuthService');
      const authService = AuthService.getInstance();
      const userProfile = authService.getUserProfile();
      
      if (!userProfile?.companyId) {
        throw new Error('User must be associated with a company to create bookings');
      }

      // Step 1: Create or get existing client
      const client = await this.clientService.createClient(bookingData, userProfile.companyId);
      console.log('Client created/found:', client.id);

      let quote: Quote | undefined;
      let job: Job | undefined;

      if (!options.skipQuote) {
        // Step 2: Create quote
        quote = await this.quoteService.createQuote(bookingData, userProfile.companyId);
        quote.clientId = client.id; // Link quote to client
        
        // Update quote with client ID
        await this.quoteService.updateQuoteStatus(quote.id, 'pending');
        console.log('Quote created:', quote.id);
      }

      if (options.createJobImmediately) {
        // Step 3: Create job directly (for immediate bookings)
        if (quote) {
          job = await this.jobService.createJobFromQuote(quote);
        } else {
          // Create job directly from booking data
          job = await this.createJobDirectlyFromBooking(bookingData, client, userProfile.companyId, actualPricing);
        }
        console.log('Job created:', job?.id);
      }

      return {
        client,
        quote,
        job
      };
    } catch (error) {
      console.error('Error processing booking:', error);
      throw new Error('Failed to process booking. Please try again.');
    }
  }





  /**
   * Create a job directly from booking data without a quote
   */
  private async createJobDirectlyFromBooking(
    bookingData: BookingData,
    client: Client,
    companyId: string,
    actualPricing?: any
  ): Promise<Job> {
    const now = new Date();
    
    // Use the actual pricing from BookingManager if provided, otherwise calculate
    const pricingBreakdown = actualPricing || this.calculatePricing(bookingData);

    const jobData: Omit<Job, 'id' | 'createdAt' | 'updatedAt'> = {
      companyId,
      clientId: client.id,
      client: {
        email: client.email,
        firstName: client.firstName,
        lastName: client.lastName,
        phone: client.phone
      },
      service: {
        type: this.mapServiceType(bookingData.service.cleaningType),
        bedrooms: bookingData.service.bedrooms,
        bathrooms: bookingData.service.bathrooms,
        squareFootage: undefined,
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
      status: 'confirmed', // Direct bookings are confirmed
      payment: {
        status: 'pending'
      }
    };

    return await this.jobService.createJob(jobData);
  }

  /**
   * Convert an accepted quote to a job
   */
  public async convertQuoteToJob(quoteId: string): Promise<Job> {
    try {
      const quote = await this.quoteService.getQuote(quoteId);
      if (!quote) {
        throw new Error('Quote not found');
      }

      if (quote.status !== 'accepted') {
        throw new Error('Quote must be accepted before converting to job');
      }

      const job = await this.jobService.createJobFromQuote(quote);
      console.log('Quote converted to job:', job.id);
      
      return job;
    } catch (error) {
      console.error('Error converting quote to job:', error);
      throw error;
    }
  }

  // Helper methods (copied from QuoteService for consistency)
  private mapServiceType(cleaningType: any): Job['service']['type'] {
    const typeMap: Record<string, Job['service']['type']> = {
      'regular': 'standard',
      'deep': 'deep',
      'move-in-out': 'move-out',
      'post-construction': 'post-construction'
    };
    return typeMap[cleaningType] || 'standard';
  }

  private mapFrequency(frequency: any): Job['service']['frequency'] {
    const frequencyMap: Record<string, Job['service']['frequency']> = {
      'one-time': 'one-time',
      'weekly': 'weekly',
      'biweekly': 'bi-weekly',
      'monthly': 'monthly'
    };
    return frequencyMap[frequency] || 'one-time';
  }

  private calculatePricing(bookingData: BookingData) {
    const baseRate = this.calculateBaseRate(bookingData);
    const extrasTotal = this.calculateExtrasTotal(bookingData.extras);
    const travelFee = 0;
    const rushFee = 0;
    const discount = 0;
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
    let baseRate = 80;
    baseRate += (bookingData.service.bedrooms - 1) * 20;
    baseRate += (bookingData.service.bathrooms - 1) * 15;
    
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
    let duration = 60;
    
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
    
    duration += bookingData.service.bedrooms * 20;
    duration += bookingData.service.bathrooms * 15;
    
    const extrasCount = Object.values(bookingData.extras).filter(value => 
      typeof value === 'boolean' ? value : (typeof value === 'number' && value > 0)
    ).length;
    duration += extrasCount * 15;
    
    return duration;
  }
}
