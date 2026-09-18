import { useCallback, useEffect, useState } from 'react';
import { factoryService } from '@/services/factoryService';
import { getApiErrorMessage } from '@/lib/apiClient';
import type { ProductionRecord } from '@/types/factory';

const PAGE_SIZE = 10; // GET /factory/production caps limit at 10 (docs/api/README.md #5)
const MAX_PAGES_PER_DAY = 5;
const MAX_DAYS = 31;

export interface ProductionReportFilters {
  dateFrom: string;
  dateTo: string;
}

export interface ProductProductionBreakdown {
  productName: string;
  totalProduced: number;
  recordCount: number;
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
 * GET /factory/production only accepts a single exact `date`, not a date_from/date_to range
 * (docs/api/README.md open question 13 — still open) and caps at 10 records/page. So a
 * "week"/"month" report loops one request per calendar day instead of one ranged request —
 * slower than the Depot-side reports, but there's no other way to ask for a range today.
 * isTruncated covers both a range longer than MAX_DAYS and any single day with more than
 * MAX_PAGES_PER_DAY pages of records.
 */
export function useProductionReport(filters: ProductionReportFilters) {
  const [records, setRecords] = useState<ProductionRecord[]>([]);
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
      let all: ProductionRecord[] = [];

      for (const date of dates) {
        let page = 1;
        let total = Infinity;
        let fetchedForDay = 0;
        while (fetchedForDay < total && page <= MAX_PAGES_PER_DAY) {
          const result = await factoryService.getProductionHistory({ page, pageSize: PAGE_SIZE, date });
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
      setError(getApiErrorMessage(err, 'Failed to load production report.'));
    } finally {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.dateFrom, filters.dateTo]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const totalProduced = records.reduce((sum, r) => sum + r.quantityProduced, 0);

  const byProductMap = new Map<string, ProductProductionBreakdown>();
  for (const r of records) {
    const existing = byProductMap.get(r.productName) ?? { productName: r.productName, totalProduced: 0, recordCount: 0 };
    existing.totalProduced += r.quantityProduced;
    existing.recordCount += 1;
    byProductMap.set(r.productName, existing);
  }
  const byProduct = Array.from(byProductMap.values()).sort((a, b) => b.totalProduced - a.totalProduced);

  return {
    totalProduced,
    recordCount: records.length,
    byProduct,
    isLoading,
    error,
    isTruncated,
    refetch: fetchAll,
  };
}
