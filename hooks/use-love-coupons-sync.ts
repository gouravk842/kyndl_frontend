"use client";

import type { CouponBook } from "@/features/love-coupons/config";
import { useBuilderStore } from "@/features/love-coupons/store/builder.store";
import {
  type CreationSync,
  type SyncStatus,
  useCreationSync,
} from "@/hooks/use-creation-sync";

export type { SyncStatus };
export type LoveCouponsSync = CreationSync;

function bookTitle(doc: CouponBook): string {
  const name = doc.recipientName.trim();
  return name ? `Coupons for ${name}` : "Love Coupons";
}

/** Connects the Love Coupons builder store to the backend (see `useCreationSync`). */
export function useLoveCouponsSync(): LoveCouponsSync {
  const doc = useBuilderStore((s) => s.doc);
  const load = useBuilderStore((s) => s.loadDoc);
  return useCreationSync<CouponBook>({
    type: "love-coupons",
    doc,
    load,
    makeTitle: bookTitle,
  });
}
