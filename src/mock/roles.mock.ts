import type { RolePermissionMap } from '@/types/role';

export const mockRolePermissions: RolePermissionMap[] = [
  { role: 'Admin', permissions: ['manage_users', 'manage_depots', 'manage_products', 'view_reports'] },
  { role: 'Factory Manager', permissions: ['manage_products', 'view_reports'] },
  { role: 'Depot Attendant', permissions: ['manage_depots'] },
  { role: 'Boss', permissions: ['view_reports'] },
];
