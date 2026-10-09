"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus, Receipt } from "lucide-react";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  useCreateExpense,
  useExpenseCategories,
  useShopExpenses,
  useUpdateExpense,
  useVoidExpense,
} from "@/hooks/use-expenses";
import { formatPrice } from "@/lib/gifts";
import { cn } from "@/lib/utils";
import type { Expense, ExpensePaymentMethod } from "@/types/expense";

const FILTERS: { label: string; value?: "posted" | "void" }[] = [
  { label: "Posted", value: "posted" },
  { label: "Voided", value: "void" },
  { label: "All", value: undefined },
];

const PAYMENT_METHODS: { value: ExpensePaymentMethod; label: string }[] = [
  { value: "", label: "—" },
  { value: "cash", label: "Cash" },
  { value: "upi", label: "UPI" },
  { value: "bank_transfer", label: "Bank transfer" },
  { value: "card", label: "Card" },
  { value: "other", label: "Other" },
];

const formSchema = z.object({
  category_id: z.coerce.number().int().positive("Pick a category."),
  amount_rupees: z.coerce.number().positive("Enter an amount above zero."),
  incurred_on: z.string().min(1, "Date is required."),
  payment_method: z.string().optional(),
  notes: z.string().optional(),
});

type FormValues = z.input<typeof formSchema>;

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export function ShopExpenses() {
  const [filter, setFilter] = useState<"posted" | "void" | undefined>("posted");
  const [editing, setEditing] = useState<Expense | null>(null);
  const [showForm, setShowForm] = useState(false);

  const { data: expenses, isLoading } = useShopExpenses(
    filter ? { status: filter } : undefined,
  );
  const { data: categories } = useExpenseCategories();
  const create = useCreateExpense();
  const update = useUpdateExpense();
  const voidExpense = useVoidExpense();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      category_id: 0,
      amount_rupees: "" as unknown as number,
      incurred_on: todayISO(),
      payment_method: "",
      notes: "",
    },
  });

  const categoryOptions = useMemo(() => categories ?? [], [categories]);

  function openCreate() {
    setEditing(null);
    reset({
      category_id: categoryOptions[0]?.id ?? 0,
      amount_rupees: "" as unknown as number,
      incurred_on: todayISO(),
      payment_method: "",
      notes: "",
    });
    setShowForm(true);
  }

  function openEdit(expense: Expense) {
    setEditing(expense);
    reset({
      category_id: expense.category_id,
      amount_rupees: expense.amount / 100,
      incurred_on: expense.incurred_on,
      payment_method: expense.payment_method || "",
      notes: expense.notes || "",
    });
    setShowForm(true);
  }

  function onSubmit(values: FormValues) {
    const parsed = formSchema.parse(values);
    const payload = {
      category_id: parsed.category_id,
      amount: Math.round(parsed.amount_rupees * 100),
      incurred_on: parsed.incurred_on,
      payment_method: (parsed.payment_method || "") as ExpensePaymentMethod,
      notes: parsed.notes || "",
    };
    if (editing) {
      update.mutate(
        { id: editing.id, update: payload },
        { onSuccess: () => setShowForm(false) },
      );
    } else {
      create.mutate(payload, { onSuccess: () => setShowForm(false) });
    }
  }

  const saving = create.isPending || update.isPending;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight">
            Expenses
          </h1>
          <p className="mt-1 text-muted-foreground">
            Track shop operating costs — they roll into your profit &amp; loss.
          </p>
        </div>
        <Button type="button" onClick={openCreate}>
          <Plus className="size-4" />
          Add expense
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.label}
            type="button"
            onClick={() => setFilter(f.value)}
            className={cn(
              "rounded-full border px-3.5 py-1.5 text-sm transition-colors",
              filter === f.value
                ? "border-primary bg-primary text-primary-foreground"
                : "hover:bg-accent",
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {showForm && (
        <Card className="p-6">
          <h2 className="font-heading text-lg font-medium">
            {editing ? "Edit expense" : "New expense"}
          </h2>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="mt-4 grid gap-4 sm:grid-cols-2"
          >
            <Field label="Category" error={errors.category_id?.message}>
              <select
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
                {...register("category_id")}
              >
                <option value={0} disabled>
                  Select category
                </option>
                {categoryOptions.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Amount (₹)" error={errors.amount_rupees?.message}>
              <Input
                type="number"
                step="0.01"
                min="0"
                {...register("amount_rupees")}
              />
            </Field>
            <Field label="Date" error={errors.incurred_on?.message}>
              <Input type="date" {...register("incurred_on")} />
            </Field>
            <Field label="Payment method">
              <select
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
                {...register("payment_method")}
              >
                {PAYMENT_METHODS.map((m) => (
                  <option key={m.value || "none"} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Notes" className="sm:col-span-2">
              <Input {...register("notes")} placeholder="Optional" />
            </Field>
            <div className="flex gap-2 sm:col-span-2">
              <Button type="submit" disabled={saving}>
                {saving ? <Loader2 className="size-4 animate-spin" /> : null}
                {editing ? "Save" : "Add"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      {isLoading ? (
        <div className="flex justify-center py-20 text-muted-foreground">
          <Loader2 className="size-6 animate-spin" />
        </div>
      ) : !expenses || expenses.length === 0 ? (
        <Card className="flex flex-col items-center gap-2 py-16 text-center">
          <Receipt className="size-9 text-muted-foreground" />
          <p className="font-display text-lg">No expenses yet</p>
          <p className="text-sm text-muted-foreground">
            Add packaging, shipping, ads — whatever your shop spends.
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {expenses.map((expense) => (
            <Card
              key={expense.id}
              className="flex flex-wrap items-center justify-between gap-3 p-4"
            >
              <div>
                <p className="font-medium">{expense.category_name}</p>
                <p className="text-sm text-muted-foreground">
                  {expense.incurred_on}
                  {expense.notes ? ` · ${expense.notes}` : ""}
                  {expense.status === "void" ? " · voided" : ""}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-medium tabular-nums">
                  {formatPrice(expense.amount)}
                </span>
                {expense.status === "posted" && (
                  <>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => openEdit(expense)}
                    >
                      Edit
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      disabled={voidExpense.isPending}
                      onClick={() => voidExpense.mutate({ id: expense.id })}
                    >
                      Void
                    </Button>
                  </>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function Field({
  label,
  error,
  className,
  children,
}: {
  label: string;
  error?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <label className={cn("block space-y-1.5 text-sm", className)}>
      <span className="text-muted-foreground">{label}</span>
      {children}
      {error ? (
        <span className="block text-xs text-destructive">{error}</span>
      ) : null}
    </label>
  );
}
