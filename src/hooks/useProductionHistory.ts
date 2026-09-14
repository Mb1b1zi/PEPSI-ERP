import { usePagedQuery, type UsePagedQueryResult } from '@/hooks/usePagedQuery';
import { factoryService } from '@/services/factoryService';
import type { ProductionRecord } from '@/types/factory';

export interface ProductionHistoryFilters {
  productName?: string;
  date?: string;
}

export function useProductionHistory(filters: ProductionHistoryFilters): UsePagedQueryResult<ProductionRecord> {
  return usePagedQuery<ProductionRecord, ProductionHistoryFilters>(
    ({ page, pageSize, filters: f }) =>
      factoryService.getProductionHistory({ page, pageSize, productName: f.productName, date: f.date }),
    filters,
  );
}
