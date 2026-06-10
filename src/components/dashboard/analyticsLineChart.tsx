"use client";

import { formatChartDate } from '@/lib/utils';
import { DailyAnalytics } from '@/types';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface AnalyticsLineChartProps {
  data: DailyAnalytics[];
}

const CHART_COLORS = {
  views: '#3b82f6',
  readers: '#10b981',
  likes: '#ec4899',
  comments: '#8b5cf6',
  bookmarks: '#f59e0b',
};

export function AnalyticsLineChart({ data }: AnalyticsLineChartProps) {
  const chartData = data.map((day) => ({
    date: formatChartDate(day.date),
    Views: day.views_count,
    'Unique Readers': day.unique_readers_count,
    Likes: day.likes_count,
    Comments: day.comments_count,
    Bookmarks: day.bookmarks_count,
  }));

  return (
    <div className="bg-white border border-zinc-200 rounded-xl p-6">
      <h3 className="text-lg font-semibold text-zinc-900 mb-6">
        14-Day Engagement Trend
      </h3>
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
          <XAxis
            dataKey="date"
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
          />
          <Legend
            wrapperStyle={{ fontSize: '12px' }}
            iconType="line"
          />
          <Line
            type="monotone"
            dataKey="Views"
            stroke={CHART_COLORS.views}
            strokeWidth={2}
            dot={{ fill: CHART_COLORS.views, r: 3 }}
            activeDot={{ r: 5 }}
          />
          <Line
            type="monotone"
            dataKey="Unique Readers"
            stroke={CHART_COLORS.readers}
            strokeWidth={2}
            dot={{ fill: CHART_COLORS.readers, r: 3 }}
          />
          <Line
            type="monotone"
            dataKey="Likes"
            stroke={CHART_COLORS.likes}
            strokeWidth={2}
            dot={{ fill: CHART_COLORS.likes, r: 3 }}
          />
          <Line
            type="monotone"
            dataKey="Comments"
            stroke={CHART_COLORS.comments}
            strokeWidth={2}
            dot={{ fill: CHART_COLORS.comments, r: 3 }}
          />
          <Line
            type="monotone"
            dataKey="Bookmarks"
            stroke={CHART_COLORS.bookmarks}
            strokeWidth={2}
            dot={{ fill: CHART_COLORS.bookmarks, r: 3 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}