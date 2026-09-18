import { useCallback, useEffect, useState } from 'react';
import { authService } from '@/services/authService';
import { getApiErrorMessage } from '@/lib/apiClient';
import type { PermissionEntry } from '@/types/auth';

export function useRolePermissions(roleId: number) {
  const [allPermissions, setAllPermissions] = useState<PermissionEntry[]>([]);
  const [grantedIds, setGrantedIds] = useState<Set<number>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<number | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [all, granted] = await Promise.all([authService.listPermissions(), authService.getRolePermissions(roleId)]);
      setAllPermissions(all);
      setGrantedIds(new Set(granted.map((p) => p.id)));
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to load permissions.'));
    } finally {
      setIsLoading(false);
    }
  }, [roleId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  async function toggle(permission: PermissionEntry): Promise<void> {
    setTogglingId(permission.id);
    try {
      if (grantedIds.has(permission.id)) {
        await authService.revokePermission(roleId, permission.id);
        setGrantedIds((prev) => {
          const next = new Set(prev);
          next.delete(permission.id);
          return next;
        });
      } else {
        const updated = await authService.grantPermissions(roleId, [permission.id]);
        setGrantedIds(new Set(updated.map((p) => p.id)));
      }
    } finally {
      setTogglingId(null);
    }
  }

  return { allPermissions, grantedIds, isLoading, error, togglingId, toggle, refetch: fetchData };
}
