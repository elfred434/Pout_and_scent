/**
 * ToastContainer — Affiche les notifications toast en overlay
 * Pout & Scent
 */
import { useEffect, useState } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import type { Toast, ToastType } from '@/hooks/useToast';

// Store global des toasts
let globalToasts: Toast[] = [];
let globalListeners: Array<(toasts: Toast[]) => void> = [];

export function addGlobalToast(type: ToastType, message: string, duration = 5000) {
  const id = Math.random().toString(36).slice(2);
  globalToasts = [...globalToasts, { id, type, message, duration }];
  globalListeners.forEach((fn) => fn([...globalToasts]));

  if (duration > 0) {
    setTimeout(() => {
      globalToasts = globalToasts.filter((t) => t.id !== id);
      globalListeners.forEach((fn) => fn([...globalToasts]));
    }, duration);
  }
}

export function removeGlobalToast(id: string) {
  globalToasts = globalToasts.filter((t) => t.id !== id);
  globalListeners.forEach((fn) => fn([...globalToasts]));
}

// API publique pour utiliser partout (dans les mutations, etc.)
export const toast = {
  success: (msg: string) => addGlobalToast('success', msg),
  error: (msg: string) => addGlobalToast('error', msg, 7000),
  info: (msg: string) => addGlobalToast('info', msg),
  warning: (msg: string) => addGlobalToast('warning', msg, 6000),
};

export function ToastContainer() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    const listener = (t: Toast[]) => setToasts(t);
    globalListeners.push(listener);
    return () => {
      globalListeners = globalListeners.filter((l) => l !== listener);
    };
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onDismiss={() => removeGlobalToast(t.id)} />
      ))}
    </div>
  );
}

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }) {
  const config: Record<ToastType, { bg: string; icon: typeof CheckCircle; color: string }> = {
    success: { bg: 'bg-green-50 border-green-200', icon: CheckCircle, color: 'text-green-600' },
    error: { bg: 'bg-red-50 border-red-200', icon: AlertCircle, color: 'text-red-600' },
    info: { bg: 'bg-blue-50 border-blue-200', icon: Info, color: 'text-blue-600' },
    warning: { bg: 'bg-yellow-50 border-yellow-200', icon: AlertTriangle, color: 'text-yellow-600' },
  };

  const { bg, icon: Icon, color } = config[toast.type];

  return (
    <div
      className={`pointer-events-auto flex items-start gap-3 p-4 rounded-lg border shadow-lg ${bg} animate-slide-up`}
    >
      <Icon className={`h-5 w-5 flex-shrink-0 mt-0.5 ${color}`} />
      <p className="flex-1 text-sm text-gray-800">{toast.message}</p>
      <button onClick={onDismiss} className="text-gray-400 hover:text-gray-600 flex-shrink-0">
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
