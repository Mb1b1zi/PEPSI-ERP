import { createContext, useContext } from 'react';

export interface ToastContextValue {
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
}

/**
 * Defined here (not in ToastProvider.tsx) so that file exports only the ToastProvider
 * component — react-refresh/only-export-components forbids mixing a context value export
 * with a component export in the same file.
 */
export const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
