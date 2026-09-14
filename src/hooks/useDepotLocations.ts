import { useCallback, useEffect, useState } from 'react';
import type { Depot } from '@/types/catalog';
import { depotLocationService } from '@/services/depotLocationService';

export function useDepotLocations() {
  const [depots, setDepots] = useState<Depot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDepots = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await depotLocationService.getDepots();
      setDepots(data);
    } catch {
      setError('Failed to load depots.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDepots();
  }, [fetchDepots]);

  return { depots, isLoading, error, refetch: fetchDepots };
}
