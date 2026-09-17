import { adminNavConfig } from '@/routes/adminNavConfig';
import { factoryNavConfig } from '@/routes/factoryNavConfig';
import { depotNavConfig } from '@/routes/depotNavConfig';
import { reportsNavConfig } from '@/routes/reportsNavConfig';
import type { AuthUser } from '@/types/auth';
import type { NavItem } from '@/types/navigation';

/**
 * Admin (account/permission management specifically) is an exclusive tier: admin.personnel or
 * admin.roles permission means the sidebar shows only the Admin section, full stop — even if
 * the account also holds other permissions, as the bootstrap Boss account always does (auth.md:
 * whichever role is named exactly "Boss" is auto-granted every permission on every startup,
 * additively, so its permission set can never be narrowed).
 *
 * Everyone else — Factory Manager, Depot Attendant, or a view-only Executive/Boss-style account
 * with read access into Admin's catalog data (products/depots) but no personnel/roles
 * management — sees the full merge instead, still filtered item-by-item by filterNavItems as
 * usual (so e.g. an Executive sees "All Products" but not "Add Product" or "Users").
 */
export function getNavSections(user: AuthUser): NavItem[] {
  const hasPrefix = (prefix: string) => user.permissions.some((p) => p.startsWith(prefix));

  if (hasPrefix('admin.personnel') || hasPrefix('admin.roles')) return adminNavConfig;
  return [...adminNavConfig, ...factoryNavConfig, ...depotNavConfig, ...reportsNavConfig];
}
