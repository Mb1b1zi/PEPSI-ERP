/**
 * Wire-format DTOs for Admin Roles (docs/api/openapi.json). RoleRead is name-only — there is
 * no permissions concept anywhere in the backend; the frontend's old RolePermissionMap/
 * Permission types had no real counterpart and have been dropped.
 */
export interface RoleDto {
  id: number;
  name: string;
}

export interface CreateRoleRequestDto {
  name: string;
}

// ---------------------------------------------------------------------------
// Domain types
// ---------------------------------------------------------------------------

export interface Role {
  id: number;
  name: string;
}

export interface CreateRoleInput {
  name: string;
}

export type UpdateRoleInput = CreateRoleInput;
