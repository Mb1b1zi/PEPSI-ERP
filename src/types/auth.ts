/**
 * Wire-format DTOs for the Auth module (docs/api/auth.md). Field names and casing are the
 * backend's, verbatim. These are for the service layer only — no hook, page or component may
 * import them; a service must map them into frontend domain types first.
 */
export interface LoginRequestDto {
  email: string;
  password: string;
}

/** Shared by POST /auth/login's `user` field and the full response of GET /auth/me. */
export interface AuthUserDto {
  id: number;
  username: string;
  personnel_id: number;
  personnel_name: string;
  role_id: number;
  role_name: string;
  permissions: string[];
}

export interface LoginResponseDto {
  access_token: string;
  token_type: string;
  user: AuthUserDto;
}

export type PermissionAction = 'create' | 'read' | 'update' | 'delete';

/**
 * Shape shared by GET /auth/permissions (every permission that exists) and
 * GET /auth/roles/{role_id}/permissions (the subset granted to that role) — same schema,
 * different set of rows. Carries module_key/module_name directly, so there's no need to also
 * call GET /auth/modules just to group permissions by module in a UI.
 */
export interface PermissionEntryDto {
  id: number;
  module_id: number;
  module_key: string;
  module_name: string;
  action: PermissionAction;
}

export interface GrantPermissionsRequestDto {
  permission_ids: number[];
}

// ---------------------------------------------------------------------------
// Domain types
// ---------------------------------------------------------------------------

/** A flat "module:action" string, e.g. "factory.production:create". */
export type Permission = string;

export interface AuthUser {
  id: number;
  username: string;
  personnelId: number;
  personnelName: string;
  roleId: number;
  roleName: string;
  permissions: Permission[];
}

/** What gets persisted across a page reload — see src/lib/authSession.ts. */
export interface AuthSession {
  accessToken: string;
  user: AuthUser;
}

export interface PermissionEntry {
  id: number;
  moduleId: number;
  moduleKey: string;
  moduleName: string;
  action: PermissionAction;
}
