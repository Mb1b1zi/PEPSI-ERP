type BadgeColor = 'gray' | 'green' | 'red' | 'blue';

interface BadgeProps {
  label: string;
  color?: BadgeColor;
}

const COLOR_CLASSES: Record<BadgeColor, string> = {
  gray: 'bg-gray-100 text-gray-700',
  green: 'bg-green-100 text-green-700',
  red: 'bg-red-100 text-red-700',
  blue: 'bg-blue-100 text-blue-700',
};

export function Badge({ label, color = 'gray' }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${COLOR_CLASSES[color]}`}
    >
      {label}
    </span>
  );
}