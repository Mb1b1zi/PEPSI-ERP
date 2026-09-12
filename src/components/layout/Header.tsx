import { Breadcrumbs } from '@/components/breadcrumbs/Breadcrumbs';

export function Header() {
  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center px-6 shrink-0">
      <Breadcrumbs />
    </header>
  );
}