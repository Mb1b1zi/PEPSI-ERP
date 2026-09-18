/**
 * Admin Quantities (pack-size/quantity catalog — "500ml", "Crate-24", etc.). Endpoints
 * implemented here:
 *   POST /admin/quantities
 *   GET  /admin/quantities
 *   GET  /admin/quantities/{quantity_id}
 *
 * No update or delete endpoint exists on the real backend, same limitation as
 * productService.ts — only create + read, so no Edit/Delete UI on the Quantities page.
 *
 * POST takes an array (QuantityCreate[] in, QuantityRead[] out) — same batch-creation
 * convention as Depots/Products/Personnel/Roles/Auth Users. GET is paged, but this fetches one
 * large page (page_size 100) and returns a flat array, matching every existing caller's
 * expectation, same approach as productService.ts/depotLocationService.ts.
 *
 * catalogService.getQuantities() delegates here so an edit made through the Admin UI is
 * reflected in every Factory/Depot form selector that reads from there too.
 */
import { apiRequest } from '@/lib/apiClient';
import { apiConfig } from '@/lib/config';
import type { Quantity, CreateQuantityInput, QuantityDto, QuantityCreateDto } from '@/types/catalog';
import { mockQuantities } from '@/mock/catalog.mock';

function simulateDelay<T>(data: T, ms = 400): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(data), ms));
}

interface AdminPageDto<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
}

function toQuantity(dto: QuantityDto): Quantity {
  return { id: dto.id, value: dto.quantity };
}

let quantitiesStore: Quantity[] = [...mockQuantities];

export const quantityService = {
  async getQuantities(): Promise<Quantity[]> {
    if (apiConfig.useMockApi) {
      return simulateDelay(quantitiesStore);
    }
    const response = await apiRequest<AdminPageDto<QuantityDto>>('/admin/quantities?page=1&page_size=100');
    return response.items.map(toQuantity);
  },

  async getQuantityById(id: number): Promise<Quantity | undefined> {
    if (apiConfig.useMockApi) {
      return simulateDelay(quantitiesStore.find((q) => q.id === id));
    }
    const dto = await apiRequest<QuantityDto>(`/admin/quantities/${id}`);
    return toQuantity(dto);
  },

  async createQuantity(input: CreateQuantityInput): Promise<Quantity> {
    if (apiConfig.useMockApi) {
      const newQuantity: Quantity = {
        id: quantitiesStore.reduce((max, q) => Math.max(max, q.id), 0) + 1,
        value: input.value,
      };
      quantitiesStore = [...quantitiesStore, newQuantity];
      return simulateDelay(newQuantity);
    }
    const body: QuantityCreateDto[] = [{ quantity: input.value }];
    const dtos = await apiRequest<QuantityDto[]>('/admin/quantities', {
      method: 'POST',
      body: JSON.stringify(body),
    });
    return toQuantity(dtos[0]);
  },
};
