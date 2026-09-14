/**
 * Factory Module — Production only (docs/api/factory.md). Endpoints implemented here:
 *   POST   /factory/production
 *   GET    /factory/production
 *   PUT    /factory/production/{production_id}
 *   DELETE /factory/production/{production_id}
 *
 * GET /factory/production/{product_id} (per-product history) is documented but not needed
 * by the current UI, so it isn't implemented. Supply History and Factory Stock endpoints are
 * out of scope for this file — they get their own service work alongside those screens.
 *
 * Reference implementation for the "Module implementation pattern" in CLAUDE.md: maps every
 * Dto to a domain type before it leaves this file, normalises pagination to Paged<T>, and
 * switches between mock and real data on `apiConfig.useMockApi` — both branches return the
 * identical domain shape.
 */
import { apiRequest } from '@/lib/apiClient';
import { apiConfig } from '@/lib/config';
import { pagedFromFactoryList } from '@/lib/pagination';
import { buildQuery } from '@/lib/queryString';
import { mockProductionRecords } from '@/mock/factory.mock';
import { catalogService } from '@/services/catalogService';
import type { Paged } from '@/types/api';
import type {
  ProductionRecordDto,
  CreateProductionRequestDto,
  UpdateProductionRequestDto,
  ProductionRecord,
  CreateProductionInput,
  UpdateProductionInput,
} from '@/types/factory';

function simulateDelay<T>(data: T, ms = 400): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(data), ms));
}

function toProductionRecord(dto: ProductionRecordDto): ProductionRecord {
  return {
    id: dto.id,
    productId: dto.product_id,
    productName: dto.product_name,
    quantityProduced: dto.quantity_produced,
    productionDate: dto.production_date,
    createdDate: dto.created_date,
  };
}

/** A 409 on DELETE means the record's stock can't be safely reduced — distinct from a generic failure. */
export class ProductionDeleteConflictError extends Error {
  constructor() {
    super('This production record cannot be deleted: factory stock cannot be safely reduced by this amount.');
    this.name = 'ProductionDeleteConflictError';
  }
}

function isConflict(err: unknown): boolean {
  return typeof err === 'object' && err !== null && 'status' in err && (err as { status: unknown }).status === 409;
}

/** Documented max (docs/api/factory.md); also flagged as too small for a usable table page — docs/api/README.md open question 5. */
const MAX_LIMIT = 10;

export interface GetProductionHistoryParams {
  page: number;
  pageSize: number;
  date?: string;
  productId?: number;
  productName?: string;
  /**
   * Documented (docs/api/factory.md lists "quantity" among GET /factory/production's query
   * params) but its matching semantics are never elaborated, and Production has no
   * quantity_id/quantity_value concept the way Supply does. Forwarded to the real API
   * verbatim in real mode; not filtered against in mock mode since no UI control sets it.
   */
  quantity?: number;
}

let mockStore: ProductionRecord[] = [...mockProductionRecords];
let nextMockId = mockStore.reduce((max, r) => Math.max(max, r.id), 0) + 1;

/** Mock-only interpretation (not a claim about real backend semantics): exact-date-prefix match. */
function matchesMockFilters(record: ProductionRecord, params: GetProductionHistoryParams): boolean {
  if (params.productId !== undefined && record.productId !== params.productId) return false;
  if (params.productName) {
    const needle = params.productName.toLowerCase();
    if (!record.productName.toLowerCase().includes(needle)) return false;
  }
  if (params.date && !record.productionDate.startsWith(params.date)) return false;
  return true;
}

export const factoryService = {
  async getProductionHistory(params: GetProductionHistoryParams): Promise<Paged<ProductionRecord>> {
    const limit = Math.min(params.pageSize, MAX_LIMIT);
    const skip = (params.page - 1) * limit;

    if (apiConfig.useMockApi) {
      const filtered = mockStore.filter((r) => matchesMockFilters(r, params));
      const page = filtered.slice(skip, skip + limit);
      return simulateDelay(pagedFromFactoryList(page, { skip, limit }));
    }

    const query = buildQuery({
      skip,
      limit,
      date: params.date,
      product_id: params.productId,
      product_name: params.productName,
      quantity: params.quantity,
    });
    const dtos = await apiRequest<ProductionRecordDto[]>(`/factory/production${query}`);
    return pagedFromFactoryList(dtos.map(toProductionRecord), { skip, limit });
  },

  async createProduction(input: CreateProductionInput): Promise<ProductionRecord> {
    if (apiConfig.useMockApi) {
      const products = await catalogService.getProducts();
      const product = products.find((p) => p.id === input.productId);
      const now = new Date().toISOString();
      const record: ProductionRecord = {
        id: nextMockId++,
        productId: input.productId,
        productName: product?.name ?? `Product ${input.productId}`,
        quantityProduced: input.quantityProduced,
        productionDate: input.productionDate ?? now,
        createdDate: now,
      };
      mockStore = [record, ...mockStore];
      return simulateDelay(record);
    }

    const body: CreateProductionRequestDto = {
      product_id: input.productId,
      quantity_produced: input.quantityProduced,
      production_date: input.productionDate,
    };
    const dto = await apiRequest<ProductionRecordDto>('/factory/production', {
      method: 'POST',
      body: JSON.stringify(body),
    });
    return toProductionRecord(dto);
  },

  async updateProduction(id: number, input: UpdateProductionInput): Promise<ProductionRecord> {
    if (apiConfig.useMockApi) {
      const existing = mockStore.find((r) => r.id === id);
      if (!existing) {
        throw new Error('Production record not found.');
      }
      const products = await catalogService.getProducts();
      const product = products.find((p) => p.id === input.productId);
      const updated: ProductionRecord = {
        ...existing,
        productId: input.productId,
        productName: product?.name ?? `Product ${input.productId}`,
        quantityProduced: input.quantityProduced,
        productionDate: input.productionDate ?? existing.productionDate,
      };
      mockStore = mockStore.map((r) => (r.id === id ? updated : r));
      return simulateDelay(updated);
    }

    const body: UpdateProductionRequestDto = {
      product_id: input.productId,
      quantity_produced: input.quantityProduced,
      production_date: input.productionDate,
    };
    const dto = await apiRequest<ProductionRecordDto>(`/factory/production/${id}`, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
    return toProductionRecord(dto);
  },

  async deleteProduction(id: number): Promise<void> {
    if (apiConfig.useMockApi) {
      mockStore = mockStore.filter((r) => r.id !== id);
      return simulateDelay(undefined);
    }

    try {
      await apiRequest<void>(`/factory/production/${id}`, { method: 'DELETE' });
    } catch (err) {
      if (isConflict(err)) {
        throw new ProductionDeleteConflictError();
      }
      throw err;
    }
  },
};
