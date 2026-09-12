import { Link } from 'react-router-dom';
import { ADMIN_PATHS } from '@/routes/paths';

export function NotFoundPage() {
  return (
    <div className="p-6 flex flex-col items-center justify-center text-center">
      <h1 className="text-2xl font-semibold text-gray-900">404 — Page not found</h1>
      <p className="text-gray-500 mt-1">The page you're looking for doesn't exist.</p>
      <Link to={ADMIN_PATHS.dashboard} className="mt-4 text-sm text-brand hover:text-brand-dark font-medium">
        Back to Dashboard
      </Link>
    </div>
  );
}
