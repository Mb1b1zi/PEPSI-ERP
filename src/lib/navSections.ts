import { adminNavConfig } from '@/routes/adminNavConfig';
import { factoryNavConfig } from '@/routes/factoryNavConfig';
import { depotNavConfig } from '@/routes/depotNavConfig';
import { reportsNavConfig } from '@/routes/reportsNavConfig';
import type { AuthUser, Permission } from '@/types/auth';
import type { NavItem } from '@/types/navigation';

/**
 * The dividing line between "manages the organization" (Admin — a worker like any other, not
 * the company's leadership) and "views the organization" (Boss/CEO, or anyone else with broad
 * read access). Write access to personnel or roles is what actually makes someone Admin — read
 * access alone doesn't, since the Boss/CEO also needs to view personnel (who works where) and
 * that must not make their sidebar collapse down to the Admin section.
 */
const ADMIN_MANAGEMENT_PERMISSIONS: Permission[] = [
  'admin.personnel:create',
  'admin.personnel:update',
  'admin.personnel:delete',
  'admin.roles:create',
  'admin.roles:update',
  'admin.roles:delete',
];

export function isAdminTier(user: AuthUser): boolean {
  return ADMIN_MANAGEMENT_PERMISSIONS.some((p) => user.permissions.includes(p));
}

/** Same set reportsNavConfig.tsx gates "Company Overview" on, and roleLanding.ts's landing-path
 *  logic — genuine cross-company read access (production + supplies + depot restock + depot
 *  sales), the Boss/CEO signal. Kept here as the single source of truth; roleLanding.ts imports
 *  it rather than redefining it. */
export const CROSS_COMPANY_PERMISSIONS: Permission[] = [
  'factory.production:read',
  'factory.supplies:read',
  'depot.restock:read',
  'depot.sales:read',
];

export function isCrossCompany(user: AuthUser): boolean {
  return CROSS_COMPANY_PERMISSIONS.every((p) => user.permissions.includes(p));
}

/**
 * Admin (exclusive) and cross-company Boss/CEO are handled first, same as before.
 *
 * The Boss/CEO does NOT get adminNavConfig — that's Admin's own management nav (Users/Depots/
 * Products/Quantities/Prices, with Add/Edit/Delete children), and the Boss/CEO is "just a
 * worker like other workers doesn't manage the org" per the user's own framing: Admin manages,
 * Boss/CEO views. The Boss/CEO's read-only permissions into admin.depots/admin.products exist
 * only so their OWN pages' filter dropdowns can populate (e.g. the Depot filter on Sales
 * History) — not so Admin's catalog-management screens become navigable. Personnel viewing
 * ("workers of the different depots") is served by reportsNavConfig's own "Workers by Depot"
 * item instead, a dedicated read-only page — not Admin's Users list, which has write actions
 * the Boss/CEO has no permission to use and would 403 on.
 *
 * Everyone else — Factory Manager, Depot Attendant, or any other single-purpose role — sees
 * ONLY their own module's section(s), never Admin's catalog-browsing screens and never Reports,
 * even though they typically hold read permissions like admin.products:read/admin.depots:read
 * too, for the same "populate my own form's dropdown" reason. A role is scoped to Factory if it
 * holds any factory.production/factory.supplies permission, and to Depot the same way for
 * depot.restock/depot.sales — matching exactly what that module's own endpoints grant, nothing
 * from another module bleeding in just because a read permission happens to overlap.
 */
export function getNavSections(user: AuthUser): NavItem[] {
  if (isAdminTier(user)) return adminNavConfig;
  if (isCrossCompany(user)) return [...factoryNavConfig, ...depotNavConfig, ...reportsNavConfig];

  const hasPrefix = (prefix: string) => user.permissions.some((p) => p.startsWith(prefix));
  const sections: NavItem[] = [];
  if (hasPrefix('factory.')) sections.push(...factoryNavConfig);
  if (hasPrefix('depot.')) sections.push(...depotNavConfig);
  return sections;
}
