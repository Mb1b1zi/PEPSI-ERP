import { CheckCircle2, XCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
  message: string;
  type: ToastType;
  onDismiss: () => void;
}

const CONTAINER_CLASSES: Record<ToastType, string> = {
  success: 'bg-green-50 border-green-200 text-green-800',
  error: 'bg-red-50 border-red-200 text-red-800',
  info: 'bg-brand-light/10 border-brand/30 text-brand-dark',
};

const ICONS: Record<ToastType, typeof CheckCircle2> = {
  success: CheckCircle2,
  error: XCircle,
  info: Info,
};

export function Toast({ message, type, onDismiss }: ToastProps) {
  const Icon = ICONS[type];

  return (
    <div className={`flex items-start gap-3 border rounded-lg px-4 py-3 shadow-md text-sm ${CONTAINER_CLASSES[type]}`}>
      <Icon size={18} className="shrink-0 mt-0.5" />
      <p className="flex-1">{message}</p>
      <button
        onClick={onDismiss}
        title="Dismiss"
        className="shrink-0 text-current opacity-60 hover:opacity-100 transition-opacity"
      >
        <X size={16} />
      </button>
    </div>
  );
}
