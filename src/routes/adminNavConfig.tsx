import { LayoutDashboard, Users, Warehouse, Package, ShieldCheck, Ruler, Tag } from 'lucide-react';
import { ADMIN_PATHS } from './paths';
import type { NavItem } from '@/types/navigation';

export const adminNavConfig: NavItem[] = [
  {
    label: 'Dashboard',
    path: ADMIN_PATHS.dashboard,
    icon: <LayoutDashboard size={18} />,
    requiredPermission: 'admin.personnel:read',
  },
  {
    label: 'Roles & Permissions',
    path: ADMIN_PATHS.roles,
    icon: <ShieldCheck size={18} />,
    requiredPermission: 'admin.roles:read',
  },
  {
    label: 'Users',
    icon: <Users size={18} />,
    children: [
      { label: 'All Users', path: ADMIN_PATHS.users.list, requiredPermission: 'admin.personnel:read' },
      { label: 'Add User', path: ADMIN_PATHS.users.add, requiredPermission: 'admin.personnel:create' },
    ],
  },
  {
    label: 'Depots',
    icon: <Warehouse size={18} />,
    children: [
      { label: 'All Depots', path: ADMIN_PATHS.depots.list, requiredPermission: 'admin.depots:read' },
      { label: 'Add Depot', path: ADMIN_PATHS.depots.add, requiredPermission: 'admin.depots:create' },
    ],
  },
  {
    label: 'Products',
    icon: <Package size={18} />,
    children: [
      { label: 'All Products', path: ADMIN_PATHS.products.list, requiredPermission: 'admin.products:read' },
      { label: 'Add Product', path: ADMIN_PATHS.products.add, requiredPermission: 'admin.products:create' },
    ],
  },
  {
    label: 'Quantities',
    icon: <Ruler size={18} />,
    children: [
      { label: 'All Quantities', path: ADMIN_PATHS.quantities.list, requiredPermission: 'admin.quantities:read' },
      { label: 'Add Quantity', path: ADMIN_PATHS.quantities.add, requiredPermission: 'admin.quantities:create' },
    ],
  },
  {
    label: 'Prices',
    icon: <Tag size={18} />,
    children: [
      { label: 'All Prices', path: ADMIN_PATHS.prices.list, requiredPermission: 'admin.prices:read' },
      { label: 'Add Price', path: ADMIN_PATHS.prices.add, requiredPermission: 'admin.prices:create' },
    ],
  },
];
