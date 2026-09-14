import { useCallback, useEffect, useState } from 'react';
import { factoryService } from '@/services/factoryService';
import { getApiErrorMessage } from '@/lib/apiClient';
import type { FactoryStockItem } from '@/types/factory';

export function useFactoryStock() {
  const [items, setItems] = useState<FactoryStockItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStock = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await factoryService.getFactoryStock();
      setItems(data);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to load factory stock.'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStock();
  }, [fetchStock]);

  return { items, isLoading, error, refetch: fetchStock };
}
