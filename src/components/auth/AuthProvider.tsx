import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { authService } from '@/services/authService';
import { getStoredSession, setStoredSession, clearStoredSession } from '@/lib/authSession';
import { setUnauthorizedHandler } from '@/lib/apiClient';
import { AuthContext, type AuthContextValue } from '@/hooks/useAuth';
import type { AuthUser, Permission } from '@/types/auth';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => getStoredSession()?.user ?? null);

  // A 401 from any request means the token is gone/expired — clearing `user` here is enough;
  // ProtectedRoute (reading this same state) redirects to /login declaratively once it re-renders.
  useEffect(() => {
    setUnauthorizedHandler(() => setUser(null));
    return () => setUnauthorizedHandler(null);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const session = await authService.login(email, password);
    setStoredSession(session);
    setUser(session.user);
    return session.user;
  }, []);

  const logout = useCallback(() => {
    clearStoredSession();
    setUser(null);
  }, []);

  const hasPermission = useCallback(
    (permission: Permission) => user?.permissions.includes(permission) ?? false,
    [user],
  );

  const value: AuthContextValue = { user, login, logout, hasPermission };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
