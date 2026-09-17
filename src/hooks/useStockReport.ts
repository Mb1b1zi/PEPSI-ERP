import { useCallback, useEffect, useState } from 'react';
import { depotService } from '@/services/depotService';
import { getApiErrorMessage } from '@/lib/apiClient';
import type { RestockEntry } from '@/types/restock';

const PAGE_SIZE = 100;
const MAX_PAGES = 10;

export interface StockReportFilters {
  dateFrom: string;
  dateTo: string;
  depotId?: number;
}

export interface DepotStockBreakdown {
  depotName: string;
  totalDelivered: number;
  confirmedCount: number;
  rejectedCount: number;
}

/**
 * Reflects stock *received* over the period (restock deliveries), not a live current-stock
 * snapshot — that's what the existing Depot Stock page already shows. No backend aggregate
 * endpoint exists, so this pages through GET /depot/restock for the given range and sums
 * client-side, same approach and same MAX_PAGES cap as useSalesReport.
 */
export function useStockReport(filters: StockReportFilters) {
  const [records, setRecords] = useState<RestockEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isTruncated, setIsTruncated] = useState(false);

  const fetchAll = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      let all: RestockEntry[] = [];
      let page = 1;
      let total = Infinity;
      while (all.length < total && page <= MAX_PAGES) {
        const result = await depotService.listRestock({
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
      setError(getApiErrorMessage(err, 'Failed to load stock report.'));
    } finally {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.dateFrom, filters.dateTo, filters.depotId]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const confirmed = records.filter((r) => r.status === 'confirmed');
  const rejectedCount = records.filter((r) => r.status === 'rejected').length;
  const totalDelivered = confirmed.reduce((sum, r) => sum + r.quantityDelivered, 0);

  const byDepotMap = new Map<string, DepotStockBreakdown>();
  for (const r of records) {
    const existing = byDepotMap.get(r.depotName) ?? {
      depotName: r.depotName,
      totalDelivered: 0,
      confirmedCount: 0,
      rejectedCount: 0,
    };
    if (r.status === 'confirmed') {
      existing.totalDelivered += r.quantityDelivered;
      existing.confirmedCount += 1;
    } else {
      existing.rejectedCount += 1;
    }
    byDepotMap.set(r.depotName, existing);
  }
  const byDepot = Array.from(byDepotMap.values()).sort((a, b) => b.totalDelivered - a.totalDelivered);

  return {
    totalDelivered,
    confirmedCount: confirmed.length,
    rejectedCount,
    byDepot,
    isLoading,
    error,
    isTruncated,
    refetch: fetchAll,
  };
}
