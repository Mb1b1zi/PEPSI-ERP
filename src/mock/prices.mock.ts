import type { Price } from '@/types/price';

/** quantityId values match src/mock/catalog.mock.ts's mockQuantities ids. */
export const mockPrices: Price[] = [
  { id: 1, quantityId: 1, amount: 1500 },
  { id: 2, quantityId: 2, amount: 2800 },
  { id: 3, quantityId: 3, amount: 8500 },
];
