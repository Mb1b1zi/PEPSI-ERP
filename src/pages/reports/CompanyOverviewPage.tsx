import { useDashboardSummary } from '@/hooks/useDashboardSummary';
import { StatCard } from '@/components/cards/StatCard';
import { Factory, Boxes, PackageCheck, Truck, Warehouse, ShoppingCart } from 'lucide-react';
import { FACTORY_PATHS, DEPOT_PATHS } from '@/routes/paths';

/**
 * Curated to production/supplies/sales activity only — the Boss's concern, per the user's own
 * framing ("view what the rest of the users are doing in terms of production, sales, and
 * supplies"). Deliberately excludes /dashboard/summary's admin-y catalog counts (products,
 * depots, personnel) — those belong to the Admin Dashboard, not this page.
 *
 * `to` is our own frontend route for each card, not /dashboard/summary's `link` field — that
 * field is a backend API path (e.g. `/factory/supplies?status=pending`), not a route in this
 * app, so it's mapped here to the matching history/list page instead of followed directly.
 */
const OPERATIONAL_CARDS: Record<string, { icon: React.ReactNode; to: string }> = {
  production_today: { icon: <Factory size={20} />, to: FACTORY_PATHS.production.list },
  factory_stock: { icon: <Boxes size={20} />, to: FACTORY_PATHS.stock },
  pending_supplies: { icon: <PackageCheck size={20} />, to: FACTORY_PATHS.supplies.list },
  restocks_today: { icon: <Truck size={20} />, to: DEPOT_PATHS.restock.list },
  depot_stock: { icon: <Warehouse size={20} />, to: DEPOT_PATHS.stock },
  sales_today: { icon: <ShoppingCart size={20} />, to: DEPOT_PATHS.sales.list },
};

export function CompanyOverviewPage() {
  const { summary, isLoading, error } = useDashboardSummary();
  const cards = summary?.cards.filter((card) => card.key in OPERATIONAL_CARDS) ?? [];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold text-gray-900">Company Overview</h1>
      <p className="text-gray-500 mt-1">Production, supplies, and sales activity across the company.</p>

      {error && (
        <div className="mt-6 bg-red-50 border border-red-200 text-red-700 text-sm rounded-md px-4 py-3">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-[76px] bg-gray-100 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
          {cards.map((card) => (
            <StatCard
              key={card.key}
              label={card.title}
              value={card.value}
              subtitle={card.subtitle ?? undefined}
              icon={OPERATIONAL_CARDS[card.key].icon}
              to={OPERATIONAL_CARDS[card.key].to}
            />
          ))}
        </div>
      )}
    </div>
  );
}
