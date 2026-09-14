import { usePagedQuery, type UsePagedQueryResult } from '@/hooks/usePagedQuery';
import { depotService } from '@/services/depotService';
import type { SaleRecord } from '@/types/sale';

export interface SalesFilters {
  productName?: string;
  dateFrom?: string;
  dateTo?: string;
}

export function useSalesHistory(filters: SalesFilters): UsePagedQueryResult<SaleRecord> {
  return usePagedQuery<SaleRecord, SalesFilters>(
    ({ page, pageSize, filters: f }) => depotService.listSales({ page, pageSize, ...f }),
    filters,
  );
}
