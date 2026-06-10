"use client";

import { supabase } from '@/lib/supabase/client';
import { DailyAnalytics } from '@/types';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';

export function useAnalyticsTimeseries(enabled: boolean, daysCount: number = 14) {
  return useQuery<DailyAnalytics[], Error>({
    queryKey: ['analyticsTimeseries', daysCount],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_creator_analytics_timeseries', {
        days_count: daysCount,
      });

      if (error) {
        toast.error(`Chart Data Error: ${error.message}`);
        throw new Error(error.message);
      }

      return data || [];
    },
    enabled,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}