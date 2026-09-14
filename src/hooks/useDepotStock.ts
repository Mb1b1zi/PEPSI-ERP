import { useCallback, useEffect, useState } from 'react';
import type { DepotStockItem } from '@/types/depotStock';
import { depotService } from '@/services/depotService';
import { getApiErrorMessage } from '@/lib/apiClient';

export function useDepotStock() {
  const [stock, setStock] = useState<DepotStockItem[]>([]);
  const [depotId, setDepotId] = useState<number | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStock = useCallback(async (filterDepotId: number | undefined) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await depotService.getStock(filterDepotId);
      setStock(data);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to load depot stock.'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStock(undefined);
  }, [fetchStock]);

  return {
    stock,
    isLoading,
    error,
    depotId,
    applyFilter: (newDepotId: number | undefined) => {
      setDepotId(newDepotId);
      fetchStock(newDepotId);
    },
    refetch: () => fetchStock(depotId),
  };
}
