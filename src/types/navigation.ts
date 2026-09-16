import type { ReactNode } from 'react';
import type { Permission } from '@/types/auth';

export interface NavItem {
  label: string;
  path?: string;
  icon?: ReactNode;
  children?: NavItem[];
  /** Hidden unless the user has at least one of these permissions. Omit to always show. */
  requiredPermission?: Permission | Permission[];
  /** Hidden unless the user has every one of these permissions — for pages that need genuine
   *  cross-module oversight (e.g. a Boss-level overview), not just any single matching one. */
  requiredPermissions?: Permission[];
}
