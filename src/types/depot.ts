/**
 * Wire-format DTOs for the Depot module (docs/api/depot.md). Field names and casing
 * are the backend's, verbatim. These are for the service layer only — no hook, page or
 * component may import them; a service must map them into frontend domain types first.
 */
import type { DepotPagedResponse } from '@/types/api';

export type RestockStatus = 'confirmed' | 'rejected';

/**
 * depot_id and supplier_id are NOT fields on this request (confirmed against openapi.json and a
 * live call, 2026-09-18 — sending them is silently ignored, even an invalid depot_id). Both are
 * derived server-side from the supply_history_id's own Factory dispatch record, which already
 * carries depot_id/supplier_id since docs/api/README.md #4 was resolved. depot.md's worked
 * example (which showed depot_id/supplier_id in the body) predates that and is stale here.
 */
export interface ConfirmRestockRequestDto {
  quantity_received: number;
  confirmed_by_id?: number;
}

export interface RejectRestockRequestDto {
  reason: string;
  confirmed_by_id?: number;
  quantity_received?: number;
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
  sold_by_id?: number;
  amount_sold?: number;
}

export interface UpdateSaleRequestDto {
  quantity_sold: number;
  amount_sold: number;
}

/**
 * Confirmed against docs/api/openapi.json's SaleResponse. Field is `amount_sold` (matching the
 * request body's field name) as of 2026-09-18 — this used to be `sold_amount`, the exact
 * request/response naming mismatch docs/api/README.md open question 7 flagged; the backend has
 * since fixed it here (GET /depot/sales-current's `sold_amount` is unrelated and unchanged —
 * see SalesCurrentEntryDto below).
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
  amount_sold: number;
  sold_by_id: number | null;
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
