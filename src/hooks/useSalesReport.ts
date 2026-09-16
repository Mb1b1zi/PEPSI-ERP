import { useCallback, useEffect, useState } from 'react';
import { depotService } from '@/services/depotService';
import { getApiErrorMessage } from '@/lib/apiClient';
import type { SaleRecord } from '@/types/sale';

const PAGE_SIZE = 100;
const MAX_PAGES = 10;

export interface SalesReportFilters {
  dateFrom: string;
  dateTo: string;
  depotId?: number;
}

export interface DepotSalesBreakdown {
  depotName: string;
  totalUnits: number;
  totalRevenue: number;
  saleCount: number;
}

/**
 * No backend aggregate endpoint exists (depot.md's list endpoints return a count, never a sum),
 * so this pages through GET /depot/sales for the given range and sums client-side. Capped at
 * MAX_PAGES * PAGE_SIZE records — isTruncated tells the caller to say so honestly rather than
 * silently showing a partial total as if it were complete.
 */
export function useSalesReport(filters: SalesReportFilters) {
  const [records, setRecords] = useState<SaleRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isTruncated, setIsTruncated] = useState(false);

  const fetchAll = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      let all: SaleRecord[] = [];
      let page = 1;
      let total = Infinity;
      while (all.length < total && page <= MAX_PAGES) {
        const result = await depotService.listSales({
          page,
          pageSize: PAGE_SIZE,
          depotId: filters.depotId,
          dateFrom: filters.dateFrom,
          dateTo: filters.dateTo,
        });
        all = all.concat(result.items);
        total = result.total;
        page += 1;
      }
      setIsTruncated(all.length < total);
      setRecords(all);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to load sales report.'));
    } finally {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.dateFrom, filters.dateTo, filters.depotId]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const totalUnits = records.reduce((sum, r) => sum + r.quantitySold, 0);
  const totalRevenue = records.reduce((sum, r) => sum + r.soldAmount, 0);

  const byDepotMap = new Map<string, DepotSalesBreakdown>();
  for (const r of records) {
    const existing = byDepotMap.get(r.depotName) ?? {
      depotName: r.depotName,
      totalUnits: 0,
      totalRevenue: 0,
      saleCount: 0,
    };
    existing.totalUnits += r.quantitySold;
    existing.totalRevenue += r.soldAmount;
    existing.saleCount += 1;
    byDepotMap.set(r.depotName, existing);
  }
  const byDepot = Array.from(byDepotMap.values()).sort((a, b) => b.totalRevenue - a.totalRevenue);

  return {
    totalUnits,
    totalRevenue,
    saleCount: records.length,
    byDepot,
    isLoading,
    error,
    isTruncated,
    refetch: fetchAll,
  };
}
