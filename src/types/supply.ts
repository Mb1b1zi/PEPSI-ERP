export type SupplyStatus = 'pending' | 'received' | 'rejected';

export interface SupplyRecord {
  id: number;
  productId: number;
  quantityId: number;
  amount: number;
  productName: string;
  quantityValue: string;
  status: SupplyStatus;
  rejectionReason: string | null;
  createdDate: string;
}

export interface CreateSupplyInput {
  productId: number;
  quantityId: number;
  amount: number;
}

export interface UpdateSupplyInput {
  status: SupplyStatus;
  rejectionReason?: string;
}
