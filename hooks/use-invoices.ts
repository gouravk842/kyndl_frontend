"use client";

import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "@/constants/query-keys";
import { paymentService } from "@/services/payments/payment.service";

export function useInvoices() {
  return useQuery({
    queryKey: queryKeys.payments.invoices(),
    queryFn: () => paymentService.listInvoices(),
    staleTime: 30 * 1000,
  });
}
