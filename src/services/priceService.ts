/**
 * Admin Prices. Endpoints implemented here:
 *   POST   /admin/prices
 *   GET    /admin/prices
 *   GET    /admin/prices/{quantity_id}
 *   PUT    /admin/prices/{quantity_id}
 *   DELETE /admin/prices/{quantity_id}
 *
 * Addressed by quantity_id, not a separate price id (see types/price.ts) — one price per
 * quantity. POST takes an array (PriceCreate[] in, PriceRead[] out), same batch-creation
 * convention as every other Admin catalog resource. GET is paged, but this fetches one large
 * page (page_size 100) and returns a flat array, same approach as depotLocationService.ts /
 * productService.ts / quantityService.ts.
 */
import { apiRequest } from '@/lib/apiClient';
import { apiConfig } from '@/lib/config';
import type { Price, CreatePriceInput, UpdatePriceInput, PriceDto, PriceCreateDto, PriceUpdateDto } from '@/types/price';
import { mockPrices } from '@/mock/prices.mock';

function simulateDelay<T>(data: T, ms = 400): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(data), ms));
}

interface AdminPageDto<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
}

function toPrice(dto: PriceDto): Price {
  return { id: dto.id, quantityId: dto.quantity_id, amount: dto.amount };
}

let pricesStore: Price[] = [...mockPrices];

export const priceService = {
  async getPrices(): Promise<Price[]> {
    if (apiConfig.useMockApi) {
      return simulateDelay(pricesStore);
    }
    const response = await apiRequest<AdminPageDto<PriceDto>>('/admin/prices?page=1&page_size=100');
    return response.items.map(toPrice);
  },

  async getPriceByQuantityId(quantityId: number): Promise<Price | undefined> {
    if (apiConfig.useMockApi) {
      return simulateDelay(pricesStore.find((p) => p.quantityId === quantityId));
    }
    const dto = await apiRequest<PriceDto>(`/admin/prices/${quantityId}`);
    return toPrice(dto);
  },

  async createPrice(input: CreatePriceInput): Promise<Price> {
    if (apiConfig.useMockApi) {
      const newPrice: Price = {
        id: pricesStore.reduce((max, p) => Math.max(max, p.id), 0) + 1,
        quantityId: input.quantityId,
        amount: input.amount,
      };
      pricesStore = [...pricesStore, newPrice];
      return simulateDelay(newPrice);
    }
    const body: PriceCreateDto[] = [{ quantity_id: input.quantityId, amount: input.amount }];
    const dtos = await apiRequest<PriceDto[]>('/admin/prices', {
      method: 'POST',
      body: JSON.stringify(body),
    });
    return toPrice(dtos[0]);
  },

  async updatePrice(quantityId: number, input: UpdatePriceInput): Promise<Price | undefined> {
    if (apiConfig.useMockApi) {
      pricesStore = pricesStore.map((p) => (p.quantityId === quantityId ? { ...p, amount: input.amount } : p));
      return simulateDelay(pricesStore.find((p) => p.quantityId === quantityId));
    }
    const body: PriceUpdateDto = { amount: input.amount };
    const dto = await apiRequest<PriceDto>(`/admin/prices/${quantityId}`, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
    return toPrice(dto);
  },

  async deletePrice(quantityId: number): Promise<void> {
    if (apiConfig.useMockApi) {
      pricesStore = pricesStore.filter((p) => p.quantityId !== quantityId);
      return simulateDelay(undefined);
    }
    return apiRequest<void>(`/admin/prices/${quantityId}`, { method: 'DELETE' });
  },
};
