import { LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Breadcrumbs } from '@/components/breadcrumbs/Breadcrumbs';
import { useAuth } from '@/hooks/useAuth';
import { AUTH_PATHS } from '@/routes/paths';

export function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleSignOut() {
    logout();
    navigate(AUTH_PATHS.login, { replace: true });
  }

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shrink-0">
      <Breadcrumbs />
      {user && (
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm font-medium text-gray-900">{user.personnelName}</p>
            <p className="text-xs text-gray-500">{user.roleName}</p>
          </div>
          <button
            onClick={handleSignOut}
            title="Sign out"
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md border border-gray-300"
          >
            <LogOut size={14} /> Sign out
          </button>
        </div>
      )}
    </header>
  );
}