import { useCallback, useEffect, useState } from 'react';
import type { Role } from '@/types/role';
import { roleService } from '@/services/roleService';

export function useRoles() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRoles = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await roleService.getRoles();
      setRoles(data);
    } catch {
      setError('Failed to load roles.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  return { roles, isLoading, error, refetch: fetchRoles };
}
