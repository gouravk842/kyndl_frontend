"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { queryKeys } from "@/constants/query-keys";
import { giftService } from "@/services/gifts/gift.service";
import { paymentService } from "@/services/payments/payment.service";
import { openRazorpayCheckout } from "@/services/payments/razorpay";
import { useAuthStore } from "@/store/auth.store";
import type { ApiError } from "@/types/api";
import type {
  AddressInput,
  CartLine,
  CatalogParams,
  Order,
  ShippingAddress,
} from "@/types/gift";

// Thrown when the buyer closes the Razorpay modal — a normal cancel, not a
// failure to surface as an error toast.
const PAYMENT_CANCELLED = "payment_cancelled";

/** Public gift catalog, with optional search + sorting. */
export function useGiftCatalog(params?: CatalogParams) {
  return useQuery({
    queryKey: queryKeys.gifts.catalog(
      params as Record<string, unknown> | undefined,
    ),
    queryFn: () => giftService.catalog(params),
    staleTime: 30 * 1000,
  });
}

/** A vendor's public storefront. */
export function useStore(slug: string) {
  return useQuery({
    queryKey: queryKeys.gifts.store(slug),
    queryFn: () => giftService.store(slug),
    enabled: Boolean(slug),
    staleTime: 60 * 1000,
  });
}

/** Product taxonomy (master categories + subcategories) for filters & the
 * product-form combobox. Rarely changes, so cache it generously. */
export function useCategories() {
  return useQuery({
    queryKey: queryKeys.gifts.categories(),
    queryFn: () => giftService.categories(),
    staleTime: 10 * 60 * 1000,
  });
}

/** Shipping carriers for the fulfillment dropdown. Rarely changes. */
export function useCarriers() {
  return useQuery({
    queryKey: queryKeys.gifts.carriers(),
    queryFn: () => giftService.carriers(),
    staleTime: 60 * 60 * 1000,
  });
}

/** Public gift product detail. */
export function useGiftProduct(slug: string) {
  return useQuery({
    queryKey: queryKeys.gifts.product(slug),
    queryFn: () => giftService.product(slug),
    enabled: Boolean(slug),
    staleTime: 60 * 1000,
  });
}

/** The signed-in user's gift orders (gated on hydrated auth). */
export function useGiftOrders() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isHydrated = useAuthStore((s) => s.isHydrated);

  return useQuery({
    queryKey: queryKeys.gifts.orders(),
    queryFn: () => giftService.orders(),
    enabled: isAuthenticated && isHydrated,
    staleTime: 30 * 1000,
  });
}

export interface CheckoutInput {
  items: CartLine[];
  shipping: ShippingAddress;
  prefill?: { name?: string; email?: string };
}

/**
 * Runs the full physical-gift checkout end-to-end:
 * create order (server computes the total) → open Razorpay → verify → done.
 * Returns the created `Order`. A cancelled checkout resolves quietly.
 */
export function useGiftCheckout() {
  const queryClient = useQueryClient();

  return useMutation<Order, unknown, CheckoutInput>({
    mutationFn: async ({ items, shipping, prefill }) => {
      const { order, checkout } = await giftService.checkout({
        items,
        shipping,
      });

      const success = await openRazorpayCheckout({
        checkout,
        name: "Kyndl Gifts",
        description: `Order ${order.id.slice(0, 8)} · ${order.total_display}`,
        prefill,
      });
      if (!success) throw new Error(PAYMENT_CANCELLED);

      await paymentService.verify(success);
      return order;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.gifts.orders() });
      queryClient.invalidateQueries({ queryKey: queryKeys.gifts.all });
    },
    onError: (error: unknown) => {
      if (error instanceof Error && error.message === PAYMENT_CANCELLED) return;
      toast.error(
        (error as ApiError)?.message ?? "Checkout failed. Please try again.",
      );
    },
  });
}

/** Live per-vendor shipping quote for a cart (empty carts are skipped). */
export function useCartQuote(items: CartLine[]) {
  return useQuery({
    queryKey: [...queryKeys.gifts.all, "quote", items],
    queryFn: () => giftService.quote(items),
    enabled: items.length > 0,
    staleTime: 30 * 1000,
  });
}

// ── Wishlist ────────────────────────────────────────────────────────────────

/** The signed-in user's wishlist (gated on hydrated auth). */
export function useWishlist() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isHydrated = useAuthStore((s) => s.isHydrated);

  return useQuery({
    queryKey: queryKeys.gifts.wishlist(),
    queryFn: () => giftService.wishlist(),
    enabled: isAuthenticated && isHydrated,
    staleTime: 30 * 1000,
  });
}

/** Add/remove a gift from the wishlist. Pass `wishlisted` = current state. */
export function useToggleWishlist() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      slug,
      wishlisted,
    }: {
      slug: string;
      wishlisted: boolean;
    }) => {
      if (wishlisted) await giftService.removeFromWishlist(slug);
      else await giftService.addToWishlist(slug);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.gifts.wishlist() });
    },
    onError: (error: unknown) =>
      toast.error(
        (error as ApiError)?.message ?? "Could not update your wishlist.",
      ),
  });
}

// ── Saved addresses ───────────────────────────────────────────────────────

export function useAddresses() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isHydrated = useAuthStore((s) => s.isHydrated);

  return useQuery({
    queryKey: queryKeys.gifts.addresses(),
    queryFn: () => giftService.addresses(),
    enabled: isAuthenticated && isHydrated,
    staleTime: 60 * 1000,
  });
}

export function useSaveAddress() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: AddressInput) => giftService.createAddress(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.gifts.addresses() });
    },
    onError: (error: unknown) =>
      toast.error(
        (error as ApiError)?.message ?? "Could not save that address.",
      ),
  });
}

export function useDeleteAddress() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => giftService.deleteAddress(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.gifts.addresses() });
      toast.success("Address removed.");
    },
    onError: (error: unknown) =>
      toast.error(
        (error as ApiError)?.message ?? "Could not remove that address.",
      ),
  });
}

export { PAYMENT_CANCELLED };
