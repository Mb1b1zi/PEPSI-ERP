/**
 * Admin Personnel (docs/api/openapi.json — no hand-written doc yet, see docs/api/README.md
 * open question 11). Endpoints implemented here:
 *   POST   /admin/personnel
 *   GET    /admin/personnel
 *   GET    /admin/personnel/{personnel_id}
 *   PUT    /admin/personnel/{personnel_id}
 *   DELETE /admin/personnel/{personnel_id}
 *   PATCH  /admin/personnel/{personnel_id}/role
 *   PATCH  /admin/personnel/{personnel_id}/depot
 *
 * Reference: "Module implementation pattern" in CLAUDE.md — Dto -> mapper -> mock/real
 * switch -> Paged<T> -> hook -> page. Admin's Page[T] wrapper has no total_pages; computed
 * client-side (Math.ceil(total / page_size)).
 */
import { apiRequest } from '@/lib/apiClient';
import { apiConfig } from '@/lib/config';
import { buildQuery } from '@/lib/queryString';
import { mockUsers } from '@/mock/users.mock';
import type { Paged } from '@/types/api';
import type { PersonnelDto, CreatePersonnelRequestDto, User, CreateUserInput, UpdateUserInput } from '@/types/user';

function simulateDelay<T>(data: T, ms = 400): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(data), ms));
}

const MAX_PAGE_SIZE = 100;

interface AdminPageDto<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
}

function toUser(dto: PersonnelDto): User {
  return {
    id: dto.id,
    name: dto.name,
    email: dto.email,
    gender: dto.gender,
    contact: dto.contact,
    salary: dto.salary === null ? null : Number(dto.salary),
    roleId: dto.role_id,
    depotId: dto.depot_id,
    createdAt: dto.created_at,
  };
}

function toPersonnelBody(input: CreateUserInput): CreatePersonnelRequestDto {
  return {
    role_id: input.roleId,
    depot_id: input.depotId,
    name: input.name,
    email: input.email,
    gender: input.gender,
    contact: input.contact,
    salary: input.salary,
  };
}

export interface GetUsersParams {
  page: number;
  pageSize: number;
}

let mockStore: User[] = [...mockUsers];
let nextMockId = mockStore.reduce((max, u) => Math.max(max, u.id), 0) + 1;

export const userService = {
  async getUsers(params: GetUsersParams): Promise<Paged<User>> {
    const pageSize = Math.min(params.pageSize, MAX_PAGE_SIZE);

    if (apiConfig.useMockApi) {
      const start = (params.page - 1) * pageSize;
      const items = mockStore.slice(start, start + pageSize);
      return simulateDelay({
        items,
        total: mockStore.length,
        page: params.page,
        pageSize,
        totalPages: Math.max(1, Math.ceil(mockStore.length / pageSize)),
      });
    }

    const query = buildQuery({ page: params.page, page_size: pageSize });
    const response = await apiRequest<AdminPageDto<PersonnelDto>>(`/admin/personnel${query}`);
    return {
      items: response.items.map(toUser),
      total: response.total,
      page: response.page,
      pageSize: response.page_size,
      totalPages: Math.max(1, Math.ceil(response.total / response.page_size)),
    };
  },

  async getUserById(id: number): Promise<User | undefined> {
    if (apiConfig.useMockApi) {
      return simulateDelay(mockStore.find((u) => u.id === id));
    }
    const dto = await apiRequest<PersonnelDto>(`/admin/personnel/${id}`);
    return toUser(dto);
  },

  async createUser(input: CreateUserInput): Promise<User> {
    if (apiConfig.useMockApi) {
      const newUser: User = {
        id: nextMockId++,
        name: input.name,
        email: input.email ?? null,
        gender: input.gender,
        contact: input.contact,
        salary: input.salary ?? null,
        roleId: input.roleId ?? null,
        depotId: input.depotId ?? null,
        createdAt: new Date().toISOString(),
      };
      mockStore = [...mockStore, newUser];
      return simulateDelay(newUser);
    }

    const dto = await apiRequest<PersonnelDto>('/admin/personnel', {
      method: 'POST',
      body: JSON.stringify(toPersonnelBody(input)),
    });
    return toUser(dto);
  },

  async updateUser(id: number, input: UpdateUserInput): Promise<User | undefined> {
    if (apiConfig.useMockApi) {
      mockStore = mockStore.map((u) =>
        u.id === id
          ? {
              ...u,
              name: input.name,
              email: input.email ?? null,
              gender: input.gender,
              contact: input.contact,
              salary: input.salary ?? null,
              roleId: input.roleId ?? u.roleId,
              depotId: input.depotId ?? u.depotId,
            }
          : u,
      );
      return simulateDelay(mockStore.find((u) => u.id === id));
    }

    const dto = await apiRequest<PersonnelDto>(`/admin/personnel/${id}`, {
      method: 'PUT',
      body: JSON.stringify(toPersonnelBody(input)),
    });
    return toUser(dto);
  },

  async deleteUser(id: number): Promise<void> {
    if (apiConfig.useMockApi) {
      mockStore = mockStore.filter((u) => u.id !== id);
      return simulateDelay(undefined);
    }
    return apiRequest<void>(`/admin/personnel/${id}`, { method: 'DELETE' });
  },

  async assignRole(id: number, roleId: number): Promise<User | undefined> {
    if (apiConfig.useMockApi) {
      mockStore = mockStore.map((u) => (u.id === id ? { ...u, roleId } : u));
      return simulateDelay(mockStore.find((u) => u.id === id));
    }
    const dto = await apiRequest<PersonnelDto>(`/admin/personnel/${id}/role`, {
      method: 'PATCH',
      body: JSON.stringify({ role_id: roleId }),
    });
    return toUser(dto);
  },

  async assignDepot(id: number, depotId: number): Promise<User | undefined> {
    if (apiConfig.useMockApi) {
      mockStore = mockStore.map((u) => (u.id === id ? { ...u, depotId } : u));
      return simulateDelay(mockStore.find((u) => u.id === id));
    }
    const dto = await apiRequest<PersonnelDto>(`/admin/personnel/${id}/depot`, {
      method: 'PATCH',
      body: JSON.stringify({ depot_id: depotId }),
    });
    return toUser(dto);
  },
};
