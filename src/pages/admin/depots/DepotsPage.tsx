import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { useDepotLocations } from '@/hooks/useDepotLocations';
import { depotLocationService } from '@/services/depotLocationService';
import { useToast } from '@/hooks/useToast';
import { Table, type Column } from '@/components/tables/Table';
import { ConfirmDialog } from '@/components/modals/ConfirmDialog';
import { ADMIN_PATHS } from '@/routes/paths';
import type { Depot } from '@/types/catalog';

export function DepotsPage() {
  const { depots, isLoading, error, refetch } = useDepotLocations();
  const navigate = useNavigate();
  const toast = useToast();
  const [depotToDelete, setDepotToDelete] = useState<Depot | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleConfirmDelete() {
    if (!depotToDelete) return;
    setIsDeleting(true);
    try {
      await depotLocationService.deleteDepot(depotToDelete.id);
      toast.success('Depot deleted.');
      await refetch();
      setDepotToDelete(null);
    } catch {
      toast.error('Failed to delete depot.');
    } finally {
      setIsDeleting(false);
    }
  }

  const columns: Column<Depot>[] = [
    { header: 'Name', render: (d) => <span className="font-medium text-gray-900">{d.name}</span> },
    { header: 'Location', render: (d) => d.location },
    {
      header: 'Actions',
      render: (d) => (
        <div className="flex items-center gap-3 text-gray-400">
          <button
            title="Edit"
            onClick={() => navigate(`${ADMIN_PATHS.depots.list}/${d.id}/edit`)}
            className="hover:text-brand transition-colors"
          >
            <Pencil size={16} />
          </button>
          <button title="Delete" onClick={() => setDepotToDelete(d)} className="hover:text-red-600 transition-colors">
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
          <h1 className="text-2xl font-semibold text-gray-900">Depots</h1>
          <p className="text-gray-500 mt-1">Manage depot locations.</p>
        </div>
        <Link
          to={ADMIN_PATHS.depots.add}
          className="flex items-center gap-2 bg-brand hover:bg-brand-dark text-white text-sm font-medium px-4 py-2 rounded-md transition-colors"
        >
          <Plus size={16} /> Add Depot
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
          <Table columns={columns} data={depots} getRowKey={(d) => String(d.id)} />
        )}
      </div>

      <ConfirmDialog
        isOpen={depotToDelete !== null}
        title="Delete depot?"
        message={`Are you sure you want to delete ${depotToDelete?.name}? This cannot be undone.`}
        confirmLabel={isDeleting ? 'Deleting...' : 'Delete'}
        isDestructive
        onConfirm={handleConfirmDelete}
        onCancel={() => setDepotToDelete(null)}
      />
    </div>
  );
}
