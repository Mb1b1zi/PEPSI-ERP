import type { ProductionRecord } from '@/types/factory';

/** Reuses product ids/names from src/mock/catalog.mock.ts — never invents conflicting ones. */
export const mockProductionRecords: ProductionRecord[] = [
  { id: 1, productId: 1, productName: 'Pepsi 1L', quantityProduced: 500, productionDate: '2026-09-01T08:00:00Z', createdDate: '2026-09-01T08:00:05Z' },
  { id: 2, productId: 4, productName: 'Pepsi 500ml', quantityProduced: 800, productionDate: '2026-09-02T08:30:00Z', createdDate: '2026-09-02T08:30:04Z' },
  { id: 3, productId: 2, productName: 'Mirinda 500ml', quantityProduced: 300, productionDate: '2026-09-02T09:00:00Z', createdDate: '2026-09-02T09:00:03Z' },
  { id: 4, productId: 3, productName: '7up 500ml', quantityProduced: 450, productionDate: '2026-09-03T07:45:00Z', createdDate: '2026-09-03T07:45:02Z' },
  { id: 5, productId: 5, productName: 'Mountain Dew 1L', quantityProduced: 200, productionDate: '2026-09-03T10:15:00Z', createdDate: '2026-09-03T10:15:06Z' },
  { id: 6, productId: 1, productName: 'Pepsi 1L', quantityProduced: 600, productionDate: '2026-09-04T08:00:00Z', createdDate: '2026-09-04T08:00:05Z' },
  { id: 7, productId: 4, productName: 'Pepsi 500ml', quantityProduced: 700, productionDate: '2026-09-05T08:30:00Z', createdDate: '2026-09-05T08:30:04Z' },
  { id: 8, productId: 2, productName: 'Mirinda 500ml', quantityProduced: 350, productionDate: '2026-09-05T09:00:00Z', createdDate: '2026-09-05T09:00:03Z' },
  { id: 9, productId: 3, productName: '7up 500ml', quantityProduced: 400, productionDate: '2026-09-06T07:45:00Z', createdDate: '2026-09-06T07:45:02Z' },
  { id: 10, productId: 5, productName: 'Mountain Dew 1L', quantityProduced: 250, productionDate: '2026-09-06T10:15:00Z', createdDate: '2026-09-06T10:15:06Z' },
  { id: 11, productId: 1, productName: 'Pepsi 1L', quantityProduced: 550, productionDate: '2026-09-07T08:00:00Z', createdDate: '2026-09-07T08:00:05Z' },
  { id: 12, productId: 4, productName: 'Pepsi 500ml', quantityProduced: 900, productionDate: '2026-09-07T08:30:00Z', createdDate: '2026-09-07T08:30:04Z' },
];
