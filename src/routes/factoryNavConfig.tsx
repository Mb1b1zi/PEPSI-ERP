import { Factory, LayoutDashboard } from 'lucide-react';
import { FACTORY_PATHS } from './paths';
import type { NavItem } from '@/types/navigation';

export const factoryNavConfig: NavItem[] = [
  {
    label: 'Factory Dashboard',
    path: FACTORY_PATHS.dashboard,
    icon: <LayoutDashboard size={18} />,
    requiredPermission: ['factory.production:read', 'factory.supplies:read'],
  },
  {
    label: 'Factory',
    icon: <Factory size={18} />,
    children: [
      { label: 'Production History', path: FACTORY_PATHS.production.list, requiredPermission: 'factory.production:read' },
      { label: 'Record Production', path: FACTORY_PATHS.production.add, requiredPermission: 'factory.production:create' },
      { label: 'Supply History', path: FACTORY_PATHS.supplies.list, requiredPermission: 'factory.supplies:read' },
      { label: 'Add Supply', path: FACTORY_PATHS.supplies.add, requiredPermission: 'factory.supplies:create' },
      {
        label: 'Factory Stock',
        path: FACTORY_PATHS.stock,
        requiredPermission: ['factory.production:read', 'factory.supplies:read'],
      },
    ],
  },
];
