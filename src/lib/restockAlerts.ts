import type { DepotStockItem } from '@/types/depotStock';

/**
 * Fixed frontend-only threshold — the backend has no reorder-level concept anywhere
 * (no min_stock/reorder_level field on stock, product, or quantity). Kept in one place so
 * it's trivial to swap for a real per-product field later.
 */
export const LOW_STOCK_THRESHOLD = 20;

export function isLowStock(item: DepotStockItem): boolean {
  return item.currentAmount <= LOW_STOCK_THRESHOLD;
}
