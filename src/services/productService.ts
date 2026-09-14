/**
 * Admin Products (product catalog). No backend contract exists for this yet (see
 * docs/api/README.md open question 1) — mock-backed only, same pattern as userService.ts.
 * Owns the canonical mutable product list; catalogService.getProducts() delegates here so
 * an edit made through the Admin UI is reflected in Factory/Depot form selectors too.
 */
import type { Product, CreateProductInput, UpdateProductInput } from '@/types/catalog';
import { mockProducts } from '@/mock/catalog.mock';

function simulateDelay<T>(data: T, ms = 500): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(data), ms));
}

let productsStore: Product[] = [...mockProducts];

export const productService = {
  async getProducts(): Promise<Product[]> {
    return simulateDelay(productsStore);
  },

  async getProductById(id: number): Promise<Product | undefined> {
    return simulateDelay(productsStore.find((p) => p.id === id));
  },

  async createProduct(data: CreateProductInput): Promise<Product> {
    const newProduct: Product = {
      id: productsStore.reduce((max, p) => Math.max(max, p.id), 0) + 1,
      name: data.name,
    };
    productsStore = [...productsStore, newProduct];
    return simulateDelay(newProduct);
  },

  async updateProduct(id: number, data: UpdateProductInput): Promise<Product | undefined> {
    productsStore = productsStore.map((p) => (p.id === id ? { ...p, name: data.name } : p));
    return simulateDelay(productsStore.find((p) => p.id === id));
  },

  async deleteProduct(id: number): Promise<void> {
    productsStore = productsStore.filter((p) => p.id !== id);
    return simulateDelay(undefined);
  },
};
