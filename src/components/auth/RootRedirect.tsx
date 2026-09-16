import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { getDefaultLandingPath } from '@/lib/roleLanding';
import { AUTH_PATHS } from '@/routes/paths';

export function RootRedirect() {
  const { user } = useAuth();
  return <Navigate to={user ? getDefaultLandingPath(user) : AUTH_PATHS.login} replace />;
}
