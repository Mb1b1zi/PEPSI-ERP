/**
 * Factory Module (docs/api/factory.md). Every endpoint in this module is implemented here —
 * this is "the Factory Manager's own module" (all four actions on both factory.production and
 * factory.supplies are granted to that role):
 *   POST   /factory/production
 *   GET    /factory/production
 *   GET    /factory/production/{production_id}   -- see getProductionById
 *   PUT    /factory/production/{production_id}
 *   DELETE /factory/production/{production_id}
 *   POST   /factory/supplies
 *   GET    /factory/supplies
 *   GET    /factory/supplies/{supply_id}          -- see getSupplyById
 *   PUT    /factory/supplies/{supply_id}
 *   DELETE /factory/supplies/{supply_id}
 *   GET    /factory/stock
 *   GET    /factory/stock/{product_id}/{quantity_id}
 *
 * Note: factory.md (predates openapi.json, may have drifted — see docs/api/README.md) documents
 * the stock-by-id route as GET /factory/stock/{product_id} (one path param). The live spec's
 * real route takes two — {product_id}/{quantity_id} — confirmed against a real call. Per "the
 * spec wins" (docs/api/README.md), this file follows the live spec's shape, not factory.md's.
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
import { mockProductionRecords, mockSupplyRecords, mockFactoryStock } from '@/mock/factory.mock';
import { catalogService } from '@/services/catalogService';
import type { Paged } from '@/types/api';
import type {
  ProductionRecordDto,
  CreateProductionRequestDto,
  UpdateProductionRequestDto,
  ProductionRecord,
  CreateProductionInput,
  UpdateProductionInput,
  SupplyHistoryDto,
  CreateSupplyRequestDto,
  UpdateSupplyRequestDto,
  SupplyRecord,
  CreateSupplyInput,
  UpdateSupplyInput,
  FactoryCurrentStockDto,
  FactoryStockItem,
} from '@/types/factory';

function simulateDelay<T>(data: T, ms = 400): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(data), ms));
}

function toProductionRecord(dto: ProductionRecordDto): ProductionRecord {
  return {
    id: dto.id,
    productId: dto.product_id,
    productName: dto.product_name,
    quantityId: dto.quantity_id,
    quantityValue: dto.quantity_value,
    quantityProduced: dto.quantity_produced,
    productionDate: dto.production_date,
    createdDate: dto.created_date,
  };
}

function toSupplyRecord(dto: SupplyHistoryDto): SupplyRecord {
  return {
    id: dto.id,
    productId: dto.product_id,
    quantityId: dto.quantity_id,
    amount: dto.amount,
    productName: dto.product_name,
    quantityValue: dto.quantity_value,
    depotId: dto.depot_id,
    depotName: dto.depot_name,
    supplierId: dto.supplier_id,
    supplierName: dto.supplier_name,
    status: dto.status,
    rejectionReason: dto.rejection_reason,
    createdDate: dto.created_date,
  };
}

function toFactoryStockItem(dto: FactoryCurrentStockDto): FactoryStockItem {
  return {
    id: dto.id,
    productId: dto.product_id,
    productName: dto.product_name,
    quantityId: dto.quantity_id,
    quantityValue: dto.quantity_value,
    availableQuantity: dto.available_quantity,
    updatedDate: dto.updated_date,
  };
}

/** A 409 on DELETE means the record's stock can't be safely reduced — distinct from a generic failure. */
export class ProductionDeleteConflictError extends Error {
  constructor() {
    super('This production record cannot be deleted: factory stock cannot be safely reduced by this amount.');
    this.name = 'ProductionDeleteConflictError';
  }
}

/** A 409 on POST /factory/supplies means available factory stock is less than the requested amount. */
export class InsufficientFactoryStockError extends Error {
  constructor() {
    super('Not enough factory stock available to dispatch this supply.');
    this.name = 'InsufficientFactoryStockError';
  }
}

function isConflict(err: unknown): boolean {
  return typeof err === 'object' && err !== null && 'status' in err && (err as { status: unknown }).status === 409;
}

