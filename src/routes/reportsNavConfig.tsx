import { BarChart3, FileBarChart } from 'lucide-react';
import { REPORTS_PATHS } from './paths';
import type { NavItem } from '@/types/navigation';

export const reportsNavConfig: NavItem[] = [
  {
    label: 'Reports & Overview',
    icon: <BarChart3 size={18} />,
    children: [
      {
        label: 'Company Overview',
        path: REPORTS_PATHS.overview,
        // Requires ALL four (not "any of") — genuine cross-company read access, not just a
        // partial slice like Factory Manager's view-only depot.sales:read.
        requiredPermissions: [
          'factory.production:read',
          'factory.supplies:read',
          'depot.restock:read',
          'depot.sales:read',
        ],
      },
      { label: 'Workers by Depot', path: REPORTS_PATHS.workers, requiredPermission: 'admin.personnel:read' },
    ],
  },
  {
    label: 'Generate Reports',
    icon: <FileBarChart size={18} />,
    children: [
      { label: 'Sales Report', path: REPORTS_PATHS.sales, requiredPermission: 'depot.sales:read' },
      { label: 'Restock Report', path: REPORTS_PATHS.stock, requiredPermission: 'depot.restock:read' },
      { label: 'Supply Report', path: REPORTS_PATHS.supply, requiredPermission: 'factory.supplies:read' },
      { label: 'Production Report', path: REPORTS_PATHS.production, requiredPermission: 'factory.production:read' },
    ],
  },
];
