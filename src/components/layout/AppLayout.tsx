import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Sidebar } from '@/components/sidebar/Sidebar';
import { adminNavConfig } from '@/routes/adminNavConfig';
import { factoryNavConfig } from '@/routes/factoryNavConfig';

export function AppLayout() {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar items={[...adminNavConfig, ...factoryNavConfig]} title="Pepsi Color ERP" />

      <div className="flex flex-col flex-1 min-w-0">
        <Header />
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}