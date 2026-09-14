import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Pencil, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { useSalesHistory } from '@/hooks/useSalesHistory';
import { depotService } from '@/services/depotService';
import { getApiErrorMessage } from '@/lib/apiClient';
import { Table, type Column } from '@/components/tables/Table';
import { ConfirmDialog } from '@/components/modals/ConfirmDialog';
import { ADMIN_PATHS } from '@/routes/paths';
import type { SaleRecord } from '@/types/sale';

export function SalesListPage() {
  const { sales, isLoading, error, page, totalPages, hasNextPage, hasPrevPage, nextPage, prevPage, refetch } =
    useSalesHistory();
  const navigate = useNavigate();
  const [saleToDelete, setSaleToDelete] = useState<SaleRecord | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  async function handleConfirmDelete() {
    if (!saleToDelete) return;
    setIsDeleting(true);
    setDeleteError(null);
    try {
      await depotService.deleteSale(saleToDelete.id);
      await refetch();
      setSaleToDelete(null);
    } catch (err) {
      setDeleteError(getApiErrorMessage(err, 'Failed to delete sale.'));
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
    { header: 'Sold By', render: (s) => s.soldById },
    { header: 'Date', render: (s) => s.saleDate },
    { header: 'Time', render: (s) => s.saleTime },
    {
      header: 'Actions',
      render: (s) => (
        <div className="flex items-center gap-3 text-gray-400">
          <button
            title="Edit"
            onClick={() => navigate(`${ADMIN_PATHS.depotOps.sales.list}/${s.id}/edit`)}
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
          to={ADMIN_PATHS.depotOps.sales.add}
          className="flex items-center gap-2 bg-brand hover:bg-brand-dark text-white text-sm font-medium px-4 py-2 rounded-md transition-colors"
        >
          <Plus size={16} /> Add Sale
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
          <Table columns={columns} data={sales} getRowKey={(s) => String(s.id)} />
        )}
      </div>

      <div className="flex items-center justify-between mt-4">
        <span className="text-sm text-gray-500">Page {page} of {totalPages}</span>
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
