import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Eye, Pencil, Trash2 } from 'lucide-react';
import { useUsers } from '@/hooks/useUsers';
import { useRoles } from '@/hooks/useRoles';
import { useDepotLocations } from '@/hooks/useDepotLocations';
import { userService } from '@/services/userService';
import { useToast } from '@/hooks/useToast';
import { Table, type Column } from '@/components/tables/Table';
import { Pagination } from '@/components/tables/Pagination';
import { ConfirmDialog } from '@/components/modals/ConfirmDialog';
import { ADMIN_PATHS } from '@/routes/paths';
import type { User } from '@/types/user';

export function UsersListPage() {
  const { items, page, totalPages, total, isLoading, error, setPage, refetch } = useUsers();
  const { roles } = useRoles();
  const { depots } = useDepotLocations();
  const navigate = useNavigate();
  const toast = useToast();
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const roleName = (roleId: number | null) => roles.find((r) => r.id === roleId)?.name ?? '—';
  const depotName = (depotId: number | null) => depots.find((d) => d.id === depotId)?.name ?? '—';

  async function handleConfirmDelete() {
    if (!userToDelete) return;
    setIsDeleting(true);
    try {
      await userService.deleteUser(userToDelete.id);
      toast.success('User deleted.');
      await refetch();
      setUserToDelete(null);
    } catch {
      toast.error('Failed to delete user.');
    } finally {
      setIsDeleting(false);
    }
  }

  const columns: Column<User>[] = [
    { header: 'Name', render: (u) => <span className="font-medium text-gray-900">{u.name}</span> },
    { header: 'Email', render: (u) => u.email ?? '—' },
    { header: 'Contact', render: (u) => u.contact },
    { header: 'Role', render: (u) => roleName(u.roleId) },
    { header: 'Depot', render: (u) => depotName(u.depotId) },
    {
      header: 'Actions',
      render: (u) => (
        <div className="flex items-center gap-3 text-gray-400">
          <button title="View" onClick={() => navigate(`${ADMIN_PATHS.users.list}/${u.id}`)} className="hover:text-brand transition-colors">
            <Eye size={16} />
          </button>
          <button title="Edit" onClick={() => navigate(`${ADMIN_PATHS.users.list}/${u.id}/edit`)} className="hover:text-brand transition-colors">
            <Pencil size={16} />
          </button>
          <button title="Delete" onClick={() => setUserToDelete(u)} className="hover:text-red-600 transition-colors">
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
          <h1 className="text-2xl font-semibold text-gray-900">Users</h1>
          <p className="text-gray-500 mt-1">Manage system users and their access.</p>
        </div>
        <Link
          to={ADMIN_PATHS.users.add}
          className="flex items-center gap-2 bg-brand hover:bg-brand-dark text-white text-sm font-medium px-4 py-2 rounded-md transition-colors"
        >
          <Plus size={16} /> Add User
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
          <Table columns={columns} data={items} getRowKey={(u) => String(u.id)} />
        )}
      </div>

      <div className="mt-4">
        <Pagination currentPage={page} pageSize={10} totalPages={totalPages} totalItems={total} onPageChange={setPage} disabled={isLoading} />
      </div>

      <ConfirmDialog
        isOpen={userToDelete !== null}
        title="Delete user?"
        message={`Are you sure you want to delete ${userToDelete?.name}? This cannot be undone.`}
        confirmLabel={isDeleting ? 'Deleting...' : 'Delete'}
        isDestructive
        onConfirm={handleConfirmDelete}
        onCancel={() => setUserToDelete(null)}
      />
    </div>
  );
}
