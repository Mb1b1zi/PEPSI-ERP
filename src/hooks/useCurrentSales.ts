import { useCallback, useEffect, useState } from 'react';
import type { CurrentSaleEntry } from '@/types/sale';
import { depotService } from '@/services/depotService';
import { getApiErrorMessage } from '@/lib/apiClient';

export function useCurrentSales() {
  const [sales, setSales] = useState<CurrentSaleEntry[]>([]);
  const [depotId, setDepotId] = useState<number | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSales = useCallback(async (filterDepotId: number | undefined) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await depotService.getCurrentSales(filterDepotId);
      setSales(data);
    } catch (err) {
      setError(getApiErrorMessage(err, "Failed to load today's sales."));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSales(undefined);
  }, [fetchSales]);

  return {
    sales,
    isLoading,
    error,
    depotId,
    applyFilter: (newDepotId: number | undefined) => {
      setDepotId(newDepotId);
      fetchSales(newDepotId);
    },
    refetch: () => fetchSales(depotId),
  };
}
