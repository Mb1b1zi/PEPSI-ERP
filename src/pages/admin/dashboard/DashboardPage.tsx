import { Users, Warehouse, Package, UserCheck } from 'lucide-react';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import { StatCard } from '@/components/cards/StatCard';

export function DashboardPage() {
  const { stats, isLoading, error } = useDashboardStats();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold text-gray-900">Admin Dashboard</h1>
      <p className="text-gray-500 mt-1">Overview of your ERP system.</p>

      {error && (
        <div className="mt-6 bg-red-50 border border-red-200 text-red-700 text-sm rounded-md px-4 py-3">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-[76px] bg-gray-100 rounded-lg animate-pulse"
            />
          ))}
        </div>
      ) : (
        stats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
            <StatCard label="Total Users" value={stats.totalUsers} icon={<Users size={20} />} />
            <StatCard label="Active Users" value={stats.activeUsers} icon={<UserCheck size={20} />} />
            <StatCard label="Total Depots" value={stats.totalDepots} icon={<Warehouse size={20} />} />
            <StatCard label="Total Products" value={stats.totalProducts} icon={<Package size={20} />} />
          </div>
        )
      )}
    </div>
  );
}