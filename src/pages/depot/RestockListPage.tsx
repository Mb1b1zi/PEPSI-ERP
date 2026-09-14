import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ClipboardCheck, Pencil, Trash2 } from 'lucide-react';
import { useRestockEntries, type RestockFilters } from '@/hooks/useRestockEntries';
import { depotService } from '@/services/depotService';
import { getApiErrorMessage } from '@/lib/apiClient';
import { useToast } from '@/hooks/useToast';
import { Table, type Column } from '@/components/tables/Table';
import { Pagination } from '@/components/tables/Pagination';
import { Badge } from '@/components/badges/Badge';
import { ConfirmDialog } from '@/components/modals/ConfirmDialog';
import { DEPOT_PATHS } from '@/routes/paths';
import type { RestockEntry, RestockStatus } from '@/types/restock';

const inputClasses =
  'border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand';

const STATUS_COLOR: Record<RestockStatus, 'green' | 'red'> = {
  confirmed: 'green',
  rejected: 'red',
};

export function RestockListPage() {
  const [statusInput, setStatusInput] = useState<'' | RestockStatus>('');
  const [productNameInput, setProductNameInput] = useState('');
  const [dateFromInput, setDateFromInput] = useState('');
  const [dateToInput, setDateToInput] = useState('');
  const [appliedFilters, setAppliedFilters] = useState<RestockFilters>({});
  const { items, page, totalPages, total, isLoading, error, setPage, refetch } = useRestockEntries(appliedFilters);
  const navigate = useNavigate();
  const toast = useToast();
  const [entryToDelete, setEntryToDelete] = useState<RestockEntry | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  function handleApplyFilters() {
    setAppliedFilters({
      status: statusInput || undefined,
      productName: productNameInput.trim() || undefined,
      dateFrom: dateFromInput || undefined,
      dateTo: dateToInput || undefined,
    });
  }

  async function handleConfirmDelete() {
    if (!entryToDelete) return;
    setIsDeleting(true);
    try {
      await depotService.deleteRestock(entryToDelete.id);
      toast.success('Restock entry deleted.');
      await refetch();
      setEntryToDelete(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : getApiErrorMessage(err, 'Failed to delete restock entry.');
      toast.error(message);
    } finally {
      setIsDeleting(false);
    }
  }

  const columns: Column<RestockEntry>[] = [
    { header: 'Depot', render: (r) => <span className="font-medium text-gray-900">{r.depotName}</span> },
    { header: 'Product', render: (r) => r.productName },
    { header: 'Quantity', render: (r) => r.quantityValue },
    { header: 'Delivered', render: (r) => r.quantityDelivered },
    {
      header: 'Status',
      render: (r) => (
        <div className="flex flex-col gap-1">
          <Badge label={r.status} color={STATUS_COLOR[r.status]} />
          {r.status === 'rejected' && r.rejectionReason && (
            <span className="text-xs text-red-600">{r.rejectionReason}</span>
          )}
        </div>
      ),
    },
    { header: 'Restock Date', render: (r) => new Date(r.restockDate).toLocaleString() },
    {
      header: 'Actions',
      render: (r) => (
        <div className="flex items-center gap-3 text-gray-400">
          <button
            title="Edit delivered quantity"
            onClick={() => navigate(`${DEPOT_PATHS.restock.list}/${r.id}/edit`)}
            className="hover:text-brand transition-colors"
          >
            <Pencil size={16} />
          </button>
          <button title="Delete" onClick={() => setEntryToDelete(r)} className="hover:text-red-600 transition-colors">
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
          <h1 className="text-2xl font-semibold text-gray-900">Restock History</h1>
          <p className="text-gray-500 mt-1">Deliveries confirmed or rejected against factory dispatches.</p>
        </div>
        <Link
          to={DEPOT_PATHS.restock.decide}
          className="flex items-center gap-2 bg-brand hover:bg-brand-dark text-white text-sm font-medium px-4 py-2 rounded-md transition-colors"
        >
          <ClipboardCheck size={16} /> Confirm/Reject Delivery
        </Link>
      </div>

      <div className="mt-6 flex items-end gap-3 flex-wrap">
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1.5">Status</label>
          <select value={statusInput} onChange={(e) => setStatusInput(e.target.value as '' | RestockStatus)} className={inputClasses}>
            <option value="">All</option>
            <option value="confirmed">Confirmed</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1.5">Product Name</label>
          <input value={productNameInput} onChange={(e) => setProductNameInput(e.target.value)} className={inputClasses} placeholder="e.g. Pepsi" />
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
          <Table columns={columns} data={items} getRowKey={(r) => String(r.id)} />
        )}
      </div>

      <div className="mt-4">
        <Pagination currentPage={page} pageSize={10} totalPages={totalPages} totalItems={total} onPageChange={setPage} disabled={isLoading} />
      </div>

      <ConfirmDialog
        isOpen={entryToDelete !== null}
        title="Delete restock entry?"
        message={`Are you sure you want to delete this restock entry for ${entryToDelete?.depotName}? If it was confirmed, the credited stock will be reversed. This cannot be undone.`}
        confirmLabel={isDeleting ? 'Deleting...' : 'Delete'}
        isDestructive
        onConfirm={handleConfirmDelete}
        onCancel={() => setEntryToDelete(null)}
      />
    </div>
  );
}
