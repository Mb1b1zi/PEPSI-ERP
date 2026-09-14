# PEPSI-ERP

## Project purpose
PEPSI-ERP is an admin frontend for an ERP system, providing management screens for **Users**, **Roles**, **Depots**, and **Products**. It is built as a single-page React application with client-side routing, backed today by an in-memory mock data layer that is designed to be swapped for real API calls without touching UI code.

## Tech stack (exact versions from package.json)
- react `^19.2.8`, react-dom `^19.2.8`
- typescript `~6.0.2`
- vite `^8.3.0`, @vitejs/plugin-react `^6.1.1`
- tailwindcss `^4.3.3`, @tailwindcss/vite `^4.3.3`
- react-router-dom `^7.18.3`
- react-hook-form `^7.87.0`, @hookform/resolvers `^5.9.1`
- zod `^4.6.2`
- lucide-react `^1.45.0`
- eslint `^10.10.0`, typescript-eslint `^8.69.0`, eslint-plugin-react-hooks `^7.1.1`, eslint-plugin-react-refresh `^0.5.6`

## Layer architecture (hard rule)
Data flows in one direction only:

```
types/  →  mock/  →  services/  →  hooks/  →  pages/  →  components/
```

- **`types/`** — interfaces/types only, no logic.
- **`mock/`** — static seed data, typed against `types/`.
- **`services/`** — the ONLY place data access happens. Every service imports its mock module directly and exposes async methods (list/get/create/update/delete). No other layer may import from `mock/`.
- **`hooks/`** — consume `services/` only, manage loading/error/data state for components.
- **`pages/`** — consume `hooks/` (and call `services/` directly for mutations such as create/update/delete, following the existing pattern in this codebase). **Pages must never import from `mock/` directly.**
- **`components/`** — pure presentation, receive data via props, no data fetching.

When adding a new module, follow this chain: define the type in `types/`, seed data in `mock/`, a service in `services/` that reads the mock, a hook in `hooks/` that calls the service, and a page in `pages/` that uses the hook.

## Conventions
- **Exports**: use named exports for all components, hooks, and services (`export function X`, `export const xService = {...}`). Do not use default exports for components.
- **File naming**: components/pages use PascalCase filenames matching the PascalCase component name (`StatCard.tsx` → `StatCard`). Services/hooks/schemas use camelCase filenames matching their identifier (`userService.ts`, `useUsers.ts`, `userSchema.ts`). Type files are lowercase singular nouns (`user.ts`, `role.ts`).
- **Imports**: use the `@/` alias (mapped to `./src` in `vite.config.ts` and `tsconfig.app.json`) for all cross-directory imports. Only same-directory sibling imports may use a relative `./` path.
- **Tailwind**: utility-first inline classes using the standard spacing/rounding scale (`px-4 py-2`, `rounded-md`/`rounded-lg`) and responsive prefixes (`sm:`, `lg:`) where needed. When a class string is reused within a file, factor it into a local `const` (e.g. `inputClasses`, `selectClasses`) instead of repeating it.
- **Brand colours**: use the brand tokens defined in `src/index.css` (`bg-brand`, `text-brand`, `bg-brand-dark`, `bg-brand-light`, and opacity variants like `bg-brand-light/10`) instead of default Tailwind palette colours or arbitrary hex values.

## Commands
- `npm run dev` — start the Vite dev server
- `npm run build` — type-check (`tsc -b`) and build for production
- `npm run lint` — run ESLint

## Do not
- Do not add new dependencies without asking the user first.
- Do not bypass the service layer — no page, hook, or component may import from `mock/` directly.
- Do not use default exports for components.
- Do not edit files outside the module being worked on.

## API modules
- Documented backend contracts live in `docs/api/` (one file per module, owned by the backend team — never edit their content).
- DTO types in `src/types/factory.ts` and `src/types/depot.ts` mirror the backend's field names and casing exactly, and are confined to the service layer.
- Every service must map DTOs into frontend domain types before returning data — no DTO may cross into a hook, page, or component.
- All paginated endpoints must be normalised to `Paged<T>` (`src/types/api.ts`) inside the service, using the adapters in `src/lib/pagination.ts` — no other pagination shape is allowed above the service layer.
- A 2xx HTTP response never by itself means business success where the response body carries its own `status` field — read the body's status (see `assertBusinessStatus` in `src/lib/apiClient.ts`).

## Shared primitives
- `useToast` (`src/hooks/useToast.ts`, provider mounted in `src/main.tsx`) is the only approved way to surface success and failure to the user. Don't roll a one-off banner or alert for a new flow — use it.
- `usePagedQuery` (`src/hooks/usePagedQuery.ts`) plus `Pagination` (`src/components/tables/Pagination.tsx`) is the only approved pattern for a server-paginated table. It's deliberately backend-agnostic — normalising a module's own pagination scheme into `Paged<T>` stays the service's job, never the hook's.
- `catalogService` (`src/services/catalogService.ts`) is a temporary, mock-backed stand-in for the undocumented Admin module (products/quantities/depots) — it exists only so Factory/Depot forms have something to populate `product_id`/`quantity_id`/`depot_id` selectors from. Replace it once Admin ships; do not extend it or point it at a guessed endpoint shape.

## Module implementation pattern
Every module wired to a real backend (Factory Production is the reference — `src/services/factoryService.ts`) follows this exact chain. Every subsequent module must follow it too:

1. **`docs/api/<module>.md`** — the source of truth for the wire contract. Read it in full before writing anything; never fill a gap from another module's document.
2. **Dto types** (`src/types/<module>.ts`) — snake_case, mirror the backend's field names and casing verbatim, confined to the service layer.
3. **Domain types** (same file, in a clearly separated section, or a dedicated type file) — camelCase, what a hook/page/component actually sees. No Dto may cross that boundary.
4. **Mapper** — an explicit function per Dto→domain conversion, living in the service file. No page, hook, or component may ever see a Dto.
5. **Service with a mock/real switch** — every data method branches on `apiConfig.useMockApi` (`src/lib/config.ts`, `VITE_USE_MOCK_API`): the mock branch reads a `src/mock/<module>.mock.ts` file via the existing `simulateDelay` pattern, the real branch calls `apiRequest`. **Both branches must return the identical domain shape** — never let them diverge.
6. **`Paged<T>` normalisation** — any paginated endpoint is normalised inside the service using the adapters in `src/lib/pagination.ts`, matching whatever pagination scheme that module's backend actually uses (skip/limit, page/page_size, or something else). No other pagination shape is allowed above the service layer.
7. **Hook** — wraps `usePagedQuery` (list data) or a plain fetch-on-mount hook (single resource), calling the service only. Must never import `apiClient` or a Dto type.
8. **Page** — consumes the hook, uses `Table`/`Pagination`/`Badge`/`FormField`/`ConfirmDialog` as-is, and reports every create/update/delete outcome through `useToast`.

A documented contradiction between two modules' docs (field semantics, endpoint shape, etc.) is never resolved by guessing or by borrowing the other module's reading — implement only what that module's own document says, name the method so the ambiguity can't be assumed away, and record the contradiction as a new open question in `docs/api/README.md`.
