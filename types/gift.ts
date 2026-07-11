/**
 * Physical-gift shop shapes, mirrored from the Django `gifts` app. Money is
 * always an integer in the smallest currency unit (paise for INR).
 */

import type { CheckoutParams } from "@/types/payment";

export interface GiftProduct {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  price: number;
  currency: string;
  price_display: string;
  image_url: string;
  gallery: string[];
  category: string;
  stock: number;
  in_stock: boolean;
  is_featured: boolean;
  vendor_name?: string;
  vendor_slug?: string;
  /** Denormalised rating rollup from the reviews app. */
  rating_average?: number;
  rating_count?: number;
}

export interface ShippingAddress {
  full_name: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postal_code: string;
  country?: string;
}

export interface CartLine {
  slug: string;
  quantity: number;
}

export interface CheckoutPayload {
  items: CartLine[];
  shipping: ShippingAddress;
}

export type OrderStatus =
  | "pending_payment"
  | "paid"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

export interface OrderItem {
  id: string;
  product_slug: string;
  product_name: string;
  image_url: string;
  unit_price: number;
  quantity: number;
  line_total: number;
}

/** One vendor's shipment within a buyer's order. Shipping (and thus tracking)
 * happens per vendor, so tracking links live here, not on the order. */
export interface OrderVendorGroup {
  id: string;
  vendor_name: string;
  status: OrderStatus;
  subtotal: number;
  courier: string;
  courier_display: string;
  tracking_number: string;
  tracking_url: string;
  /** Buyer-facing deep-link to track this shipment (derived server-side). */
  tracking_link: string;
  items: OrderItem[];
  shipped_at: string | null;
}

export interface Order {
  id: string;
  status: OrderStatus;
  subtotal: number;
  shipping_fee: number;
  total: number;
  currency: string;
  total_display: string;
  ship_full_name: string;
  ship_phone: string;
  ship_line1: string;
  ship_line2: string;
  ship_city: string;
  ship_state: string;
  ship_postal_code: string;
  ship_country: string;
  courier: string;
  courier_display: string;
  tracking_number: string;
  tracking_url: string;
  /** Buyer-facing deep-link to track the parcel (derived server-side). */
  tracking_link: string;
  items: OrderItem[];
  vendor_orders: OrderVendorGroup[];
  created_at: string;
  paid_at: string | null;
  shipped_at: string | null;
}

/** Response from `POST /gifts/checkout/`: the created order + checkout params. */
export interface CheckoutResult {
  order: Order;
  checkout: CheckoutParams;
}

/** A saved shipping address (backend `Address`). */
export interface Address {
  id: string;
  full_name: string;
  phone: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export type AddressInput = Omit<Address, "id" | "created_at" | "updated_at">;

/** A wishlist entry. */
export interface WishlistItem {
  id: string;
  product: GiftProduct;
  created_at: string;
}

/** A cart quote (per-vendor shipping) from `POST /gifts/quote/`. */
export interface QuoteVendorLine {
  vendor_name: string;
  subtotal: number;
  shipping: number;
}

export interface CartQuote {
  subtotal: number;
  shipping: number;
  total: number;
  currency: string;
  vendor_lines: QuoteVendorLine[];
}

/** A vendor's public storefront. */
export interface PublicStore {
  name: string;
  slug: string;
  description: string;
  logo_url: string;
  products: GiftProduct[];
}

/** Catalog query params for search + sorting. */
export type CatalogSort = "newest" | "price" | "-price" | "name" | "popular";
export interface CatalogParams {
  q?: string;
  sort?: CatalogSort;
  category?: string;
}
