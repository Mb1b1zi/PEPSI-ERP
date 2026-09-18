/**
 * Admin Quantities (pack-size/quantity catalog — "500ml", "Crate-24", etc.). Endpoints
 * implemented here:
 *   POST   /admin/quantities
 *   GET    /admin/quantities
 *   GET    /admin/quantities/{quantity_id}
 *   PUT    /admin/quantities/{quantity_id}
 *   DELETE /admin/quantities/{quantity_id}
 *
 * Update/delete were added to the backend after this module was first built (confirmed against
 * openapi.json, 2026-09-18 — originally there was only create + read, same as Products).
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
import type { Quantity, CreateQuantityInput, UpdateQuantityInput, QuantityDto, QuantityCreateDto } from '@/types/catalog';
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

  async updateQuantity(id: number, input: UpdateQuantityInput): Promise<Quantity | undefined> {
    if (apiConfig.useMockApi) {
      quantitiesStore = quantitiesStore.map((q) => (q.id === id ? { ...q, value: input.value } : q));
      return simulateDelay(quantitiesStore.find((q) => q.id === id));
    }
    const body: QuantityCreateDto = { quantity: input.value };
    const dto = await apiRequest<QuantityDto>(`/admin/quantities/${id}`, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
    return toQuantity(dto);
  },

  async deleteQuantity(id: number): Promise<void> {
    if (apiConfig.useMockApi) {
      quantitiesStore = quantitiesStore.filter((q) => q.id !== id);
      return simulateDelay(undefined);
    }
    return apiRequest<void>(`/admin/quantities/${id}`, { method: 'DELETE' });
  },
};
