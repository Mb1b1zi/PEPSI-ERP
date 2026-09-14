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

/**
 * Separate from ADMIN_PATHS by design (see "Module implementation pattern" in CLAUDE.md).
 * ADMIN_PATHS.factory above is now dead/unused — its pages were retired in favor of these —
 * but is left in place rather than edited, since ADMIN_PATHS itself must not be altered here.
 */
export const FACTORY_PATHS = {
  production: {
    list: '/factory/production',
    add: '/factory/production/add',
  },
  supplies: {
    list: '/factory/supplies',
    add: '/factory/supplies/add',
  },
  stock: '/factory/stock',
} as const;