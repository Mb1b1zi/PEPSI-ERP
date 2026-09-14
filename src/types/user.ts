/**
 * Wire-format DTOs for Admin Personnel (docs/api/openapi.json — no hand-written doc yet,
 * see docs/api/README.md open question 11). Field names and casing are the backend's,
 * verbatim. Confined to the service layer.
 */
export type Gender = 'Male' | 'Female';

export interface PersonnelDto {
  id: number;
  role_id: number | null;
  depot_id: number | null;
  name: string;
  email: string | null;
  gender: Gender;
  contact: string;
  salary: string | null;
  created_at: string;
}

export interface CreatePersonnelRequestDto {
  role_id?: number;
  depot_id?: number;
  name: string;
  email?: string;
  gender: Gender;
  contact: string;
  salary?: number;
}

// ---------------------------------------------------------------------------
// Domain types. There is no `status` or `password` field here — neither exists on
// PersonnelDto, and no auth scheme exists anywhere in this app (docs/api/README.md open
// question 8).
// ---------------------------------------------------------------------------

export interface User {
  id: number;
  name: string;
  email: string | null;
  gender: Gender;
  contact: string;
  salary: number | null;
  roleId: number | null;
  depotId: number | null;
  createdAt: string;
}

export interface CreateUserInput {
  name: string;
  email?: string;
  gender: Gender;
  contact: string;
  salary?: number;
  roleId?: number;
  depotId?: number;
}

export type UpdateUserInput = CreateUserInput;
