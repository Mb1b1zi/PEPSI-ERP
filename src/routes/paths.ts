export const ADMIN_PATHS = {
  dashboard: '/admin/dashboard',
  roles: '/admin/roles',
  users: {
    list: '/admin/users',
    add: '/admin/users/add',
  },
  depots: {
    list: '/admin/depots',
    add: '/admin/depots/add',
  },
  products: {
    list: '/admin/products',
    add: '/admin/products/add',
  },
  factory: {
    production: {
      list: '/admin/factory/production',
      add: '/admin/factory/production/add',
    },
    supplies: {
      list: '/admin/factory/supplies',
      add: '/admin/factory/supplies/add',
    },
    stock: '/admin/factory/stock',
  },
  depotOps: {
    restock: {
      list: '/admin/depot-operations/restock',
      decide: '/admin/depot-operations/restock/decide',
    },
    stock: '/admin/depot-operations/stock',
    sales: {
      list: '/admin/depot-operations/sales',
      add: '/admin/depot-operations/sales/add',
    },
    currentSales: '/admin/depot-operations/sales-current',
  },
} as const;