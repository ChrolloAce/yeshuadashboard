'use client';

import { collection, query, where, onSnapshot, Timestamp, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Job, Quote, JobStatus, PaymentStatus } from '@/types/database';
import { 
  AnalyticsMetrics, 
  TimeSeriesData, 
  MonthlyMetrics, 
  AnalyticsFilters, 
  TimeFilter,
  RevenueBreakdown 
} from '@/types/analytics';
import { startOfWeek, startOfMonth, startOfQuarter, startOfYear, format, subDays, subWeeks, subMonths, subQuarters, subYears } from 'date-fns';

export class AnalyticsService {
  private static instance: AnalyticsService;
  private jobs: Job[] = [];
  private quotes: Quote[] = [];
  private listeners: Array<() => void> = [];

  private constructor() {
    this.initializeListeners();
  }

  public static getInstance(): AnalyticsService {
    if (!AnalyticsService.instance) {
      AnalyticsService.instance = new AnalyticsService();
    }
    return AnalyticsService.instance;
  }

  private initializeListeners(): void {
    // Listen to jobs collection
    const jobsQuery = query(collection(db, 'jobs'), orderBy('createdAt', 'desc'));
    const unsubscribeJobs = onSnapshot(jobsQuery, (snapshot) => {
      this.jobs = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          ...data,
          id: doc.id,
          createdAt: this.convertToDate(data.createdAt),
          updatedAt: this.convertToDate(data.updatedAt),
          schedule: {
            ...data.schedule,
            date: this.convertToDate(data.schedule?.date)
          }
        } as unknown as Job;
      });
      this.notifyListeners();
    });

    // Listen to quotes collection
    const quotesQuery = query(collection(db, 'quotes'), orderBy('createdAt', 'desc'));
    const unsubscribeQuotes = onSnapshot(quotesQuery, (snapshot) => {
      this.quotes = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          ...data,
          id: doc.id,
          createdAt: this.convertToDate(data.createdAt),
          updatedAt: this.convertToDate(data.updatedAt)
        } as unknown as Quote;
      });
      this.notifyListeners();
    });

    this.listeners.push(unsubscribeJobs, unsubscribeQuotes);
  }

  private convertToDate(dateValue: any): Date {
    if (!dateValue) return new Date();
    
    if (dateValue instanceof Timestamp) {
      return dateValue.toDate();
    }
    
    if (dateValue instanceof Date) {
      return dateValue;
    }
    
    if (typeof dateValue === 'string' || typeof dateValue === 'number') {
      const date = new Date(dateValue);
      return isNaN(date.getTime()) ? new Date() : date;
    }
    
    return new Date();
  }

  private notifyListeners(): void {
    console.log('📊 Analytics data updated:', {
      jobsCount: this.jobs.length,
      quotesCount: this.quotes.length,
      latestJob: this.jobs[0]?.id,
      latestQuote: this.quotes[0]?.id
    });
    
    // Trigger a custom event that components can listen to
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('analytics-data-updated'));
    }
  }

  public getMetrics(filters?: AnalyticsFilters): AnalyticsMetrics {
    const filteredJobs = this.filterJobsByTime(this.jobs, filters);
    const filteredQuotes = this.filterQuotesByTime(this.quotes, filters);

    const approvedJobs = filteredJobs.filter(job => 
      job.status === 'assigned' || 
      job.status === 'in-progress' || 
      job.status === 'completed'
    );

    const paidJobs = filteredJobs.filter(job => 
      job.payment.status === 'paid' || job.status === 'completed'
    );

    const completedJobs = filteredJobs.filter(job => job.status === 'completed');
    const pendingJobs = filteredJobs.filter(job => job.status === 'pending');

    const totalRevenue = paidJobs.reduce((sum, job) => sum + (job.pricing.finalPrice || 0), 0);
    const averageJobValue = paidJobs.length > 0 ? totalRevenue / paidJobs.length : 0;
    const conversionRate = filteredQuotes.length > 0 ? (approvedJobs.length / filteredQuotes.length) * 100 : 0;
    
    // Calculate cleaner payments (assuming 70% goes to cleaners, 30% profit)
    const totalPaidToCleaners = totalRevenue * 0.7;
    const totalProfit = totalRevenue * 0.3;
    
    // Appointments booked = jobs that are assigned or in progress
    const appointmentsBooked = filteredJobs.filter(job => 
      job.status === 'assigned' || job.status === 'in-progress'
    ).length;

    return {
      totalRevenue,
      totalJobs: filteredJobs.length,
      totalQuotes: filteredQuotes.length,
      approvedJobs: approvedJobs.length,
      paidJobs: paidJobs.length,
      pendingJobs: pendingJobs.length,
      completedJobs: completedJobs.length,
      appointmentsBooked,
      averageJobValue,
      conversionRate,
      totalPaidToCleaners,
      totalProfit
    };
  }

  public getTimeSeriesData(filters?: AnalyticsFilters): TimeSeriesData[] {
    const filteredJobs = this.filterJobsByTime(this.jobs, filters);
    const filteredQuotes = this.filterQuotesByTime(this.quotes, filters);

    // Choose date format based on time filter
    const getDateKey = (date: Date): string => {
      switch (filters?.timeFilter) {
        case 'day':
          return format(date, 'yyyy-MM-dd HH:00'); // Group by hour for 24H view
        case 'week':
        case 'month':
          return format(date, 'yyyy-MM-dd'); // Group by day
        case 'quarter':
        case 'year':
          return format(date, 'yyyy-MM'); // Group by month
        default:
          return format(date, 'yyyy-MM-dd');
      }
    };

    // Group data by date/time
    const dataMap = new Map<string, TimeSeriesData>();

    // Process jobs
    filteredJobs.forEach(job => {
      const dateKey = getDateKey(job.createdAt);
      
      if (!dataMap.has(dateKey)) {
        dataMap.set(dateKey, {
          date: dateKey,
          revenue: 0,
          jobs: 0,
          quotes: 0,
          approved: 0,
          completed: 0
        });
      }

      const data = dataMap.get(dateKey)!;
      data.jobs += 1;
      
      if (job.payment.status === 'paid' || job.status === 'completed') {
        data.revenue += job.pricing.finalPrice || 0;
      }
      
      if (job.status === 'assigned' || job.status === 'in-progress' || job.status === 'completed') {
        data.approved += 1;
      }
      
      if (job.status === 'completed') {
        data.completed += 1;
      }
    });

    // Process quotes
    filteredQuotes.forEach(quote => {
      const dateKey = getDateKey(quote.createdAt);
      
      if (!dataMap.has(dateKey)) {
        dataMap.set(dateKey, {
          date: dateKey,
          revenue: 0,
          jobs: 0,
          quotes: 0,
          approved: 0,
          completed: 0
        });
      }

      const data = dataMap.get(dateKey)!;
      data.quotes += 1;
    });

    const sortedData = Array.from(dataMap.values()).sort((a, b) => a.date.localeCompare(b.date));
    
    // Fill in missing time periods with 0 values
    return this.fillMissingTimeSlots(sortedData, filters);
  }

  private fillMissingTimeSlots(data: TimeSeriesData[], filters?: AnalyticsFilters): TimeSeriesData[] {
    if (data.length === 0) return data;

    const timeFilter = filters?.timeFilter || 'month';
    const result: TimeSeriesData[] = [];
    
    // Determine the time increment and format based on filter
    let startDate: Date;
    let endDate: Date = new Date();
    let increment: (date: Date) => Date;
    let formatKey: (date: Date) => string;

    switch (timeFilter) {
      case 'day':
        startDate = subDays(endDate, 1);
        increment = (date: Date) => new Date(date.getTime() + 60 * 60 * 1000); // Add 1 hour
        formatKey = (date: Date) => format(date, 'yyyy-MM-dd HH:00');
        break;
      case 'week':
        startDate = subWeeks(endDate, 1);
        increment = (date: Date) => new Date(date.getTime() + 24 * 60 * 60 * 1000); // Add 1 day
        formatKey = (date: Date) => format(date, 'yyyy-MM-dd');
        break;
      case 'month':
        startDate = subMonths(endDate, 1);
        increment = (date: Date) => new Date(date.getTime() + 24 * 60 * 60 * 1000); // Add 1 day
        formatKey = (date: Date) => format(date, 'yyyy-MM-dd');
        break;
      case 'quarter':
        startDate = subQuarters(endDate, 1);
        increment = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 1); // Add 1 month
        formatKey = (date: Date) => format(date, 'yyyy-MM');
        break;
      case 'year':
        startDate = subYears(endDate, 1);
        increment = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 1); // Add 1 month
        formatKey = (date: Date) => format(date, 'yyyy-MM');
        break;
      default:
        return data; // Return as-is for 'all' filter
    }

    // Create a map of existing data for quick lookup
    const dataMap = new Map<string, TimeSeriesData>();
    data.forEach(item => dataMap.set(item.date, item));

    // Fill in all time slots
    let currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      const dateKey = formatKey(currentDate);
      
      if (dataMap.has(dateKey)) {
        result.push(dataMap.get(dateKey)!);
      } else {
        // Add missing slot with 0 values
        result.push({
          date: dateKey,
          revenue: 0,
          jobs: 0,
          quotes: 0,
          approved: 0,
          completed: 0
        });
      }
      
      currentDate = increment(currentDate);
    }

    return result;
  }

  public getMonthlyMetrics(): MonthlyMetrics[] {
    const monthlyMap = new Map<string, MonthlyMetrics>();

    // Process jobs by month
    this.jobs.forEach(job => {
      const date = job.createdAt;
      const monthKey = format(date, 'yyyy-MM');
      const monthName = format(date, 'MMM yyyy');

      if (!monthlyMap.has(monthKey)) {
        monthlyMap.set(monthKey, {
          month: monthName,
          year: date.getFullYear(),
          revenue: 0,
          jobsCount: 0,
          quotesCount: 0,
          approvedCount: 0,
          completedCount: 0,
          paidCount: 0
        });
      }

      const metrics = monthlyMap.get(monthKey)!;
      metrics.jobsCount += 1;

      if (job.payment.status === 'paid' || job.status === 'completed') {
        metrics.revenue += job.pricing.finalPrice || 0;
        metrics.paidCount += 1;
      }

      if (job.status === 'assigned' || job.status === 'in-progress' || job.status === 'completed') {
        metrics.approvedCount += 1;
      }

      if (job.status === 'completed') {
        metrics.completedCount += 1;
      }
    });

    // Process quotes by month
    this.quotes.forEach(quote => {
      const date = quote.createdAt;
      const monthKey = format(date, 'yyyy-MM');
      const monthName = format(date, 'MMM yyyy');

      if (!monthlyMap.has(monthKey)) {
        monthlyMap.set(monthKey, {
          month: monthName,
          year: date.getFullYear(),
          revenue: 0,
          jobsCount: 0,
          quotesCount: 0,
          approvedCount: 0,
          completedCount: 0,
          paidCount: 0
        });
      }

      const metrics = monthlyMap.get(monthKey)!;
      metrics.quotesCount += 1;
    });

    return Array.from(monthlyMap.values()).sort((a, b) => a.year - b.year || a.month.localeCompare(b.month));
  }

  public getRevenueBreakdown(filters?: AnalyticsFilters): RevenueBreakdown {
    const filteredJobs = this.filterJobsByTime(this.jobs, filters);
    
    const paidJobs = filteredJobs.filter(job => 
      job.payment.status === 'paid' || job.status === 'completed'
    );
    
    const pendingJobs = filteredJobs.filter(job => 
      job.status === 'pending' || job.status === 'assigned' || job.status === 'in-progress'
    );

    const paidRevenue = paidJobs.reduce((sum, job) => sum + (job.pricing.finalPrice || 0), 0);
    const pendingRevenue = pendingJobs.reduce((sum, job) => sum + (job.pricing.finalPrice || 0), 0);
    const totalRevenue = paidRevenue + pendingRevenue;

    const totalPaidToCleaners = paidRevenue * 0.7;
    const totalProfit = paidRevenue * 0.3;

    const jobValues = filteredJobs.map(job => job.pricing.finalPrice || 0).filter(value => value > 0);
    const averageJobValue = jobValues.length > 0 ? jobValues.reduce((sum, value) => sum + value, 0) / jobValues.length : 0;
    const highestJobValue = jobValues.length > 0 ? Math.max(...jobValues) : 0;
    const lowestJobValue = jobValues.length > 0 ? Math.min(...jobValues) : 0;

    return {
      totalRevenue,
      paidRevenue,
      pendingRevenue,
      totalPaidToCleaners,
      totalProfit,
      averageJobValue,
      highestJobValue,
      lowestJobValue
    };
  }

  private filterJobsByTime(jobs: Job[], filters?: AnalyticsFilters): Job[] {
    if (!filters?.timeFilter || filters.timeFilter === 'all') {
      return jobs;
    }

    const now = new Date();
    let startDate: Date;

    switch (filters.timeFilter) {
      case 'day':
        startDate = subDays(now, 1);
        break;
      case 'week':
        startDate = subWeeks(now, 1);
        break;
      case 'month':
        startDate = subMonths(now, 1);
        break;
      case 'quarter':
        startDate = subQuarters(now, 1);
        break;
      case 'year':
        startDate = subYears(now, 1);
        break;
      default:
        return jobs;
    }

    return jobs.filter(job => job.createdAt >= startDate);
  }

  private filterQuotesByTime(quotes: Quote[], filters?: AnalyticsFilters): Quote[] {
    if (!filters?.timeFilter || filters.timeFilter === 'all') {
      return quotes;
    }

    const now = new Date();
    let startDate: Date;

    switch (filters.timeFilter) {
      case 'day':
        startDate = subDays(now, 1);
        break;
      case 'week':
        startDate = subWeeks(now, 1);
        break;
      case 'month':
        startDate = subMonths(now, 1);
        break;
      case 'quarter':
        startDate = subQuarters(now, 1);
        break;
      case 'year':
        startDate = subYears(now, 1);
        break;
      default:
        return quotes;
    }

    return quotes.filter(quote => quote.createdAt >= startDate);
  }

  public destroy(): void {
    this.listeners.forEach(unsubscribe => unsubscribe());
    this.listeners = [];
  }
}
