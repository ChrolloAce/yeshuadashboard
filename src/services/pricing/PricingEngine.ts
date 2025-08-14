import { CleaningType, Frequency, ServiceSelection, ServiceExtras, PricingBreakdown } from '@/types/booking';

export class PricingEngine {
  private readonly baseRates: Record<CleaningType, { bedrooms: Record<number, number>; bathrooms: Record<number, number> }>;
  private readonly extrasPricing: Record<keyof ServiceExtras, number>;
  private readonly frequencyDiscounts: Record<Frequency, number>;

  constructor() {
    this.baseRates = {
      [CleaningType.REGULAR]: {
        bedrooms: { 1: 80, 2: 100, 3: 120, 4: 140, 5: 160 },
        bathrooms: { 1: 20, 2: 35, 3: 50, 4: 65 }
      },
      [CleaningType.DEEP]: {
        bedrooms: { 1: 120, 2: 150, 3: 180, 4: 210, 5: 240 },
        bathrooms: { 1: 30, 2: 50, 3: 70, 4: 90 }
      },
      [CleaningType.MOVE_IN_OUT]: {
        bedrooms: { 1: 150, 2: 180, 3: 210, 4: 240, 5: 270 },
        bathrooms: { 1: 40, 2: 65, 3: 90, 4: 115 }
      },
      [CleaningType.POST_CONSTRUCTION]: {
        bedrooms: { 1: 200, 2: 240, 3: 280, 4: 320, 5: 360 },
        bathrooms: { 1: 50, 2: 80, 3: 110, 4: 140 }
      }
    };

    this.extrasPricing = {
      insideFridge: 25,
      insideOven: 20,
      windows: 5, // per window
      cabinets: 30,
      laundry: 15, // per load
      walls: 40,
      petHairRemoval: 35
    };

    this.frequencyDiscounts = {
      [Frequency.ONE_TIME]: 0,
      [Frequency.WEEKLY]: 0.15,
      [Frequency.BIWEEKLY]: 0.10,
      [Frequency.MONTHLY]: 0.05
    };
  }

  public calculatePricing(
    service: ServiceSelection,
    extras: ServiceExtras,
    frequency: Frequency,
    promoCode?: string,
    isRushOrder: boolean = false
  ): PricingBreakdown {
    const baseRate = this.calculateBaseRate(service);
    const extrasTotal = this.calculateExtrasTotal(extras);
    const travelFee = this.calculateTravelFee();
    const rushFee = isRushOrder ? this.calculateRushFee(baseRate) : 0;
    
    const subtotalBeforeDiscount = baseRate + extrasTotal + travelFee + rushFee;
    const frequencyDiscount = this.calculateFrequencyDiscount(subtotalBeforeDiscount, frequency);
    const promoDiscount = this.calculatePromoDiscount(subtotalBeforeDiscount, promoCode);
    
    const totalDiscount = frequencyDiscount + promoDiscount;
    const subtotal = subtotalBeforeDiscount - totalDiscount;
    const total = Math.max(subtotal, 0);

    return {
      baseRate,
      extrasTotal,
      travelFee,
      rushFee,
      discount: totalDiscount,
      subtotal: subtotalBeforeDiscount,
      total
    };
  }

  private calculateBaseRate(service: ServiceSelection): number {
    const rates = this.baseRates[service.cleaningType];
    const bedroomRate = rates.bedrooms[service.bedrooms] || rates.bedrooms[5];
    const bathroomRate = rates.bathrooms[service.bathrooms] || rates.bathrooms[4];
    
    return bedroomRate + bathroomRate;
  }

  private calculateExtrasTotal(extras: ServiceExtras): number {
    let total = 0;

    if (extras.insideFridge) total += this.extrasPricing.insideFridge;
    if (extras.insideOven) total += this.extrasPricing.insideOven;
    if (extras.cabinets) total += this.extrasPricing.cabinets;
    if (extras.walls) total += this.extrasPricing.walls;
    if (extras.petHairRemoval) total += this.extrasPricing.petHairRemoval;
    
    total += extras.windows * this.extrasPricing.windows;
    total += extras.laundry * this.extrasPricing.laundry;

    return total;
  }

  private calculateTravelFee(): number {
    // Base travel fee - could be made dynamic based on distance
    return 15;
  }

  private calculateRushFee(baseRate: number): number {
    return Math.round(baseRate * 0.2); // 20% rush fee
  }

  private calculateFrequencyDiscount(amount: number, frequency: Frequency): number {
    const discountRate = this.frequencyDiscounts[frequency];
    return Math.round(amount * discountRate);
  }

  private calculatePromoDiscount(amount: number, promoCode?: string): number {
    if (!promoCode) return 0;

    // Simple promo code logic - could be expanded
    const promoCodes: Record<string, number> = {
      'FIRST20': 0.20,
      'SAVE10': 0.10,
      'WELCOME15': 0.15
    };

    const discountRate = promoCodes[promoCode.toUpperCase()] || 0;
    return Math.round(amount * discountRate);
  }
}
