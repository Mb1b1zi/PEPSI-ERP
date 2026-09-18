/**
 * Admin Roles (docs/api/openapi.json). Endpoints implemented here:
 *   POST   /admin/roles
 *   GET    /admin/roles
 *   PUT    /admin/roles/{role_id}
 *   DELETE /admin/roles/{role_id}
 *
 * Roles are name-only — no permissions concept exists in the backend. Reference: "Module
 * implementation pattern" in CLAUDE.md. Roles lists are small; not paginated in the UI even
 * though the endpoint itself accepts page/page_size.
 */
import { apiRequest } from '@/lib/apiClient';
import { apiConfig } from '@/lib/config';
import { mockRoles } from '@/mock/roles.mock';
import type { RoleDto, CreateRoleRequestDto, Role, CreateRoleInput, UpdateRoleInput } from '@/types/role';

function simulateDelay<T>(data: T, ms = 400): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(data), ms));
}

interface AdminPageDto<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
}

function toRole(dto: RoleDto): Role {
  return { id: dto.id, name: dto.name };
}

let mockStore: Role[] = [...mockRoles];
let nextMockId = mockStore.reduce((max, r) => Math.max(max, r.id), 0) + 1;

export const roleService = {
  async getRoles(): Promise<Role[]> {
    if (apiConfig.useMockApi) {
      return simulateDelay(mockStore);
    }
    const response = await apiRequest<AdminPageDto<RoleDto>>('/admin/roles?page=1&page_size=100');
    return response.items.map(toRole);
  },

  /** POST /admin/roles takes an array (RoleCreate[] in, RoleRead[] out) — same batch-creation
   *  convention as every other Admin resource (Depots/Products/Quantities/Prices/Personnel). */
  async createRole(input: CreateRoleInput): Promise<Role> {
    if (apiConfig.useMockApi) {
      const newRole: Role = { id: nextMockId++, name: input.name };
      mockStore = [...mockStore, newRole];
      return simulateDelay(newRole);
    }
    const body: CreateRoleRequestDto[] = [{ name: input.name }];
    const dtos = await apiRequest<RoleDto[]>('/admin/roles', { method: 'POST', body: JSON.stringify(body) });
    return toRole(dtos[0]);
  },

  async updateRole(id: number, input: UpdateRoleInput): Promise<Role | undefined> {
    if (apiConfig.useMockApi) {
      mockStore = mockStore.map((r) => (r.id === id ? { ...r, name: input.name } : r));
      return simulateDelay(mockStore.find((r) => r.id === id));
    }
    const body: CreateRoleRequestDto = { name: input.name };
    const dto = await apiRequest<RoleDto>(`/admin/roles/${id}`, { method: 'PUT', body: JSON.stringify(body) });
    return toRole(dto);
  },

  async deleteRole(id: number): Promise<void> {
    if (apiConfig.useMockApi) {
      mockStore = mockStore.filter((r) => r.id !== id);
      return simulateDelay(undefined);
    }
    return apiRequest<void>(`/admin/roles/${id}`, { method: 'DELETE' });
  },
};
