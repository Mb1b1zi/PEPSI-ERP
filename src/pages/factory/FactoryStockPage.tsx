import { RefreshCw } from 'lucide-react';
import { useFactoryStock } from '@/hooks/useFactoryStock';
import { Table, type Column } from '@/components/tables/Table';
import type { FactoryStockItem } from '@/types/factory';

const columns: Column<FactoryStockItem>[] = [
  { header: 'Product', render: (s) => <span className="font-medium text-gray-900">{s.productName}</span> },
  { header: 'Available Quantity', render: (s) => s.availableQuantity },
  { header: 'Updated', render: (s) => new Date(s.updatedDate).toLocaleString() },
];

export function FactoryStockPage() {
  const { items, isLoading, error, refetch } = useFactoryStock();

  return (
    <div className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Factory Stock</h1>
          <p className="text-gray-500 mt-1">Current stock per product, ordered by product ID.</p>
        </div>
        <button
          onClick={() => refetch()}
          disabled={isLoading}
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 disabled:opacity-50 px-4 py-2 rounded-md border border-gray-300"
        >
          <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} /> Refresh
        </button>
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
          <Table
            columns={columns}
            data={items}
            getRowKey={(s) => String(s.id)}
            emptyMessage="No factory stock recorded yet."
          />
        )}
      </div>
    </div>
  );
}
