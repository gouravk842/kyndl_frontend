"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { queryKeys } from "@/constants/query-keys";
import { expensesService } from "@/services/expenses/expenses.service";
import { useAuthStore } from "@/store/auth.store";
import type { ApiError } from "@/types/api";
import type {
  ExpenseInput,
  ExpenseListParams,
  ExpenseUpdate,
} from "@/types/expense";

function useVendorGate() {
  const isHydrated = useAuthStore((s) => s.isHydrated);
  const isVendor = useAuthStore((s) => Boolean(s.user?.is_vendor));
  return isHydrated && isVendor;
}

export function useExpenseCategories() {
  return useQuery({
    queryKey: queryKeys.expenses.categories(),
    queryFn: () => expensesService.categories(),
    enabled: useVendorGate(),
    staleTime: 5 * 60 * 1000,
  });
}

export function useShopExpenses(params?: ExpenseListParams) {
  return useQuery({
    queryKey: queryKeys.expenses.list(params),
    queryFn: () => expensesService.list(params),
    enabled: useVendorGate(),
    staleTime: 20 * 1000,
  });
}

export function useShopPnL(params?: { from?: string; to?: string }) {
  return useQuery({
    queryKey: queryKeys.expenses.pnl(params),
    queryFn: () => expensesService.pnl(params),
    enabled: useVendorGate(),
    staleTime: 30 * 1000,
  });
}

export function useCreateExpense() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: ExpenseInput) => expensesService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.expenses.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.vendor.finance() });
      toast.success("Expense added.");
    },
    onError: (error: unknown) =>
      toast.error((error as ApiError)?.message ?? "Could not add expense."),
  });
}

export function useUpdateExpense() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, update }: { id: string; update: ExpenseUpdate }) =>
      expensesService.update(id, update),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.expenses.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.vendor.finance() });
      toast.success("Expense updated.");
    },
    onError: (error: unknown) =>
      toast.error((error as ApiError)?.message ?? "Could not update expense."),
  });
}

export function useVoidExpense() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      expensesService.update(id, { status: "void", void_reason: reason ?? "" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.expenses.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.vendor.finance() });
      toast.success("Expense voided.");
    },
    onError: (error: unknown) =>
      toast.error((error as ApiError)?.message ?? "Could not void expense."),
  });
}
