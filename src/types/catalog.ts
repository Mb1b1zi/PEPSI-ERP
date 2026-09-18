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

/** No update/delete endpoint exists for products on the real backend — only create + read. */
export interface ProductCreateDto {
  name: string;
}

export interface ProductDto {
  id: number;
  name: string;
}

/** Backend field is `quantity` (e.g. "500ml", "Crate-24"), not `value` — mapped to the domain
 *  Quantity type's `value` field in quantityService.ts. No update/delete endpoint, same as
 *  Products — only create + read. */
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

export interface CreateQuantityInput {
  value: string;
}

export interface CreateDepotInput {
  name: string;
  location: string;
}

export type UpdateDepotInput = CreateDepotInput;
