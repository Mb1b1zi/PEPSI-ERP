import { useCallback, useEffect, useState } from 'react';
import type { Price } from '@/types/price';
import { priceService } from '@/services/priceService';

export function usePrices() {
  const [prices, setPrices] = useState<Price[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPrices = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await priceService.getPrices();
      setPrices(data);
    } catch {
      setError('Failed to load prices.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPrices();
  }, [fetchPrices]);

  return { prices, isLoading, error, refetch: fetchPrices };
}
