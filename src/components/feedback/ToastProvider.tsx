import { useCallback, useRef, useState, type ReactNode } from 'react';
import { Toast, type ToastType } from './Toast';
import { ToastContext, type ToastContextValue } from '@/hooks/useToast';

interface ToastItem {
  id: number;
  message: string;
  type: ToastType;
}

const AUTO_DISMISS_MS = 5000;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const nextId = useRef(0);

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const push = useCallback(
    (type: ToastType, message: string) => {
      const id = nextId.current++;
      setToasts((prev) => [...prev, { id, message, type }]);
      setTimeout(() => dismiss(id), AUTO_DISMISS_MS);
    },
    [dismiss],
  );

  const value: ToastContextValue = {
    success: (message) => push('success', message),
    error: (message) => push('error', message),
    info: (message) => push('info', message),
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 w-80 max-w-[calc(100vw-2rem)]">
        {toasts.map((t) => (
          <Toast key={t.id} message={t.message} type={t.type} onDismiss={() => dismiss(t.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}
