import { apiRequest } from '@/lib/apiClient';
import { pagedFromFactoryList } from '@/lib/pagination';
import type { Paged } from '@/types/api';
import type {
  ProductionRecordDto,
  CreateProductionRequestDto,
  UpdateProductionRequestDto,
  FactoryCurrentStockDto,
  SupplyHistoryDto,
  CreateSupplyRequestDto,
  UpdateSupplyRequestDto,
} from '@/types/factory';
import type { ProductionRecord, CreateProductionInput, UpdateProductionInput } from '@/types/production';
import type { SupplyRecord, CreateSupplyInput, UpdateSupplyInput } from '@/types/supply';
import type { FactoryStockItem } from '@/types/factoryStock';

export interface ListProductionParams {
  skip: number;
  limit: number;
  date?: string;
  productId?: number;
  productName?: string;
  quantity?: number;
}

export interface ListSuppliesParams {
  skip: number;
  limit: number;
  date?: string;
  productId?: number;
  productName?: string;
  quantity?: number;
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

function toSupplyRecord(dto: SupplyHistoryDto): SupplyRecord {
  return {
    id: dto.id,
    productId: dto.product_id,
    quantityId: dto.quantity_id,
    amount: dto.amount,
    productName: dto.product_name,
    quantityValue: dto.quantity_value,
    status: dto.status,
    rejectionReason: dto.rejection_reason,
    createdDate: dto.created_date,
  };
}

function toStockItem(dto: FactoryCurrentStockDto): FactoryStockItem {
  return {
    id: dto.id,
    productId: dto.product_id,
    productName: dto.product_name,
    availableQuantity: dto.available_quantity,
    updatedDate: dto.updated_date,
  };
}

function buildQuery(params: Record<string, string | number | undefined>): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) {
      search.set(key, String(value));
    }
  }
  const query = search.toString();
  return query ? `?${query}` : '';
}

export const factoryService = {
  async listProduction(params: ListProductionParams): Promise<Paged<ProductionRecord>> {
    const { skip, limit, ...filters } = params;
    const query = buildQuery({ skip, limit, ...filters });
    const dtos = await apiRequest<ProductionRecordDto[]>(`/factory/production${query}`);
    return pagedFromFactoryList(dtos.map(toProductionRecord), { skip, limit });
  },

  async createProduction(input: CreateProductionInput): Promise<ProductionRecord> {
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
    return apiRequest<void>(`/factory/production/${id}`, { method: 'DELETE' });
  },

  async listSupplies(params: ListSuppliesParams): Promise<Paged<SupplyRecord>> {
    const { skip, limit, ...filters } = params;
    const query = buildQuery({ skip, limit, ...filters });
    const dtos = await apiRequest<SupplyHistoryDto[]>(`/factory/supplies${query}`);
    return pagedFromFactoryList(dtos.map(toSupplyRecord), { skip, limit });
  },

  async createSupply(input: CreateSupplyInput): Promise<SupplyRecord> {
    const body: CreateSupplyRequestDto = {
      product_id: input.productId,
      quantity_id: input.quantityId,
      amount: input.amount,
    };
    const dto = await apiRequest<SupplyHistoryDto>('/factory/supplies', {
      method: 'POST',
      body: JSON.stringify(body),
    });
    return toSupplyRecord(dto);
  },

  async updateSupply(id: number, input: UpdateSupplyInput): Promise<SupplyRecord> {
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
    return apiRequest<void>(`/factory/supplies/${id}`, { method: 'DELETE' });
  },

  async getStock(): Promise<FactoryStockItem[]> {
    const dtos = await apiRequest<FactoryCurrentStockDto[]>('/factory/stock');
    return dtos.map(toStockItem);
  },
};
