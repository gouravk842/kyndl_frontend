"use client";

import {
  ArrowRight,
  IndianRupee,
  Loader2,
  Package,
  TrendingUp,
  Wallet,
} from "lucide-react";
import Link from "next/link";

import { Card } from "@/components/ui/card";
import { ROUTES } from "@/constants/routes";
import { VendorAnalytics } from "@/features/vendor/components/vendor-analytics";
import { useVendorFinance, useVendorProfile } from "@/hooks/use-vendor";
import { formatPrice } from "@/lib/gifts";

const STATUS_LABELS: Record<string, string> = {
  paid: "To pack",
  processing: "Packing",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export function VendorOverview() {
  const { data: vendor } = useVendorProfile();
  const { data: finance, isLoading } = useVendorFinance();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
          {vendor?.name ?? "Your shop"}
        </h1>
        <p className="mt-1 text-muted-foreground">
          Your earnings and fulfillment at a glance
          {vendor ? ` · ${vendor.commission_percent}% platform fee` : ""}.
        </p>
      </div>

      {isLoading || !finance ? (
        <div className="flex justify-center py-20 text-muted-foreground">
          <Loader2 className="size-6 animate-spin" />
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatTile
              icon={Wallet}
              label="Payable balance"
              value={formatPrice(finance.payable_balance)}
              hint="Owed to you, not yet paid out"
              highlight
            />
            <StatTile
              icon={TrendingUp}
              label="Net earnings"
              value={formatPrice(finance.net_earnings)}
              hint="After platform fee, all time"
            />
            <StatTile
              icon={IndianRupee}
              label="Shop profit"
              value={formatPrice(
                finance.profit ??
                  finance.net_earnings - (finance.total_expenses ?? 0),
              )}
              hint={`Expenses ${formatPrice(finance.total_expenses ?? 0)}`}
            />
            <StatTile
              icon={Package}
              label="To fulfill"
              value={String(finance.to_fulfill)}
              hint="Awaiting shipment"
            />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Earnings breakdown */}
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <h2 className="font-heading text-lg font-medium">
                  Earnings &amp; P&amp;L
                </h2>
                <Link
                  href={ROUTES.shopReports}
                  className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                >
                  Full report <ArrowRight className="size-3.5" />
                </Link>
              </div>
              <dl className="mt-4 space-y-3 text-sm">
                <Row
                  label="Gross sales"
                  value={formatPrice(finance.gross_sales)}
                />
                <Row
                  label="Platform commission"
                  value={`− ${formatPrice(finance.commission)}`}
                  muted
                />
                <Row
                  label="Net earnings"
                  value={formatPrice(finance.net_earnings)}
                  strong
                />
                <Row
                  label="Shop expenses"
                  value={`− ${formatPrice(finance.total_expenses ?? 0)}`}
                  muted
                />
                <Row
                  label="Profit"
                  value={formatPrice(
                    finance.profit ??
                      finance.net_earnings - (finance.total_expenses ?? 0),
                  )}
                  strong
                />
                <Row
                  label="Paid out"
                  value={`− ${formatPrice(finance.paid_out)}`}
                  muted
                />
                <div className="border-t pt-3">
                  <Row
                    label="Payable balance"
                    value={formatPrice(finance.payable_balance)}
                    strong
                  />
                </div>
              </dl>
              <p className="mt-4 text-xs text-muted-foreground">
                Payouts are settled by the Kyndl team.{" "}
                <Link
                  href={ROUTES.shopExpenses}
                  className="text-primary hover:underline"
                >
                  Manage expenses
                </Link>
                .
              </p>
            </Card>

            {/* Orders by status */}
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <h2 className="font-heading text-lg font-medium">
                  Orders by status
                </h2>
                <Link
                  href={ROUTES.shopOrders}
                  className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                >
                  View all <ArrowRight className="size-3.5" />
                </Link>
              </div>
              <ul className="mt-4 space-y-2 text-sm">
                {Object.entries(STATUS_LABELS).map(([key, label]) => (
                  <li key={key} className="flex items-center justify-between">
                    <span className="text-muted-foreground">{label}</span>
                    <span className="font-medium">
                      {finance.orders_by_status[key] ?? 0}
                    </span>
                  </li>
                ))}
              </ul>
            </Card>
          </div>

          <VendorAnalytics />
        </>
      )}
    </div>
  );
}

function StatTile({
  icon: Icon,
  label,
  value,
  hint,
  highlight = false,
}: {
  icon: typeof Wallet;
  label: string;
  value: string;
  hint: string;
  highlight?: boolean;
}) {
  return (
    <Card className={highlight ? "border-primary/40 bg-primary/5 p-5" : "p-5"}>
      <div className="flex items-center gap-2 text-muted-foreground">
        <Icon className="size-4" />
        <span className="text-sm">{label}</span>
      </div>
      <p className="mt-2 font-display text-2xl font-bold tracking-tight">
        {value}
      </p>
      <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
    </Card>
  );
}

function Row({
  label,
  value,
  strong = false,
  muted = false,
}: {
  label: string;
  value: string;
  strong?: boolean;
  muted?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <dt className={muted ? "text-muted-foreground" : ""}>{label}</dt>
      <dd
        className={
          strong ? "font-semibold" : muted ? "text-muted-foreground" : ""
        }
      >
        {value}
      </dd>
    </div>
  );
}
