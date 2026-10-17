"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { queryKeys } from "@/constants/query-keys";
import { formatPackPrice } from "@/lib/quota";
import { paymentService } from "@/services/payments/payment.service";
import { openRazorpayCheckout } from "@/services/payments/razorpay";
import { quotaService } from "@/services/quotas/quota.service";
import { useAuthStore } from "@/store/auth.store";
import type { ApiError } from "@/types/api";
import type { QuotaFeature, QuotaPack } from "@/types/quota";

const PAYMENT_CANCELLED = "payment_cancelled";

export function useFeatureQuota(feature: QuotaFeature) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isHydrated = useAuthStore((s) => s.isHydrated);

  return useQuery({
    queryKey: queryKeys.quotas.status(feature),
    queryFn: () => quotaService.status(feature),
    enabled: isAuthenticated && isHydrated,
    staleTime: 30_000,
  });
}

/**
 * Buy a capacity pack via checkout → Razorpay → verify, then refresh the meter.
 */
export function usePurchaseQuotaPack(feature: QuotaFeature) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (pack: QuotaPack) => {
      const started = await quotaService.checkout(feature, pack.code);
      const checkout = await paymentService.create({
        product_code: started.product.code,
        reference_id: started.checkout_id,
        idempotency_key: `quota:${feature}:${started.checkout_id}`,
      });
      const success = await openRazorpayCheckout({
        checkout,
        name: pack.name,
        description: `Add ${pack.units} more · ${formatPackPrice(pack.amount, pack.currency)}`,
      });
      if (!success) throw new Error(PAYMENT_CANCELLED);
      await paymentService.verify(success);
      return pack;
    },
    onSuccess: (pack) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.quotas.all });
      toast.success(`Added ${pack.units} more. You're good to keep going.`);
    },
    onError: (error: unknown) => {
      if (error instanceof Error && error.message === PAYMENT_CANCELLED) return;
      toast.error(
        (error as ApiError)?.message ?? "Could not complete that purchase.",
      );
    },
  });
}
