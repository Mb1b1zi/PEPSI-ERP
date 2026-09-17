import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { useProducts } from '@/hooks/useProducts';
import { Table, type Column } from '@/components/tables/Table';
import { ADMIN_PATHS } from '@/routes/paths';
import type { Product } from '@/types/catalog';

/** No Actions column — the real backend has no update/delete endpoint for products, only
 *  create + read (see productService.ts). */
const columns: Column<Product>[] = [
  { header: 'Name', render: (p) => <span className="font-medium text-gray-900">{p.name}</span> },
];

export function ProductsPage() {
  const { products, isLoading, error } = useProducts();

  return (
    <div className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Products</h1>
          <p className="text-gray-500 mt-1">The product catalog.</p>
        </div>
        <Link
          to={ADMIN_PATHS.products.add}
          className="flex items-center gap-2 bg-brand hover:bg-brand-dark text-white text-sm font-medium px-4 py-2 rounded-md transition-colors"
        >
          <Plus size={16} /> Add Product
        </Link>
      </div>

      {error && (
        <div className="mt-6 bg-red-50 border border-red-200 text-red-700 text-sm rounded-md px-4 py-3">{error}</div>
      )}

      <div className="mt-6">
        {isLoading ? (
          <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-10 bg-gray-100 rounded animate-pulse" />
            ))}
          </div>
        ) : (
          <Table columns={columns} data={products} getRowKey={(p) => String(p.id)} />
        )}
      </div>
    </div>
  );
}
