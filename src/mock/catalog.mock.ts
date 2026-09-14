import type { Product, Quantity, Depot } from '@/types/catalog';

/** Product 4 / quantity 5 / depot 3 match the worked examples in docs/api/depot.md. */
export const mockProducts: Product[] = [
  { id: 1, name: 'Pepsi 1L' },
  { id: 2, name: 'Mirinda 500ml' },
  { id: 3, name: '7up 500ml' },
  { id: 4, name: 'Pepsi 500ml' },
  { id: 5, name: 'Mountain Dew 1L' },
];

export const mockQuantities: Quantity[] = [
  { id: 1, value: '500ml' },
  { id: 2, value: '1L' },
  { id: 3, value: 'Pack-6' },
  { id: 4, value: 'Crate-12' },
  { id: 5, value: 'Crate-24' },
];

export const mockDepots: Depot[] = [
  { id: 1, name: 'Kampala Central Depot' },
  { id: 2, name: 'Ntinda Depot' },
  { id: 3, name: 'Nakawa Depot' },
  { id: 4, name: 'Mukono Depot' },
];
