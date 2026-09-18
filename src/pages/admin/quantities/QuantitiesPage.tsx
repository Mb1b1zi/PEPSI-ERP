import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { useQuantities } from '@/hooks/useQuantities';
import { quantityService } from '@/services/quantityService';
import { useToast } from '@/hooks/useToast';
import { Table, type Column } from '@/components/tables/Table';
import { ConfirmDialog } from '@/components/modals/ConfirmDialog';
import { ADMIN_PATHS } from '@/routes/paths';
import type { Quantity } from '@/types/catalog';

export function QuantitiesPage() {
  const { quantities, isLoading, error, refetch } = useQuantities();
  const navigate = useNavigate();
  const toast = useToast();
  const [quantityToDelete, setQuantityToDelete] = useState<Quantity | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleConfirmDelete() {
    if (!quantityToDelete) return;
    setIsDeleting(true);
    try {
      await quantityService.deleteQuantity(quantityToDelete.id);
      toast.success('Quantity deleted.');
      await refetch();
      setQuantityToDelete(null);
    } catch {
      toast.error('Failed to delete quantity.');
    } finally {
      setIsDeleting(false);
    }
  }

  const columns: Column<Quantity>[] = [
    { header: 'Value', render: (q) => <span className="font-medium text-gray-900">{q.value}</span> },
    {
      header: 'Actions',
      render: (q) => (
        <div className="flex items-center gap-3 text-gray-400">
          <button
            title="Edit"
            onClick={() => navigate(`${ADMIN_PATHS.quantities.list}/${q.id}/edit`)}
            className="hover:text-brand transition-colors"
          >
            <Pencil size={16} />
          </button>
          <button title="Delete" onClick={() => setQuantityToDelete(q)} className="hover:text-red-600 transition-colors">
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
          <h1 className="text-2xl font-semibold text-gray-900">Quantities</h1>
          <p className="text-gray-500 mt-1">Pack-size / quantity catalog (e.g. "500ml", "Crate-24").</p>
        </div>
        <Link
          to={ADMIN_PATHS.quantities.add}
          className="flex items-center gap-2 bg-brand hover:bg-brand-dark text-white text-sm font-medium px-4 py-2 rounded-md transition-colors"
        >
          <Plus size={16} /> Add Quantity
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
          <Table columns={columns} data={quantities} getRowKey={(q) => String(q.id)} />
        )}
      </div>

      <ConfirmDialog
        isOpen={quantityToDelete !== null}
        title="Delete quantity?"
        message={`Are you sure you want to delete "${quantityToDelete?.value}"? This cannot be undone.`}
        confirmLabel={isDeleting ? 'Deleting...' : 'Delete'}
        isDestructive
        onConfirm={handleConfirmDelete}
        onCancel={() => setQuantityToDelete(null)}
      />
    </div>
  );
}
