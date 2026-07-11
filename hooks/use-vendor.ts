"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { queryKeys } from "@/constants/query-keys";
import { vendorService } from "@/services/vendor/vendor.service";
import { useAuthStore } from "@/store/auth.store";
import type { ApiError } from "@/types/api";
import type {
  VendorOrderUpdate,
  VendorProductInput,
  VendorProfileUpdate,
} from "@/types/vendor";

/** Gate a vendor query on hydrated auth + the vendor role. */
function useVendorGate() {
  const isHydrated = useAuthStore((s) => s.isHydrated);
  const isVendor = useAuthStore((s) => Boolean(s.user?.is_vendor));
  return isHydrated && isVendor;
}

export function useVendorProfile() {
  return useQuery({
    queryKey: queryKeys.vendor.me(),
    queryFn: () => vendorService.me(),
    enabled: useVendorGate(),
    staleTime: 5 * 60 * 1000,
  });
}

export function useVendorProducts() {
  return useQuery({
    queryKey: queryKeys.vendor.products(),
    queryFn: () => vendorService.products(),
    enabled: useVendorGate(),
    staleTime: 30 * 1000,
  });
}

export function useVendorProduct(slug: string, enabled = true) {
  const gate = useVendorGate();
  return useQuery({
    queryKey: queryKeys.vendor.product(slug),
    queryFn: () => vendorService.product(slug),
    enabled: enabled && Boolean(slug) && gate,
  });
}

export function useVendorOrders(status?: string) {
  return useQuery({
    queryKey: queryKeys.vendor.orders(status),
    queryFn: () => vendorService.orders(status),
    enabled: useVendorGate(),
    staleTime: 20 * 1000,
  });
}

export function useVendorFinance() {
  return useQuery({
    queryKey: queryKeys.vendor.finance(),
    queryFn: () => vendorService.finance(),
    enabled: useVendorGate(),
    staleTime: 30 * 1000,
  });
}

export function useVendorAnalytics(months = 6) {
  return useQuery({
    queryKey: queryKeys.vendor.analytics(months),
    queryFn: () => vendorService.analytics(months),
    enabled: useVendorGate(),
    staleTime: 60 * 1000,
  });
}

export function useUpdateVendorProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: VendorProfileUpdate) => vendorService.updateProfile(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.vendor.me() });
      toast.success("Shop settings saved.");
    },
    onError: (error: unknown) =>
      toast.error((error as ApiError)?.message ?? "Could not save settings."),
  });
}

export function useCreateVendorProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: VendorProductInput) => vendorService.createProduct(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.vendor.products() });
      toast.success("Product listed 🎉");
    },
    onError: (error: unknown) =>
      toast.error((error as ApiError)?.message ?? "Could not save that product."),
  });
}

export function useUpdateVendorProduct(slug: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<VendorProductInput>) =>
      vendorService.updateProduct(slug, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.vendor.products() });
      queryClient.invalidateQueries({ queryKey: queryKeys.vendor.product(slug) });
      toast.success("Product updated.");
    },
    onError: (error: unknown) =>
      toast.error((error as ApiError)?.message ?? "Could not update that product."),
  });
}

export function useDeleteVendorProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (slug: string) => vendorService.deleteProduct(slug),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.vendor.products() });
      toast.success("Product removed.");
    },
    onError: (error: unknown) =>
      toast.error((error as ApiError)?.message ?? "Could not remove that product."),
  });
}

export function useUpdateVendorOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, update }: { id: string; update: VendorOrderUpdate }) =>
      vendorService.updateOrder(id, update),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.vendor.all });
      toast.success("Order updated.");
    },
    onError: (error: unknown) =>
      toast.error((error as ApiError)?.message ?? "Could not update the order."),
  });
}
