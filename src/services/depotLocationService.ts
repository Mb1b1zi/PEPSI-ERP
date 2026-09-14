/**
 * Admin Depots (depot locations). No backend contract exists for this yet (see
 * docs/api/README.md open question 1) — mock-backed only, same pattern as userService.ts.
 * Not to be confused with depotService.ts (Depot Operations — restock/sales/stock, real-API
 * backed against docs/api/depot.md). This one owns the canonical mutable depot-locations
 * list; catalogService.getDepots() delegates here so an edit made through the Admin UI is
 * reflected in Factory/Depot form selectors too.
 */
import type { Depot, CreateDepotInput, UpdateDepotInput } from '@/types/catalog';
import { mockDepots } from '@/mock/catalog.mock';

function simulateDelay<T>(data: T, ms = 500): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(data), ms));
}

let depotsStore: Depot[] = [...mockDepots];

export const depotLocationService = {
  async getDepots(): Promise<Depot[]> {
    return simulateDelay(depotsStore);
  },

  async getDepotById(id: number): Promise<Depot | undefined> {
    return simulateDelay(depotsStore.find((d) => d.id === id));
  },

  async createDepot(data: CreateDepotInput): Promise<Depot> {
    const newDepot: Depot = {
      id: depotsStore.reduce((max, d) => Math.max(max, d.id), 0) + 1,
      name: data.name,
    };
    depotsStore = [...depotsStore, newDepot];
    return simulateDelay(newDepot);
  },

  async updateDepot(id: number, data: UpdateDepotInput): Promise<Depot | undefined> {
    depotsStore = depotsStore.map((d) => (d.id === id ? { ...d, name: data.name } : d));
    return simulateDelay(depotsStore.find((d) => d.id === id));
  },

  async deleteDepot(id: number): Promise<void> {
    depotsStore = depotsStore.filter((d) => d.id !== id);
    return simulateDelay(undefined);
  },
};
