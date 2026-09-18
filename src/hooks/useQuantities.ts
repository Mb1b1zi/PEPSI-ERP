import { useCallback, useEffect, useState } from 'react';
import type { Quantity } from '@/types/catalog';
import { quantityService } from '@/services/quantityService';

export function useQuantities() {
  const [quantities, setQuantities] = useState<Quantity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchQuantities = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await quantityService.getQuantities();
      setQuantities(data);
    } catch {
      setError('Failed to load quantities.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchQuantities();
  }, [fetchQuantities]);

  return { quantities, isLoading, error, refetch: fetchQuantities };
}
