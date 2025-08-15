export interface AnalyticsMetrics {
  totalRevenue: number;
  totalJobs: number;
  totalQuotes: number;
  approvedJobs: number;
  paidJobs: number;
  pendingJobs: number;
  completedJobs: number;
  appointmentsBooked: number;
  averageJobValue: number;
  conversionRate: number; // jobs approved / quotes sent
  totalPaidToCleaners: number;
  totalProfit: number;
}

export interface TimeSeriesData {
  date: string;
  revenue: number;
  jobs: number;
  quotes: number;
  approved: number;
  completed: number;
}

export interface MonthlyMetrics {
  month: string;
  year: number;
  revenue: number;
  jobsCount: number;
  quotesCount: number;
  approvedCount: number;
  completedCount: number;
  paidCount: number;
}

export enum TimeFilter {
  LAST_24H = 'day',
  LAST_7_DAYS = 'week',
  LAST_30_DAYS = 'month',
  LAST_3_MONTHS = 'quarter',
  LAST_YEAR = 'year',
  ALL_TIME = 'all'
}

export interface AnalyticsFilters {
  timeFilter?: TimeFilter;
  startDate?: Date;
  endDate?: Date;
}

export interface ChartDataPoint {
  name: string;
  value: number;
  date?: string;
}

export interface RevenueBreakdown {
  totalRevenue: number;
  paidRevenue: number;
  pendingRevenue: number;
  totalPaidToCleaners: number;
  totalProfit: number;
  averageJobValue: number;
  highestJobValue: number;
  lowestJobValue: number;
}

export interface PieChartData {
  name: string;
  value: number;
  color: string;
}
