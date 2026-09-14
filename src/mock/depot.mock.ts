import type { RestockEntry } from '@/types/restock';
import type { SaleRecord, CurrentSaleEntry } from '@/types/sale';
import type { DepotStockItem } from '@/types/depotStock';

/**
 * Mock-only stand-in for Admin's undocumented `prices` table (docs/api/depot.md: sales
 * auto-price from `price.amount * quantity_sold` when `amount_sold` is omitted). Keyed by
 * product id, reusing src/mock/catalog.mock.ts's product ids.
 */
export const mockUnitPrices: Record<number, number> = {
  1: 4000,
  2: 1500,
  3: 1500,
  4: 1800,
  5: 4500,
};

/** Reuses depot/product/quantity ids/names from src/mock/catalog.mock.ts. */
export const mockRestockEntries: RestockEntry[] = [
  { id: 1, supplyHistoryId: 20, depotId: 3, depotName: 'Nakawa Depot', productId: 4, productName: 'Pepsi 500ml', quantityId: 5, quantityValue: 'Crate-24', quantityDelivered: 60, supplierId: 8, confirmedById: 8, status: 'confirmed', rejectionReason: null, restockDate: '2026-09-02T09:20:00Z' },
  { id: 2, supplyHistoryId: 21, depotId: 1, depotName: 'Kampala Central Depot', productId: 1, productName: 'Pepsi 1L', quantityId: 2, quantityValue: '1L', quantityDelivered: 45, supplierId: null, confirmedById: 5, status: 'confirmed', rejectionReason: null, restockDate: '2026-09-04T08:40:00Z' },
  { id: 3, supplyHistoryId: 22, depotId: 2, depotName: 'Ntinda Depot', productId: 2, productName: 'Mirinda 500ml', quantityId: 1, quantityValue: '500ml', quantityDelivered: 35, supplierId: null, confirmedById: 6, status: 'rejected', rejectionReason: 'Quantity mismatch: expected 40, received 35', restockDate: '2026-09-05T09:45:00Z' },
  { id: 4, supplyHistoryId: 23, depotId: 3, depotName: 'Nakawa Depot', productId: 5, productName: 'Mountain Dew 1L', quantityId: 2, quantityValue: '1L', quantityDelivered: 30, supplierId: null, confirmedById: 8, status: 'confirmed', rejectionReason: null, restockDate: '2026-09-06T10:40:00Z' },
  { id: 5, supplyHistoryId: 24, depotId: 4, depotName: 'Mukono Depot', productId: 3, productName: '7up 500ml', quantityId: 1, quantityValue: '500ml', quantityDelivered: 60, supplierId: null, confirmedById: 7, status: 'confirmed', rejectionReason: null, restockDate: '2026-09-07T09:10:00Z' },
  { id: 6, supplyHistoryId: 25, depotId: 1, depotName: 'Kampala Central Depot', productId: 4, productName: 'Pepsi 500ml', quantityId: 5, quantityValue: 'Crate-24', quantityDelivered: 100, supplierId: 8, confirmedById: 5, status: 'confirmed', rejectionReason: null, restockDate: '2026-09-07T09:20:00Z' },
  { id: 7, supplyHistoryId: 26, depotId: 2, depotName: 'Ntinda Depot', productId: 1, productName: 'Pepsi 1L', quantityId: 2, quantityValue: '1L', quantityDelivered: 20, supplierId: null, confirmedById: 6, status: 'rejected', rejectionReason: 'Truck broke down, crates never arrived', restockDate: '2026-09-07T11:00:00Z' },
  { id: 8, supplyHistoryId: 27, depotId: 3, depotName: 'Nakawa Depot', productId: 2, productName: 'Mirinda 500ml', quantityId: 1, quantityValue: '500ml', quantityDelivered: 40, supplierId: null, confirmedById: 8, status: 'confirmed', rejectionReason: null, restockDate: '2026-09-08T08:15:00Z' },
  { id: 9, supplyHistoryId: 28, depotId: 4, depotName: 'Mukono Depot', productId: 5, productName: 'Mountain Dew 1L', quantityId: 2, quantityValue: '1L', quantityDelivered: 25, supplierId: null, confirmedById: 7, status: 'confirmed', rejectionReason: null, restockDate: '2026-09-08T09:00:00Z' },
  { id: 10, supplyHistoryId: 29, depotId: 1, depotName: 'Kampala Central Depot', productId: 3, productName: '7up 500ml', quantityId: 1, quantityValue: '500ml', quantityDelivered: 55, supplierId: null, confirmedById: 5, status: 'confirmed', rejectionReason: null, restockDate: '2026-09-08T10:00:00Z' },
  { id: 11, supplyHistoryId: 30, depotId: 2, depotName: 'Ntinda Depot', productId: 4, productName: 'Pepsi 500ml', quantityId: 5, quantityValue: 'Crate-24', quantityDelivered: 90, supplierId: 8, confirmedById: 6, status: 'confirmed', rejectionReason: null, restockDate: '2026-09-09T08:00:00Z' },
  { id: 12, supplyHistoryId: 31, depotId: 3, depotName: 'Nakawa Depot', productId: 1, productName: 'Pepsi 1L', quantityId: 2, quantityValue: '1L', quantityDelivered: 45, supplierId: null, confirmedById: 8, status: 'confirmed', rejectionReason: null, restockDate: '2026-09-09T09:30:00Z' },
];

