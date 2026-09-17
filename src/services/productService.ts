/**
 * Admin Products (product catalog). Endpoints implemented here:
 *   POST /admin/products
 *   GET  /admin/products
 *   GET  /admin/products/{product_id}
 *
 * No update or delete endpoint exists for products on the real backend (confirmed against
 * openapi.json and a live call, 2026-09-17) — so unlike depotLocationService.ts, there's no
 * updateProduct/deleteProduct here, and no Edit/Delete UI on the Products page either.
 *
 * POST takes an array (ProductCreate[] in, ProductRead[] out) — same batch-creation convention
 * as Depots/Personnel/Roles/Auth Users. GET is paged, but this fetches one large page
 * (page_size 100) and returns a flat array, matching every existing caller's expectation, same
 * approach as depotLocationService.ts/roleService.ts.
 *
 * catalogService.getProducts() delegates here so an edit made through the Admin UI is
 * reflected in every Factory/Depot form selector that reads from there too.
 */
import { apiRequest } from '@/lib/apiClient';
import { apiConfig } from '@/lib/config';
import type { Product, CreateProductInput, ProductDto, ProductCreateDto } from '@/types/catalog';
import { mockProducts } from '@/mock/catalog.mock';

function simulateDelay<T>(data: T, ms = 400): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(data), ms));
}

interface AdminPageDto<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
}

function toProduct(dto: ProductDto): Product {
  return { id: dto.id, name: dto.name };
}

let productsStore: Product[] = [...mockProducts];

export const productService = {
  async getProducts(): Promise<Product[]> {
    if (apiConfig.useMockApi) {
      return simulateDelay(productsStore);
    }
    const response = await apiRequest<AdminPageDto<ProductDto>>('/admin/products?page=1&page_size=100');
    return response.items.map(toProduct);
  },

  async getProductById(id: number): Promise<Product | undefined> {
    if (apiConfig.useMockApi) {
      return simulateDelay(productsStore.find((p) => p.id === id));
    }
    const dto = await apiRequest<ProductDto>(`/admin/products/${id}`);
    return toProduct(dto);
  },

  async createProduct(input: CreateProductInput): Promise<Product> {
    if (apiConfig.useMockApi) {
      const newProduct: Product = {
        id: productsStore.reduce((max, p) => Math.max(max, p.id), 0) + 1,
        name: input.name,
      };
      productsStore = [...productsStore, newProduct];
      return simulateDelay(newProduct);
    }
    const body: ProductCreateDto[] = [{ name: input.name }];
    const dtos = await apiRequest<ProductDto[]>('/admin/products', {
      method: 'POST',
      body: JSON.stringify(body),
    });
    return toProduct(dtos[0]);
  },
};
