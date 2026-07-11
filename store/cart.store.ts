import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { GiftProduct } from "@/types/gift";

/** A cart line keeps enough product detail to render the cart without a refetch.
 * Price is only ever a *display* value here — the server recomputes the
 * authoritative total from its own catalog at checkout. */
export interface CartItem {
  slug: string;
  name: string;
  price: number;
  currency: string;
  image_url: string;
  quantity: number;
  /** Stock at add-time, to cap the quantity stepper. */
  maxStock: number;
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  isHydrated: boolean;
  add: (product: GiftProduct, quantity?: number) => void;
  remove: (slug: string) => void;
  setQuantity: (slug: string, quantity: number) => void;
  clear: () => void;
  open: () => void;
  close: () => void;
  setOpen: (open: boolean) => void;
  setHydrated: (value: boolean) => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      isOpen: false,
      isHydrated: false,

      add: (product, quantity = 1) =>
        set((state) => {
          const existing = state.items.find((i) => i.slug === product.slug);
          const cap = Math.max(product.stock, 1);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.slug === product.slug
                  ? { ...i, quantity: Math.min(i.quantity + quantity, cap), maxStock: product.stock }
                  : i,
              ),
              isOpen: true,
            };
          }
          return {
            items: [
              ...state.items,
              {
                slug: product.slug,
                name: product.name,
                price: product.price,
                currency: product.currency,
                image_url: product.image_url,
                quantity: Math.min(quantity, cap),
                maxStock: product.stock,
              },
            ],
            isOpen: true,
          };
        }),

      remove: (slug) =>
        set((state) => ({ items: state.items.filter((i) => i.slug !== slug) })),

      setQuantity: (slug, quantity) =>
        set((state) => ({
          items: state.items
            .map((i) =>
              i.slug === slug
                ? { ...i, quantity: Math.max(1, Math.min(quantity, Math.max(i.maxStock, 1))) }
                : i,
            )
            .filter((i) => i.quantity > 0),
        })),

      clear: () => set({ items: [] }),
      open: () => set({ isOpen: true }),
      close: () => set({ isOpen: false }),
      setOpen: (isOpen) => set({ isOpen }),
      setHydrated: (isHydrated) => set({ isHydrated }),
    }),
    {
      name: "kyndl:cart",
      // Persist only the cart contents — not the transient drawer/hydration flags.
      partialize: (state) => ({ items: state.items }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    },
  ),
);

/** Derived selectors — call with the store hook to avoid re-render churn. */
export const cartCount = (items: CartItem[]) =>
  items.reduce((n, i) => n + i.quantity, 0);

export const cartSubtotal = (items: CartItem[]) =>
  items.reduce((sum, i) => sum + i.price * i.quantity, 0);
