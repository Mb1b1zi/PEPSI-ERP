import { useEffect, useState } from 'react';
import { useUsers } from '@/hooks/useUsers';
import { useDepotLocations } from '@/hooks/useDepotLocations';
import { Table, type Column } from '@/components/tables/Table';
import type { User } from '@/types/user';

const selectClasses =
  'border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand';

/**
 * Boss/CEO's view-only look at who works where. Deliberately has no Actions column and never
 * imports userService's create/update/delete/assignRole methods — this is "view workers of the
 * different depots", not Admin's personnel management screen (UsersListPage), which the Boss/CEO
 * doesn't have write access to anyway. Also skips a Role column: role names live behind
 * GET /admin/roles (admin.roles:read), a permission the Boss/CEO account isn't granted.
 */
export function WorkersPage() {
  const { items, isLoading, error, setPageSize } = useUsers();
  const { depots, isLoading: isDepotsLoading } = useDepotLocations();
  const [depotFilter, setDepotFilter] = useState('');

  useEffect(() => {
    setPageSize(100);
  }, [setPageSize]);

  const depotName = (depotId: number | null) => depots.find((d) => d.id === depotId)?.name ?? '—';
  const workers = depotFilter === '' ? items : items.filter((u) => u.depotId === Number(depotFilter));

  const columns: Column<User>[] = [
    { header: 'Name', render: (u) => <span className="font-medium text-gray-900">{u.name}</span> },
    { header: 'Email', render: (u) => u.email ?? '—' },
    { header: 'Contact', render: (u) => u.contact },
    { header: 'Gender', render: (u) => u.gender },
    { header: 'Depot', render: (u) => depotName(u.depotId) },
  ];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold text-gray-900">Workers by Depot</h1>
      <p className="text-gray-500 mt-1">Personnel across the factory and every depot.</p>

      <div className="mt-6">
        <label className="text-sm font-medium text-gray-700 block mb-1.5">Depot</label>
        <select
          value={depotFilter}
          onChange={(e) => setDepotFilter(e.target.value)}
          disabled={isDepotsLoading}
          className={selectClasses}
        >
          <option value="">All depots</option>
          {depots.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </select>
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
          <Table columns={columns} data={workers} getRowKey={(u) => String(u.id)} />
        )}
      </div>
    </div>
  );
}
