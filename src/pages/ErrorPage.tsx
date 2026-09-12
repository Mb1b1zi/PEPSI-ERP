import { Link, useRouteError } from 'react-router-dom';
import { ADMIN_PATHS } from '@/routes/paths';

export function ErrorPage() {
  const error = useRouteError();
  const message = error instanceof Error ? error.message : 'An unexpected error occurred.';

  return (
    <div className="p-6 flex flex-col items-center justify-center text-center">
      <h1 className="text-2xl font-semibold text-gray-900">Something went wrong</h1>
      <div className="mt-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-md px-4 py-3">
        {message}
      </div>
      <Link to={ADMIN_PATHS.dashboard} className="mt-4 text-sm text-brand hover:text-brand-dark font-medium">
        Back to Dashboard
      </Link>
    </div>
  );
}
