'use client';

import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TimeSeriesData } from '@/types/analytics';
import { format, parseISO } from 'date-fns';

interface RevenueChartProps {
  data: TimeSeriesData[];
  className?: string;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    let formattedDate: string;
    
    if (label.includes(' ')) {
      // Hour format (2024-01-15 14:00)
      const date = parseISO(label.replace(' ', 'T') + ':00');
      formattedDate = format(date, 'MMM dd, yyyy HH:mm');
    } else if (label.length === 7) {
      // Month format (2024-01)
      const date = parseISO(label + '-01');
      formattedDate = format(date, 'MMM yyyy');
    } else {
      // Day format (2024-01-15)
      const date = parseISO(label);
      formattedDate = format(date, 'MMM dd, yyyy');
    }
    
    return (
      <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
        <p className="text-sm font-medium text-gray-900 mb-2">
          {formattedDate}
        </p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            <span className="font-medium">{entry.name}:</span> ${entry.value.toLocaleString()}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export const RevenueChart: React.FC<RevenueChartProps> = ({ data, className = '' }) => {
  const formatXAxisTick = (tickItem: string) => {
    // Handle different date formats
    if (tickItem.includes(' ')) {
      // Hour format (2024-01-15 14:00)
      const date = parseISO(tickItem.replace(' ', 'T') + ':00');
      return format(date, 'HH:mm');
    } else if (tickItem.length === 7) {
      // Month format (2024-01)
      const date = parseISO(tickItem + '-01');
      return format(date, 'MMM yyyy');
    } else {
      // Day format (2024-01-15)
      const date = parseISO(tickItem);
      return format(date, 'MMM dd');
    }
  };

  const formatYAxisTick = (value: number) => {
    if (value >= 1000) {
      return `$${(value / 1000).toFixed(1)}k`;
    }
    return `$${value}`;
  };

  return (
    <div className={`w-full h-96 ${className}`}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 20,
          }}
        >
          <defs>
            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#7c2429" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#7c2429" stopOpacity={0.1}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            dataKey="date" 
            tickFormatter={formatXAxisTick}
            stroke="#6b7280"
            fontSize={12}
            tickLine={false}
          />
          <YAxis 
            tickFormatter={formatYAxisTick}
            stroke="#6b7280"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area 
            type="monotone" 
            dataKey="revenue" 
            stroke="#7c2429" 
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorRevenue)"
            name="Revenue"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
