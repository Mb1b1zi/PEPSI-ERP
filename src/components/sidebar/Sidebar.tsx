import { SidebarItem } from './SidebarItem';
import type { NavItem } from '@/types/navigation';

interface SidebarProps {
  items: NavItem[];
  title: string;
}

export function Sidebar({ items, title }: SidebarProps) {
  return (
    <aside className="flex flex-col w-64 shrink-0 h-full bg-brand text-white">
      <div className="h-16 flex items-center px-4 border-b border-white/10">
        <span className="text-lg font-semibold truncate">{title}</span>
      </div>
      <nav className="flex-1 overflow-y-auto flex flex-col gap-1 p-3">
        {items.map((item) => (
          <SidebarItem key={item.label} item={item} />
        ))}
      </nav>
    </aside>
  );
}
