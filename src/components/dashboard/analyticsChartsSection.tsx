"use client";

import { useAnalyticsTimeseries } from '@/hooks/useAnalyticsTimeseries';
import { EmptyChartState } from './emptyChartState';
import { aggregateForComparison, hasAnyEngagement } from '@/lib/utils';
import { AnalyticsLineChart } from './analyticsLineChart';
import { AnalyticsComparisonBarChart } from './analyticsComparisonBarChart';



export function AnalyticsChartsSection() {
  const { data: timeseriesData = [], isLoading, error } = useAnalyticsTimeseries(true, 14);

  // Loading state
  if (isLoading) {
    return (
      <section className="space-y-6" aria-live="polite">
        <div className="bg-white border border-zinc-200 rounded-xl p-12 flex items-center justify-center">
          <p className="text-sm font-medium text-zinc-500 animate-pulse">
            Loading chart data...
          </p>
        </div>
      </section>
    );
  }

  // Error state
  if (error) {
    return (
      <section className="space-y-6">
        <div className="rounded-xl bg-red-50 p-4 text-sm text-red-700 border border-red-200" role="alert">
          <p className="font-semibold">Chart Error:</p>
          <p className="mt-1 opacity-90">{error.message}</p>
        </div>
      </section>
    );
  }

  // Empty state - no engagement data
  if (!hasAnyEngagement(timeseriesData)) {
    return (
      <section className="space-y-6">
        <EmptyChartState
          message="No engagement data available"
          description="Start sharing your articles to see analytics trends over time."
        />
      </section>
    );
  }

  const comparisonData = aggregateForComparison(timeseriesData);

  return (
    <section className="space-y-6" aria-labelledby="charts-heading">
      <h2 id="charts-heading" className="text-lg font-semibold text-zinc-900">
        Performance Trends
      </h2>

      <div className="grid gap-6 lg:grid-cols-1">
        <AnalyticsLineChart data={timeseriesData} />
        <AnalyticsComparisonBarChart data={comparisonData} />
      </div>
    </section>
  );
}