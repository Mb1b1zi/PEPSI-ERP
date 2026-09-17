/**
 * Admin Depots (depot locations). Endpoints implemented here:
 *   POST   /admin/depots
 *   GET    /admin/depots
 *   GET    /admin/depots/{depot_id}
 *   PUT    /admin/depots/{depot_id}
 *   DELETE /admin/depots/{depot_id}
 *
 * Not to be confused with depotService.ts (Depot Operations — restock/sales/stock, backed
 * against docs/api/depot.md). This one owns the canonical mutable depot-locations list;
 * catalogService.getDepots() delegates here so an edit made through the Admin UI is reflected
 * in every Factory/Depot form selector that reads from here — one canonical store per resource,
 * not a second copy.
 *
 * POST takes an array (openapi.json: DepotCreate[] in, DepotRead[] out) — same batch-creation
 * convention as Admin Personnel/Roles and Auth Users. GET is paged ({items, total, page,
 * page_size}, no total_pages — see docs/api/README.md open question 10), but this service
 * fetches one large page (page_size 100) and returns a flat array, matching every existing
 * caller's expectation (dropdowns, tables) — same approach as roleService.ts.
 */
import { apiRequest } from '@/lib/apiClient';
import { apiConfig } from '@/lib/config';
import type { Depot, CreateDepotInput, UpdateDepotInput, DepotDto, DepotCreateDto } from '@/types/catalog';
import { mockDepots } from '@/mock/catalog.mock';

function simulateDelay<T>(data: T, ms = 400): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(data), ms));
}

interface AdminPageDto<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
}

function toDepot(dto: DepotDto): Depot {
  return { id: dto.id, name: dto.name, location: dto.location };
}

function toDepotCreateBody(input: CreateDepotInput): DepotCreateDto {
  return { name: input.name, location: input.location };
}

let depotsStore: Depot[] = [...mockDepots];

export const depotLocationService = {
  async getDepots(): Promise<Depot[]> {
    if (apiConfig.useMockApi) {
      return simulateDelay(depotsStore);
    }
    const response = await apiRequest<AdminPageDto<DepotDto>>('/admin/depots?page=1&page_size=100');
    return response.items.map(toDepot);
  },

  async getDepotById(id: number): Promise<Depot | undefined> {
    if (apiConfig.useMockApi) {
      return simulateDelay(depotsStore.find((d) => d.id === id));
    }
    const dto = await apiRequest<DepotDto>(`/admin/depots/${id}`);
    return toDepot(dto);
  },

  async createDepot(input: CreateDepotInput): Promise<Depot> {
    if (apiConfig.useMockApi) {
      const newDepot: Depot = {
        id: depotsStore.reduce((max, d) => Math.max(max, d.id), 0) + 1,
        name: input.name,
        location: input.location,
      };
      depotsStore = [...depotsStore, newDepot];
      return simulateDelay(newDepot);
    }
    const body: DepotCreateDto[] = [toDepotCreateBody(input)];
    const dtos = await apiRequest<DepotDto[]>('/admin/depots', {
      method: 'POST',
      body: JSON.stringify(body),
    });
    return toDepot(dtos[0]);
  },

  async updateDepot(id: number, input: UpdateDepotInput): Promise<Depot | undefined> {
    if (apiConfig.useMockApi) {
      depotsStore = depotsStore.map((d) => (d.id === id ? { ...d, name: input.name, location: input.location } : d));
      return simulateDelay(depotsStore.find((d) => d.id === id));
    }
    const dto = await apiRequest<DepotDto>(`/admin/depots/${id}`, {
      method: 'PUT',
      body: JSON.stringify(toDepotCreateBody(input)),
    });
    return toDepot(dto);
  },

  async deleteDepot(id: number): Promise<void> {
    if (apiConfig.useMockApi) {
      depotsStore = depotsStore.filter((d) => d.id !== id);
      return simulateDelay(undefined);
    }
    return apiRequest<void>(`/admin/depots/${id}`, { method: 'DELETE' });
  },
};
