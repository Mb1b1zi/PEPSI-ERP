/**
 * Wire-format DTOs for Admin Prices (openapi.json: PriceCreate/PriceRead/PriceUpdate).
 * Confined to the service layer; no hook, page, or component may import these.
 *
 * A price is keyed by quantity_id alone — there's no product_id anywhere on this resource, so
 * pricing is per pack-size only, not per specific product+pack-size combination (matches
 * docs/api/depot.md: a sale auto-prices as `price.amount * quantity_sold` when amount_sold is
 * omitted, looked up by the sale's quantity_id). PriceUpdate only allows changing `amount` —
 * quantity_id can't be changed after creation, only deleted and recreated.
 */
export interface PriceCreateDto {
  quantity_id: number;
  amount: number;
}

export interface PriceUpdateDto {
  amount: number;
}

export interface PriceDto {
  id: number;
  quantity_id: number;
  amount: number;
}

// ---------------------------------------------------------------------------
// Domain types
// ---------------------------------------------------------------------------

export interface Price {
  id: number;
  quantityId: number;
  amount: number;
}

export interface CreatePriceInput {
  quantityId: number;
  amount: number;
}

export interface UpdatePriceInput {
  amount: number;
}
