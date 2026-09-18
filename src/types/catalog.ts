/**
 * Wire-format DTOs for Admin Depots, Products, and Quantities (openapi.json:
 * DepotCreate/DepotRead, ProductCreate/ProductRead, QuantityCreate/QuantityRead). Confined to
 * the service layer; no hook, page, or component may import these.
 */
export interface DepotCreateDto {
  name: string;
  location: string;
}

export interface DepotDto {
  id: number;
  name: string;
  location: string;
}

/** PUT /admin/products/{id} reuses this same shape (confirmed against openapi.json,
 *  2026-09-18) — update/delete were added to the backend after this module was first built. */
export interface ProductCreateDto {
  name: string;
}

export interface ProductDto {
  id: number;
  name: string;
}

/** Backend field is `quantity` (e.g. "500ml", "Crate-24"), not `value` — mapped to the domain
 *  Quantity type's `value` field in quantityService.ts. PUT /admin/quantities/{id} reuses this
 *  same shape (confirmed against openapi.json, 2026-09-18) — update/delete were added to the
 *  backend after this module was first built. */
export interface QuantityCreateDto {
  quantity: string;
}

export interface QuantityDto {
  id: number;
  quantity: string;
}

// ---------------------------------------------------------------------------
// Domain types
// ---------------------------------------------------------------------------

export interface Product {
  id: number;
  name: string;
}

export interface Quantity {
  id: number;
  value: string;
}

export interface Depot {
  id: number;
  name: string;
  location: string;
}

export interface CreateProductInput {
  name: string;
}

export type UpdateProductInput = CreateProductInput;

export interface CreateQuantityInput {
  value: string;
}

export type UpdateQuantityInput = CreateQuantityInput;

export interface CreateDepotInput {
  name: string;
  location: string;
}

export type UpdateDepotInput = CreateDepotInput;
