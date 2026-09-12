import type { UserAccountRole } from '@/types/user';
import type { RolePermissionMap } from '@/types/role';
import { mockRolePermissions } from '@/mock/roles.mock';

function simulateDelay<T>(data: T, ms = 500): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(data), ms));
}

export const roleService = {
  async getRoleByName(role: UserAccountRole): Promise<RolePermissionMap | undefined> {
    return simulateDelay(mockRolePermissions.find((r) => r.role === role));
  },
};
