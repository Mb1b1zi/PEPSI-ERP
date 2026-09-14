import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Pencil, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { useSupplyHistory } from '@/hooks/useSupplyHistory';
import { factoryService } from '@/services/factoryService';
import { getApiErrorMessage } from '@/lib/apiClient';
import { Table, type Column } from '@/components/tables/Table';
import { Badge } from '@/components/badges/Badge';
import { ConfirmDialog } from '@/components/modals/ConfirmDialog';
import { ADMIN_PATHS } from '@/routes/paths';
import type { SupplyRecord, SupplyStatus } from '@/types/supply';

const STATUS_COLOR: Record<SupplyStatus, 'gray' | 'green' | 'red'> = {
  pending: 'gray',
  received: 'green',
  rejected: 'red',
};

export function SupplyHistoryListPage() {
  const { records, isLoading, error, page, hasNextPage, hasPrevPage, nextPage, prevPage, refetch } =
    useSupplyHistory();
  const navigate = useNavigate();
  const [recordToDelete, setRecordToDelete] = useState<SupplyRecord | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  async function handleConfirmDelete() {
    if (!recordToDelete) return;
    setIsDeleting(true);
    setDeleteError(null);
    try {
      await factoryService.deleteSupply(recordToDelete.id);
      await refetch();
      setRecordToDelete(null);
    } catch (err) {
      setDeleteError(getApiErrorMessage(err, 'Failed to delete supply record.'));
    } finally {
      setIsDeleting(false);
    }
  }

  const columns: Column<SupplyRecord>[] = [
    { header: 'Product', render: (s) => <span className="font-medium text-gray-900">{s.productName}</span> },
    { header: 'Quantity', render: (s) => s.quantityValue },
    { header: 'Amount', render: (s) => s.amount },
    { header: 'Status', render: (s) => <Badge label={s.status} color={STATUS_COLOR[s.status]} /> },
    { header: 'Rejection Reason', render: (s) => s.rejectionReason ?? '—' },
    { header: 'Created', render: (s) => new Date(s.createdDate).toLocaleString() },
    {
      header: 'Actions',
      render: (s) => (
        <div className="flex items-center gap-3 text-gray-400">
          <button
            title="Decide"
            onClick={() => navigate(`${ADMIN_PATHS.factory.supplies.list}/${s.id}/edit`, { state: s })}
            className="hover:text-brand transition-colors"
          >
            <Pencil size={16} />
          </button>
          <button
            title="Delete"
            onClick={() => setRecordToDelete(s)}
            className="hover:text-red-600 transition-colors"
          >
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
          <h1 className="text-2xl font-semibold text-gray-900">Supply History</h1>
          <p className="text-gray-500 mt-1">Supplies dispatched from factory stock to depots.</p>
        </div>
        <Link
          to={ADMIN_PATHS.factory.supplies.add}
          className="flex items-center gap-2 bg-brand hover:bg-brand-dark text-white text-sm font-medium px-4 py-2 rounded-md transition-colors"
        >
          <Plus size={16} /> Add Supply
        </Link>
      </div>

      {error && (
        <div className="mt-6 bg-red-50 border border-red-200 text-red-700 text-sm rounded-md px-4 py-3">{error}</div>
      )}
      {deleteError && (
        <div className="mt-6 bg-red-50 border border-red-200 text-red-700 text-sm rounded-md px-4 py-3">{deleteError}</div>
      )}

      <div className="mt-6">
        {isLoading ? (
          <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-10 bg-gray-100 rounded animate-pulse" />
            ))}
          </div>
        ) : (
          <Table columns={columns} data={records} getRowKey={(s) => String(s.id)} />
        )}
      </div>

      <div className="flex items-center justify-between mt-4">
        <span className="text-sm text-gray-500">Page {page}</span>
        <div className="flex items-center gap-2">
          <button
            onClick={prevPage}
            disabled={!hasPrevPage || isLoading}
            className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 disabled:opacity-40 disabled:cursor-not-allowed px-3 py-1.5 rounded-md border border-gray-300"
          >
            <ChevronLeft size={14} /> Prev
          </button>
          <button
            onClick={nextPage}
            disabled={!hasNextPage || isLoading}
            className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 disabled:opacity-40 disabled:cursor-not-allowed px-3 py-1.5 rounded-md border border-gray-300"
          >
            Next <ChevronRight size={14} />
          </button>
        </div>
      </div>

      <ConfirmDialog
        isOpen={recordToDelete !== null}
        title="Delete supply record?"
        message={`Are you sure you want to delete this supply record for ${recordToDelete?.productName}? This cannot be undone.`}
        confirmLabel={isDeleting ? 'Deleting...' : 'Delete'}
        isDestructive
        onConfirm={handleConfirmDelete}
        onCancel={() => setRecordToDelete(null)}
      />
    </div>
  );
}
