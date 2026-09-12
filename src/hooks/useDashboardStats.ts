import { useEffect, useState } from 'react';
import type { DashboardStats } from '@/types/dashboard';
import { dashboardService } from '@/services/dashboardService';

interface UseDashboardStatsResult {
  stats: DashboardStats | null;
  isLoading: boolean;
  error: string | null;
}

export function useDashboardStats(): UseDashboardStatsResult {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isCancelled = false;

    dashboardService
      .getStats()
      .then((data) => {
        if (!isCancelled) setStats(data);
      })
      .catch(() => {
        if (!isCancelled) setError('Failed to load dashboard stats.');
      })
      .finally(() => {
        if (!isCancelled) setIsLoading(false);
      });

    return () => {
      isCancelled = true;
    };
  }, []);

  return { stats, isLoading, error };
}