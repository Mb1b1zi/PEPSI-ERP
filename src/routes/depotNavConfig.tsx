import { Truck } from 'lucide-react';
import { DEPOT_PATHS } from './paths';
import type { NavItem } from '@/types/navigation';

export const depotNavConfig: NavItem[] = [
  {
    label: 'Depot Operations',
    icon: <Truck size={18} />,
    children: [
      { label: 'Confirm/Reject Delivery', path: DEPOT_PATHS.restock.decide },
      { label: 'Restock History', path: DEPOT_PATHS.restock.list },
      { label: 'Depot Stock', path: DEPOT_PATHS.stock },
      { label: 'Add Sale', path: DEPOT_PATHS.sales.add },
      { label: 'Sales History', path: DEPOT_PATHS.sales.list },
      { label: "Today's Sales", path: DEPOT_PATHS.currentSales },
    ],
  },
];
