import { useCallback, useEffect, useState } from 'react';
import type { SaleRecord } from '@/types/sale';
import { depotService } from '@/services/depotService';
import { getApiErrorMessage } from '@/lib/apiClient';

const PAGE_SIZE = 10;

export function useSalesHistory() {
  const [sales, setSales] = useState<SaleRecord[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPage = useCallback(async (targetPage: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await depotService.listSales({ page: targetPage, pageSize: PAGE_SIZE });
      setSales(result.items);
      setTotalPages(result.totalPages);
      setPage(result.page);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to load sales history.'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPage(1);
  }, [fetchPage]);

  return {
    sales,
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
