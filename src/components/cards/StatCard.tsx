import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

interface StatCardProps {
  label: string;
  value: number | string;
  icon: ReactNode;
  subtitle?: string;
  /** When set, the card becomes a link to this in-app path. */
  to?: string;
}

export function StatCard({ label, value, icon, subtitle, to }: StatCardProps) {
  const content = (
    <>
      <div className="w-11 h-11 rounded-md bg-brand/10 text-brand flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-2xl font-semibold text-gray-900">{value}</p>
        {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
      </div>
    </>
  );

  if (to) {
    return (
      <Link
        to={to}
        className="bg-white rounded-lg border border-gray-200 p-5 flex items-center gap-4 hover:border-brand hover:shadow-sm transition-all"
      >
        {content}
      </Link>
    );
  }

  return <div className="bg-white rounded-lg border border-gray-200 p-5 flex items-center gap-4">{content}</div>;
}