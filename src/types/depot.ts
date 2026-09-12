/**
 * Wire-format DTOs for the Depot module (docs/api/depot.md). Field names and casing
 * are the backend's, verbatim. These are for the service layer only — no hook, page or
 * component may import them; a service must map them into frontend domain types first.
 */
import type { DepotPagedResponse } from '@/types/api';

export type RestockStatus = 'confirmed' | 'rejected';

export interface ConfirmRestockRequestDto {
  depot_id: number;
  quantity_received: number;
  supplier_id?: number;
  confirmed_by_id?: number;
}

export interface RejectRestockRequestDto {
  depot_id: number;
  reason: string;
  confirmed_by_id?: number;
  quantity_received?: number;
  supplier_id?: number;
}

export interface UpdateRestockRequestDto {
  quantity_delivered: number;
}

/** Response shape shared by confirm, reject, get-one, and get-list (see docs/api/depot.md). */
export interface RestockEntryDto {
  id: number;
  supply_history_id: number;
  depot_id: number;
  depot_name: string;
  product_id: number;
  product_name: string;
  quantity_id: number;
  quantity_value: string;
  quantity_delivered: number;
  supplier_id: number | null;
  confirmed_by_id: number | null;
  status: RestockStatus;
  rejection_reason: string | null;
  restock_date: string;
}

export type RestockListResponseDto = DepotPagedResponse<RestockEntryDto>;

export interface DepotCurrentStockDto {
  id: number;
  depot_id: number;
  depot_name: string;
  product_id: number;
  product_name: string;
  quantity_id: number;
  quantity_value: string;
  current_amount: number;
  updated_at: string;
}

export interface CreateSaleRequestDto {
  depot_id: number;
  product_id: number;
  quantity_id: number;
  quantity_sold: number;
  sold_by_id: number;
  amount_sold?: number;
}

export interface UpdateSaleRequestDto {
  quantity_sold: number;
  amount_sold: number;
}

/**
 * docs/api/depot.md does not give a complete JSON example for POST/GET /depot/sales
 * responses (only for the separate /depot/sales-current endpoint below). The fields here
 * are inferred from the request body, from the prose confirming `sale_date` and `sale_time`
 * are separate fields, from the response field being named `sold_amount` (see open question
 * #7 in docs/api/README.md), and from the name-enrichment pattern (`*_name`, `quantity_value`)
 * used consistently by every other list/detail response in this document. Confirm against
 * the real API before relying on this shape.
 */
export interface SaleDto {
  id: number;
  depot_id: number;
  depot_name: string;
  product_id: number;
  product_name: string;
  quantity_id: number;
  quantity_value: string;
  quantity_sold: number;
  sold_amount: number;
  sold_by_id: number;
  sale_date: string;
  sale_time: string;
}

export type SaleListResponseDto = DepotPagedResponse<SaleDto>;

/** Confirmed shape for GET /depot/sales-current (today only, not paginated). */
export interface SalesCurrentEntryDto {
  id: number;
  depot_id: number;
  depot_name: string;
  product_id: number;
  product_name: string;
  quantity_id: number;
  quantity_value: string;
  sale_date: string;
  quantity_sold: number;
  sold_amount: number;
}