export const mockSaleRecords: SaleRecord[] = [
  { id: 1, depotId: 3, depotName: 'Nakawa Depot', productId: 4, productName: 'Pepsi 500ml', quantityId: 5, quantityValue: 'Crate-24', quantitySold: 10, soldAmount: 18000, soldById: 8, saleDate: '2026-09-02', saleTime: '09:30:00' },
  { id: 2, depotId: 1, depotName: 'Kampala Central Depot', productId: 1, productName: 'Pepsi 1L', quantityId: 2, quantityValue: '1L', quantitySold: 20, soldAmount: 80000, soldById: 5, saleDate: '2026-09-03', saleTime: '10:15:00' },
  { id: 3, depotId: 2, depotName: 'Ntinda Depot', productId: 2, productName: 'Mirinda 500ml', quantityId: 1, quantityValue: '500ml', quantitySold: 15, soldAmount: 22500, soldById: 6, saleDate: '2026-09-04', saleTime: '11:00:00' },
  { id: 4, depotId: 3, depotName: 'Nakawa Depot', productId: 5, productName: 'Mountain Dew 1L', quantityId: 2, quantityValue: '1L', quantitySold: 8, soldAmount: 36000, soldById: 8, saleDate: '2026-09-05', saleTime: '09:45:00' },
  { id: 5, depotId: 4, depotName: 'Mukono Depot', productId: 3, productName: '7up 500ml', quantityId: 1, quantityValue: '500ml', quantitySold: 25, soldAmount: 37500, soldById: 7, saleDate: '2026-09-05', saleTime: '14:20:00' },
  { id: 6, depotId: 1, depotName: 'Kampala Central Depot', productId: 4, productName: 'Pepsi 500ml', quantityId: 5, quantityValue: 'Crate-24', quantitySold: 12, soldAmount: 21600, soldById: 5, saleDate: '2026-09-06', saleTime: '08:50:00' },
  { id: 7, depotId: 2, depotName: 'Ntinda Depot', productId: 1, productName: 'Pepsi 1L', quantityId: 2, quantityValue: '1L', quantitySold: 18, soldAmount: 72000, soldById: 6, saleDate: '2026-09-06', saleTime: '13:10:00' },
  { id: 8, depotId: 3, depotName: 'Nakawa Depot', productId: 2, productName: 'Mirinda 500ml', quantityId: 1, quantityValue: '500ml', quantitySold: 22, soldAmount: 33000, soldById: 8, saleDate: '2026-09-07', saleTime: '09:00:00' },
  { id: 9, depotId: 4, depotName: 'Mukono Depot', productId: 5, productName: 'Mountain Dew 1L', quantityId: 2, quantityValue: '1L', quantitySold: 10, soldAmount: 45000, soldById: 7, saleDate: '2026-09-07', saleTime: '15:30:00' },
  { id: 10, depotId: 1, depotName: 'Kampala Central Depot', productId: 3, productName: '7up 500ml', quantityId: 1, quantityValue: '500ml', quantitySold: 30, soldAmount: 45000, soldById: 5, saleDate: '2026-09-08', saleTime: '10:00:00' },
  { id: 11, depotId: 2, depotName: 'Ntinda Depot', productId: 4, productName: 'Pepsi 500ml', quantityId: 5, quantityValue: 'Crate-24', quantitySold: 14, soldAmount: 25200, soldById: 6, saleDate: '2026-09-08', saleTime: '16:00:00' },
  { id: 12, depotId: 3, depotName: 'Nakawa Depot', productId: 1, productName: 'Pepsi 1L', quantityId: 2, quantityValue: '1L', quantitySold: 16, soldAmount: 64000, soldById: 8, saleDate: '2026-09-09', saleTime: '09:20:00' },
];

