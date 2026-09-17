import { useCallback, useEffect, useState } from 'react';
import type { DashboardSummary } from '@/types/dashboardSummary';
import { dashboardSummaryService } from '@/services/dashboardSummaryService';
import { getApiErrorMessage } from '@/lib/apiClient';

export function useDashboardSummary() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSummary = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await dashboardSummaryService.getSummary();
      setSummary(data);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to load dashboard summary.'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  return { summary, isLoading, error, refetch: fetchSummary };
}
