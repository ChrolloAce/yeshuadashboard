'use client';

import React from 'react';
import { RefreshCw, DollarSign, Users, TrendingUp } from 'lucide-react';
import { useAnalytics } from '@/hooks/useAnalytics';
import { TimeFilter, PieChartData } from '@/types/analytics';
import { RevenueChart } from '@/components/charts/RevenueChart';
import { PieChart } from '@/components/charts/PieChart';
import { ThemedButton } from '@/components/ui/ThemedButton';
import { ThemedCard } from '@/components/ui/ThemedCard';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export const AnalyticsTab: React.FC = () => {
  const { 
    metrics, 
    timeSeriesData, 
    monthlyMetrics,
    revenueBreakdown,
    isLoading, 
    error, 
    filters,
    setTimeFilter,
    refreshData 
  } = useAnalytics();



  const timeFilterOptions: { value: TimeFilter; label: 'Last 24H' | string }[] = [
    { value: 'day', label: 'Last 24H' },
    { value: 'week', label: 'Last 7 Days' },
    { value: 'month', label: 'Last 30 Days' },
    { value: 'quarter', label: 'Last 3 Months' },
    { value: 'year', label: 'Last Year' },
    { value: 'all', label: 'All Time' },
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="lg" />
        <span className="ml-3 text-lg text-gray-600">Loading analytics...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <p className="text-red-800 font-medium mb-2">Error Loading Analytics</p>
        <p className="text-red-600 mb-4">{error}</p>
        <ThemedButton onClick={refreshData} variant="primary">
          <RefreshCw className="w-4 h-4 mr-2" />
          Try Again
        </ThemedButton>
      </div>
    );
  }

  if (!metrics || !revenueBreakdown) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-12 text-center">
        <p className="text-gray-600">No analytics data available</p>
      </div>
    );
  }

  // Prepare pie chart data
  const revenueBreakdownData: PieChartData[] = [
    { name: 'Total Revenue', value: revenueBreakdown.paidRevenue, color: '#7c2429' },
    { name: 'Paid to Cleaners', value: revenueBreakdown.totalPaidToCleaners, color: '#f59e0b' },
    { name: 'Profit', value: revenueBreakdown.totalProfit, color: '#10b981' }
  ];

  const jobStatusData: PieChartData[] = [
    { name: 'Quotes Sent', value: metrics.totalQuotes, color: '#e5e7eb' },
    { name: 'Appointments Booked', value: metrics.appointmentsBooked, color: '#fbbf24' },
    { name: 'Jobs Completed', value: metrics.completedJobs, color: '#7c2429' }
  ];

  return (
    <div className="p-6 space-y-8">
      {/* Header with Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-600">Real-time insights into your cleaning business</p>
        </div>
        
        <div className="flex items-center space-x-3">
          {/* Time Filter */}
          <div className="flex items-center space-x-2 bg-white border border-gray-200 rounded-lg p-1">
            {timeFilterOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setTimeFilter(option.value)}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  filters.timeFilter === option.value
                    ? 'bg-primary-600 text-white'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>

          {/* Refresh Button */}
          <ThemedButton onClick={refreshData} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4" />
          </ThemedButton>
        </div>
      </div>

      {/* Top Row - Main Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Revenue */}
        <ThemedCard className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(metrics.totalRevenue)}</p>
              <p className="text-xs text-green-600 mt-1">
                <TrendingUp className="w-3 h-3 inline mr-1" />
                +{metrics.conversionRate.toFixed(1)}% conversion
              </p>
            </div>
            <div className="p-3 bg-primary-100 text-primary-600 rounded-full">
              <DollarSign className="w-6 h-6" />
            </div>
          </div>
        </ThemedCard>

        {/* Total Paid to Cleaners */}
        <ThemedCard className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Paid to Cleaners</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(metrics.totalPaidToCleaners)}</p>
              <p className="text-xs text-gray-500 mt-1">70% of revenue</p>
            </div>
            <div className="p-3 bg-yellow-100 text-yellow-600 rounded-full">
              <Users className="w-6 h-6" />
            </div>
          </div>
        </ThemedCard>

        {/* Total Profit */}
        <ThemedCard className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Total Profit</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(metrics.totalProfit)}</p>
              <p className="text-xs text-gray-500 mt-1">30% margin</p>
            </div>
            <div className="p-3 bg-green-100 text-green-600 rounded-full">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>
        </ThemedCard>

        {/* Average Job Value */}
        <ThemedCard className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Avg Job Value</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(metrics.averageJobValue)}</p>
              <p className="text-xs text-gray-500 mt-1">{metrics.paidJobs} paid jobs</p>
            </div>
            <div className="p-3 bg-blue-100 text-blue-600 rounded-full">
              <DollarSign className="w-6 h-6" />
            </div>
          </div>
        </ThemedCard>
      </div>



      {/* Pie Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <PieChart
          data={revenueBreakdownData}
          title="Revenue Breakdown"
          showLegend={true}
        />
        
        <PieChart
          data={jobStatusData}
          title="Job Pipeline"
          showLegend={true}
        />
      </div>

      {/* Revenue Trends Chart */}
      <ThemedCard className="p-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Revenue Trends</h2>
        <RevenueChart data={timeSeriesData} />
      </ThemedCard>
    </div>
  );
};