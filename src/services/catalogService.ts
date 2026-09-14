/**
 * STAND-IN for the Admin module. Admin has no documented endpoints yet (see
 * docs/api/README.md, "Open questions for the backend team", item 1), but Factory and
 * Depot write endpoints require product_id, quantity_id and depot_id — this exists only
 * so form selectors have something to populate from until Admin ships.
 *
 * Mock-backed only, deliberately: it must be REPLACED with a real Admin-backed service
 * once that module is documented, not extended or wired to a guessed endpoint shape.
 */
import type { Product, Quantity, Depot } from '@/types/catalog';
import { mockProducts, mockQuantities, mockDepots } from '@/mock/catalog.mock';

function simulateDelay<T>(data: T, ms = 500): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(data), ms));
}

export const catalogService = {
  async getProducts(): Promise<Product[]> {
    return simulateDelay(mockProducts);
  },

  async getQuantities(): Promise<Quantity[]> {
    return simulateDelay(mockQuantities);
  },

  async getDepots(): Promise<Depot[]> {
    return simulateDelay(mockDepots);
  },
};
