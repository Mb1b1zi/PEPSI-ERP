import { useCallback, useEffect, useRef, useState } from 'react';
import type { Paged } from '@/types/api';

export interface PagedQueryParams<F> {
  page: number;
  pageSize: number;
  filters: F;
}

export type PagedFetcher<T, F> = (params: PagedQueryParams<F>) => Promise<Paged<T>>;

export interface UsePagedQueryResult<T> {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  isLoading: boolean;
  error: string | null;
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
  refetch: () => void;
}

/**
 * Generic server-side pagination + filter state. Normalising a backend's own pagination
 * scheme (skip/limit, page/page_size, or anything else) into Paged<T> is the service layer's
 * job — this hook only ever sees that normalised shape, never a DTO, apiClient, or a service.
 */
export function usePagedQuery<T, F>(
  fetcher: PagedFetcher<T, F>,
  filters: F,
  initialPageSize = 10,
): UsePagedQueryResult<T> {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [items, setItems] = useState<T[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const filtersKey = JSON.stringify(filters);
  const prevFiltersKey = useRef(filtersKey);

  const fetchPage = useCallback(async (targetPage: number, targetPageSize: number, targetFilters: F) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await fetcher({ page: targetPage, pageSize: targetPageSize, filters: targetFilters });
      setItems(result.items);
      setTotal(result.total);
      setTotalPages(result.totalPages);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data.');
    } finally {
      setIsLoading(false);
    }
  }, [fetcher]);

  useEffect(() => {
    const filtersChanged = prevFiltersKey.current !== filtersKey;
    prevFiltersKey.current = filtersKey;

    // Filters changed while on a page other than 1: reset first, let the resulting page change
    // re-run this effect and fetch then, instead of fetching once at the stale page and again
    // at page 1.
    if (filtersChanged && page !== 1) {
      setPage(1);
      return;
    }

    fetchPage(page, pageSize, filters);
    // filtersKey (not the filters object identity) is the real dependency, so a fresh object
    // literal from the caller each render doesn't cause an extra fetch.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize, filtersKey]);

  return {
    items,
    page,
    pageSize,
    total,
    totalPages,
    isLoading,
    error,
    setPage,
    setPageSize,
    refetch: () => fetchPage(page, pageSize, filters),
  };
}
