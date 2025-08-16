'use client';

import { useState, useEffect, useCallback } from 'react';
import { AnalyticsService } from '@/services/analytics/AnalyticsService';
import { useAuth } from '@/hooks/useAuth';
import { 
  AnalyticsMetrics, 
  TimeSeriesData, 
  MonthlyMetrics, 
  AnalyticsFilters,
  TimeFilter,
  RevenueBreakdown
} from '@/types/analytics';

interface UseAnalyticsReturn {
  metrics: AnalyticsMetrics | null;
  timeSeriesData: TimeSeriesData[];
  monthlyMetrics: MonthlyMetrics[];
  revenueBreakdown: RevenueBreakdown | null;
  isLoading: boolean;
  error: string | null;
  filters: AnalyticsFilters;
  setTimeFilter: (filter: TimeFilter) => void;
  setCustomDateRange: (startDate: Date, endDate: Date) => void;
  refreshData: () => void;
}

export const useAnalytics = (): UseAnalyticsReturn => {
  const [metrics, setMetrics] = useState<AnalyticsMetrics | null>(null);
  const [timeSeriesData, setTimeSeriesData] = useState<TimeSeriesData[]>([]);
  const [monthlyMetrics, setMonthlyMetrics] = useState<MonthlyMetrics[]>([]);
  const [revenueBreakdown, setRevenueBreakdown] = useState<RevenueBreakdown | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<AnalyticsFilters>({
    timeFilter: TimeFilter.LAST_30_DAYS
  });

  const { userProfile } = useAuth();
  const analyticsService = AnalyticsService.getInstance();

  const loadAnalytics = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      if (!userProfile?.companyId) {
        // Only warn if userProfile exists but has no companyId
        if (userProfile) {
          console.warn('No company ID available, cannot load analytics');
        }
        setMetrics(null);
        setTimeSeriesData([]);
        setMonthlyMetrics([]);
        setRevenueBreakdown(null);
        setIsLoading(false);
        return;
      }

      console.log('Loading analytics with filters:', filters);

      // Get all analytics data for the company
      const [metrics, timeSeries, monthly, breakdown] = await Promise.all([
        analyticsService.getMetrics(userProfile.companyId, filters),
        analyticsService.getTimeSeriesData(userProfile.companyId, filters),
        analyticsService.getMonthlyMetrics(userProfile.companyId, filters),
        analyticsService.getRevenueBreakdown(userProfile.companyId, filters)
      ]);

      console.log('Analytics data loaded:', {
        metrics,
        timeSeriesCount: timeSeries.length,
        monthlyCount: monthly.length,
        revenueBreakdown: breakdown
      });
      
      // Log revenue breakdown details for debugging
      if (breakdown) {
        console.log('💰 Revenue Breakdown Details:', {
          totalRevenue: `$${breakdown.totalRevenue}`,
          paidRevenue: `$${breakdown.paidRevenue}`,
          pendingRevenue: `$${breakdown.pendingRevenue}`,
          totalPaidToCleaners: `$${breakdown.totalPaidToCleaners}`,
          totalProfit: `$${breakdown.totalProfit}`,
          averageJobValue: `$${breakdown.averageJobValue}`,
          highestJobValue: `$${breakdown.highestJobValue}`,
          lowestJobValue: `$${breakdown.lowestJobValue}`
        });
      }

      setMetrics(metrics);
      setTimeSeriesData(timeSeries);
      setMonthlyMetrics(monthly);
      setRevenueBreakdown(breakdown);
    } catch (err) {
      console.error('Error loading analytics:', err);
      setError(err instanceof Error ? err.message : 'Failed to load analytics');
    } finally {
      setIsLoading(false);
    }
  }, [filters, analyticsService, userProfile?.companyId]);

  const setTimeFilter = useCallback((filter: TimeFilter) => {
    setFilters(prev => ({
      ...prev,
      timeFilter: filter,
      startDate: undefined,
      endDate: undefined
    }));
  }, []);

  const setCustomDateRange = useCallback((startDate: Date, endDate: Date) => {
    setFilters(prev => ({
      ...prev,
      timeFilter: TimeFilter.ALL_TIME,
      startDate,
      endDate
    }));
  }, []);

  const refreshData = useCallback(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  // Load analytics when filters change
  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  // Listen for real-time data updates
  useEffect(() => {
    const handleDataUpdate = () => {
      console.log('🔄 Analytics data update detected, refreshing...');
      loadAnalytics();
    };

    // Listen for custom events from AnalyticsService
    window.addEventListener('analytics-data-updated', handleDataUpdate);

    // Also set up periodic refresh as backup (every 30 seconds)
    const interval = setInterval(() => {
      loadAnalytics();
    }, 30000);

    return () => {
      window.removeEventListener('analytics-data-updated', handleDataUpdate);
      clearInterval(interval);
    };
  }, [loadAnalytics]);

  return {
    metrics,
    timeSeriesData,
    monthlyMetrics,
    revenueBreakdown,
    isLoading,
    error,
    filters,
    setTimeFilter,
    setCustomDateRange,
    refreshData
  };
};
