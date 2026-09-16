import type { DashboardSummary } from '@/types/dashboardSummary';

export const mockDashboardSummary: DashboardSummary = {
  generatedAt: new Date().toISOString(),
  cards: [
    { key: 'products', title: 'Products', value: 5, subtitle: null, link: '/admin/products' },
    { key: 'depots', title: 'Depots', value: 2, subtitle: null, link: '/admin/depots' },
    { key: 'personnel', title: 'Personnel', value: 6, subtitle: null, link: '/admin/users' },
    { key: 'production_today', title: 'Produced Today', value: 0, subtitle: '0 batch(es)', link: '/factory/production' },
    {
      key: 'factory_stock',
      title: 'Factory Stock',
      value: 1165,
      subtitle: 'across 3 product/pack line(s)',
      link: '/factory/stock',
    },
    {
      key: 'pending_supplies',
      title: 'Pending Supplies',
      value: 1,
      subtitle: 'awaiting depot confirmation',
      link: '/factory/supplies',
    },
    {
      key: 'restocks_today',
      title: 'Restocks Today',
      value: 0,
      subtitle: '0 confirmed, 0 rejected',
      link: '/depot/restock',
    },
    {
      key: 'depot_stock',
      title: 'Depot Stock',
      value: 0,
      subtitle: 'across 0 depot/product line(s)',
      link: '/depot/stock',
    },
    { key: 'sales_today', title: 'Sales Today', value: 0, subtitle: '0 unit(s) sold', link: '/depot/sales' },
  ],
};
