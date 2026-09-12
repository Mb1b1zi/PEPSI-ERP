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

export interface FactoryCurrentStockDto {
  id: number;
  product_id: number;
  product_name: string;
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
