import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Pencil, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { useProductionRecords } from '@/hooks/useProductionRecords';
import { factoryService } from '@/services/factoryService';
import { getApiErrorMessage } from '@/lib/apiClient';
import { Table, type Column } from '@/components/tables/Table';
import { ConfirmDialog } from '@/components/modals/ConfirmDialog';
import { ADMIN_PATHS } from '@/routes/paths';
import type { ProductionRecord } from '@/types/production';

export function ProductionListPage() {
  const { records, isLoading, error, page, hasNextPage, hasPrevPage, nextPage, prevPage, refetch } =
    useProductionRecords();
  const navigate = useNavigate();
  const [recordToDelete, setRecordToDelete] = useState<ProductionRecord | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  async function handleConfirmDelete() {
    if (!recordToDelete) return;
    setIsDeleting(true);
    setDeleteError(null);
    try {
      await factoryService.deleteProduction(recordToDelete.id);
      await refetch();
      setRecordToDelete(null);
    } catch (err) {
      setDeleteError(getApiErrorMessage(err, 'Failed to delete production record.'));
    } finally {
      setIsDeleting(false);
    }
  }

  const columns: Column<ProductionRecord>[] = [
    { header: 'Product', render: (r) => <span className="font-medium text-gray-900">{r.productName}</span> },
    { header: 'Product ID', render: (r) => r.productId },
    { header: 'Quantity Produced', render: (r) => r.quantityProduced },
    { header: 'Production Date', render: (r) => new Date(r.productionDate).toLocaleString() },
    { header: 'Created', render: (r) => new Date(r.createdDate).toLocaleString() },
    {
      header: 'Actions',
      render: (r) => (
        <div className="flex items-center gap-3 text-gray-400">
          <button
            title="Edit"
            onClick={() => navigate(`${ADMIN_PATHS.factory.production.list}/${r.id}/edit`, { state: r })}
            className="hover:text-brand transition-colors"
          >
            <Pencil size={16} />
          </button>
          <button
            title="Delete"
            onClick={() => setRecordToDelete(r)}
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
          <h1 className="text-2xl font-semibold text-gray-900">Production Records</h1>
          <p className="text-gray-500 mt-1">Track factory production and its effect on current stock.</p>
        </div>
        <Link
          to={ADMIN_PATHS.factory.production.add}
          className="flex items-center gap-2 bg-brand hover:bg-brand-dark text-white text-sm font-medium px-4 py-2 rounded-md transition-colors"
        >
          <Plus size={16} /> Add Production
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
          <Table columns={columns} data={records} getRowKey={(r) => String(r.id)} />
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
