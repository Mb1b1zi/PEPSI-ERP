import { Link, useLocation } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

const LABEL_MAP: Record<string, string> = {
  admin: 'Admin',
  dashboard: 'Dashboard',
  users: 'Users',
  add: 'Add',
  depots: 'Depots',
  products: 'Products',
};

export function Breadcrumbs() {
  const location = useLocation();
  const segments = location.pathname.split('/').filter(Boolean);

  return (
    <nav className="flex items-center gap-2 text-sm text-gray-500">
      {segments.map((segment, index) => {
        const path = '/' + segments.slice(0, index + 1).join('/');
        const isLast = index === segments.length - 1;
        const label = LABEL_MAP[segment] ?? segment;

        return (
          <span key={path} className="flex items-center gap-2">
            {index > 0 && <ChevronRight size={14} />}
            {isLast ? (
              <span className="text-gray-800 font-medium">{label}</span>
            ) : (
              <Link to={path} className="hover:text-brand transition-colors">
                {label}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}