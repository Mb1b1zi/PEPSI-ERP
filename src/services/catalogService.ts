/**
 * STAND-IN for Admin Quantities specifically. `/admin/quantities` is now documented in
 * openapi.json (see docs/api/README.md item 1, resolved 2026-09-14), but no Admin Quantities
 * CRUD screen exists yet, so this stays mock-backed until that module is built (replace then;
 * do not extend or point it at a guessed endpoint shape in the meantime).
 *
 * getProducts/getDepots delegate to productService/depotLocationService, the Admin Products
 * and Depots CRUD screens' own services, so an edit made through the Admin UI is reflected
 * in every Factory/Depot form selector that reads from here — one canonical store per
 * resource, not a second copy. Both are real-API backed; only Quantities (above) remains
 * mock-only.
 */
import type { Quantity } from '@/types/catalog';
import { mockQuantities } from '@/mock/catalog.mock';
import { productService } from '@/services/productService';
import { depotLocationService } from '@/services/depotLocationService';

function simulateDelay<T>(data: T, ms = 500): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(data), ms));
}

export const catalogService = {
  getProducts: productService.getProducts,

  async getQuantities(): Promise<Quantity[]> {
    return simulateDelay(mockQuantities);
  },

  getDepots: depotLocationService.getDepots,
};
