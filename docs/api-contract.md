# API Contract

## Status

Factory and Depot are now documented directly by the backend team — see [`docs/api/`](./api/). This file no longer proposes endpoints for either module; it exists only for the parts of the API the backend hasn't documented yet: the **Admin** module and **authentication**.

**Confirmed** below means written by the backend team in `docs/api/factory.md` or `docs/api/depot.md`. **Proposed** means authored by the frontend from its current code/mock shape, not yet reviewed or implemented by the backend — treat every proposed field/endpoint as a starting point for discussion, not a spec.

## Documented modules (confirmed)

| Module | Doc |
|---|---|
| Factory | [`docs/api/factory.md`](./api/factory.md) |
| Depot | [`docs/api/depot.md`](./api/depot.md) |

Confirmed fact from those two docs, relevant to the section below: the Factory and Depot modules both read and write shared Admin tables named `products`, `quantities`, `depots`, `personnel`, and `prices`. Their endpoints are not documented anywhere yet — only their existence, as tables other modules depend on.

## Admin module (proposed)

No Admin endpoint documentation exists. The proposal below is derived from the frontend's current mock-backed services (`src/services/userService.ts`, `src/services/roleService.ts`, `src/services/dashboardService.ts`) and from the `User`/`RolePermissionMap`/`DashboardStats` types they use. It is offered as a discussion starting point, not a request — the actual endpoint names, casing, and pagination scheme are for the backend to decide, ideally aligned with the `skip`/`limit` (Factory) or `page`/`page_size` (Depot) conventions already established.

### Personnel (maps to the frontend's `User`)

The frontend's `userService` currently exposes `getUsers()`, `getUserById(id)`, `createUser(data)`, `updateUser(id, data)`, `assignRole(id, role)`, and `deleteUser(id)`, over a `User` shape of `{ id, name, email, contact, role, status }`. Proposed:

- `GET /admin/personnel` — list, paginated
- `GET /admin/personnel/{id}` — single record
- `POST /admin/personnel` — create
- `PUT /admin/personnel/{id}` — update
- `PATCH /admin/personnel/{id}/role` — role assignment (kept separate today because the frontend's Roles screen assigns roles independently of editing a user's profile)
- `DELETE /admin/personnel/{id}` — delete

**Open question (see [`docs/api/README.md`](./api/README.md#open-questions-for-the-backend-team)):** whether `personnel` is the same entity as this `User` shape at all, and what its real field names are.

### Roles & permissions

`roleService.getRoleByName(role)` currently looks up a static `{ role, permissions[] }` map. Proposed: `GET /admin/roles` returning that same shape per role, if the backend models permissions as data rather than an enum baked into `personnel`.

### Depots & Products

Routes and nav entries already exist for these (`ADMIN_PATHS.depots.list`, `ADMIN_PATHS.products.list`), but the frontend has no service or mock data for them yet — only placeholder pages. No proposal is made here beyond noting that the backend has already confirmed `depots`, `products`, and `quantities` as Admin-owned tables (see above); once endpoint shapes exist, this section should be filled in the same way as Personnel.

### Dashboard stats

`dashboardService.getStats()` returns `{ totalUsers, totalDepots, totalProducts, activeUsers }`. This is most likely a client-side aggregation over the Personnel/Depot/Product lists above rather than its own endpoint — flagged here rather than proposed, since inventing a dedicated `/admin/dashboard` endpoint isn't grounded in anything the backend has confirmed.

## Authentication (proposed)

No authentication service exists in the frontend yet, and no scheme is documented by the backend (see open question #8). This section is a from-scratch proposal, not a description of existing frontend code, sketched to match the async, `simulateDelay`-style shape the other mock services already use:

- `POST /auth/login` — `{ email, password }` → session/token + current user
- `POST /auth/logout` — invalidate the session
- `GET /auth/me` — current user from an existing session

Every Factory/Depot write endpoint currently accepts personnel IDs (`confirmed_by_id`, `sold_by_id`, `supplier_id`) as plain request fields with no auth check — once a scheme is confirmed, those endpoints presumably start deriving the caller's identity from it instead.

## Open questions

The full list, agreed with the backend team as the eight items below, lives in [`docs/api/README.md`](./api/README.md#open-questions-for-the-backend-team) so there is exactly one copy to keep in sync.
