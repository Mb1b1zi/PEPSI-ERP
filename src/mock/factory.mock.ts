import type { ProductionRecord, SupplyRecord, FactoryStockItem } from '@/types/factory';

/** Reuses product/quantity ids/names from src/mock/catalog.mock.ts — never invents conflicting ones. */
export const mockProductionRecords: ProductionRecord[] = [
  { id: 1, productId: 1, productName: 'Pepsi 1L', quantityId: 2, quantityValue: '1L', quantityProduced: 500, productionDate: '2026-09-01T08:00:00Z', createdDate: '2026-09-01T08:00:05Z' },
  { id: 2, productId: 4, productName: 'Pepsi 500ml', quantityId: 1, quantityValue: '500ml', quantityProduced: 800, productionDate: '2026-09-02T08:30:00Z', createdDate: '2026-09-02T08:30:04Z' },
  { id: 3, productId: 2, productName: 'Mirinda 500ml', quantityId: 1, quantityValue: '500ml', quantityProduced: 300, productionDate: '2026-09-02T09:00:00Z', createdDate: '2026-09-02T09:00:03Z' },
  { id: 4, productId: 3, productName: '7up 500ml', quantityId: 1, quantityValue: '500ml', quantityProduced: 450, productionDate: '2026-09-03T07:45:00Z', createdDate: '2026-09-03T07:45:02Z' },
  { id: 5, productId: 5, productName: 'Mountain Dew 1L', quantityId: 2, quantityValue: '1L', quantityProduced: 200, productionDate: '2026-09-03T10:15:00Z', createdDate: '2026-09-03T10:15:06Z' },
  { id: 6, productId: 1, productName: 'Pepsi 1L', quantityId: 2, quantityValue: '1L', quantityProduced: 600, productionDate: '2026-09-04T08:00:00Z', createdDate: '2026-09-04T08:00:05Z' },
  { id: 7, productId: 4, productName: 'Pepsi 500ml', quantityId: 1, quantityValue: '500ml', quantityProduced: 700, productionDate: '2026-09-05T08:30:00Z', createdDate: '2026-09-05T08:30:04Z' },
  { id: 8, productId: 2, productName: 'Mirinda 500ml', quantityId: 1, quantityValue: '500ml', quantityProduced: 350, productionDate: '2026-09-05T09:00:00Z', createdDate: '2026-09-05T09:00:03Z' },
  { id: 9, productId: 3, productName: '7up 500ml', quantityId: 1, quantityValue: '500ml', quantityProduced: 400, productionDate: '2026-09-06T07:45:00Z', createdDate: '2026-09-06T07:45:02Z' },
  { id: 10, productId: 5, productName: 'Mountain Dew 1L', quantityId: 2, quantityValue: '1L', quantityProduced: 250, productionDate: '2026-09-06T10:15:00Z', createdDate: '2026-09-06T10:15:06Z' },
  { id: 11, productId: 1, productName: 'Pepsi 1L', quantityId: 2, quantityValue: '1L', quantityProduced: 550, productionDate: '2026-09-07T08:00:00Z', createdDate: '2026-09-07T08:00:05Z' },
  { id: 12, productId: 4, productName: 'Pepsi 500ml', quantityId: 1, quantityValue: '500ml', quantityProduced: 900, productionDate: '2026-09-07T08:30:00Z', createdDate: '2026-09-07T08:30:04Z' },
];

/** Reuses product/quantity/depot ids/names from src/mock/catalog.mock.ts. At least one of each status. */
export const mockSupplyRecords: SupplyRecord[] = [
  { id: 1, productId: 4, quantityId: 5, amount: 80, productName: 'Pepsi 500ml', quantityValue: 'Crate-24', depotId: 1, depotName: 'Kampala Central Depot', supplierId: 8, supplierName: null, status: 'received', rejectionReason: null, createdDate: '2026-09-02T09:15:00Z' },
  { id: 2, productId: 1, quantityId: 2, amount: 50, productName: 'Pepsi 1L', quantityValue: '1L', depotId: 2, depotName: 'Ntinda Depot', supplierId: 8, supplierName: null, status: 'pending', rejectionReason: null, createdDate: '2026-09-04T08:20:00Z' },
  { id: 3, productId: 2, quantityId: 1, amount: 40, productName: 'Mirinda 500ml', quantityValue: '500ml', depotId: 3, depotName: 'Nakawa Depot', supplierId: 8, supplierName: null, status: 'rejected', rejectionReason: 'Quantity mismatch: expected 40, received 35', createdDate: '2026-09-05T09:30:00Z' },
  { id: 4, productId: 3, quantityId: 1, amount: 60, productName: '7up 500ml', quantityValue: '500ml', depotId: 4, depotName: 'Mukono Depot', supplierId: 8, supplierName: null, status: 'pending', rejectionReason: null, createdDate: '2026-09-06T08:00:00Z' },
  { id: 5, productId: 5, quantityId: 2, amount: 30, productName: 'Mountain Dew 1L', quantityValue: '1L', depotId: 1, depotName: 'Kampala Central Depot', supplierId: 8, supplierName: null, status: 'received', rejectionReason: null, createdDate: '2026-09-06T10:30:00Z' },
  { id: 6, productId: 4, quantityId: 5, amount: 100, productName: 'Pepsi 500ml', quantityValue: 'Crate-24', depotId: 2, depotName: 'Ntinda Depot', supplierId: 8, supplierName: null, status: 'pending', rejectionReason: null, createdDate: '2026-09-07T09:00:00Z' },
];

/** One row per product, per docs/api/factory.md ("one current stock row per product"). */
export const mockFactoryStock: FactoryStockItem[] = [
  { id: 1, productId: 1, productName: 'Pepsi 1L', quantityId: null, quantityValue: null, availableQuantity: 1200, updatedDate: '2026-09-07T08:00:05Z' },
  { id: 2, productId: 2, productName: 'Mirinda 500ml', quantityId: null, quantityValue: null, availableQuantity: 650, updatedDate: '2026-09-05T09:00:03Z' },
  { id: 3, productId: 3, productName: '7up 500ml', quantityId: null, quantityValue: null, availableQuantity: 790, updatedDate: '2026-09-06T07:45:02Z' },
  { id: 4, productId: 4, productName: 'Pepsi 500ml', quantityId: null, quantityValue: null, availableQuantity: 2320, updatedDate: '2026-09-07T08:30:04Z' },
  { id: 5, productId: 5, productName: 'Mountain Dew 1L', quantityId: null, quantityValue: null, availableQuantity: 420, updatedDate: '2026-09-06T10:15:06Z' },
];
