'use client';

import React, { useState } from 'react';
import { Calendar, Filter, RefreshCw, Download, TrendingUp, TrendingDown } from 'lucide-react';
import { useAnalytics } from '@/hooks/useAnalytics';
import { TimeFilter } from '@/types/analytics';
import { MetricsCards } from '@/components/charts/MetricsCards';
import { RevenueChart } from '@/components/charts/RevenueChart';
import { JobsChart } from '@/components/charts/JobsChart';
import { MonthlyOverviewChart } from '@/components/charts/MonthlyOverviewChart';
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

  const [activeChart, setActiveChart] = useState<'revenue' | 'jobs' | 'monthly'>('revenue');

  const timeFilterOptions: { value: TimeFilter; label: string }[] = [
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

  if (!metrics) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-12 text-center">
        <p className="text-gray-600">No analytics data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
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

      {/* Key Metrics Cards */}
      {metrics && <MetricsCards metrics={metrics} />}

      {/* Revenue Breakdown */}
      {revenueBreakdown && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <ThemedCard className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Revenue Breakdown</h3>
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Paid Revenue</span>
                <span className="font-semibold text-green-600">
                  {formatCurrency(revenueBreakdown.paidRevenue)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Pending Revenue</span>
                <span className="font-semibold text-yellow-600">
                  {formatCurrency(revenueBreakdown.pendingRevenue)}
                </span>
              </div>
              <div className="pt-2 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-900">Total Revenue</span>
                  <span className="font-bold text-gray-900">
                    {formatCurrency(revenueBreakdown.totalRevenue)}
                  </span>
                </div>
              </div>
            </div>
          </ThemedCard>

          <ThemedCard className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Job Values</h3>
              <TrendingUp className="w-5 h-5 text-blue-500" />
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Average Job</span>
                <span className="font-semibold text-blue-600">
                  {formatCurrency(revenueBreakdown.averageJobValue)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Highest Job</span>
                <span className="font-semibold text-green-600">
                  {formatCurrency(revenueBreakdown.highestJobValue)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Lowest Job</span>
                <span className="font-semibold text-gray-600">
                  {formatCurrency(revenueBreakdown.lowestJobValue)}
                </span>
              </div>
            </div>
          </ThemedCard>

          <ThemedCard className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Performance</h3>
              <TrendingUp className="w-5 h-5 text-primary-500" />
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Conversion Rate</span>
                <span className="font-semibold text-primary-600">
                  {metrics.conversionRate.toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Completed Jobs</span>
                <span className="font-semibold text-green-600">
                  {metrics.completedJobs}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Pending Jobs</span>
                <span className="font-semibold text-yellow-600">
                  {metrics.pendingJobs}
                </span>
              </div>
            </div>
          </ThemedCard>
        </div>
      )}

      {/* Chart Navigation */}
      <div className="flex items-center space-x-2 bg-white border border-gray-200 rounded-lg p-1">
        <button
          onClick={() => setActiveChart('revenue')}
          className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
            activeChart === 'revenue'
              ? 'bg-primary-600 text-white'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
          }`}
        >
          Revenue Trends
        </button>
        <button
          onClick={() => setActiveChart('jobs')}
          className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
            activeChart === 'jobs'
              ? 'bg-primary-600 text-white'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
          }`}
        >
          Jobs Overview
        </button>
        <button
          onClick={() => setActiveChart('monthly')}
          className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
            activeChart === 'monthly'
              ? 'bg-primary-600 text-white'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
          }`}
        >
          Monthly Trends
        </button>
      </div>

      {/* Charts */}
      <ThemedCard className="p-6">
        {activeChart === 'revenue' && (
          <>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Revenue Over Time</h2>
            <RevenueChart data={timeSeriesData} />
          </>
        )}
        
        {activeChart === 'jobs' && (
          <>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Jobs Performance</h2>
            <JobsChart data={timeSeriesData} />
          </>
        )}
        
        {activeChart === 'monthly' && (
          <>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Monthly Overview</h2>
            <MonthlyOverviewChart data={monthlyMetrics} />
          </>
        )}
      </ThemedCard>

      {/* Data Summary */}
      <ThemedCard className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Data Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-gray-600">Total Data Points</p>
            <p className="text-xl font-bold text-gray-900">{timeSeriesData.length}</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-gray-600">Monthly Records</p>
            <p className="text-xl font-bold text-gray-900">{monthlyMetrics.length}</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-gray-600">Time Period</p>
            <p className="text-xl font-bold text-gray-900">{filters.timeFilter}</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-gray-600">Last Updated</p>
            <p className="text-xl font-bold text-gray-900">Live</p>
          </div>
        </div>
      </ThemedCard>
    </div>
  );
};