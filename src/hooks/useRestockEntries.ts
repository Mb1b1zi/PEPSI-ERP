import { useCallback, useEffect, useState } from 'react';
import type { RestockEntry } from '@/types/restock';
import { depotService } from '@/services/depotService';
import { getApiErrorMessage } from '@/lib/apiClient';

const PAGE_SIZE = 10;

export function useRestockEntries() {
  const [entries, setEntries] = useState<RestockEntry[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPage = useCallback(async (targetPage: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await depotService.listRestock({ page: targetPage, pageSize: PAGE_SIZE });
      setEntries(result.items);
      setTotalPages(result.totalPages);
      setPage(result.page);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to load restock history.'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPage(1);
  }, [fetchPage]);

  return {
    entries,
    isLoading,
    error,
    page,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
    nextPage: () => fetchPage(page + 1),
    prevPage: () => fetchPage(page - 1),
    refetch: () => fetchPage(page),
  };
}
