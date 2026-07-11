import { apiRequest } from "@/services/api/client";
import type {
  Address,
  AddressInput,
  CartLine,
  CartQuote,
  CatalogParams,
  CheckoutPayload,
  CheckoutResult,
  GiftProduct,
  Order,
  PublicStore,
  WishlistItem,
} from "@/types/gift";
import type { Carrier } from "@/types/vendor";

// Hits the same-origin Next BFF, which forwards to Django with the httpOnly
// access cookie as a bearer token.
const BASE = "/gifts";

export const giftService = {
  // Public catalog of active gifts, with optional search + sorting.
  catalog(params?: CatalogParams) {
    return apiRequest<GiftProduct[]>({ method: "GET", url: `${BASE}/catalog`, params });
  },

  // Public product detail by slug.
  product(slug: string) {
    return apiRequest<GiftProduct>({ method: "GET", url: `${BASE}/catalog/${slug}` });
  },

  // Public list of shipping carriers for the fulfillment dropdown.
  carriers() {
    return apiRequest<Carrier[]>({ method: "GET", url: `${BASE}/carriers` });
  },

  // Create an order from the cart + shipping address; returns checkout params.
  // The total is computed server-side — the cart only supplies slugs + qty.
  checkout(payload: CheckoutPayload) {
    return apiRequest<CheckoutResult>({
      method: "POST",
      url: `${BASE}/checkout`,
      data: payload,
    });
  },

  // The signed-in user's gift orders.
  orders() {
    return apiRequest<Order[]>({ method: "GET", url: `${BASE}/orders` });
  },

  order(id: string) {
    return apiRequest<Order>({ method: "GET", url: `${BASE}/orders/${id}` });
  },

  // Price a cart (per-vendor shipping) without creating an order.
  quote(items: CartLine[]) {
    return apiRequest<CartQuote>({ method: "POST", url: `${BASE}/quote`, data: { items } });
  },

  // Public vendor storefront.
  store(slug: string) {
    return apiRequest<PublicStore>({ method: "GET", url: `${BASE}/shops/${slug}` });
  },

  // ── Wishlist ──────────────────────────────────────────────────────────
  wishlist() {
    return apiRequest<WishlistItem[]>({ method: "GET", url: `${BASE}/wishlist` });
  },
  addToWishlist(slug: string) {
    return apiRequest<WishlistItem>({ method: "POST", url: `${BASE}/wishlist/${slug}` });
  },
  removeFromWishlist(slug: string) {
    return apiRequest<void>({ method: "DELETE", url: `${BASE}/wishlist/${slug}` });
  },

  // ── Saved addresses ───────────────────────────────────────────────────
  addresses() {
    return apiRequest<Address[]>({ method: "GET", url: `${BASE}/addresses` });
  },
  createAddress(payload: AddressInput) {
    return apiRequest<Address>({ method: "POST", url: `${BASE}/addresses`, data: payload });
  },
  updateAddress(id: string, payload: Partial<AddressInput>) {
    return apiRequest<Address>({ method: "PATCH", url: `${BASE}/addresses/${id}`, data: payload });
  },
  deleteAddress(id: string) {
    return apiRequest<void>({ method: "DELETE", url: `${BASE}/addresses/${id}` });
  },
};
