/**
 * Depot Module (docs/api/depot.md). Endpoints implemented here:
 *   POST   /depot/restock/{supply_history_id}/confirm
 *   POST   /depot/restock/{supply_history_id}/reject
 *   GET    /depot/restock
 *   GET    /depot/restock/{entry_id}
 *   PUT    /depot/restock/{entry_id}
 *   DELETE /depot/restock/{entry_id}
 *   GET    /depot/stock
 *   POST   /depot/sales
 *   GET    /depot/sales
 *   GET    /depot/sales/{sale_id}
 *   PUT    /depot/sales/{sale_id}
 *   DELETE /depot/sales/{sale_id}
 *   GET    /depot/sales-current
 *
 * Reference pattern: see "Module implementation pattern" in CLAUDE.md. Maps every Dto to a
 * domain type before it leaves this file, normalises pagination to Paged<T>, and switches
 * between mock and real data on `apiConfig.useMockApi` — both branches return the identical
 * domain shape.
 */
import { apiRequest } from '@/lib/apiClient';
import { apiConfig } from '@/lib/config';
import { pagedFromDepotResponse } from '@/lib/pagination';
import { buildQuery } from '@/lib/queryString';
import { mockRestockEntries, mockSaleRecords, mockDepotStock, mockCurrentSales, mockUnitPrices } from '@/mock/depot.mock';
import { catalogService } from '@/services/catalogService';
import type { Paged } from '@/types/api';
import type {
  RestockEntryDto,
  RestockListResponseDto,
  ConfirmRestockRequestDto,
  RejectRestockRequestDto,
  UpdateRestockRequestDto,
  DepotCurrentStockDto,
  SaleDto,
  SaleListResponseDto,
  CreateSaleRequestDto,
  UpdateSaleRequestDto,
  SalesCurrentEntryDto,
} from '@/types/depot';
import type { RestockEntry, ConfirmRestockInput, RejectRestockInput, UpdateRestockInput } from '@/types/restock';
import type { SaleRecord, CreateSaleInput, UpdateSaleInput, CurrentSaleEntry } from '@/types/sale';
import type { DepotStockItem } from '@/types/depotStock';

function simulateDelay<T>(data: T, ms = 400): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(data), ms));
}

/** Docs cap page_size at 100 (docs/api/depot.md, "Pagination and filtering"). */
const MAX_PAGE_SIZE = 100;

