import { create } from "zustand";
import { persist } from "zustand/middleware";

import {
  type Coupon,
  COUPON_BOOK,
  type CouponBook,
  type Heat,
  HEAT_ORDER,
} from "../config";

function mintId(existing: Coupon[]): string {
  const max = existing.reduce((m, c) => {
    const n = Number(c.id.replace(/\D/g, ""));
    return Number.isFinite(n) ? Math.max(m, n) : m;
  }, 0);
  return `c${max + 1}`;
}

/** Heat default for a new coupon, cycling so a fresh book has variety. */
export function couponHeatDefault(count: number): Heat {
  return HEAT_ORDER[count % HEAT_ORDER.length]!;
}

export function starterDoc(): CouponBook {
  return {
    recipientName: COUPON_BOOK.recipientName,
    ownerName: COUPON_BOOK.ownerName,
    title: COUPON_BOOK.title,
    intro: COUPON_BOOK.intro,
    coupons: [],
  };
}

type BookMeta = Pick<
  CouponBook,
  "recipientName" | "ownerName" | "title" | "intro"
>;

export type CouponInput = Omit<Coupon, "id">;

interface BuilderState {
  doc: CouponBook;
  selectedId: string | null;

  loadDoc: (doc: CouponBook) => void;
  setMeta: (patch: Partial<BookMeta>) => void;

  addCoupon: (coupon: CouponInput) => string;
  updateCoupon: (id: string, patch: Partial<CouponInput>) => void;
  removeCoupon: (id: string) => void;
  moveCoupon: (id: string, dir: -1 | 1) => void;
  selectCoupon: (id: string | null) => void;

  reset: () => void;
}

export const useBuilderStore = create<BuilderState>()(
  persist(
    (set, get) => ({
      doc: starterDoc(),
      selectedId: null,

      loadDoc: (doc) => set({ doc, selectedId: doc.coupons[0]?.id ?? null }),

      setMeta: (patch) => set((s) => ({ doc: { ...s.doc, ...patch } })),

      addCoupon: (coupon) => {
        const id = mintId(get().doc.coupons);
        set((s) => ({
          doc: { ...s.doc, coupons: [...s.doc.coupons, { ...coupon, id }] },
          selectedId: id,
        }));
        return id;
      },

      updateCoupon: (id, patch) =>
        set((s) => ({
          doc: {
            ...s.doc,
            coupons: s.doc.coupons.map((c) =>
              c.id === id ? { ...c, ...patch } : c,
            ),
          },
        })),

      removeCoupon: (id) =>
        set((s) => ({
          doc: { ...s.doc, coupons: s.doc.coupons.filter((c) => c.id !== id) },
          selectedId: s.selectedId === id ? null : s.selectedId,
        })),

      moveCoupon: (id, dir) =>
        set((s) => {
          const coupons = [...s.doc.coupons];
          const i = coupons.findIndex((c) => c.id === id);
          const j = i + dir;
          if (i < 0 || j < 0 || j >= coupons.length) return {};
          const a = coupons[i];
          const b = coupons[j];
          if (!a || !b) return {};
          coupons[i] = b;
          coupons[j] = a;
          return { doc: { ...s.doc, coupons } };
        }),

      selectCoupon: (id) => set({ selectedId: id }),

      reset: () => set({ doc: starterDoc(), selectedId: null }),
    }),
    {
      name: "kyndl:love-coupons-builder",
      partialize: (s) => ({ doc: s.doc }),
    },
  ),
);
