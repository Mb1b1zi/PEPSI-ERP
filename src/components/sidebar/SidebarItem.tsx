import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import type { NavItem } from '@/types/navigation';

interface SidebarItemProps {
  item: NavItem;
}

export function SidebarItem({ item }: SidebarItemProps) {
  const [isOpen, setIsOpen] = useState(true);

  // Leaf item — renders as a direct link
  if (!item.children) {
    return (
      <NavLink
        to={item.path ?? '#'}
        className={({ isActive }) =>
          `flex items-center gap-3 px-4 py-2 rounded-md text-sm transition-colors ${
            isActive
              ? 'bg-brand-light text-white font-medium'
              : 'text-gray-300 hover:bg-brand-light/40 hover:text-white'
          }`
        }
      >
        {item.icon}
        {item.label}
      </NavLink>
    );
  }

  // Group item — renders as an expandable section
  return (
    <div>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full px-4 py-2 rounded-md text-sm text-gray-300 hover:bg-brand-light/40 hover:text-white transition-colors"
      >
        <span className="flex items-center gap-3">
          {item.icon}
          {item.label}
        </span>
        <ChevronDown
          size={16}
          className={`transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>
      {isOpen && (
        <div className="ml-4 mt-1 flex flex-col gap-1 border-l border-white/10 pl-3">
          {item.children.map((child) => (
            <SidebarItem key={child.label} item={child} />
          ))}
        </div>
      )}
    </div>
  );
}