'use client';

import React from 'react';
import { DollarSign, Briefcase, FileText, CheckCircle, Clock, TrendingUp } from 'lucide-react';
import { AnalyticsMetrics } from '@/types/analytics';
import { ThemedCard } from '@/components/ui/ThemedCard';

interface MetricsCardsProps {
  metrics: AnalyticsMetrics;
  className?: string;
}

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  change?: number;
  changeLabel?: string;
  color?: 'primary' | 'success' | 'warning' | 'info';
}

const MetricCard: React.FC<MetricCardProps> = ({ 
  title, 
  value, 
  icon, 
  change, 
  changeLabel,
  color = 'primary' 
}) => {
  const getColorClasses = () => {
    switch (color) {
      case 'success':
        return 'text-green-600 bg-green-100';
      case 'warning':
        return 'text-yellow-600 bg-yellow-100';
      case 'info':
        return 'text-blue-600 bg-blue-100';
      default:
        return 'text-primary-600 bg-primary-100';
    }
  };

  return (
    <ThemedCard className="p-6">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {change !== undefined && (
            <div className="flex items-center mt-2">
              <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-sm text-green-600 font-medium">
                {change > 0 ? '+' : ''}{change}%
              </span>
              {changeLabel && (
                <span className="text-sm text-gray-500 ml-1">{changeLabel}</span>
              )}
            </div>
          )}
        </div>
        <div className={`p-3 rounded-full ${getColorClasses()}`}>
          {icon}
        </div>
      </div>
    </ThemedCard>
  );
};

export const MetricsCards: React.FC<MetricsCardsProps> = ({ metrics, className = '' }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercentage = (percentage: number) => {
    return `${percentage.toFixed(1)}%`;
  };

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 ${className}`}>
      <MetricCard
        title="Total Revenue"
        value={formatCurrency(metrics.totalRevenue)}
        icon={<DollarSign className="w-6 h-6" />}
        color="primary"
      />
      
      <MetricCard
        title="Total Jobs"
        value={metrics.totalJobs}
        icon={<Briefcase className="w-6 h-6" />}
        color="info"
      />
      
      <MetricCard
        title="Quotes Sent"
        value={metrics.totalQuotes}
        icon={<FileText className="w-6 h-6" />}
        color="warning"
      />
      
      <MetricCard
        title="Jobs Approved"
        value={metrics.approvedJobs}
        icon={<CheckCircle className="w-6 h-6" />}
        color="success"
      />
      
      <MetricCard
        title="Conversion Rate"
        value={formatPercentage(metrics.conversionRate)}
        icon={<TrendingUp className="w-6 h-6" />}
        color="primary"
      />
      
      <MetricCard
        title="Avg Job Value"
        value={formatCurrency(metrics.averageJobValue)}
        icon={<DollarSign className="w-6 h-6" />}
        color="success"
      />
    </div>
  );
};
