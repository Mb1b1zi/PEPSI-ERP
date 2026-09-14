# API Documentation Index

Contracts in this directory (`docs/api/`) are written and owned by the backend team. They are the source of truth for wire formats — the frontend must not edit them, only read them.

## Modules

| Module | Base path | Doc |
|---|---|---|
| Admin | `/admin` | [`openapi.json`](./openapi.json) only — no hand-written doc yet |
| Factory | `/factory` | [`factory.md`](./factory.md) + [`openapi.json`](./openapi.json) |
| Depot | `/depot` | [`depot.md`](./depot.md) + [`openapi.json`](./openapi.json) |

**`openapi.json`** is the real, machine-generated OpenAPI spec from the backend team ("Pepsi Depo Management ERP" v0.1.0) — the authoritative source for every module, including Admin, which has no hand-written `.md` yet. It has no `servers` entry, so it doesn't say where a running instance lives. Where it conflicts with `factory.md`/`depot.md` (which predate it and may have drifted), **the spec wins** — those two files haven't been rewritten against it yet.

**Last synced:** 2026-09-14 (openapi.json added; factory.md/depot.md still dated 2026-09-12)

## Open questions for the backend team

1. ~~**Admin module has no endpoint documentation but the entire current frontend targets it.**~~ **RESOLVED 2026-09-14** — `openapi.json` documents all of Admin (`/admin/depots`, `/admin/products`, `/admin/quantities`, `/admin/prices`, `/admin/personnel`, `/admin/roles`).
2. **Whether Admin `personnel` is the same entity as the frontend `User` type, and its exact field names.** **Answered by `openapi.json`, action still pending:** `PersonnelRead` is `{id, role_id, depot_id, name, email, gender, contact, salary, created_at}` — no `status` field, no password (no auth exists anywhere). Frontend `User`/`Role` types need to be rebuilt to match (in progress).
3. ~~**Confirmation that IDs are integers across all modules.**~~ **RESOLVED 2026-09-14** — yes, confirmed everywhere in `openapi.json` including Personnel. `User.id` should move from `string` to `number`.
4. **`supply_history` has no `depot_id`, so per-depot pending deliveries cannot be queried.** Without it, a "pending deliveries for my depot" screen can't be filtered server-side and depends on manual, out-of-band coordination.
5. **Factory `limit` is capped at 10, which is too small for a usable table page.** Any Factory list view (production or supply history) will need far more round trips than a normal admin table, hurting both UX and request volume.
6. **Timestamps lack timezone information in Depot responses while Factory uses Z.** Mixing naive and UTC-suffixed timestamps risks incorrect local-time display or off-by-timezone bugs once the two modules' data is shown side by side.
7. **Sales request uses `amount_sold` but responses use `sold_amount`.** Inconsistent field naming between the request and response bodies for the same concept increases the risk of a DTO-mapping bug.
8. **No authentication scheme is defined yet.** Every write endpoint currently trusts client-supplied personnel/depot IDs with no way to verify the caller, which is a security gap that must close before going live.
9. ~~**`GET /factory/supplies/{id}` means two different things in the two documents.**~~ **RESOLVED 2026-09-14** — `openapi.json`'s `GET /factory/supplies/{supply_id}` returns a single `SupplyResponse`, confirming the Depot document's reading; `factory.md`'s "all supplies for a product" prose was wrong or stale. Frontend updated to `factoryService.getSupplyById`.
10. **Admin's `Page[T]` list wrapper (`{items, total, page, page_size}`) has no `total_pages`, unlike Factory/Depot's paged responses.** The frontend computes it client-side (`Math.ceil(total / page_size)`) rather than trusting a value that isn't sent — fine as a workaround, but worth asking whether that's the intended contract for every Admin list endpoint.
11. **No hand-written `docs/api/admin.md` exists.** `openapi.json` covers the wire shapes, but the prose context `factory.md`/`depot.md` give (business rules, side effects, worked examples) doesn't exist for Admin yet — e.g. it's not documented anywhere what deleting a Role or Depot that's still referenced by Personnel actually does.
