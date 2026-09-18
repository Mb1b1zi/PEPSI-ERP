import { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useRolePermissions } from '@/hooks/useRolePermissions';
import { useRoles } from '@/hooks/useRoles';
import { useToast } from '@/hooks/useToast';
import { getApiErrorMessage } from '@/lib/apiClient';
import { Table, type Column } from '@/components/tables/Table';
import { ADMIN_PATHS } from '@/routes/paths';
import type { PermissionAction, PermissionEntry } from '@/types/auth';

const ACTIONS: PermissionAction[] = ['create', 'read', 'update', 'delete'];

interface ModuleRow {
  moduleKey: string;
  moduleName: string;
  byAction: Partial<Record<PermissionAction, PermissionEntry>>;
}

export function RolePermissionsPage() {
  const { roleId } = useParams();
  const id = Number(roleId);
  const { roles } = useRoles();
  const { allPermissions, grantedIds, isLoading, error, togglingId, toggle } = useRolePermissions(id);
  const toast = useToast();

  const role = roles.find((r) => r.id === id);

  async function handleToggle(permission: PermissionEntry) {
    const wasGranted = grantedIds.has(permission.id);
    try {
      await toggle(permission);
      toast.success(wasGranted ? 'Permission revoked.' : 'Permission granted.');
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to update permission.'));
    }
  }

  const moduleRows = useMemo(() => {
    const map = new Map<string, ModuleRow>();
    for (const permission of allPermissions) {
      const row = map.get(permission.moduleKey) ?? {
        moduleKey: permission.moduleKey,
        moduleName: permission.moduleName,
        byAction: {},
      };
      row.byAction[permission.action] = permission;
      map.set(permission.moduleKey, row);
    }
    return Array.from(map.values()).sort((a, b) => a.moduleKey.localeCompare(b.moduleKey));
  }, [allPermissions]);

  const columns: Column<ModuleRow>[] = [
    { header: 'Module', render: (row) => <span className="font-medium text-gray-900">{row.moduleName}</span> },
    ...ACTIONS.map((action) => ({
      header: action.charAt(0).toUpperCase() + action.slice(1),
      render: (row: ModuleRow) => {
        const permission = row.byAction[action];
        if (!permission) return <span className="text-gray-300">—</span>;
        const isGranted = grantedIds.has(permission.id);
        const isToggling = togglingId === permission.id;
        return (
          <input
            type="checkbox"
            checked={isGranted}
            disabled={isToggling}
            onChange={() => handleToggle(permission)}
            className="h-4 w-4 rounded border-gray-300 text-brand focus:ring-brand/30 disabled:opacity-50"
          />
        );
      },
    })),
  ];

  return (
    <div className="p-6">
      <Link to={ADMIN_PATHS.roles} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 mb-4">
        <ArrowLeft size={14} /> Back to Roles
      </Link>

      <h1 className="text-2xl font-semibold text-gray-900">Permissions — {role?.name ?? `Role ${id}`}</h1>
      <p className="text-gray-500 mt-1">
        Check a box to grant that permission to this role, uncheck to revoke it. Changes take effect immediately —
        no save button needed.
      </p>

      {error && (
        <div className="mt-6 bg-red-50 border border-red-200 text-red-700 text-sm rounded-md px-4 py-3">{error}</div>
      )}

      <div className="mt-6">
        {isLoading ? (
          <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-10 bg-gray-100 rounded animate-pulse" />
            ))}
          </div>
        ) : (
          <Table columns={columns} data={moduleRows} getRowKey={(row) => row.moduleKey} />
        )}
      </div>
    </div>
  );
}
