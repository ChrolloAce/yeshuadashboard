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
  private companyJobs: Map<string, Job[]> = new Map();
  private companyQuotes: Map<string, Quote[]> = new Map();
  private listeners: Map<string, Array<() => void>> = new Map();

  private constructor() {}

  public static getInstance(): AnalyticsService {
    if (!AnalyticsService.instance) {
      AnalyticsService.instance = new AnalyticsService();
    }
    return AnalyticsService.instance;
  }

  private initializeListeners(companyId: string): void {
    if (this.listeners.has(companyId)) {
      return; // Already initialized for this company
    }

    const companyListeners: Array<() => void> = [];

    // Listen to jobs collection for this company
    const jobsQuery = query(
      collection(db, 'jobs'), 
      where('companyId', '==', companyId),
      orderBy('createdAt', 'desc')
    );
    const unsubscribeJobs = onSnapshot(jobsQuery, (snapshot) => {
      const jobs = snapshot.docs.map(doc => {
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
      this.companyJobs.set(companyId, jobs);
      this.notifyListeners(companyId);
    });

    // Listen to quotes collection for this company
    const quotesQuery = query(
      collection(db, 'quotes'), 
      where('companyId', '==', companyId),
      orderBy('createdAt', 'desc')
    );
    const unsubscribeQuotes = onSnapshot(quotesQuery, (snapshot) => {
      const quotes = snapshot.docs.map(doc => {
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
        } as unknown as Quote;
      });
      this.companyQuotes.set(companyId, quotes);
      this.notifyListeners(companyId);
    });

    companyListeners.push(unsubscribeJobs, unsubscribeQuotes);
    this.listeners.set(companyId, companyListeners);
  }

  private getCompanyJobs(companyId: string): Job[] {
    return this.companyJobs.get(companyId) || [];
  }

  private getCompanyQuotes(companyId: string): Quote[] {
    return this.companyQuotes.get(companyId) || [];
  }

  private convertToDate(dateValue: any): Date {
    if (!dateValue) return new Date();
    
    if (dateValue instanceof Timestamp) {
      return dateValue.toDate();
    }
    
    if (dateValue.toDate && typeof dateValue.toDate === 'function') {
      return dateValue.toDate();
    }
    
    if (dateValue instanceof Date) {
      return dateValue;
    }
    
    if (typeof dateValue === 'string') {
      return new Date(dateValue);
    }
    
    if (typeof dateValue === 'number') {
      return new Date(dateValue);
    }
    
    return new Date();
  }

  private notifyListeners(companyId: string): void {
    // Dispatch custom event for real-time updates
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('analytics-data-updated', {
        detail: { companyId }
      }));
    }
  }

  public async getMetrics(companyId: string, filters: AnalyticsFilters = {}): Promise<AnalyticsMetrics> {
    this.initializeListeners(companyId);
    
    const jobs = this.getCompanyJobs(companyId);
    const quotes = this.getCompanyQuotes(companyId);

    // Filter by date range if specified
    const filteredJobs = this.filterJobsByDateRange(jobs, filters);
    const filteredQuotes = this.filterQuotesByDateRange(quotes, filters);

    // Calculate metrics
    const totalRevenue = filteredJobs
      .filter(job => job.payment.status === 'paid')
      .reduce((sum, job) => sum + job.pricing.finalPrice, 0);

    const totalPaidToCleaners = totalRevenue * 0.7; // 70% to cleaners
    const totalProfit = totalRevenue * 0.3; // 30% profit

    const totalJobs = filteredJobs.length;
    const averageJobValue = totalJobs > 0 ? totalRevenue / totalJobs : 0;

    const totalQuotes = filteredQuotes.length;
    const appointmentsBooked = filteredJobs.filter(job => 
      ['assigned', 'in-progress'].includes(job.status)
    ).length;

    // Calculate additional metrics to match the interface
    const approvedJobs = filteredJobs.filter(job => 
      ['assigned', 'in-progress', 'completed'].includes(job.status)
    ).length;
    const paidJobs = filteredJobs.filter(job => job.payment.status === 'paid').length;
    const pendingJobs = filteredJobs.filter(job => job.status === 'pending').length;
    const completedJobs = filteredJobs.filter(job => job.status === 'completed').length;
    const conversionRate = totalQuotes > 0 ? approvedJobs / totalQuotes : 0;

    return {
      totalRevenue,
      totalPaidToCleaners,
      totalProfit,
      totalJobs,
      totalQuotes,
      approvedJobs,
      paidJobs,
      pendingJobs,
      completedJobs,
      appointmentsBooked,
      averageJobValue,
      conversionRate
    };
  }

  public async getTimeSeriesData(companyId: string, filters: AnalyticsFilters = {}): Promise<TimeSeriesData[]> {
    this.initializeListeners(companyId);
    
    const jobs = this.getCompanyJobs(companyId);
    const quotes = this.getCompanyQuotes(companyId);
    const filteredJobs = this.filterJobsByDateRange(jobs, filters);
    const filteredQuotes = this.filterQuotesByDateRange(quotes, filters);

    // Group jobs and quotes by time period based on filter
    const timeSeriesMap = new Map<string, {
      revenue: number;
      jobs: number;
      quotes: number;
      approved: number;
      completed: number;
    }>();

    // Process jobs
    filteredJobs.forEach(job => {
      const date = job.createdAt;
      let key: string;

      switch (filters.timeFilter) {
        case TimeFilter.LAST_24H:
          key = format(date, 'yyyy-MM-dd HH:00');
          break;
        case TimeFilter.LAST_7_DAYS:
        case TimeFilter.LAST_30_DAYS:
          key = format(date, 'yyyy-MM-dd');
          break;
        default:
          key = format(date, 'yyyy-MM');
          break;
      }

      const existing = timeSeriesMap.get(key) || { revenue: 0, jobs: 0, quotes: 0, approved: 0, completed: 0 };
      existing.jobs += 1;
      
      if (job.payment.status === 'paid') {
        existing.revenue += job.pricing.finalPrice;
      }
      
      if (['assigned', 'in-progress', 'completed'].includes(job.status)) {
        existing.approved += 1;
      }
      
      if (job.status === 'completed') {
        existing.completed += 1;
      }
      
      timeSeriesMap.set(key, existing);
    });

    // Process quotes
    filteredQuotes.forEach(quote => {
      const date = quote.createdAt;
      let key: string;

      switch (filters.timeFilter) {
        case TimeFilter.LAST_24H:
          key = format(date, 'yyyy-MM-dd HH:00');
          break;
        case TimeFilter.LAST_7_DAYS:
        case TimeFilter.LAST_30_DAYS:
          key = format(date, 'yyyy-MM-dd');
          break;
        default:
          key = format(date, 'yyyy-MM');
          break;
      }

      const existing = timeSeriesMap.get(key) || { revenue: 0, jobs: 0, quotes: 0, approved: 0, completed: 0 };
      existing.quotes += 1;
      timeSeriesMap.set(key, existing);
    });

    // Convert to array and fill missing time slots
    const timeSeriesArray = Array.from(timeSeriesMap.entries()).map(([date, data]) => ({
      date,
      revenue: data.revenue,
      jobs: data.jobs,
      quotes: data.quotes,
      approved: data.approved,
      completed: data.completed
    }));

    return this.fillMissingTimeSlots(timeSeriesArray, filters);
  }

  public async getMonthlyMetrics(companyId: string, filters: AnalyticsFilters = {}): Promise<MonthlyMetrics[]> {
    this.initializeListeners(companyId);
    
    const jobs = this.getCompanyJobs(companyId);
    const quotes = this.getCompanyQuotes(companyId);
    const filteredJobs = this.filterJobsByDateRange(jobs, filters);
    const filteredQuotes = this.filterQuotesByDateRange(quotes, filters);

    const monthlyMap = new Map<string, {
      revenue: number;
      jobsCount: number;
      quotesCount: number;
      approvedCount: number;
      completedCount: number;
      paidCount: number;
    }>();

    // Process jobs
    filteredJobs.forEach(job => {
      const monthKey = format(job.createdAt, 'yyyy-MM');
      const existing = monthlyMap.get(monthKey) || { 
        revenue: 0, 
        jobsCount: 0, 
        quotesCount: 0, 
        approvedCount: 0, 
        completedCount: 0, 
        paidCount: 0 
      };
      
      existing.jobsCount += 1;
      
      if (job.payment.status === 'paid') {
        existing.revenue += job.pricing.finalPrice;
        existing.paidCount += 1;
      }
      
      if (['assigned', 'in-progress', 'completed'].includes(job.status)) {
        existing.approvedCount += 1;
      }
      
      if (job.status === 'completed') {
        existing.completedCount += 1;
      }
      
      monthlyMap.set(monthKey, existing);
    });

    // Process quotes
    filteredQuotes.forEach(quote => {
      const monthKey = format(quote.createdAt, 'yyyy-MM');
      const existing = monthlyMap.get(monthKey) || { 
        revenue: 0, 
        jobsCount: 0, 
        quotesCount: 0, 
        approvedCount: 0, 
        completedCount: 0, 
        paidCount: 0 
      };
      
      existing.quotesCount += 1;
      monthlyMap.set(monthKey, existing);
    });

    return Array.from(monthlyMap.entries()).map(([monthStr, metrics]) => ({
      month: monthStr,
      year: parseInt(monthStr.split('-')[0]),
      revenue: metrics.revenue,
      jobsCount: metrics.jobsCount,
      quotesCount: metrics.quotesCount,
      approvedCount: metrics.approvedCount,
      completedCount: metrics.completedCount,
      paidCount: metrics.paidCount
    }));
  }

  public async getRevenueBreakdown(companyId: string, filters: AnalyticsFilters = {}): Promise<RevenueBreakdown> {
    this.initializeListeners(companyId);
    
    const jobs = this.getCompanyJobs(companyId);
    const filteredJobs = this.filterJobsByDateRange(jobs, filters);

    const paidJobs = filteredJobs.filter(job => job.payment.status === 'paid');
    const pendingJobs = filteredJobs.filter(job => job.payment.status === 'pending');
    
    const paidRevenue = paidJobs.reduce((sum, job) => sum + job.pricing.finalPrice, 0);
    const pendingRevenue = pendingJobs.reduce((sum, job) => sum + job.pricing.finalPrice, 0);
    const totalRevenue = paidRevenue + pendingRevenue;

    const jobValues = paidJobs.map(job => job.pricing.finalPrice);
    const averageJobValue = jobValues.length > 0 ? jobValues.reduce((sum, val) => sum + val, 0) / jobValues.length : 0;
    const highestJobValue = jobValues.length > 0 ? Math.max(...jobValues) : 0;
    const lowestJobValue = jobValues.length > 0 ? Math.min(...jobValues) : 0;

    return {
      totalRevenue,
      paidRevenue,
      pendingRevenue,
      totalPaidToCleaners: paidRevenue * 0.7,
      totalProfit: paidRevenue * 0.3,
      averageJobValue,
      highestJobValue,
      lowestJobValue
    };
  }

  private filterJobsByDateRange(jobs: Job[], filters: AnalyticsFilters): Job[] {
    if (!filters.timeFilter || filters.timeFilter === TimeFilter.ALL_TIME) {
      return jobs;
    }

    const now = new Date();
    let startDate: Date;

    switch (filters.timeFilter) {
      case TimeFilter.LAST_24H:
        startDate = subDays(now, 1);
        break;
      case TimeFilter.LAST_7_DAYS:
        startDate = subWeeks(now, 1);
        break;
      case TimeFilter.LAST_30_DAYS:
        startDate = subMonths(now, 1);
        break;
      case TimeFilter.LAST_3_MONTHS:
        startDate = subMonths(now, 3);
        break;
      case TimeFilter.LAST_YEAR:
        startDate = subYears(now, 1);
        break;
      default:
        return jobs;
    }

    return jobs.filter(job => job.createdAt >= startDate);
  }

  private filterQuotesByDateRange(quotes: Quote[], filters: AnalyticsFilters): Quote[] {
    if (!filters.timeFilter || filters.timeFilter === TimeFilter.ALL_TIME) {
      return quotes;
    }

    const now = new Date();
    let startDate: Date;

    switch (filters.timeFilter) {
      case TimeFilter.LAST_24H:
        startDate = subDays(now, 1);
        break;
      case TimeFilter.LAST_7_DAYS:
        startDate = subWeeks(now, 1);
        break;
      case TimeFilter.LAST_30_DAYS:
        startDate = subMonths(now, 1);
        break;
      case TimeFilter.LAST_3_MONTHS:
        startDate = subMonths(now, 3);
        break;
      case TimeFilter.LAST_YEAR:
        startDate = subYears(now, 1);
        break;
      default:
        return quotes;
    }

    return quotes.filter(quote => quote.createdAt >= startDate);
  }

  private fillMissingTimeSlots(data: TimeSeriesData[], filters: AnalyticsFilters): TimeSeriesData[] {
    if (!filters.timeFilter) return data;

    const now = new Date();
    const filledData: TimeSeriesData[] = [];
    let current: Date;
    let end: Date = now;

    switch (filters.timeFilter) {
      case TimeFilter.LAST_24H:
        current = subDays(now, 1);
        while (current <= end) {
          const key = format(current, 'yyyy-MM-dd HH:00');
          const existingData = data.find(d => d.date === key);
          filledData.push({
            date: key,
            revenue: existingData?.revenue || 0,
            jobs: existingData?.jobs || 0,
            quotes: existingData?.quotes || 0,
            approved: existingData?.approved || 0,
            completed: existingData?.completed || 0
          });
          current = new Date(current.getTime() + 60 * 60 * 1000); // Add 1 hour
        }
        break;

      case TimeFilter.LAST_7_DAYS:
        current = subDays(now, 7);
        while (current <= end) {
          const key = format(current, 'yyyy-MM-dd');
          const existingData = data.find(d => d.date === key);
          filledData.push({
            date: key,
            revenue: existingData?.revenue || 0,
            jobs: existingData?.jobs || 0,
            quotes: existingData?.quotes || 0,
            approved: existingData?.approved || 0,
            completed: existingData?.completed || 0
          });
          current = subDays(current, -1); // Add 1 day
        }
        break;

      case TimeFilter.LAST_30_DAYS:
        current = subDays(now, 30);
        while (current <= end) {
          const key = format(current, 'yyyy-MM-dd');
          const existingData = data.find(d => d.date === key);
          filledData.push({
            date: key,
            revenue: existingData?.revenue || 0,
            jobs: existingData?.jobs || 0,
            quotes: existingData?.quotes || 0,
            approved: existingData?.approved || 0,
            completed: existingData?.completed || 0
          });
          current = subDays(current, -1); // Add 1 day
        }
        break;

      default:
        return data;
    }

    return filledData;
  }

  public cleanup(companyId: string): void {
    const companyListeners = this.listeners.get(companyId);
    if (companyListeners) {
      companyListeners.forEach(unsubscribe => unsubscribe());
      this.listeners.delete(companyId);
    }
    this.companyJobs.delete(companyId);
    this.companyQuotes.delete(companyId);
  }
}
