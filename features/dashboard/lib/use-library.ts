"use client";

import { useMemo } from "react";

import { useCreations } from "@/hooks/use-creations";
import { useGiftOrders, useWishlist } from "@/hooks/use-gifts";

import { buildCategories, type DashboardCategory } from "./categories";

export interface DashboardLibrary {
  categories: DashboardCategory[];
  creations: NonNullable<ReturnType<typeof useCreations>["data"]>;
  orders: NonNullable<ReturnType<typeof useGiftOrders>["data"]>;
  wishlist: NonNullable<ReturnType<typeof useWishlist>["data"]>;
  /** Only the user's own creations gate the primary loading state. */
  isLoading: boolean;
}

/**
 * The signed-in user's whole library — experiences they've authored, gifts
 * ordered, gifts saved — grouped into sidebar categories. Shared by the sidebar
 * (navigation) and the dashboard workspace (detail), both reading the same
 * React Query cache so they never drift.
 */
export function useLibrary(): DashboardLibrary {
  const creationsQuery = useCreations();
  const ordersQuery = useGiftOrders();
  const wishlistQuery = useWishlist();

  const creations = useMemo(
    () => creationsQuery.data ?? [],
    [creationsQuery.data],
  );
  const orders = useMemo(() => ordersQuery.data ?? [], [ordersQuery.data]);
  const wishlist = useMemo(() => wishlistQuery.data ?? [], [wishlistQuery.data]);

  const categories = useMemo(
    () => buildCategories({ creations, orders, wishlist }),
    [creations, orders, wishlist],
  );

  return {
    categories,
    creations,
    orders,
    wishlist,
    isLoading: creationsQuery.isLoading,
  };
}
