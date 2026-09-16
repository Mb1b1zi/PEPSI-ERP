import { createContext, useContext } from 'react';
import type { AuthUser, Permission } from '@/types/auth';

export interface AuthContextValue {
  user: AuthUser | null;
  /** Resolves with the freshly signed-in user — return it directly rather than reading `user`
   *  right after awaiting this, since the context value from a stale closure won't have
   *  re-rendered yet. */
  login: (email: string, password: string) => Promise<AuthUser>;
  logout: () => void;
  hasPermission: (permission: Permission) => boolean;
}

/**
 * Defined here (not in AuthProvider.tsx) so that file exports only the AuthProvider
 * component — react-refresh/only-export-components forbids mixing a context value export
 * with a component export in the same file.
 */
export const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
