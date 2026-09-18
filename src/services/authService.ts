/**
 * Auth Module (docs/api/auth.md). Endpoints implemented here:
 *   POST   /auth/login
 *   GET    /auth/me
 *   GET    /auth/permissions
 *   GET    /auth/roles/{role_id}/permissions
 *   POST   /auth/roles/{role_id}/permissions
 *   DELETE /auth/roles/{role_id}/permissions/{permission_id}
 *
 * GET /auth/modules isn't called separately — GET /auth/permissions already carries
 * module_key/module_name on every row, which is enough to group permissions by module in a UI.
 *
 * Unlike Factory/Depot, this always calls the real backend — there's no meaningful way to mock
 * a password check, and the doc provides a real bootstrap account for local development
 * (admin@pepsidepo.com / Admin123) specifically so the frontend can build against the live API
 * from the start. No apiConfig.useMockApi branch here.
 */
import { apiRequest } from '@/lib/apiClient';
import type {
  LoginRequestDto,
  LoginResponseDto,
  AuthUserDto,
  AuthUser,
  AuthSession,
  PermissionEntryDto,
  PermissionEntry,
  GrantPermissionsRequestDto,
} from '@/types/auth';

function toAuthUser(dto: AuthUserDto): AuthUser {
  return {
    id: dto.id,
    username: dto.username,
    personnelId: dto.personnel_id,
    personnelName: dto.personnel_name,
    roleId: dto.role_id,
    roleName: dto.role_name,
    permissions: dto.permissions,
  };
}

function toPermissionEntry(dto: PermissionEntryDto): PermissionEntry {
  return { id: dto.id, moduleId: dto.module_id, moduleKey: dto.module_key, moduleName: dto.module_name, action: dto.action };
}

export const authService = {
  async login(email: string, password: string): Promise<AuthSession> {
    const body: LoginRequestDto = { email, password };
    const dto = await apiRequest<LoginResponseDto>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(body),
    });
    return { accessToken: dto.access_token, user: toAuthUser(dto.user) };
  },

  async me(): Promise<AuthUser> {
    const dto = await apiRequest<AuthUserDto>('/auth/me');
    return toAuthUser(dto);
  },

  /** Every permission that exists in the system (4 per module: create/read/update/delete). */
  async listPermissions(): Promise<PermissionEntry[]> {
    const dtos = await apiRequest<PermissionEntryDto[]>('/auth/permissions');
    return dtos.map(toPermissionEntry);
  },

  /** The subset of permissions currently granted to one role. */
  async getRolePermissions(roleId: number): Promise<PermissionEntry[]> {
    const dtos = await apiRequest<PermissionEntryDto[]>(`/auth/roles/${roleId}/permissions`);
    return dtos.map(toPermissionEntry);
  },

  /** Already-granted permission ids are silently skipped by the backend, not an error. Returns
   *  the role's full updated permission list. */
  async grantPermissions(roleId: number, permissionIds: number[]): Promise<PermissionEntry[]> {
    const body: GrantPermissionsRequestDto = { permission_ids: permissionIds };
    const dtos = await apiRequest<PermissionEntryDto[]>(`/auth/roles/${roleId}/permissions`, {
      method: 'POST',
      body: JSON.stringify(body),
    });
    return dtos.map(toPermissionEntry);
  },

  async revokePermission(roleId: number, permissionId: number): Promise<void> {
    return apiRequest<void>(`/auth/roles/${roleId}/permissions/${permissionId}`, { method: 'DELETE' });
  },
};
