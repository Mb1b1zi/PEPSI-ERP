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
