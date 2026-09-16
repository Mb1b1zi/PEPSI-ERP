import { Warehouse, AlertTriangle, ShoppingCart, DollarSign } from 'lucide-react';
import { useDepotStock } from '@/hooks/useDepotStock';
import { useCurrentSales } from '@/hooks/useCurrentSales';
import { StatCard } from '@/components/cards/StatCard';
import { isLowStock } from '@/lib/restockAlerts';

export function DepotDashboardPage() {
  const { stock, isLoading: isStockLoading, error: stockError } = useDepotStock();
  const { sales, isLoading: isSalesLoading, error: salesError } = useCurrentSales();

  const isLoading = isStockLoading || isSalesLoading;
  const error = stockError ?? salesError;
  const lowStockCount = stock.filter(isLowStock).length;
  const todaysRevenue = sales.reduce((sum, sale) => sum + sale.soldAmount, 0);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold text-gray-900">Depot Dashboard</h1>
      <p className="text-gray-500 mt-1">Overview of depot stock and today's sales.</p>

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
          <StatCard label="Stock Items Tracked" value={stock.length} icon={<Warehouse size={20} />} />
          <StatCard label="Low Stock Items" value={lowStockCount} icon={<AlertTriangle size={20} />} />
          <StatCard label="Today's Sales" value={sales.length} icon={<ShoppingCart size={20} />} />
          <StatCard label="Today's Revenue" value={todaysRevenue.toLocaleString()} icon={<DollarSign size={20} />} />
        </div>
      )}
    </div>
  );
}
