import { Truck, LayoutDashboard } from 'lucide-react';
import { DEPOT_PATHS } from './paths';
import type { NavItem } from '@/types/navigation';

export const depotNavConfig: NavItem[] = [
  {
    label: 'Depot Dashboard',
    path: DEPOT_PATHS.dashboard,
    icon: <LayoutDashboard size={18} />,
    requiredPermission: ['depot.restock:read', 'depot.sales:read'],
  },
  {
    label: 'Depot Operations',
    icon: <Truck size={18} />,
    children: [
      { label: 'Confirm/Reject Delivery', path: DEPOT_PATHS.restock.decide, requiredPermission: 'depot.restock:create' },
      { label: 'Restock History', path: DEPOT_PATHS.restock.list, requiredPermission: 'depot.restock:read' },
      { label: 'Depot Stock', path: DEPOT_PATHS.stock, requiredPermission: 'depot.restock:read' },
      { label: 'Add Sale', path: DEPOT_PATHS.sales.add, requiredPermission: 'depot.sales:create' },
      { label: 'Sales History', path: DEPOT_PATHS.sales.list, requiredPermission: 'depot.sales:read' },
      { label: "Today's Sales", path: DEPOT_PATHS.currentSales, requiredPermission: 'depot.sales:read' },
    ],
  },
];
