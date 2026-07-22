/**
 * Hook useToast — Système de notifications toast centralisé
 * Pout & Scent
 *
 * Usage :
 *   const { toast } = useToast();
 *   toast.success('Commande passée !');
 *   toast.error('Erreur serveur');
 */
import { useCallback, useState } from 'react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

// Store global pour les toasts (pas besoin de Context)
let listeners: Array<(toasts: Toast[]) => void> = [];
let toasts: Toast[] = [];

function notify() {
  listeners.forEach((listener) => listener([...toasts]));
}

function addToast(type: ToastType, message: string, duration = 5000) {
  const id = Math.random().toString(36).slice(2);
  toasts = [...toasts, { id, type, message, duration }];
  notify();

  if (duration > 0) {
    setTimeout(() => {
      removeToast(id);
    }, duration);
  }
}

function removeToast(id: string) {
  toasts = toasts.filter((t) => t.id !== id);
  notify();
}

export function useToast() {
  const [, setTick] = useState(0);

  // S'abonner aux changements
  const subscribe = useCallback(() => {
    const listener = () => setTick((t) => t + 1);
    listeners.push(listener);
    return () => {
      listeners = listeners.filter((l) => l !== listener);
    };
  }, []);

  // Force re-render à chaque changement
  useState(() => {
    const unsub = subscribe();
    return unsub;
  });

  const toast = {
    success: (message: string) => addToast('success', message),
    error: (message: string) => addToast('error', message, 7000),
    info: (message: string) => addToast('info', message),
    warning: (message: string) => addToast('warning', message, 6000),
  };

  return { toasts, toast, removeToast };
}

/**
 * Helper pour extraire un message d'erreur d'une réponse API.
 * Gère les structures : { error: { message } }, { detail }, { message }, string
 */
export function extractApiError(error: unknown): string {
  if (!error) return 'Une erreur est survenue';

  const err = error as any;

  // Axios error avec response
  if (err.response?.data) {
    const data = err.response.data;

    // Structure custom backend : { success: false, error: { code, message, details } }
    if (data.error?.message) return data.error.message;

    // Structure error string
    if (typeof data.error === 'string') return data.error;

    // Structure DRF standard : { detail: "..." }
    if (data.detail) return data.detail;

    // Structure message direct
    if (data.message) return data.message;

    // Erreurs de validation DRF : { field: ["error1", "error2"] }
    if (typeof data === 'object') {
      const firstKey = Object.keys(data)[0];
      if (firstKey && Array.isArray(data[firstKey])) {
        return data[firstKey][0];
      }
    }
  }

  // Erreur JS standard
  if (err.message) return err.message;

  return 'Une erreur est survenue';
}
