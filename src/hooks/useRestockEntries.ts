import { usePagedQuery, type UsePagedQueryResult } from '@/hooks/usePagedQuery';
import { depotService } from '@/services/depotService';
import type { RestockEntry } from '@/types/restock';

export interface RestockFilters {
  status?: 'confirmed' | 'rejected';
  productName?: string;
  dateFrom?: string;
  dateTo?: string;
}

export function useRestockEntries(filters: RestockFilters): UsePagedQueryResult<RestockEntry> {
  return usePagedQuery<RestockEntry, RestockFilters>(
    ({ page, pageSize, filters: f }) => depotService.listRestock({ page, pageSize, ...f }),
    filters,
  );
}
