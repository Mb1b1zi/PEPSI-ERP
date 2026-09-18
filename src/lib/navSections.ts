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

/**
 * Admin is an exclusive tier: an account that can actually manage personnel/roles sees only the
 * Admin section, full stop — even if it also holds other permissions, as the bootstrap Boss
 * account always does (auth.md: whichever role is named exactly "Boss" is auto-granted every
 * permission on every startup, additively, so its permission set can never be narrowed — this
 * is a bootstrap-only account, not the same thing as the company's actual Boss/CEO persona).
 *
 * Everyone else — Factory Manager, Depot Attendant, or a view-only Boss/CEO account with broad
 * read access (including into personnel, to see who works where) but no ability to create,
 * edit, or delete anyone or any role — sees the full merge instead, still filtered item-by-item
 * by filterNavItems as usual (so e.g. Boss sees "All Users" but not "Add User").
 */
export function getNavSections(user: AuthUser): NavItem[] {
  if (isAdminTier(user)) return adminNavConfig;
  return [...adminNavConfig, ...factoryNavConfig, ...depotNavConfig, ...reportsNavConfig];
}
