"use client";

import { Loader2 } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useShopPnL } from "@/hooks/use-expenses";
import { formatPrice } from "@/lib/gifts";

function monthStartISO() {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().slice(0, 10);
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export function ShopPnLReport() {
  const [from, setFrom] = useState(monthStartISO);
  const [to, setTo] = useState(todayISO);
  const [range, setRange] = useState({ from: monthStartISO(), to: todayISO() });
  const { data: pnl, isLoading, isFetching } = useShopPnL(range);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight">
          Profit &amp; loss
        </h1>
        <p className="mt-1 text-muted-foreground">
          Net earnings minus your shop expenses for the selected dates.
        </p>
      </div>

      <Card className="flex flex-wrap items-end gap-4 p-4">
        <label className="space-y-1.5 text-sm">
          <span className="text-muted-foreground">From</span>
          <Input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
          />
        </label>
        <label className="space-y-1.5 text-sm">
          <span className="text-muted-foreground">To</span>
          <Input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
          />
        </label>
        <Button
          type="button"
          onClick={() => setRange({ from, to })}
          disabled={isFetching}
        >
          Run report
        </Button>
      </Card>

      {isLoading || !pnl ? (
        <div className="flex justify-center py-20 text-muted-foreground">
          <Loader2 className="size-6 animate-spin" />
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="p-6">
            <h2 className="font-heading text-lg font-medium">Summary</h2>
            <dl className="mt-4 space-y-3 text-sm">
              <Row label="Gross sales" value={formatPrice(pnl.gross_sales)} />
              <Row
                label="Platform commission"
                value={`− ${formatPrice(pnl.commission)}`}
                muted
              />
              <Row
                label="Shipping earned"
                value={formatPrice(pnl.shipping_earned)}
                muted
              />
              <Row
                label="Net earnings"
                value={formatPrice(pnl.net_earnings)}
                strong
              />
              <Row
                label="Shop expenses"
                value={`− ${formatPrice(pnl.total_expenses)}`}
                muted
              />
              <div className="border-t pt-3">
                <Row label="Profit" value={formatPrice(pnl.profit)} strong />
              </div>
            </dl>
            <p className="mt-4 text-xs text-muted-foreground">
              {pnl.orders_count} earned orders in range · voided expenses
              excluded
            </p>
          </Card>

          <Card className="p-6">
            <h2 className="font-heading text-lg font-medium">
              Expenses by category
            </h2>
            {!pnl.expenses_by_category.length ? (
              <p className="mt-4 text-sm text-muted-foreground">
                No expenses in this range.
              </p>
            ) : (
              <ul className="mt-4 space-y-2 text-sm">
                {pnl.expenses_by_category.map((row) => (
                  <li
                    key={row.category_id}
                    className="flex justify-between gap-4"
                  >
                    <span className="text-muted-foreground">
                      {row.category_name}
                    </span>
                    <span className="font-medium tabular-nums">
                      {formatPrice(row.total)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}

function Row({
  label,
  value,
  muted,
  strong,
}: {
  label: string;
  value: string;
  muted?: boolean;
  strong?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <dt className={muted ? "text-muted-foreground" : undefined}>{label}</dt>
      <dd className={strong ? "font-semibold tabular-nums" : "tabular-nums"}>
        {value}
      </dd>
    </div>
  );
}
