export type RestockStatus = 'confirmed' | 'rejected';

export interface RestockEntry {
  id: number;
  supplyHistoryId: number;
  depotId: number;
  depotName: string;
  productId: number;
  productName: string;
  quantityId: number;
  quantityValue: string;
  quantityDelivered: number;
  supplierId: number | null;
  confirmedById: number | null;
  status: RestockStatus;
  rejectionReason: string | null;
  restockDate: string;
}

export interface ConfirmRestockInput {
  quantityReceived: number;
  confirmedById?: number;
}

export interface RejectRestockInput {
  reason: string;
  confirmedById?: number;
  quantityReceived?: number;
}

export interface UpdateRestockInput {
  quantityDelivered: number;
}