export const mockDepotStock: DepotStockItem[] = [
  { id: 1, depotId: 1, depotName: 'Kampala Central Depot', productId: 1, productName: 'Pepsi 1L', quantityId: 2, quantityValue: '1L', currentAmount: 80, updatedAt: '2026-09-08T10:00:00Z' },
  { id: 2, depotId: 1, depotName: 'Kampala Central Depot', productId: 3, productName: '7up 500ml', quantityId: 1, quantityValue: '500ml', currentAmount: 25, updatedAt: '2026-09-08T10:00:05Z' },
  { id: 3, depotId: 1, depotName: 'Kampala Central Depot', productId: 4, productName: 'Pepsi 500ml', quantityId: 5, quantityValue: 'Crate-24', currentAmount: 88, updatedAt: '2026-09-07T09:20:05Z' },
  { id: 4, depotId: 2, depotName: 'Ntinda Depot', productId: 1, productName: 'Pepsi 1L', quantityId: 2, quantityValue: '1L', currentAmount: 27, updatedAt: '2026-09-06T13:10:05Z' },
  { id: 5, depotId: 2, depotName: 'Ntinda Depot', productId: 2, productName: 'Mirinda 500ml', quantityId: 1, quantityValue: '500ml', currentAmount: 40, updatedAt: '2026-09-05T09:45:05Z' },
  { id: 6, depotId: 2, depotName: 'Ntinda Depot', productId: 4, productName: 'Pepsi 500ml', quantityId: 5, quantityValue: 'Crate-24', currentAmount: 76, updatedAt: '2026-09-09T08:00:05Z' },
  { id: 7, depotId: 3, depotName: 'Nakawa Depot', productId: 1, productName: 'Pepsi 1L', quantityId: 2, quantityValue: '1L', currentAmount: 29, updatedAt: '2026-09-09T09:30:05Z' },
  { id: 8, depotId: 3, depotName: 'Nakawa Depot', productId: 2, productName: 'Mirinda 500ml', quantityId: 1, quantityValue: '500ml', currentAmount: 18, updatedAt: '2026-09-08T08:15:05Z' },
  { id: 9, depotId: 3, depotName: 'Nakawa Depot', productId: 4, productName: 'Pepsi 500ml', quantityId: 5, quantityValue: 'Crate-24', currentAmount: 50, updatedAt: '2026-09-02T09:20:05Z' },
  { id: 10, depotId: 3, depotName: 'Nakawa Depot', productId: 5, productName: 'Mountain Dew 1L', quantityId: 2, quantityValue: '1L', currentAmount: 22, updatedAt: '2026-09-06T10:40:05Z' },
  { id: 11, depotId: 4, depotName: 'Mukono Depot', productId: 3, productName: '7up 500ml', quantityId: 1, quantityValue: '500ml', currentAmount: 35, updatedAt: '2026-09-07T09:10:05Z' },
  { id: 12, depotId: 4, depotName: 'Mukono Depot', productId: 5, productName: 'Mountain Dew 1L', quantityId: 2, quantityValue: '1L', currentAmount: 15, updatedAt: '2026-09-08T09:00:05Z' },
];

/** Real endpoint is always scoped to today; the mock is a static "today" snapshot. */
export const mockCurrentSales: CurrentSaleEntry[] = [
  { id: 1, depotId: 3, depotName: 'Nakawa Depot', productId: 4, productName: 'Pepsi 500ml', quantityId: 5, quantityValue: 'Crate-24', saleDate: '2026-09-14', quantitySold: 6, soldAmount: 10800 },
  { id: 2, depotId: 1, depotName: 'Kampala Central Depot', productId: 1, productName: 'Pepsi 1L', quantityId: 2, quantityValue: '1L', saleDate: '2026-09-14', quantitySold: 9, soldAmount: 36000 },
  { id: 3, depotId: 2, depotName: 'Ntinda Depot', productId: 2, productName: 'Mirinda 500ml', quantityId: 1, quantityValue: '500ml', saleDate: '2026-09-14', quantitySold: 11, soldAmount: 16500 },
];
