import { apiRequest } from '@/lib/apiClient';
import { pagedFromDepotResponse } from '@/lib/pagination';
import { buildQuery } from '@/lib/queryString';
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
    soldAmount: dto.sold_amount,
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

export const depotService = {
  async listRestock(params: ListRestockParams): Promise<Paged<RestockEntry>> {
    const { page, pageSize, ...filters } = params;
    const query = buildQuery({ page, page_size: pageSize, ...filters });
    const response = await apiRequest<RestockListResponseDto>(`/depot/restock${query}`);
    return pagedFromDepotResponse({ ...response, items: response.items.map(toRestockEntry) });
  },

  async confirmRestock(supplyHistoryId: number, input: ConfirmRestockInput): Promise<RestockEntry> {
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
    const dto = await apiRequest<RestockEntryDto>(`/depot/restock/${id}`);
    return toRestockEntry(dto);
  },

  async updateRestock(id: number, input: UpdateRestockInput): Promise<RestockEntry> {
    const body: UpdateRestockRequestDto = { quantity_delivered: input.quantityDelivered };
    const dto = await apiRequest<RestockEntryDto>(`/depot/restock/${id}`, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
    return toRestockEntry(dto);
  },

  async deleteRestock(id: number): Promise<void> {
    return apiRequest<void>(`/depot/restock/${id}`, { method: 'DELETE' });
  },

  async getStock(depotId?: number): Promise<DepotStockItem[]> {
    const query = buildQuery({ depot_id: depotId });
    const dtos = await apiRequest<DepotCurrentStockDto[]>(`/depot/stock${query}`);
    return dtos.map(toDepotStockItem);
  },

  async listSales(params: ListSalesParams): Promise<Paged<SaleRecord>> {
    const { page, pageSize, ...filters } = params;
    const query = buildQuery({ page, page_size: pageSize, ...filters });
    const response = await apiRequest<SaleListResponseDto>(`/depot/sales${query}`);
    return pagedFromDepotResponse({ ...response, items: response.items.map(toSaleRecord) });
  },

  async createSale(input: CreateSaleInput): Promise<SaleRecord> {
    const body: CreateSaleRequestDto = {
      depot_id: input.depotId,
      product_id: input.productId,
      quantity_id: input.quantityId,
      quantity_sold: input.quantitySold,
      sold_by_id: input.soldById,
      amount_sold: input.amountSold,
    };
    const dto = await apiRequest<SaleDto>('/depot/sales', {
      method: 'POST',
      body: JSON.stringify(body),
    });
    return toSaleRecord(dto);
  },

  async getSaleById(id: number): Promise<SaleRecord> {
    const dto = await apiRequest<SaleDto>(`/depot/sales/${id}`);
    return toSaleRecord(dto);
  },

  async updateSale(id: number, input: UpdateSaleInput): Promise<SaleRecord> {
    const body: UpdateSaleRequestDto = { quantity_sold: input.quantitySold, amount_sold: input.amountSold };
    const dto = await apiRequest<SaleDto>(`/depot/sales/${id}`, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
    return toSaleRecord(dto);
  },

  async deleteSale(id: number): Promise<void> {
    return apiRequest<void>(`/depot/sales/${id}`, { method: 'DELETE' });
  },

  async getCurrentSales(depotId?: number): Promise<CurrentSaleEntry[]> {
    const query = buildQuery({ depot_id: depotId });
    const dtos = await apiRequest<SalesCurrentEntryDto[]>(`/depot/sales-current${query}`);
    return dtos.map(toCurrentSaleEntry);
  },
};
