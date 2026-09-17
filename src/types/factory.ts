/**
 * Wire-format DTOs for the Factory module (docs/api/factory.md). Field names and casing
 * are the backend's, verbatim. These are for the service layer only — no hook, page or
 * component may import them; a service must map them into frontend domain types first.
 */

export interface CreateProductionRequestDto {
  product_id: number;
  quantity_produced: number;
  production_date?: string;
}

export interface ProductionRecordDto {
  id: number;
  product_id: number;
  product_name: string;
  quantity_produced: number;
  production_date: string;
  created_date: string;
}

/**
 * docs/api/factory.md does not give a request body example for PUT /factory/production/{id},
 * only prose ("Update ... a production record. Current factory stock is adjusted by the
 * quantity change."). Modelled on the create request since the fields being updated are the
 * same ones supplied at creation. Confirm against the real API before relying on this shape.
 */
export interface UpdateProductionRequestDto {
  product_id: number;
  quantity_produced: number;
  production_date?: string;
}

/**
 * quantity_id/quantity_value are always null in the live data today (confirmed against the
 * real API, 2026-09-17) — factory stock isn't currently tracked per pack-size, only per
 * product. Modelled as nullable rather than omitted since the live openapi.json schema
 * (FactoryStockResponse) declares them as real fields on every row, not something the backend
 * only sometimes sends.
 */
export interface FactoryCurrentStockDto {
  id: number;
  product_id: number;
  product_name: string;
  quantity_id: number | null;
  quantity_value: string | null;
  available_quantity: number;
  updated_date: string;
}

export interface CreateSupplyRequestDto {
  product_id: number;
  quantity_id: number;
  amount: number;
}

export type SupplyStatus = 'pending' | 'received' | 'rejected';

export interface SupplyHistoryDto {
  id: number;
  product_id: number;
  quantity_id: number;
  amount: number;
  product_name: string;
  quantity_value: string;
  status: SupplyStatus;
  rejection_reason: string | null;
  created_date: string;
}

/**
 * docs/api/factory.md does not give a request body example for PUT /factory/supplies/{id},
 * only prose ("A rejected supply must include rejection_reason. Rejecting or deleting a
 * pending supply releases its reserved amount back to factory stock."). Modelled as a
 * decide-the-pending-supply action: set the final status, with a reason required when
 * rejecting. Confirm against the real API before relying on this shape.
 */
export interface UpdateSupplyRequestDto {
  status: SupplyStatus;
  rejection_reason?: string;
}

// ---------------------------------------------------------------------------
// Domain types (frontend-facing). CamelCase, never snake_case. These are what
// a service returns and what a hook/page/component may import — the Dtos
// above never cross that boundary. Dates are kept as ISO strings (matching
// the wire format's own representation) rather than converted to `Date`,
// since nothing here does date arithmetic that would benefit from it.
// ---------------------------------------------------------------------------

export interface ProductionRecord {
  id: number;
  productId: number;
  productName: string;
  quantityProduced: number;
  productionDate: string;
  createdDate: string;
}

export interface CreateProductionInput {
  productId: number;
  quantityProduced: number;
  productionDate?: string;
}

export interface UpdateProductionInput {
  productId: number;
  quantityProduced: number;
  productionDate?: string;
}

export interface SupplyRecord {
  id: number;
  productId: number;
  quantityId: number;
  amount: number;
  productName: string;
  quantityValue: string;
  status: SupplyStatus;
  rejectionReason: string | null;
  createdDate: string;
}

export interface FactoryStockItem {
  id: number;
  productId: number;
  productName: string;
  quantityId: number | null;
  quantityValue: string | null;
  availableQuantity: number;
  updatedDate: string;
}

export interface CreateSupplyInput {
  productId: number;
  quantityId: number;
  amount: number;
}

export interface UpdateSupplyInput {
  status: SupplyStatus;
  rejectionReason?: string;
}