export interface ListRestockParams {
  page: number;
  pageSize: number;
  status?: 'confirmed' | 'rejected';
  depotId?: number;
  productName?: string;
  quantity?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface ListSalesParams {
  page: number;
  pageSize: number;
  depotId?: number;
  productName?: string;
  quantity?: string;
  dateFrom?: string;
  dateTo?: string;
}

function toRestockEntry(dto: RestockEntryDto): RestockEntry {
  return {
    id: dto.id,
    supplyHistoryId: dto.supply_history_id,
    depotId: dto.depot_id,
    depotName: dto.depot_name,
    productId: dto.product_id,
    productName: dto.product_name,
    quantityId: dto.quantity_id,
    quantityValue: dto.quantity_value,
    quantityDelivered: dto.quantity_delivered,
    supplierId: dto.supplier_id,
    confirmedById: dto.confirmed_by_id,
    status: dto.status,
    rejectionReason: dto.rejection_reason,
    restockDate: dto.restock_date,
  };
}

function toSaleRecord(dto: SaleDto): SaleRecord {
  return {
    id: dto.id,
    depotId: dto.depot_id,
    depotName: dto.depot_name,
    productId: dto.product_id,
    productName: dto.product_name,
    quantityId: dto.quantity_id,
    quantityValue: dto.quantity_value,
    quantitySold: dto.quantity_sold,
    soldAmount: dto.amount_sold,
    soldById: dto.sold_by_id,
    saleDate: dto.sale_date,
    saleTime: dto.sale_time,
  };
}

function toDepotStockItem(dto: DepotCurrentStockDto): DepotStockItem {
  return {
    id: dto.id,
    depotId: dto.depot_id,
    depotName: dto.depot_name,
    productId: dto.product_id,
    productName: dto.product_name,
    quantityId: dto.quantity_id,
    quantityValue: dto.quantity_value,
    currentAmount: dto.current_amount,
    updatedAt: dto.updated_at,
  };
}

function toCurrentSaleEntry(dto: SalesCurrentEntryDto): CurrentSaleEntry {
  return {
    id: dto.id,
    depotId: dto.depot_id,
    depotName: dto.depot_name,
    productId: dto.product_id,
    productName: dto.product_name,
    quantityId: dto.quantity_id,
    quantityValue: dto.quantity_value,
    saleDate: dto.sale_date,
    quantitySold: dto.quantity_sold,
    soldAmount: dto.sold_amount,
  };
}

/** A 409 on POST /depot/sales means not enough stock at that depot for the requested sale. */
export class InsufficientDepotStockError extends Error {
  constructor() {
    super('Not enough stock at this depot for the requested sale.');
    this.name = 'InsufficientDepotStockError';
  }
}

function isConflict(err: unknown): boolean {
  return typeof err === 'object' && err !== null && 'status' in err && (err as { status: unknown }).status === 409;
}

let mockRestockStore: RestockEntry[] = [...mockRestockEntries];
let nextMockRestockId = mockRestockStore.reduce((max, r) => Math.max(max, r.id), 0) + 1;

let mockSaleStore: SaleRecord[] = [...mockSaleRecords];
let nextMockSaleId = mockSaleStore.reduce((max, s) => Math.max(max, s.id), 0) + 1;

/** Mock-only interpretation (not a claim about real backend semantics). */
function matchesMockRestockFilters(record: RestockEntry, params: ListRestockParams): boolean {
  if (params.status && record.status !== params.status) return false;
  if (params.depotId !== undefined && record.depotId !== params.depotId) return false;
  if (params.productName) {
    const needle = params.productName.toLowerCase();
    if (!record.productName.toLowerCase().includes(needle)) return false;
  }
  if (params.quantity) {
    const needle = params.quantity.toLowerCase();
    if (!record.quantityValue.toLowerCase().includes(needle)) return false;
  }
  if (params.dateFrom && record.restockDate < params.dateFrom) return false;
  if (params.dateTo && record.restockDate > params.dateTo) return false;
  return true;
}

function matchesMockSaleFilters(record: SaleRecord, params: ListSalesParams): boolean {
  if (params.depotId !== undefined && record.depotId !== params.depotId) return false;
  if (params.productName) {
    const needle = params.productName.toLowerCase();
    if (!record.productName.toLowerCase().includes(needle)) return false;
  }
  if (params.quantity) {
    const needle = params.quantity.toLowerCase();
    if (!record.quantityValue.toLowerCase().includes(needle)) return false;
  }
  if (params.dateFrom && record.saleDate < params.dateFrom) return false;
  if (params.dateTo && record.saleDate > params.dateTo) return false;
  return true;
}

/** Builds a mock Paged<T> page the same way the real DepotPagedResponse shape would. */
function mockPage<T>(items: T[], page: number, pageSize: number): Paged<T> {
  const total = items.length;
  const start = (page - 1) * pageSize;
  return {
    items: items.slice(start, start + pageSize),
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

export const depotService = {
  async listRestock(params: ListRestockParams): Promise<Paged<RestockEntry>> {
    const pageSize = Math.min(params.pageSize, MAX_PAGE_SIZE);

    if (apiConfig.useMockApi) {
      const filtered = mockRestockStore.filter((r) => matchesMockRestockFilters(r, params));
      return simulateDelay(mockPage(filtered, params.page, pageSize));
    }

    const query = buildQuery({
      page: params.page,
      page_size: pageSize,
      status: params.status,
      depot_id: params.depotId,
      product_name: params.productName,
      quantity: params.quantity,
      date_from: params.dateFrom,
      date_to: params.dateTo,
    });
    const response = await apiRequest<RestockListResponseDto>(`/depot/restock${query}`);
    return pagedFromDepotResponse({ ...response, items: response.items.map(toRestockEntry) });
  },

  /**
   * Mock mode always confirms/rejects with the requested outcome — it doesn't simulate the
   * real backend's "quantity mismatch auto-rejects a confirm" rule, since that depends on
   * knowing what Factory actually dispatched for a given supply_history_id, which isn't
   * modelled in this module's mock data.
   */
  async confirmRestock(supplyHistoryId: number, input: ConfirmRestockInput): Promise<RestockEntry> {
    if (apiConfig.useMockApi) {
      const depots = await catalogService.getDepots();
      const depot = depots.find((d) => d.id === input.depotId);
      const entry: RestockEntry = {
        id: nextMockRestockId++,
        supplyHistoryId,
        depotId: input.depotId,
        depotName: depot?.name ?? `Depot ${input.depotId}`,
        productId: 0,
        productName: 'Unknown product',
        quantityId: 0,
        quantityValue: '',
        quantityDelivered: input.quantityReceived,
        supplierId: input.supplierId ?? null,
        confirmedById: input.confirmedById ?? null,
        status: 'confirmed',
        rejectionReason: null,
        restockDate: new Date().toISOString(),
      };
      mockRestockStore = [entry, ...mockRestockStore];
      return simulateDelay(entry);
    }

    const body: ConfirmRestockRequestDto = {
      depot_id: input.depotId,
      quantity_received: input.quantityReceived,
      supplier_id: input.supplierId,
      confirmed_by_id: input.confirmedById,
    };
    const dto = await apiRequest<RestockEntryDto>(`/depot/restock/${supplyHistoryId}/confirm`, {
      method: 'POST',
      body: JSON.stringify(body),
    });
    return toRestockEntry(dto);
  },

  async rejectRestock(supplyHistoryId: number, input: RejectRestockInput): Promise<RestockEntry> {
    if (apiConfig.useMockApi) {
      const depots = await catalogService.getDepots();
      const depot = depots.find((d) => d.id === input.depotId);
      const entry: RestockEntry = {
        id: nextMockRestockId++,
        supplyHistoryId,
        depotId: input.depotId,
        depotName: depot?.name ?? `Depot ${input.depotId}`,
        productId: 0,
        productName: 'Unknown product',
        quantityId: 0,
        quantityValue: '',
        quantityDelivered: input.quantityReceived ?? 0,
        supplierId: input.supplierId ?? null,
        confirmedById: input.confirmedById ?? null,
        status: 'rejected',
        rejectionReason: input.reason,
        restockDate: new Date().toISOString(),
      };
      mockRestockStore = [entry, ...mockRestockStore];
      return simulateDelay(entry);
    }

    const body: RejectRestockRequestDto = {
      depot_id: input.depotId,
      reason: input.reason,
      confirmed_by_id: input.confirmedById,
      quantity_received: input.quantityReceived,
      supplier_id: input.supplierId,
    };
    const dto = await apiRequest<RestockEntryDto>(`/depot/restock/${supplyHistoryId}/reject`, {
      method: 'POST',
      body: JSON.stringify(body),
    });
    return toRestockEntry(dto);
  },

  async getRestockById(id: number): Promise<RestockEntry> {
    if (apiConfig.useMockApi) {
      const entry = mockRestockStore.find((r) => r.id === id);
      if (!entry) throw new Error('Restock entry not found.');
      return simulateDelay(entry);
    }
    const dto = await apiRequest<RestockEntryDto>(`/depot/restock/${id}`);
    return toRestockEntry(dto);
  },

  async updateRestock(id: number, input: UpdateRestockInput): Promise<RestockEntry> {
    if (apiConfig.useMockApi) {
      const existing = mockRestockStore.find((r) => r.id === id);
      if (!existing) throw new Error('Restock entry not found.');
      const updated: RestockEntry = { ...existing, quantityDelivered: input.quantityDelivered };
      mockRestockStore = mockRestockStore.map((r) => (r.id === id ? updated : r));
      return simulateDelay(updated);
    }

    const body: UpdateRestockRequestDto = { quantity_delivered: input.quantityDelivered };
    const dto = await apiRequest<RestockEntryDto>(`/depot/restock/${id}`, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
    return toRestockEntry(dto);
  },

  async deleteRestock(id: number): Promise<void> {
    if (apiConfig.useMockApi) {
      mockRestockStore = mockRestockStore.filter((r) => r.id !== id);
      return simulateDelay(undefined);
    }
    return apiRequest<void>(`/depot/restock/${id}`, { method: 'DELETE' });
  },

  async getStock(depotId?: number): Promise<DepotStockItem[]> {
    if (apiConfig.useMockApi) {
      const items = depotId === undefined ? mockDepotStock : mockDepotStock.filter((s) => s.depotId === depotId);
      return simulateDelay(items);
    }
    const query = buildQuery({ depot_id: depotId });
    const dtos = await apiRequest<DepotCurrentStockDto[]>(`/depot/stock${query}`);
    return dtos.map(toDepotStockItem);
  },

  async listSales(params: ListSalesParams): Promise<Paged<SaleRecord>> {
    const pageSize = Math.min(params.pageSize, MAX_PAGE_SIZE);

    if (apiConfig.useMockApi) {
      const filtered = mockSaleStore.filter((s) => matchesMockSaleFilters(s, params));
      return simulateDelay(mockPage(filtered, params.page, pageSize));
    }

    const query = buildQuery({
      page: params.page,
      page_size: pageSize,
      depot_id: params.depotId,
      product_name: params.productName,
      quantity: params.quantity,
      date_from: params.dateFrom,
      date_to: params.dateTo,
    });
    const response = await apiRequest<SaleListResponseDto>(`/depot/sales${query}`);
    return pagedFromDepotResponse({ ...response, items: response.items.map(toSaleRecord) });
  },

  async createSale(input: CreateSaleInput): Promise<SaleRecord> {
    if (apiConfig.useMockApi) {
      const [depots, products, quantities] = await Promise.all([
        catalogService.getDepots(),
        catalogService.getProducts(),
        catalogService.getQuantities(),
      ]);
      const depot = depots.find((d) => d.id === input.depotId);
      const product = products.find((p) => p.id === input.productId);
      const quantity = quantities.find((q) => q.id === input.quantityId);
      const now = new Date();
      const record: SaleRecord = {
        id: nextMockSaleId++,
        depotId: input.depotId,
        depotName: depot?.name ?? `Depot ${input.depotId}`,
        productId: input.productId,
        productName: product?.name ?? `Product ${input.productId}`,
        quantityId: input.quantityId,
        quantityValue: quantity?.value ?? `Quantity ${input.quantityId}`,
        quantitySold: input.quantitySold,
        soldAmount: input.amountSold ?? (mockUnitPrices[input.productId] ?? 0) * input.quantitySold,
        soldById: input.soldById ?? null,
        saleDate: now.toISOString().slice(0, 10),
        saleTime: now.toISOString().slice(11, 19),
      };
      mockSaleStore = [record, ...mockSaleStore];
      return simulateDelay(record);
    }

    // POST /depot/sales takes an array too (same batch-creation convention as every Admin
    // resource and /factory/production, /factory/supplies — confirmed against openapi.json,
    // 2026-09-18; this endpoint used to take a single object).
    const body: CreateSaleRequestDto[] = [
      {
        depot_id: input.depotId,
        product_id: input.productId,
        quantity_id: input.quantityId,
        quantity_sold: input.quantitySold,
        sold_by_id: input.soldById,
        amount_sold: input.amountSold,
      },
    ];
    try {
      const dtos = await apiRequest<SaleDto[]>('/depot/sales', {
        method: 'POST',
        body: JSON.stringify(body),
      });
      return toSaleRecord(dtos[0]);
    } catch (err) {
      if (isConflict(err)) {
        throw new InsufficientDepotStockError();
      }
      throw err;
    }
  },

  async getSaleById(id: number): Promise<SaleRecord> {
    if (apiConfig.useMockApi) {
      const record = mockSaleStore.find((s) => s.id === id);
      if (!record) throw new Error('Sale not found.');
      return simulateDelay(record);
    }
    const dto = await apiRequest<SaleDto>(`/depot/sales/${id}`);
    return toSaleRecord(dto);
  },

  async updateSale(id: number, input: UpdateSaleInput): Promise<SaleRecord> {
    if (apiConfig.useMockApi) {
      const existing = mockSaleStore.find((s) => s.id === id);
      if (!existing) throw new Error('Sale not found.');
      const updated: SaleRecord = { ...existing, quantitySold: input.quantitySold, soldAmount: input.amountSold };
      mockSaleStore = mockSaleStore.map((s) => (s.id === id ? updated : s));
      return simulateDelay(updated);
    }

    const body: UpdateSaleRequestDto = { quantity_sold: input.quantitySold, amount_sold: input.amountSold };
    try {
      const dto = await apiRequest<SaleDto>(`/depot/sales/${id}`, {
        method: 'PUT',
        body: JSON.stringify(body),
      });
      return toSaleRecord(dto);
    } catch (err) {
      if (isConflict(err)) {
        throw new InsufficientDepotStockError();
      }
      throw err;
    }
  },

  async deleteSale(id: number): Promise<void> {
    if (apiConfig.useMockApi) {
      mockSaleStore = mockSaleStore.filter((s) => s.id !== id);
      return simulateDelay(undefined);
    }
    return apiRequest<void>(`/depot/sales/${id}`, { method: 'DELETE' });
  },

  async getCurrentSales(depotId?: number): Promise<CurrentSaleEntry[]> {
    if (apiConfig.useMockApi) {
      const items = depotId === undefined ? mockCurrentSales : mockCurrentSales.filter((s) => s.depotId === depotId);
      return simulateDelay(items);
    }
    const query = buildQuery({ depot_id: depotId });
    const dtos = await apiRequest<SalesCurrentEntryDto[]>(`/depot/sales-current${query}`);
    return dtos.map(toCurrentSaleEntry);
  },
};
