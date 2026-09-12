import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Pencil } from 'lucide-react';
import { userService } from '@/services/userService';
import { roleService } from '@/services/roleService';
import { Badge } from '@/components/badges/Badge';
import { ADMIN_PATHS } from '@/routes/paths';
import type { User } from '@/types/user';
import type { Permission } from '@/types/user';

export function UserViewPage() {
  const { id } = useParams();
  const [user, setUser] = useState<User | null | undefined>(undefined);
  const [rolePermissions, setRolePermissions] = useState<Permission[]>([]);

  useEffect(() => {
    if (!id) return;
    userService.getUserById(id).then((foundUser) => {
      setUser(foundUser ?? null);
      if (foundUser) {
        roleService.getRoleByName(foundUser.role).then((mapping) => {
          setRolePermissions(mapping?.permissions ?? []);
        });
      }
    });
  }, [id]);

  if (user === undefined) {
    return <div className="p-6 text-gray-500 text-sm">Loading...</div>;
  }

  if (!user) {
    return <div className="p-6 text-gray-500 text-sm">User not found.</div>;
  }

  return (
    <div className="p-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">{user.name}</h1>
        <Link
          to={`${ADMIN_PATHS.users.list}/${user.id}/edit`}
          className="flex items-center gap-2 text-sm text-brand hover:text-brand-dark font-medium"
        >
          <Pencil size={14} /> Edit
        </Link>
      </div>

      <div className="mt-6 bg-white border border-gray-200 rounded-lg divide-y divide-gray-100">
        <DetailRow label="Email" value={user.email} />
        <DetailRow label="Contact" value={user.contact} />
        <DetailRow label="Role" value={<Badge label={user.role} color={user.role === 'Unassigned' ? 'gray' : 'blue'} />} />
        <DetailRow label="Status" value={<Badge label={user.status} color={user.status === 'active' ? 'green' : 'red'} />} />
        <DetailRow
          label="Permissions (via role)"
          value={
            rolePermissions.length
              ? rolePermissions.map((p) => p.replace('_', ' ')).join(', ')
              : 'None — role has no permissions assigned'
          }
        />
      </div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between px-5 py-3">
      <span className="text-sm text-gray-500">{label}</span>
      <span className="text-sm text-gray-900">{value}</span>
    </div>
  );
}