function isNotFound(err: unknown): boolean {
  return typeof err === 'object' && err !== null && 'status' in err && (err as { status: unknown }).status === 404;
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

export interface GetSupplyHistoryParams {
  page: number;
  pageSize: number;
  date?: string;
  productId?: number;
  productName?: string;
  quantity?: number;
  depotId?: number;
}

let mockStore: ProductionRecord[] = [...mockProductionRecords];
let nextMockId = mockStore.reduce((max, r) => Math.max(max, r.id), 0) + 1;

let mockSupplyStore: SupplyRecord[] = [...mockSupplyRecords];
let nextMockSupplyId = mockSupplyStore.reduce((max, s) => Math.max(max, s.id), 0) + 1;

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

/** Same mock-only interpretation as production filtering above. */
function matchesMockSupplyFilters(record: SupplyRecord, params: GetSupplyHistoryParams): boolean {
  if (params.productId !== undefined && record.productId !== params.productId) return false;
  if (params.depotId !== undefined && record.depotId !== params.depotId) return false;
  if (params.productName) {
    const needle = params.productName.toLowerCase();
    if (!record.productName.toLowerCase().includes(needle)) return false;
  }
  if (params.date && !record.createdDate.startsWith(params.date)) return false;
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

  /** GET /factory/production/{production_id} — a single production record by its own id. Used
   *  by ProductionFormPage's edit mode so a direct URL/refresh still loads the record, instead
   *  of depending on state passed from the list page. */
  async getProductionById(id: number): Promise<ProductionRecord> {
    if (apiConfig.useMockApi) {
      const record = mockStore.find((r) => r.id === id);
      if (!record) throw new Error('Production record not found.');
      return simulateDelay(record);
    }
    const dto = await apiRequest<ProductionRecordDto>(`/factory/production/${id}`);
    return toProductionRecord(dto);
  },

  async createProduction(input: CreateProductionInput): Promise<ProductionRecord> {
    if (apiConfig.useMockApi) {
      const products = await catalogService.getProducts();
      const quantities = await catalogService.getQuantities();
      const product = products.find((p) => p.id === input.productId);
      const quantity = quantities.find((q) => q.id === input.quantityId);
      const now = new Date().toISOString();
      const record: ProductionRecord = {
        id: nextMockId++,
        productId: input.productId,
        productName: product?.name ?? `Product ${input.productId}`,
        quantityId: input.quantityId,
        quantityValue: quantity?.value ?? `Quantity ${input.quantityId}`,
        quantityProduced: input.quantityProduced,
        productionDate: input.productionDate ?? now,
        createdDate: now,
      };
      mockStore = [record, ...mockStore];
      return simulateDelay(record);
    }

    // POST /factory/production takes an array (ProductionCreate[] in, ProductionResponse[] out)
    // — same batch-creation convention as every Admin resource (confirmed against openapi.json,
    // 2026-09-18; this endpoint used to take a single object, and quantity_id used to not exist
    // on it at all).
    const body: CreateProductionRequestDto[] = [
      {
        product_id: input.productId,
        quantity_id: input.quantityId,
        quantity_produced: input.quantityProduced,
        production_date: input.productionDate,
      },
    ];
    const dtos = await apiRequest<ProductionRecordDto[]>('/factory/production', {
      method: 'POST',
      body: JSON.stringify(body),
    });
    return toProductionRecord(dtos[0]);
  },

  async updateProduction(id: number, input: UpdateProductionInput): Promise<ProductionRecord> {
    if (apiConfig.useMockApi) {
      const existing = mockStore.find((r) => r.id === id);
      if (!existing) {
        throw new Error('Production record not found.');
      }
      const products = await catalogService.getProducts();
      const quantities = await catalogService.getQuantities();
      const product = products.find((p) => p.id === input.productId);
      const quantity = quantities.find((q) => q.id === input.quantityId);
      const updated: ProductionRecord = {
        ...existing,
        productId: input.productId,
        productName: product?.name ?? `Product ${input.productId}`,
        quantityId: input.quantityId,
        quantityValue: quantity?.value ?? `Quantity ${input.quantityId}`,
        quantityProduced: input.quantityProduced,
        productionDate: input.productionDate ?? existing.productionDate,
      };
      mockStore = mockStore.map((r) => (r.id === id ? updated : r));
      return simulateDelay(updated);
    }

    const body: UpdateProductionRequestDto = {
      product_id: input.productId,
      quantity_id: input.quantityId,
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

  async getSupplyHistory(params: GetSupplyHistoryParams): Promise<Paged<SupplyRecord>> {
    const limit = Math.min(params.pageSize, MAX_LIMIT);
    const skip = (params.page - 1) * limit;

    if (apiConfig.useMockApi) {
      const filtered = mockSupplyStore.filter((s) => matchesMockSupplyFilters(s, params));
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
      depot_id: params.depotId,
    });
    const dtos = await apiRequest<SupplyHistoryDto[]>(`/factory/supplies${query}`);
    return pagedFromFactoryList(dtos.map(toSupplyRecord), { skip, limit });
  },

  /**
   * GET /factory/supplies/{supply_id} — a single supply by its own id. Confirmed against
   * openapi.json (docs/api/README.md open question 9, resolved): the response is one
   * SupplyResponse, not an array — factory.md's "all supplies for a product" prose was
   * wrong or stale. Not consumed by any page yet; kept for API completeness.
   */
  async getSupplyById(id: number): Promise<SupplyRecord> {
    if (apiConfig.useMockApi) {
      const record = mockSupplyStore.find((s) => s.id === id);
      if (!record) throw new Error('Supply record not found.');
      return simulateDelay(record);
    }
    const dto = await apiRequest<SupplyHistoryDto>(`/factory/supplies/${id}`);
    return toSupplyRecord(dto);
  },

  async createSupply(input: CreateSupplyInput): Promise<SupplyRecord> {
    if (apiConfig.useMockApi) {
      const products = await catalogService.getProducts();
      const quantities = await catalogService.getQuantities();
      const depots = await catalogService.getDepots();
      const product = products.find((p) => p.id === input.productId);
      const quantity = quantities.find((q) => q.id === input.quantityId);
      const depot = depots.find((d) => d.id === input.depotId);
      const record: SupplyRecord = {
        id: nextMockSupplyId++,
        productId: input.productId,
        quantityId: input.quantityId,
        amount: input.amount,
        productName: product?.name ?? `Product ${input.productId}`,
        quantityValue: quantity?.value ?? `Quantity ${input.quantityId}`,
        depotId: input.depotId,
        depotName: depot?.name ?? `Depot ${input.depotId}`,
        supplierId: input.supplierId,
        supplierName: null,
        status: 'pending',
        rejectionReason: null,
        createdDate: new Date().toISOString(),
      };
      mockSupplyStore = [record, ...mockSupplyStore];
      return simulateDelay(record);
    }

    // POST /factory/supplies takes an array too (same convention as production above).
    const body: CreateSupplyRequestDto[] = [
      {
        product_id: input.productId,
        quantity_id: input.quantityId,
        amount: input.amount,
        depot_id: input.depotId,
        supplier_id: input.supplierId,
      },
    ];
    try {
      const dtos = await apiRequest<SupplyHistoryDto[]>('/factory/supplies', {
        method: 'POST',
        body: JSON.stringify(body),
      });
      return toSupplyRecord(dtos[0]);
    } catch (err) {
      if (isConflict(err)) {
        throw new InsufficientFactoryStockError();
      }
      throw err;
    }
  },

  async updateSupply(id: number, input: UpdateSupplyInput): Promise<SupplyRecord> {
    if (input.status === 'rejected' && !input.rejectionReason?.trim()) {
      throw new Error('A rejection reason is required when rejecting a supply.');
    }

    if (apiConfig.useMockApi) {
      const existing = mockSupplyStore.find((s) => s.id === id);
      if (!existing) {
        throw new Error('Supply record not found.');
      }
      const updated: SupplyRecord = {
        ...existing,
        status: input.status,
        rejectionReason: input.status === 'rejected' ? (input.rejectionReason ?? null) : null,
      };
      mockSupplyStore = mockSupplyStore.map((s) => (s.id === id ? updated : s));
      return simulateDelay(updated);
    }

    const body: UpdateSupplyRequestDto = {
      status: input.status,
      rejection_reason: input.rejectionReason,
    };
    const dto = await apiRequest<SupplyHistoryDto>(`/factory/supplies/${id}`, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
    return toSupplyRecord(dto);
  },

  async deleteSupply(id: number): Promise<void> {
    if (apiConfig.useMockApi) {
      mockSupplyStore = mockSupplyStore.filter((s) => s.id !== id);
      return simulateDelay(undefined);
    }
    return apiRequest<void>(`/factory/supplies/${id}`, { method: 'DELETE' });
  },

  async getFactoryStock(): Promise<FactoryStockItem[]> {
    if (apiConfig.useMockApi) {
      return simulateDelay(mockFactoryStock);
    }
    const dtos = await apiRequest<FactoryCurrentStockDto[]>('/factory/stock');
    return dtos.map(toFactoryStockItem);
  },

  /**
   * GET /factory/stock/{product_id}/{quantity_id} — returns null on the documented 404 (no
   * stock row yet). Two path params, not one: factory.md (stale, predates openapi.json) only
   * documents GET /factory/stock/{product_id}; the live spec's real route requires quantity_id
   * too. Since stock isn't currently tracked per pack-size (quantity_id is always null on every
   * live row today — see FactoryCurrentStockDto), this only matches a row once the backend
   * starts populating quantity_id; querying by product alone isn't possible against the real
   * API, unlike the list endpoint above.
   */
  async getFactoryStockByProduct(productId: number, quantityId: number): Promise<FactoryStockItem | null> {
    if (apiConfig.useMockApi) {
      const item = mockFactoryStock.find((s) => s.productId === productId && s.quantityId === quantityId);
      return simulateDelay(item ?? null);
    }
    try {
      const dto = await apiRequest<FactoryCurrentStockDto>(`/factory/stock/${productId}/${quantityId}`);
      return toFactoryStockItem(dto);
    } catch (err) {
      if (isNotFound(err)) {
        return null;
      }
      throw err;
    }
  },
};
