import { Factory } from 'lucide-react';
import { FACTORY_PATHS } from './paths';
import type { NavItem } from '@/types/navigation';

export const factoryNavConfig: NavItem[] = [
  {
    label: 'Factory',
    icon: <Factory size={18} />,
    children: [
      { label: 'Production History', path: FACTORY_PATHS.production.list },
      { label: 'Record Production', path: FACTORY_PATHS.production.add },
      { label: 'Supply History', path: FACTORY_PATHS.supplies.list },
      { label: 'Add Supply', path: FACTORY_PATHS.supplies.add },
      { label: 'Factory Stock', path: FACTORY_PATHS.stock },
    ],
  },
];
