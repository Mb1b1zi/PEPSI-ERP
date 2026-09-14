# API Documentation Index

Contracts in this directory (`docs/api/`) are written and owned by the backend team. They are the source of truth for wire formats — the frontend must not edit them, only read them.

## Modules

| Module | Base path | Doc |
|---|---|---|
| Admin | Not yet documented | **NOT YET DOCUMENTED** — see the PROPOSED Admin section in [`docs/api-contract.md`](../api-contract.md) |
| Factory | `/factory` | [`factory.md`](./factory.md) |
| Depot | `/depot` | [`depot.md`](./depot.md) |

**Last synced:** 2026-09-12

## Open questions for the backend team

1. **Admin module has no endpoint documentation but the entire current frontend targets it.** Without it, none of the frontend's user/role/depot/product management screens can be pointed at a real backend.
2. **Whether Admin `personnel` is the same entity as the frontend `User` type, and its exact field names.** This determines whether the existing `User`-shaped data and UI can map directly onto Admin personnel records or need a translation layer.
3. **Confirmation that IDs are integers across all modules.** The frontend currently models `User.id` as a `string`; DTOs and route params need to know definitively whether to expect numbers or strings everywhere.
4. **`supply_history` has no `depot_id`, so per-depot pending deliveries cannot be queried.** Without it, a "pending deliveries for my depot" screen can't be filtered server-side and depends on manual, out-of-band coordination.
5. **Factory `limit` is capped at 10, which is too small for a usable table page.** Any Factory list view (production or supply history) will need far more round trips than a normal admin table, hurting both UX and request volume.
6. **Timestamps lack timezone information in Depot responses while Factory uses Z.** Mixing naive and UTC-suffixed timestamps risks incorrect local-time display or off-by-timezone bugs once the two modules' data is shown side by side.
7. **Sales request uses `amount_sold` but responses use `sold_amount`.** Inconsistent field naming between the request and response bodies for the same concept increases the risk of a DTO-mapping bug.
8. **No authentication scheme is defined yet.** Every write endpoint currently trusts client-supplied personnel/depot IDs with no way to verify the caller, which is a security gap that must close before going live.
9. **`GET /factory/supplies/{id}` means two different things in the two documents.** `docs/api/factory.md` documents it as `GET /factory/supplies/{product_id}` — all supply records for a product. `docs/api/depot.md` refers to the same path as `GET /factory/supplies/{supply_id}` — a single supply record by its own id, which the Depot Module should read before confirming/rejecting a delivery. Both can't be true of one route. The frontend implements only the Factory document's reading (`factoryService.getSuppliesByProduct`) and does not implement a single-supply-by-id fetch — confirm with the backend team which one the route actually does, or whether two separate routes are needed.
