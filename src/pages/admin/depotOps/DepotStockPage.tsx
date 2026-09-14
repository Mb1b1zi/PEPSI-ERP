import { useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { useDepotStock } from '@/hooks/useDepotStock';
import { Table, type Column } from '@/components/tables/Table';
import type { DepotStockItem } from '@/types/depotStock';

const inputClasses =
  'border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand';

const columns: Column<DepotStockItem>[] = [
  { header: 'Depot', render: (s) => <span className="font-medium text-gray-900">{s.depotName}</span> },
  { header: 'Product', render: (s) => s.productName },
  { header: 'Quantity', render: (s) => s.quantityValue },
  { header: 'Current Amount', render: (s) => s.currentAmount },
  { header: 'Updated', render: (s) => new Date(s.updatedAt).toLocaleString() },
];

export function DepotStockPage() {
  const { stock, isLoading, error, applyFilter, refetch } = useDepotStock();
  const [depotIdInput, setDepotIdInput] = useState('');

  function handleApplyFilter() {
    applyFilter(depotIdInput.trim() === '' ? undefined : Number(depotIdInput));
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Depot Stock</h1>
          <p className="text-gray-500 mt-1">Current stock per depot, updated automatically on restock/sale.</p>
        </div>
        <button
          onClick={() => refetch()}
          disabled={isLoading}
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 disabled:opacity-50 px-4 py-2 rounded-md border border-gray-300"
        >
          <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} /> Refresh
        </button>
      </div>

      <div className="mt-6 flex items-end gap-3">
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1.5">Depot ID</label>
          <input
            value={depotIdInput}
            onChange={(e) => setDepotIdInput(e.target.value)}
            type="number"
            min={1}
            placeholder="Filter by depot ID"
            className={inputClasses}
          />
        </div>
        <button
          onClick={handleApplyFilter}
          className="text-sm text-gray-600 hover:text-gray-900 px-4 py-2 rounded-md border border-gray-300"
        >
          Apply
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
          <Table columns={columns} data={stock} getRowKey={(s) => String(s.id)} />
        )}
      </div>
    </div>
  );
}
