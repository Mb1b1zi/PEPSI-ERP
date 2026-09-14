import { usePagedQuery, type UsePagedQueryResult } from '@/hooks/usePagedQuery';
import { userService } from '@/services/userService';
import type { User } from '@/types/user';

/** /admin/personnel has no documented filter params — page/page_size only. */
export function useUsers(): UsePagedQueryResult<User> {
  return usePagedQuery<User, Record<string, never>>(
    ({ page, pageSize }) => userService.getUsers({ page, pageSize }),
    {},
  );
}
