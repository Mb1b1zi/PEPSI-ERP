export interface ProductionRecord {
  id: number;
  productId: number;
  productName: string;
  quantityProduced: number;
  productionDate: string;
  createdDate: string;
}

export interface CreateProductionInput {
  productId: number;
  quantityProduced: number;
  productionDate?: string;
}

export interface UpdateProductionInput {
  productId: number;
  quantityProduced: number;
  productionDate?: string;
}
