import { useCallback, useEffect, useState } from 'react';
import { factoryService } from '@/services/factoryService';
import { getApiErrorMessage } from '@/lib/apiClient';
import type { SupplyRecord } from '@/types/factory';

const PAGE_SIZE = 10; // GET /factory/supplies caps limit at 10, same as /factory/production
const MAX_PAGES_PER_DAY = 5;
const MAX_DAYS = 31;

export interface SupplyReportFilters {
  dateFrom: string;
  dateTo: string;
  depotId?: number;
}

export interface DepotSupplyBreakdown {
  depotName: string;
  totalAmount: number;
  receivedCount: number;
  pendingCount: number;
  rejectedCount: number;
}

function enumerateDates(from: string, to: string): string[] {
  const dates: string[] = [];
  const start = new Date(from);
  const end = new Date(to);
  for (const d = new Date(start); d <= end && dates.length < MAX_DAYS; d.setDate(d.getDate() + 1)) {
    dates.push(d.toISOString().slice(0, 10));
  }
  return dates;
}

/**
 * Same day-by-day looping approach as useProductionReport.ts, and the same open limitation
 * (docs/api/README.md #13 — no date_from/date_to on this endpoint yet). Unlike Production,
 * Supply now carries depot_id/depot_name (docs/api/README.md #4, resolved 2026-09-18), so this
 * can group by depot — "supply history of different depots" the Boss/CEO asked for.
 */
export function useSupplyReport(filters: SupplyReportFilters) {
  const [records, setRecords] = useState<SupplyRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isTruncated, setIsTruncated] = useState(false);

  const fetchAll = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const dates = enumerateDates(filters.dateFrom, filters.dateTo);
      const spanDays = Math.round((new Date(filters.dateTo).getTime() - new Date(filters.dateFrom).getTime()) / 86400000) + 1;
      let truncated = spanDays > MAX_DAYS;
      let all: SupplyRecord[] = [];

      for (const date of dates) {
        let page = 1;
        let total = Infinity;
        let fetchedForDay = 0;
        while (fetchedForDay < total && page <= MAX_PAGES_PER_DAY) {
          const result = await factoryService.getSupplyHistory({
            page,
            pageSize: PAGE_SIZE,
            date,
            depotId: filters.depotId,
          });
          all = all.concat(result.items);
          total = result.total;
          fetchedForDay += result.items.length;
          page += 1;
        }
        if (fetchedForDay < total) truncated = true;
      }

      setIsTruncated(truncated);
      setRecords(all);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to load supply report.'));
    } finally {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.dateFrom, filters.dateTo, filters.depotId]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const totalAmount = records.reduce((sum, r) => sum + r.amount, 0);
  const receivedCount = records.filter((r) => r.status === 'received').length;
  const pendingCount = records.filter((r) => r.status === 'pending').length;
  const rejectedCount = records.filter((r) => r.status === 'rejected').length;

  const byDepotMap = new Map<string, DepotSupplyBreakdown>();
  for (const r of records) {
    const key = r.depotName ?? 'Unassigned';
    const existing = byDepotMap.get(key) ?? {
      depotName: key,
      totalAmount: 0,
      receivedCount: 0,
      pendingCount: 0,
      rejectedCount: 0,
    };
    existing.totalAmount += r.amount;
    if (r.status === 'received') existing.receivedCount += 1;
    else if (r.status === 'pending') existing.pendingCount += 1;
    else existing.rejectedCount += 1;
    byDepotMap.set(key, existing);
  }
  const byDepot = Array.from(byDepotMap.values()).sort((a, b) => b.totalAmount - a.totalAmount);

  return {
    totalAmount,
    recordCount: records.length,
    receivedCount,
    pendingCount,
    rejectedCount,
    byDepot,
    isLoading,
    error,
    isTruncated,
    refetch: fetchAll,
  };
}
