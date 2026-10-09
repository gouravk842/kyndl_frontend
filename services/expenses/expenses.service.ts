import { apiRequest } from "@/services/api/client";
import type {
  Expense,
  ExpenseCategory,
  ExpenseInput,
  ExpenseListParams,
  ExpenseUpdate,
  ShopPnL,
} from "@/types/expense";

const BASE = "/expenses";

export const expensesService = {
  categories() {
    return apiRequest<ExpenseCategory[]>({
      method: "GET",
      url: `${BASE}/categories`,
    });
  },

  list(params?: ExpenseListParams) {
    return apiRequest<Expense[]>({
      method: "GET",
      url: `${BASE}/shop`,
      params: params ?? undefined,
    });
  },

  create(payload: ExpenseInput) {
    return apiRequest<Expense>({
      method: "POST",
      url: `${BASE}/shop`,
      data: payload,
    });
  },

  update(id: string, payload: ExpenseUpdate) {
    return apiRequest<Expense>({
      method: "PATCH",
      url: `${BASE}/shop/${id}`,
      data: payload,
    });
  },

  pnl(params?: { from?: string; to?: string }) {
    return apiRequest<ShopPnL>({
      method: "GET",
      url: `${BASE}/shop/pnl`,
      params: params ?? undefined,
    });
  },
};
