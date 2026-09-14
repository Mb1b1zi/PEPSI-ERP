import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Pencil } from 'lucide-react';
import { userService } from '@/services/userService';
import { useRoles } from '@/hooks/useRoles';
import { useDepotLocations } from '@/hooks/useDepotLocations';
import { ADMIN_PATHS } from '@/routes/paths';
import type { User } from '@/types/user';

export function UserViewPage() {
  const { id } = useParams();
  const [user, setUser] = useState<User | null | undefined>(undefined);
  const { roles } = useRoles();
  const { depots } = useDepotLocations();

  useEffect(() => {
    if (!id) return;
    userService.getUserById(Number(id)).then((foundUser) => {
      setUser(foundUser ?? null);
    });
  }, [id]);

  if (user === undefined) {
    return <div className="p-6 text-gray-500 text-sm">Loading...</div>;
  }

  if (!user) {
    return <div className="p-6 text-gray-500 text-sm">User not found.</div>;
  }

  const roleName = roles.find((r) => r.id === user.roleId)?.name ?? '—';
  const depotName = depots.find((d) => d.id === user.depotId)?.name ?? '—';

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
        <DetailRow label="Email" value={user.email ?? '—'} />
        <DetailRow label="Gender" value={user.gender} />
        <DetailRow label="Contact" value={user.contact} />
        <DetailRow label="Salary" value={user.salary !== null ? user.salary.toLocaleString() : '—'} />
        <DetailRow label="Role" value={roleName} />
        <DetailRow label="Depot" value={depotName} />
        <DetailRow label="Created" value={new Date(user.createdAt).toLocaleString()} />
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
