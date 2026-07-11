"use client";

import { TrendingUp } from "lucide-react";

import { Card } from "@/components/ui/card";
import { useVendorAnalytics } from "@/hooks/use-vendor";
import { formatPrice } from "@/lib/gifts";
import { cn } from "@/lib/utils";

function monthLabel(ym: string): string {
  // "2026-07" → "Jul"
  const y = Number(ym.slice(0, 4));
  const m = Number(ym.slice(5, 7));
  return new Date(y, m - 1, 1).toLocaleString(undefined, { month: "short" });
}

export function VendorAnalytics() {
  const { data, isLoading } = useVendorAnalytics(6);

  if (isLoading || !data) return null;

  const max = Math.max(1, ...data.series.map((p) => p.net));

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Earnings over time */}
      <Card className="p-6">
        <div className="flex items-center gap-2">
          <TrendingUp className="size-4 text-muted-foreground" />
          <h2 className="font-heading text-lg font-medium">Earnings over time</h2>
        </div>
        <div className="mt-6 flex h-40 items-end gap-2">
          {data.series.map((p) => (
            <div key={p.month} className="flex flex-1 flex-col items-center gap-2">
              <div className="flex w-full flex-1 items-end">
                <div
                  className={cn(
                    "w-full rounded-t-md bg-gradient-to-t from-[#FF7A59] to-[#F2596F] transition-all",
                    p.net === 0 && "from-muted to-muted",
                  )}
                  style={{ height: `${Math.max((p.net / max) * 100, 2)}%` }}
                  title={`${monthLabel(p.month)}: ${formatPrice(p.net)} · ${p.orders} orders`}
                />
              </div>
              <span className="text-xs text-muted-foreground">{monthLabel(p.month)}</span>
            </div>
          ))}
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          Net earnings (after commission) per month.
        </p>
      </Card>

      {/* Best sellers */}
      <Card className="p-6">
        <h2 className="font-heading text-lg font-medium">Best sellers</h2>
        {data.best_sellers.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">No sales yet.</p>
        ) : (
          <ol className="mt-4 space-y-3">
            {data.best_sellers.map((b, i) => (
              <li key={b.slug} className="flex items-center gap-3 text-sm">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold">
                  {i + 1}
                </span>
                <span className="flex-1 truncate font-medium">{b.name}</span>
                <span className="text-muted-foreground">{b.units} sold</span>
                <span className="w-20 text-right font-medium">{formatPrice(b.revenue)}</span>
              </li>
            ))}
          </ol>
        )}
      </Card>
    </div>
  );
}
