"use client";

import { AnalyticsOverview } from "@/components/dashboard/analyticsOverview";
import { PostMetricsTable } from "@/components/dashboard/postMetricsTable";
import { ChartToggleButton } from "@/components/dashboard/chartToggleButton";
import { AnalyticsChartsSection } from "@/components/dashboard/analyticsChartsSection";
import { useAuth } from "@/context/auth-context";
import { useDashboardAnalytics } from "@/hooks/useDashboardAnalytics";
import { useChartToggle } from "@/hooks/useChartToggle";

export default function DashboardPage() {
  const { user } = useAuth();
  const {
    data: analytics = [],
    isLoading: isDataLoading,
    error,
  } = useDashboardAnalytics(!!user);
  const { showCharts, toggleCharts } = useChartToggle();

  // 1. Unauthenticated route barrier layout
  if (!user && !isDataLoading) {
    return (
      <main className='mx-auto max-w-7xl p-4 sm:p-6 lg:p-8'>
        <section
          className='text-center py-16 px-4 border border-zinc-200 rounded-xl bg-white shadow-xs'
          aria-label='Access Denied Alert'>
          <h1 className='text-xl font-bold text-zinc-900'>Access Denied</h1>
          <p className='text-zinc-500 mt-2 text-sm max-w-sm mx-auto'>
            Please authenticate or log into your account to access your
            personalized platform publisher metrics.
          </p>
        </section>
      </main>
    );
  }

  // 2. Loading state during active server query data gathering
  if (isDataLoading) {
    return (
      <div
        className='flex min-h-screen items-center justify-center bg-zinc-50'
        aria-live='polite'>
        <p className='text-sm font-medium text-zinc-500 animate-pulse'>
          Assembling analytic metrics...
        </p>
      </div>
    );
  }

  // 3. Fail-safe visual presentation block for query tracking errors
  if (error) {
    return (
      <main className='mx-auto max-w-7xl p-4 sm:p-6 lg:p-8'>
        <div
          className='rounded-xl bg-red-50 p-4 text-sm text-red-700 border border-red-200'
          role='alert'>
          <p className='font-semibold'>
            Unable to map platform performance data:
          </p>
          <p className='mt-1 opacity-90'>
            {error.message ||
              "Unknown network error occurs during RPC interface execution."}
          </p>
        </div>
      </main>
    );
  }

  // 4. Main successful dashboard screen representation
  return (
    <main className='mx-auto max-w-7xl p-4 sm:p-6 lg:p-8 space-y-8'>
      <header className='border-b border-zinc-200 pb-5'>
        <h1 className='text-3xl font-bold tracking-tight text-zinc-900'>
          Creator Analytics
        </h1>
        <p className='text-sm text-zinc-500 mt-1'>
          Monitor your long-form publication footprints, tracking views, reader
          scope, and social community metrics.
        </p>
      </header>

      {/* Aggregate metric cards */}
      <AnalyticsOverview analytics={analytics} />

      {/* Chart toggle button */}
      <ChartToggleButton
        isActive={showCharts}
        onClick={toggleCharts}
        hasData={analytics.length > 0}
      />

      {/* Comparison charts section - only visible when toggled */}
      {showCharts && <AnalyticsChartsSection />}

      {/* Itemized post table listing */}
      <section className='space-y-4' aria-labelledby='posts-table-heading'>
        <h2
          id='posts-table-heading'
          className='text-lg font-semibold text-zinc-900'>
          Article Performance Breakdown
        </h2>
        <PostMetricsTable analytics={analytics} />
      </section>
    </main>
  );
}
