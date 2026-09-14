import { LayoutDashboard, Users, Warehouse, Package, ShieldCheck, Factory, Truck } from 'lucide-react';
import { ADMIN_PATHS } from './paths';
import type { NavItem } from '@/types/navigation';

export const adminNavConfig: NavItem[] = [
  {
    label: 'Dashboard',
    path: ADMIN_PATHS.dashboard,
    icon: <LayoutDashboard size={18} />,
  },
  {
    label: 'Roles & Permissions',
    path: ADMIN_PATHS.roles,
    icon: <ShieldCheck size={18} />,
  },
  {
    label: 'Users',
    icon: <Users size={18} />,
    children: [
      { label: 'All Users', path: ADMIN_PATHS.users.list },
      { label: 'Add User', path: ADMIN_PATHS.users.add },
    ],
  },
  {
    label: 'Depots',
    icon: <Warehouse size={18} />,
    children: [
      { label: 'All Depots', path: ADMIN_PATHS.depots.list },
      { label: 'Add Depot', path: ADMIN_PATHS.depots.add },
    ],
  },
  {
    label: 'Products',
    icon: <Package size={18} />,
    children: [
      { label: 'All Products', path: ADMIN_PATHS.products.list },
      { label: 'Add Product', path: ADMIN_PATHS.products.add },
    ],
  },
  {
    label: 'Factory',
    icon: <Factory size={18} />,
    children: [
      { label: 'Production Records', path: ADMIN_PATHS.factory.production.list },
      { label: 'Add Production', path: ADMIN_PATHS.factory.production.add },
      { label: 'Supply History', path: ADMIN_PATHS.factory.supplies.list },
      { label: 'Add Supply', path: ADMIN_PATHS.factory.supplies.add },
      { label: 'Factory Stock', path: ADMIN_PATHS.factory.stock },
    ],
  },
  {
    label: 'Depot Operations',
    icon: <Truck size={18} />,
    children: [
      { label: 'Confirm/Reject Delivery', path: ADMIN_PATHS.depotOps.restock.decide },
      { label: 'Restock History', path: ADMIN_PATHS.depotOps.restock.list },
      { label: 'Depot Stock', path: ADMIN_PATHS.depotOps.stock },
      { label: 'Add Sale', path: ADMIN_PATHS.depotOps.sales.add },
      { label: 'Sales History', path: ADMIN_PATHS.depotOps.sales.list },
      { label: "Today's Sales", path: ADMIN_PATHS.depotOps.currentSales },
    ],
  },
];