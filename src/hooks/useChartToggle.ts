"use client";

import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useCallback } from 'react';

export function useChartToggle() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const showCharts = searchParams.get('comparison') === '7d';

  const toggleCharts = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (showCharts) {
      params.delete('comparison');
    } else {
      params.set('comparison', '7d');
    }

    const queryString = params.toString();
    const url = queryString ? `${pathname}?${queryString}` : pathname;
    
    router.push(url, { scroll: false });
  }, [showCharts, searchParams, pathname, router]);

  return { showCharts, toggleCharts };
}