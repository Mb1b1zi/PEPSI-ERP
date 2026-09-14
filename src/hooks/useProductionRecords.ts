import { useCallback, useEffect, useState } from 'react';
import type { ProductionRecord } from '@/types/production';
import { factoryService } from '@/services/factoryService';
import { getApiErrorMessage } from '@/lib/apiClient';

const PAGE_SIZE = 10;

export function useProductionRecords() {
  const [records, setRecords] = useState<ProductionRecord[]>([]);
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPage = useCallback(async (targetPage: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const skip = (targetPage - 1) * PAGE_SIZE;
      const result = await factoryService.listProduction({ skip, limit: PAGE_SIZE });
      setRecords(result.items);
      setHasNextPage(result.items.length === PAGE_SIZE);
      setPage(targetPage);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to load production records.'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPage(1);
  }, [fetchPage]);

  return {
    records,
    isLoading,
    error,
    page,
    hasNextPage,
    hasPrevPage: page > 1,
    nextPage: () => fetchPage(page + 1),
    prevPage: () => fetchPage(page - 1),
    refetch: () => fetchPage(page),
  };
}
