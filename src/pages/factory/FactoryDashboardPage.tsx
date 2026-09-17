import { Factory, PackageCheck, Warehouse, Boxes } from 'lucide-react';
import { useProductionHistory } from '@/hooks/useProductionHistory';
import { useSupplyHistory } from '@/hooks/useSupplyHistory';
import { useFactoryStock } from '@/hooks/useFactoryStock';
import { StatCard } from '@/components/cards/StatCard';

export function FactoryDashboardPage() {
  const production = useProductionHistory({});
  const supplies = useSupplyHistory({});
  const stock = useFactoryStock();

  const isLoading = production.isLoading || supplies.isLoading || stock.isLoading;
  const error = production.error ?? supplies.error ?? stock.error;
  const totalUnitsInStock = stock.items.reduce((sum, item) => sum + item.availableQuantity, 0);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold text-gray-900">Factory Dashboard</h1>
      <p className="text-gray-500 mt-1">Overview of production, supplies, and factory stock.</p>

      {error && (
        <div className="mt-6 bg-red-50 border border-red-200 text-red-700 text-sm rounded-md px-4 py-3">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-[76px] bg-gray-100 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          <StatCard label="Production Records" value={production.total} icon={<Factory size={20} />} />
          <StatCard label="Supply Records" value={supplies.total} icon={<PackageCheck size={20} />} />
          <StatCard label="Stock Items Tracked" value={stock.items.length} icon={<Warehouse size={20} />} />
          <StatCard label="Total Units in Stock" value={totalUnitsInStock} icon={<Boxes size={20} />} />
        </div>
      )}
    </div>
  );
}
