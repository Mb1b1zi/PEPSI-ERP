import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { useProductionHistory } from '@/hooks/useProductionHistory';
import { factoryService } from '@/services/factoryService';
import { getApiErrorMessage } from '@/lib/apiClient';
import { useToast } from '@/hooks/useToast';
import { Table, type Column } from '@/components/tables/Table';
import { Pagination } from '@/components/tables/Pagination';
import { ConfirmDialog } from '@/components/modals/ConfirmDialog';
import { FACTORY_PATHS } from '@/routes/paths';
import type { ProductionRecord } from '@/types/factory';

const inputClasses =
  'border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand';

interface AppliedFilters {
  productName?: string;
  date?: string;
}

export function ProductionPage() {
  const [productNameInput, setProductNameInput] = useState('');
  const [dateInput, setDateInput] = useState('');
  const [appliedFilters, setAppliedFilters] = useState<AppliedFilters>({});
  const { items, page, totalPages, total, isLoading, error, setPage, refetch } = useProductionHistory(appliedFilters);
  const navigate = useNavigate();
  const toast = useToast();
  const [recordToDelete, setRecordToDelete] = useState<ProductionRecord | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  function handleApplyFilters() {
    setAppliedFilters({
      productName: productNameInput.trim() || undefined,
      date: dateInput || undefined,
    });
  }

  async function handleConfirmDelete() {
    if (!recordToDelete) return;
    setIsDeleting(true);
    try {
      await factoryService.deleteProduction(recordToDelete.id);
      toast.success('Production record deleted.');
      await refetch();
      setRecordToDelete(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : getApiErrorMessage(err, 'Failed to delete production record.');
      toast.error(message);
    } finally {
      setIsDeleting(false);
    }
  }

  const columns: Column<ProductionRecord>[] = [
    { header: 'Product', render: (r) => <span className="font-medium text-gray-900">{r.productName}</span> },
    { header: 'Quantity Produced', render: (r) => r.quantityProduced },
    { header: 'Production Date', render: (r) => new Date(r.productionDate).toLocaleString() },
    { header: 'Created', render: (r) => new Date(r.createdDate).toLocaleString() },
    {
      header: 'Actions',
      render: (r) => (
        <div className="flex items-center gap-3 text-gray-400">
          <button
            title="Edit"
            onClick={() => navigate(`${FACTORY_PATHS.production.list}/${r.id}/edit`, { state: r })}
            className="hover:text-brand transition-colors"
          >
            <Pencil size={16} />
          </button>
          <button title="Delete" onClick={() => setRecordToDelete(r)} className="hover:text-red-600 transition-colors">
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
          <h1 className="text-2xl font-semibold text-gray-900">Production History</h1>
          <p className="text-gray-500 mt-1">Track factory production and its effect on current stock.</p>
        </div>
        <Link
          to={FACTORY_PATHS.production.add}
          className="flex items-center gap-2 bg-brand hover:bg-brand-dark text-white text-sm font-medium px-4 py-2 rounded-md transition-colors"
        >
          <Plus size={16} /> Record Production
        </Link>
      </div>

      <div className="mt-6 flex items-end gap-3 flex-wrap">
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1.5">Product Name</label>
          <input
            value={productNameInput}
            onChange={(e) => setProductNameInput(e.target.value)}
            className={inputClasses}
            placeholder="e.g. Pepsi"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1.5">Date</label>
          <input value={dateInput} onChange={(e) => setDateInput(e.target.value)} type="date" className={inputClasses} />
        </div>
        <button
          onClick={handleApplyFilters}
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
          <Table columns={columns} data={items} getRowKey={(r) => String(r.id)} />
        )}
      </div>

      <div className="mt-4">
        <Pagination
          currentPage={page}
          pageSize={10}
          totalPages={totalPages}
          totalItems={total}
          onPageChange={setPage}
          disabled={isLoading}
        />
      </div>

      <ConfirmDialog
        isOpen={recordToDelete !== null}
        title="Delete production record?"
        message={`Are you sure you want to delete this production record for ${recordToDelete?.productName}? This cannot be undone.`}
        confirmLabel={isDeleting ? 'Deleting...' : 'Delete'}
        isDestructive
        onConfirm={handleConfirmDelete}
        onCancel={() => setRecordToDelete(null)}
      />
    </div>
  );
}
