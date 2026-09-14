/**
 * STAND-IN for the Admin module. Admin has no documented endpoints yet (see
 * docs/api/README.md, "Open questions for the backend team", item 1) — for Quantities,
 * this is still mock-backed only, since no Admin Quantities CRUD screen exists yet either
 * (replace once Admin ships; do not extend or point it at a guessed endpoint shape).
 *
 * getProducts/getDepots delegate to productService/depotLocationService, the Admin Products
 * and Depots CRUD screens' own services, so an edit made through the Admin UI is reflected
 * in every Factory/Depot form selector that reads from here — one canonical store per
 * resource, not a second copy.
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
