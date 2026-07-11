import { apiRequest } from "@/services/api/client";
import type {
  Vendor,
  VendorAnalytics,
  VendorFinance,
  VendorOrder,
  VendorOrderUpdate,
  VendorProduct,
  VendorProductInput,
  VendorProfileUpdate,
} from "@/types/vendor";

// Hits the same-origin Next BFF, which forwards to Django with the httpOnly
// access cookie as a bearer token. All endpoints require the vendor role.
const BASE = "/gifts/vendor";

export const vendorService = {
  me() {
    return apiRequest<Vendor>({ method: "GET", url: `${BASE}/me` });
  },

  updateProfile(payload: VendorProfileUpdate) {
    return apiRequest<Vendor>({ method: "PATCH", url: `${BASE}/me`, data: payload });
  },

  analytics(months = 6) {
    return apiRequest<VendorAnalytics>({
      method: "GET",
      url: `${BASE}/analytics`,
      params: { months },
    });
  },

  products() {
    return apiRequest<VendorProduct[]>({ method: "GET", url: `${BASE}/products` });
  },

  product(slug: string) {
    return apiRequest<VendorProduct>({ method: "GET", url: `${BASE}/products/${slug}` });
  },

  createProduct(payload: VendorProductInput) {
    return apiRequest<VendorProduct>({ method: "POST", url: `${BASE}/products`, data: payload });
  },

  updateProduct(slug: string, payload: Partial<VendorProductInput>) {
    return apiRequest<VendorProduct>({
      method: "PATCH",
      url: `${BASE}/products/${slug}`,
      data: payload,
    });
  },

  deleteProduct(slug: string) {
    return apiRequest<void>({ method: "DELETE", url: `${BASE}/products/${slug}` });
  },

  orders(status?: string) {
    return apiRequest<VendorOrder[]>({
      method: "GET",
      url: `${BASE}/orders`,
      params: status ? { status } : undefined,
    });
  },

  updateOrder(id: string, payload: VendorOrderUpdate) {
    return apiRequest<VendorOrder>({
      method: "PATCH",
      url: `${BASE}/orders/${id}/status`,
      data: payload,
    });
  },

  finance() {
    return apiRequest<VendorFinance>({ method: "GET", url: `${BASE}/finance` });
  },
};
