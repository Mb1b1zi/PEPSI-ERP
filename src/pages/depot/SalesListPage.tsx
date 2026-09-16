import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { useSalesHistory, type SalesFilters } from '@/hooks/useSalesHistory';
import { useCatalog } from '@/hooks/useCatalog';
import { depotService } from '@/services/depotService';
import { getApiErrorMessage } from '@/lib/apiClient';
import { useToast } from '@/hooks/useToast';
import { Table, type Column } from '@/components/tables/Table';
import { Pagination } from '@/components/tables/Pagination';
import { ConfirmDialog } from '@/components/modals/ConfirmDialog';
import { DEPOT_PATHS } from '@/routes/paths';
import type { SaleRecord } from '@/types/sale';

const inputClasses =
  'border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand';

export function SalesListPage() {
  const [depotIdInput, setDepotIdInput] = useState('');
  const [productNameInput, setProductNameInput] = useState('');
  const [dateFromInput, setDateFromInput] = useState('');
  const [dateToInput, setDateToInput] = useState('');
  const [appliedFilters, setAppliedFilters] = useState<SalesFilters>({});
  const { items, page, totalPages, total, isLoading, error, setPage, refetch } = useSalesHistory(appliedFilters);
  const { depots, products, isLoading: isCatalogLoading } = useCatalog();
  const navigate = useNavigate();
  const toast = useToast();
  const [saleToDelete, setSaleToDelete] = useState<SaleRecord | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  function handleApplyFilters() {
    setAppliedFilters({
      depotId: depotIdInput === '' ? undefined : Number(depotIdInput),
      productName: productNameInput || undefined,
      dateFrom: dateFromInput || undefined,
      dateTo: dateToInput || undefined,
    });
  }

  async function handleConfirmDelete() {
    if (!saleToDelete) return;
    setIsDeleting(true);
    try {
      await depotService.deleteSale(saleToDelete.id);
      toast.success('Sale deleted.');
      await refetch();
      setSaleToDelete(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : getApiErrorMessage(err, 'Failed to delete sale.');
      toast.error(message);
    } finally {
      setIsDeleting(false);
    }
  }

  const columns: Column<SaleRecord>[] = [
    { header: 'Depot', render: (s) => <span className="font-medium text-gray-900">{s.depotName}</span> },
    { header: 'Product', render: (s) => s.productName },
    { header: 'Quantity', render: (s) => s.quantityValue },
    { header: 'Sold', render: (s) => s.quantitySold },
    { header: 'Amount', render: (s) => s.soldAmount },
    { header: 'Date', render: (s) => s.saleDate },
    { header: 'Time', render: (s) => s.saleTime },
    {
      header: 'Actions',
      render: (s) => (
        <div className="flex items-center gap-3 text-gray-400">
          <button
            title="Edit"
            onClick={() => navigate(`${DEPOT_PATHS.sales.list}/${s.id}/edit`)}
            className="hover:text-brand transition-colors"
          >
            <Pencil size={16} />
          </button>
          <button title="Delete" onClick={() => setSaleToDelete(s)} className="hover:text-red-600 transition-colors">
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Sales History</h1>
          <p className="text-gray-500 mt-1">Sales recorded at each depot.</p>
        </div>
        <Link
          to={DEPOT_PATHS.sales.add}
          className="flex items-center gap-2 bg-brand hover:bg-brand-dark text-white text-sm font-medium px-4 py-2 rounded-md transition-colors"
        >
          <Plus size={16} /> Add Sale
        </Link>
      </div>

      <div className="mt-6 flex items-end gap-3 flex-wrap">
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1.5">Depot</label>
          <select
            value={depotIdInput}
            onChange={(e) => setDepotIdInput(e.target.value)}
            disabled={isCatalogLoading}
            className={inputClasses}
          >
            <option value="">All depots</option>
            {depots.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1.5">Product</label>
          <select
            value={productNameInput}
            onChange={(e) => setProductNameInput(e.target.value)}
            disabled={isCatalogLoading}
            className={inputClasses}
          >
            <option value="">All products</option>
            {products.map((p) => (
              <option key={p.id} value={p.name}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1.5">From</label>
          <input value={dateFromInput} onChange={(e) => setDateFromInput(e.target.value)} type="date" className={inputClasses} />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1.5">To</label>
          <input value={dateToInput} onChange={(e) => setDateToInput(e.target.value)} type="date" className={inputClasses} />
        </div>
        <button onClick={handleApplyFilters} className="text-sm text-gray-600 hover:text-gray-900 px-4 py-2 rounded-md border border-gray-300">
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
          <Table columns={columns} data={items} getRowKey={(s) => String(s.id)} />
        )}
      </div>

      <div className="mt-4">
        <Pagination currentPage={page} pageSize={10} totalPages={totalPages} totalItems={total} onPageChange={setPage} disabled={isLoading} />
      </div>

      <ConfirmDialog
        isOpen={saleToDelete !== null}
        title="Delete sale?"
        message={`Are you sure you want to delete this sale for ${saleToDelete?.productName}? The stock it consumed will be restored. This cannot be undone.`}
        confirmLabel={isDeleting ? 'Deleting...' : 'Delete'}
        isDestructive
        onConfirm={handleConfirmDelete}
        onCancel={() => setSaleToDelete(null)}
      />
    </div>
  );
}
