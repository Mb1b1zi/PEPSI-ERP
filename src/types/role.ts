import type { Permission, UserRole } from '@/types/user';

export interface RolePermissionMap {
  role: UserRole;
  permissions: Permission[];
}
