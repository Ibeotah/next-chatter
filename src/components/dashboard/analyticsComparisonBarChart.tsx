"use client";

import { ChartComparisonData } from '@/types';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface AnalyticsComparisonBarChartProps {
  data: ChartComparisonData[];
}

export function AnalyticsComparisonBarChart({ data }: AnalyticsComparisonBarChartProps) {
  return (
    <div className="bg-white border border-zinc-200 rounded-xl p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-zinc-900">
          7-Day Comparison
        </h3>
        <p className="text-sm text-zinc-500 mt-1">
          Last 7 days vs. previous 7 days
        </p>
      </div>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
          <XAxis
            dataKey="metric"
            tick={{ fill: '#71717a', fontSize: 12 }}
            tickLine={{ stroke: '#e4e4e7' }}
          />
          <YAxis
            tick={{ fill: '#71717a', fontSize: 12 }}
            tickLine={{ stroke: '#e4e4e7' }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#ffffff',
              border: '1px solid #e4e4e7',
              borderRadius: '8px',
              fontSize: '12px',
            }}
            cursor={{ fill: '#fafafa' }}
          />
          <Legend
            wrapperStyle={{ fontSize: '12px' }}
          />
          <Bar
            dataKey="previous"
            fill="#a1a1aa"
            name="Previous 7 Days"
            radius={[4, 4, 0, 0]}
          />
          <Bar
            dataKey="current"
            fill="#18181b"
            name="Last 7 Days"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}