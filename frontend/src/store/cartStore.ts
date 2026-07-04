
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartItem } from '@/types';

interface CartState {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (variante_id: string) => void;
  updateQuantity: (variante_id: string, quantite: number) => void;
  clearCart: () => void;
  totalItems: () => number;
  totalPrice: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) =>
        set((state) => {
          const existing = state.items.find((i) => i.variante_id === item.variante_id);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.variante_id === item.variante_id
                  ? { ...i, quantite: i.quantite + item.quantite }
                  : i
              ),
            };
          }
          return { items: [...state.items, item] };
        }),

      removeItem: (variante_id) =>
        set((state) => ({
          items: state.items.filter((i) => i.variante_id !== variante_id),
        })),

      updateQuantity: (variante_id, quantite) =>
        set((state) => ({
          items: state.items.map((i) =>
            i.variante_id === variante_id ? { ...i, quantite } : i
          ),
        })),

      clearCart: () => set({ items: [] }),

      totalItems: () => get().items.reduce((sum, i) => sum + i.quantite, 0),
      totalPrice: () =>
        get().items.reduce((sum, i) => sum + i.prix * i.quantite, 0),
    }),
    {
      name: 'pout-scent-cart',
    }
  )
);