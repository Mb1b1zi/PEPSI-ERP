export interface SaleRecord {
  id: number;
  depotId: number;
  depotName: string;
  productId: number;
  productName: string;
  quantityId: number;
  quantityValue: string;
  quantitySold: number;
  soldAmount: number;
  soldById: number | null;
  saleDate: string;
  saleTime: string;
}

export interface CreateSaleInput {
  depotId: number;
  productId: number;
  quantityId: number;
  quantitySold: number;
  soldById?: number;
  amountSold?: number;
}

export interface UpdateSaleInput {
  quantitySold: number;
  amountSold: number;
}

export interface CurrentSaleEntry {
  id: number;
  depotId: number;
  depotName: string;
  productId: number;
  productName: string;
  quantityId: number;
  quantityValue: string;
  saleDate: string;
  quantitySold: number;
  soldAmount: number;
}
