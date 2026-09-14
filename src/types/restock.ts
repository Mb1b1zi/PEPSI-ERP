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
  depotId: number;
  quantityReceived: number;
  supplierId?: number;
  confirmedById?: number;
}

export interface RejectRestockInput {
  depotId: number;
  reason: string;
  confirmedById?: number;
  quantityReceived?: number;
  supplierId?: number;
}

export interface UpdateRestockInput {
  quantityDelivered: number;
}
