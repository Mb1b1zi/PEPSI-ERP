import { useCallback, useEffect, useState } from 'react';
import type { FactoryStockItem } from '@/types/factoryStock';
import { factoryService } from '@/services/factoryService';
import { getApiErrorMessage } from '@/lib/apiClient';

export function useFactoryStock() {
  const [stock, setStock] = useState<FactoryStockItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStock = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await factoryService.getStock();
      setStock(data);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to load factory stock.'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStock();
  }, [fetchStock]);

  return { stock, isLoading, error, refetch: fetchStock };
}
