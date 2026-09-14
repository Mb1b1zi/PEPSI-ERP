import { usePagedQuery, type UsePagedQueryResult } from '@/hooks/usePagedQuery';
import { factoryService } from '@/services/factoryService';
import type { SupplyRecord } from '@/types/factory';

export interface SupplyHistoryFilters {
  productName?: string;
  date?: string;
}

export function useSupplyHistory(filters: SupplyHistoryFilters): UsePagedQueryResult<SupplyRecord> {
  return usePagedQuery<SupplyRecord, SupplyHistoryFilters>(
    ({ page, pageSize, filters: f }) =>
      factoryService.getSupplyHistory({ page, pageSize, productName: f.productName, date: f.date }),
    filters,
  );
}
