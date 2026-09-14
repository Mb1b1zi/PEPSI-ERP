import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Trash2 } from 'lucide-react';
import { useUsers } from '@/hooks/useUsers';
import { useRoles } from '@/hooks/useRoles';
import { userService } from '@/services/userService';
import { roleService } from '@/services/roleService';
import { useToast } from '@/hooks/useToast';
import { roleSchema, type RoleValues } from '@/schemas/roleSchema';
import { Table, type Column } from '@/components/tables/Table';
import { Pagination } from '@/components/tables/Pagination';
import { ConfirmDialog } from '@/components/modals/ConfirmDialog';
import { FormField } from '@/components/forms/FormField';
import type { User } from '@/types/user';
import type { Role } from '@/types/role';

const inputClasses =
  'border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand';
const selectClasses =
  'border border-gray-300 rounded-md px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand';

export function RolesPage() {
  const { items, page, totalPages, total, isLoading, error, setPage, refetch } = useUsers();
  const { roles, isLoading: isRolesLoading, refetch: refetchRoles } = useRoles();
  const toast = useToast();
  const [savingId, setSavingId] = useState<number | null>(null);
  const [roleToDelete, setRoleToDelete] = useState<Role | null>(null);
  const [isDeletingRole, setIsDeletingRole] = useState(false);
  const [isAddingRole, setIsAddingRole] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RoleValues>({ resolver: zodResolver(roleSchema), defaultValues: { name: '' } });

  async function onAddRole(values: RoleValues) {
    setIsAddingRole(true);
    try {
      await roleService.createRole(values);
      toast.success('Role created.');
      reset({ name: '' });
      await refetchRoles();
    } catch {
      toast.error('Failed to create role.');
    } finally {
      setIsAddingRole(false);
    }
  }

  async function handleConfirmDeleteRole() {
    if (!roleToDelete) return;
    setIsDeletingRole(true);
    try {
      await roleService.deleteRole(roleToDelete.id);
      toast.success('Role deleted.');
      await refetchRoles();
      setRoleToDelete(null);
    } catch {
      toast.error('Failed to delete role.');
    } finally {
      setIsDeletingRole(false);
    }
  }

  async function handleAssignRole(userId: number, roleId: string) {
    if (!roleId) return;
    setSavingId(userId);
    try {
      await userService.assignRole(userId, Number(roleId));
      toast.success('Role assigned.');
      await refetch();
    } catch {
      toast.error('Failed to assign role.');
    } finally {
      setSavingId(null);
    }
  }

  const columns: Column<User>[] = [
    { header: 'Name', render: (u) => <span className="font-medium text-gray-900">{u.name}</span> },
    { header: 'Email', render: (u) => u.email ?? '—' },
    {
      header: 'Current Role',
      render: (u) => roles.find((r) => r.id === u.roleId)?.name ?? 'Unassigned',
    },
    {
      header: 'Assign Role',
      render: (u) => (
        <select
          className={selectClasses}
          value={u.roleId ?? ''}
          disabled={savingId === u.id || isRolesLoading}
          onChange={(e) => handleAssignRole(u.id, e.target.value)}
        >
          <option value="" disabled>
            Select role…
          </option>
          {roles.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name}
            </option>
          ))}
        </select>
      ),
    },
  ];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold text-gray-900">Roles</h1>
      <p className="text-gray-500 mt-1">Manage role names and assign a role to each user.</p>

      <div className="mt-6 bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-sm font-medium text-gray-900 mb-4">Manage Roles</h2>
        <form onSubmit={handleSubmit(onAddRole)} className="flex items-end gap-3 mb-4">
          <FormField label="Role Name" error={errors.name?.message}>
            <input {...register('name')} className={inputClasses} placeholder="e.g. Warehouse Supervisor" />
          </FormField>
          <button
            type="submit"
            disabled={isAddingRole}
            className="flex items-center gap-2 bg-brand hover:bg-brand-dark disabled:opacity-50 text-white text-sm font-medium px-4 py-2 rounded-md transition-colors"
          >
            <Plus size={16} /> Add Role
          </button>
        </form>
        {isRolesLoading ? (
          <div className="text-sm text-gray-500">Loading roles…</div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {roles.map((r) => (
              <span key={r.id} className="inline-flex items-center gap-2 bg-gray-100 text-gray-700 text-sm rounded-full px-3 py-1">
                {r.name}
                <button title="Delete role" onClick={() => setRoleToDelete(r)} className="text-gray-400 hover:text-red-600">
                  <Trash2 size={12} />
                </button>
              </span>
            ))}
          </div>
        )}
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
        isOpen={roleToDelete !== null}
        title="Delete role?"
        message={`Are you sure you want to delete the role "${roleToDelete?.name}"? Users assigned to it will need a new role.`}
        confirmLabel={isDeletingRole ? 'Deleting...' : 'Delete'}
        isDestructive
        onConfirm={handleConfirmDeleteRole}
        onCancel={() => setRoleToDelete(null)}
      />
    </div>
  );
}
