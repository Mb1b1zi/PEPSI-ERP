import { LayoutDashboard, Users, Warehouse, Package, ShieldCheck } from 'lucide-react';
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
];