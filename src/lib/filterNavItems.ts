import type { NavItem } from '@/types/navigation';
import type { Permission } from '@/types/auth';

function isVisible(item: NavItem, hasPermission: (permission: Permission) => boolean): boolean {
  if (item.requiredPermissions && !item.requiredPermissions.every(hasPermission)) return false;

  if (!item.requiredPermission) return true;
  const required = Array.isArray(item.requiredPermission) ? item.requiredPermission : [item.requiredPermission];
  return required.some(hasPermission);
}

/**
 * Drops nav items (and group children) the user's permissions don't cover. A group with no
 * visible children left after filtering is dropped too, rather than shown empty.
 */
export function filterNavItems(items: NavItem[], hasPermission: (permission: Permission) => boolean): NavItem[] {
  return items.reduce<NavItem[]>((visible, item) => {
    if (item.children) {
      const children = filterNavItems(item.children, hasPermission);
      if (children.length > 0) visible.push({ ...item, children });
      return visible;
    }

    if (isVisible(item, hasPermission)) {
      visible.push(item);
    }
    return visible;
  }, []);
}
