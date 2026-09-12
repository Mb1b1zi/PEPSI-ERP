/**
 * Depot's list endpoints (GET /depot/restock, GET /depot/sales) return a page envelope
 * matching this shape exactly (see docs/api/depot.md, "Pagination and filtering").
 */
export interface DepotPagedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

/**
 * Factory's list endpoints (GET /factory/production, GET /factory/supplies) take
 * skip/limit query params and return a bare array with no envelope — the backend caps
 * `limit` at 10 (see docs/api/factory.md).
 */
export interface FactoryPageParams {
  skip: number;
  limit: number;
}

/**
 * The only pagination shape allowed above the service layer. Depot and Factory
 * responses must be normalised into this via src/lib/pagination.ts before a service
 * returns them.
 */
export interface Paged<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/** FastAPI's per-field validation error entry, returned in a 422 body's `detail` array. */
export interface FastApiValidationError {
  loc: (string | number)[];
  msg: string;
  type: string;
}

/**
 * Documented error cases across the Factory and Depot modules:
 * - 400: invalid reference (bad depot/product/quantity ID), or a sale with no price set
 *   and no `amount_sold` override.
 * - 404: resource not found.
 * - 409: business-rule conflict — insufficient stock, or a supply that's already been decided.
 * - 422: FastAPI request validation failure — see `validationErrors`.
 */
export interface ApiError {
  status: number;
  message: string;
  validationErrors?: FastApiValidationError[];
}
