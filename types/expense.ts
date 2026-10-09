/** Expense / shop P&L types — money is integer paise. */

export type ExpenseStatus = "posted" | "void";
export type ExpensePaymentMethod =
  | "cash"
  | "upi"
  | "bank_transfer"
  | "card"
  | "other"
  | "";

export interface ExpenseCategory {
  id: number;
  name: string;
  slug: string;
  display_order: number;
}

export interface Expense {
  id: string;
  scope: "shop" | "company";
  category_id: number;
  category_name: string;
  category_slug: string;
  amount: number;
  currency: string;
  incurred_on: string;
  payment_method: ExpensePaymentMethod;
  notes: string;
  status: ExpenseStatus;
  voided_at: string | null;
  void_reason: string;
  created_at: string;
  updated_at: string;
}

export interface ExpenseInput {
  category_id: number;
  amount: number;
  incurred_on: string;
  payment_method?: ExpensePaymentMethod;
  notes?: string;
}

export interface ExpenseUpdate {
  category_id?: number;
  amount?: number;
  incurred_on?: string;
  payment_method?: ExpensePaymentMethod;
  notes?: string;
  status?: "void";
  void_reason?: string;
}

export interface ExpenseByCategory {
  category_id: number;
  category_name: string;
  category_slug: string;
  total: number;
}

export interface ShopPnL {
  currency: string;
  date_from: string | null;
  date_to: string | null;
  gross_sales: number;
  commission: number;
  shipping_earned: number;
  net_earnings: number;
  orders_count: number;
  total_expenses: number;
  expenses_by_category: ExpenseByCategory[];
  profit: number;
}

export interface ExpenseListParams {
  status?: ExpenseStatus;
  from?: string;
  to?: string;
}
