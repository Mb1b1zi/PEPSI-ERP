/**
 * Wire-format DTOs for Admin Depots and Products (openapi.json: DepotCreate/DepotRead,
 * ProductCreate/ProductRead). Quantities have no Dto section yet — still mock-only (see
 * catalogService.ts). Confined to the service layer; no hook, page, or component may import
 * these.
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

export interface CreateDepotInput {
  name: string;
  location: string;
}

export type UpdateDepotInput = CreateDepotInput;
