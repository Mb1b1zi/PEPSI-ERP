import type { AuthUser, Permission } from '@/types/auth';
import { ADMIN_PATHS, FACTORY_PATHS, DEPOT_PATHS, REPORTS_PATHS } from '@/routes/paths';
import { isAdminTier } from '@/lib/navSections';

/** Same set reportsNavConfig.tsx gates "Company Overview" on — genuine cross-company read
 *  access (production + supplies + depot restock + depot sales), not just one module's slice. */
const CROSS_COMPANY_PERMISSIONS: Permission[] = [
  'factory.production:read',
  'factory.supplies:read',
  'depot.restock:read',
  'depot.sales:read',
];

/**
 * Where a user lands after login (and what `/` redirects to). Keyed off permission prefixes
 * rather than role name — role names are backend-editable free text (docs/api/auth.md), not a
 * reliable signal, but the "module:action" permission prefix always is.
 *
 * Admin is checked first and is exclusive (matches getNavSections/isAdminTier in
 * lib/navSections.ts): the ability to create/update/delete personnel or roles lands on the
 * Admin Dashboard, full stop, even if the account also holds cross-company permissions —
 * otherwise login would drop you on a page your own sidebar can't navigate back to, since an
 * admin-tier account's sidebar only shows the Admin section. Read-only access into personnel
 * (the Boss/CEO viewing who works where) does NOT count as admin-tier — it falls through to
 * the cross-company check below, same as plain admin.products/admin.depots read access.
 */
export function getDefaultLandingPath(user: AuthUser): string {
  const hasPrefix = (prefix: string) => user.permissions.some((p) => p.startsWith(prefix));
  const hasPermission = (permission: Permission) => user.permissions.includes(permission);

  if (isAdminTier(user)) return ADMIN_PATHS.dashboard;
  if (CROSS_COMPANY_PERMISSIONS.every(hasPermission)) return REPORTS_PATHS.overview;
  if (hasPrefix('factory.')) return FACTORY_PATHS.dashboard;
  if (hasPrefix('depot.')) return DEPOT_PATHS.dashboard;
  return ADMIN_PATHS.dashboard;
}
