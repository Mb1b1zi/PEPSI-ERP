import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { usePrices } from '@/hooks/usePrices';
import { useCatalog } from '@/hooks/useCatalog';
import { priceService } from '@/services/priceService';
import { useToast } from '@/hooks/useToast';
import { Table, type Column } from '@/components/tables/Table';
import { ConfirmDialog } from '@/components/modals/ConfirmDialog';
import { ADMIN_PATHS } from '@/routes/paths';
import type { Price } from '@/types/price';

export function PricesPage() {
  const { prices, isLoading, error, refetch } = usePrices();
  const { quantities, isLoading: isCatalogLoading } = useCatalog();
  const navigate = useNavigate();
  const toast = useToast();
  const [priceToDelete, setPriceToDelete] = useState<Price | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  function quantityLabel(quantityId: number): string {
    return quantities.find((q) => q.id === quantityId)?.value ?? `Quantity ${quantityId}`;
  }

  async function handleConfirmDelete() {
    if (!priceToDelete) return;
    setIsDeleting(true);
    try {
      await priceService.deletePrice(priceToDelete.quantityId);
      toast.success('Price deleted.');
      await refetch();
      setPriceToDelete(null);
    } catch {
      toast.error('Failed to delete price.');
    } finally {
      setIsDeleting(false);
    }
  }

  const columns: Column<Price>[] = [
    {
      header: 'Quantity',
      render: (p) => (
        <span className="font-medium text-gray-900">{isCatalogLoading ? '…' : quantityLabel(p.quantityId)}</span>
      ),
    },
    { header: 'Amount', render: (p) => p.amount.toLocaleString() },
    {
      header: 'Actions',
      render: (p) => (
        <div className="flex items-center gap-3 text-gray-400">
          <button
            title="Edit"
            onClick={() => navigate(`${ADMIN_PATHS.prices.list}/${p.quantityId}/edit`)}
            className="hover:text-brand transition-colors"
          >
            <Pencil size={16} />
          </button>
          <button title="Delete" onClick={() => setPriceToDelete(p)} className="hover:text-red-600 transition-colors">
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
          <h1 className="text-2xl font-semibold text-gray-900">Prices</h1>
          <p className="text-gray-500 mt-1">
            Price per pack-size, used to auto-price a depot sale when an amount isn't entered manually.
          </p>
        </div>
        <Link
          to={ADMIN_PATHS.prices.add}
          className="flex items-center gap-2 bg-brand hover:bg-brand-dark text-white text-sm font-medium px-4 py-2 rounded-md transition-colors"
        >
          <Plus size={16} /> Add Price
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
          <Table columns={columns} data={prices} getRowKey={(p) => String(p.quantityId)} />
        )}
      </div>

      <ConfirmDialog
        isOpen={priceToDelete !== null}
        title="Delete price?"
        message={`Are you sure you want to delete the price for ${
          priceToDelete ? quantityLabel(priceToDelete.quantityId) : ''
        }? This cannot be undone.`}
        confirmLabel={isDeleting ? 'Deleting...' : 'Delete'}
        isDestructive
        onConfirm={handleConfirmDelete}
        onCancel={() => setPriceToDelete(null)}
      />
    </div>
  );
}
