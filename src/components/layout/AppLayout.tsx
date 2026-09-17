import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Sidebar } from '@/components/sidebar/Sidebar';
import { getNavSections } from '@/lib/navSections';
import { useAuth } from '@/hooks/useAuth';
import { filterNavItems } from '@/lib/filterNavItems';

export function AppLayout() {
  const { user, hasPermission } = useAuth();
  const navItems = user ? filterNavItems(getNavSections(user), hasPermission) : [];

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar items={navItems} title="Pepsi Color ERP" />

      <div className="flex flex-col flex-1 min-w-0">
        <Header />
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
