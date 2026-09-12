import { useState } from 'react';
import { useUsers } from '@/hooks/useUsers';
import { userService } from '@/services/userService';
import { Table, type Column } from '@/components/tables/Table';
import { Badge } from '@/components/badges/Badge';
import type { User, UserRole } from '@/types/user';

const ROLES: UserRole[] = ['Admin', 'Factory Manager', 'Depot Attendant', 'Boss'];

const selectClasses =
  'border border-gray-300 rounded-md px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand';

export function RolesPage() {
  const { users, isLoading, error, refetch } = useUsers();
  const [savingId, setSavingId] = useState<string | null>(null);

  async function handleAssignRole(userId: string, role: UserRole) {
    setSavingId(userId);
    try {
      await userService.assignRole(userId, role);
      await refetch();
    } finally {
      setSavingId(null);
    }
  }

  const columns: Column<User>[] = [
    { header: 'Name', render: (u) => <span className="font-medium text-gray-900">{u.name}</span> },
    { header: 'Email', render: (u) => u.email },
    {
      header: 'Current Role',
      render: (u) => <Badge label={u.role} color={u.role === 'Unassigned' ? 'gray' : 'blue'} />,
    },
    {
      header: 'Assign Role',
      render: (u) => (
        <select
          className={selectClasses}
          value={u.role === 'Unassigned' ? '' : u.role}
          disabled={savingId === u.id}
          onChange={(e) => handleAssignRole(u.id, e.target.value as UserRole)}
        >
          <option value="" disabled>
            Select role…
          </option>
          {ROLES.map((role) => (
            <option key={role} value={role}>
              {role}
            </option>
          ))}
        </select>
      ),
    },
  ];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold text-gray-900">Roles & Permissions</h1>
      <p className="text-gray-500 mt-1">Assign a role to each registered user.</p>

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
          <Table columns={columns} data={users} getRowKey={(u) => u.id} />
        )}
      </div>
    </div>
  );
}
