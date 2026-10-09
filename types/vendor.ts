/**
 * Vendor (shopkeeper) marketplace shapes, mirrored from the Django `gifts` app.
 * Money is an integer in the smallest currency unit (paise for INR).
 */

import type { OrderStatus } from "@/types/gift";

export interface Vendor {
  id: number;
  name: string;
  slug: string;
  description: string;
  logo_url: string;
  support_email: string;
  support_phone: string;
  commission_percent: string;
  flat_shipping_fee: number;
  free_shipping_threshold: number;
  is_active: boolean;
  created_at: string;
}

/** Fields a shopkeeper can PATCH on their own shop. */
export interface VendorProfileUpdate {
  name?: string;
  description?: string;
  logo_url?: string;
  support_email?: string;
  support_phone?: string;
  flat_shipping_fee?: number;
  free_shipping_threshold?: number;
}

export interface VendorProductImage {
  file_id: string;
  url: string;
  thumb_url: string;
  position: number;
  is_thumbnail: boolean;
}

export interface VendorProduct {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  price: number;
  currency: string;
  price_display: string;
  image_url: string;
  gallery: string[];
  images: VendorProductImage[];
  image_file_ids: string[];
  thumbnail_file_id: string | null;
  /** Master category name (empty when uncategorised). */
  category: string;
  /** Subcategory name (empty when none). */
  subcategory: string;
  stock: number;
  in_stock: boolean;
  is_active: boolean;
  is_featured: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

/** Create/update payload for a vendor product. */
export interface VendorProductInput {
  name: string;
  tagline?: string;
  description?: string;
  price: number;
  stock: number;
  /** Master category name — resolved/created server-side. */
  category?: string;
  /** Subcategory name under that category — resolved/created server-side. */
  subcategory?: string;
  is_active?: boolean;
  /** Ordered uploaded file ids (max 5). */
  image_file_ids?: string[];
  /** Must be one of ``image_file_ids`` — becomes the catalog card thumbnail. */
  thumbnail_file_id?: string | null;
}

export interface VendorOrderItem {
  id: string;
  product_slug: string;
  product_name: string;
  image_url: string;
  unit_price: number;
  quantity: number;
  line_total: number;
}

export interface VendorOrder {
  id: string;
  order_id: string;
  status: OrderStatus;
  subtotal: number;
  shipping_fee: number;
  commission_percent: string;
  commission_amount: number;
  net_amount: number;
  payable: number;
  currency: string;
  courier: string;
  /** Human label for the carrier code, e.g. "India Post". */
  courier_display: string;
  tracking_number: string;
  tracking_url: string;
  /** Buyer-facing deep-link to track the parcel (derived server-side). */
  tracking_link: string;
  notes: string;
  items: VendorOrderItem[];
  placed_at: string;
  shipped_at: string | null;
  ship_full_name: string;
  ship_phone: string;
  ship_line1: string;
  ship_line2: string;
  ship_city: string;
  ship_state: string;
  ship_postal_code: string;
  ship_country: string;
}

/** Fulfillment update a vendor can submit. */
export interface VendorOrderUpdate {
  status?: "processing" | "shipped" | "delivered";
  courier?: string;
  tracking_number?: string;
  tracking_url?: string;
  notes?: string;
}

/** A shipping carrier option (from `GET /gifts/carriers/`). */
export interface Carrier {
  code: string;
  name: string;
}

export interface VendorFinance {
  currency: string;
  gross_sales: number;
  commission: number;
  shipping_earned: number;
  net_earnings: number;
  paid_out: number;
  payable_balance: number;
  total_expenses: number;
  profit: number;
  orders_count: number;
  to_fulfill: number;
  orders_by_status: Record<string, number>;
}

export interface VendorAnalyticsPoint {
  month: string;
  gross: number;
  net: number;
  orders: number;
}

export interface VendorBestSeller {
  slug: string;
  name: string;
  units: number;
  revenue: number;
}

export interface VendorAnalytics {
  series: VendorAnalyticsPoint[];
  best_sellers: VendorBestSeller[];
}
