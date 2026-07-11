"use client";

import { ExternalLink, Loader2, PackageCheck, Truck } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useCarriers } from "@/hooks/use-gifts";
import { useUpdateVendorOrder, useVendorOrders } from "@/hooks/use-vendor";
import { formatPrice } from "@/lib/gifts";
import { cn } from "@/lib/utils";
import type { OrderStatus } from "@/types/gift";
import type { Carrier, VendorOrder as VOrder } from "@/types/vendor";

const FILTERS: { label: string; value?: string }[] = [
  { label: "To fulfill", value: "paid" },
  { label: "Packing", value: "processing" },
  { label: "Shipped", value: "shipped" },
  { label: "Delivered", value: "delivered" },
  { label: "All", value: undefined },
];

const STATUS_META: Record<OrderStatus, { label: string; className: string }> = {
  pending_payment: { label: "Unpaid", className: "bg-muted text-muted-foreground" },
  paid: { label: "To fulfill", className: "bg-amber-500/15 text-amber-600 dark:text-amber-400" },
  processing: { label: "Packing", className: "bg-blue-500/15 text-blue-600 dark:text-blue-400" },
  shipped: { label: "Shipped", className: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400" },
  delivered: { label: "Delivered", className: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400" },
  cancelled: { label: "Cancelled", className: "bg-destructive/15 text-destructive" },
};

export function VendorOrders() {
  const [filter, setFilter] = useState<string | undefined>("paid");
  const { data: orders, isLoading } = useVendorOrders(filter);
  const { data: carriers } = useCarriers();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight">Orders</h1>
        <p className="mt-1 text-muted-foreground">Pack and ship what your customers bought.</p>
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

      {isLoading ? (
        <div className="flex justify-center py-20 text-muted-foreground">
          <Loader2 className="size-6 animate-spin" />
        </div>
      ) : !orders || orders.length === 0 ? (
        <Card className="flex flex-col items-center gap-2 py-16 text-center">
          <PackageCheck className="size-9 text-muted-foreground" />
          <p className="font-display text-lg">Nothing here</p>
          <p className="text-sm text-muted-foreground">No orders in this view.</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <OrderRow key={order.id} order={order} carriers={carriers ?? []} />
          ))}
        </div>
      )}
    </div>
  );
}

function OrderRow({ order, carriers }: { order: VOrder; carriers: Carrier[] }) {
  const update = useUpdateVendorOrder();
  const [tracking, setTracking] = useState(order.tracking_number);
  const [courier, setCourier] = useState(order.courier);
  const meta = STATUS_META[order.status as OrderStatus];

  const advance = (status: "processing" | "shipped" | "delivered") => {
    update.mutate({
      id: order.id,
      update:
        status === "shipped"
          ? { status, tracking_number: tracking, courier }
          : { status },
    });
  };

  return (
    <Card className="p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium">Order #{order.order_id.slice(0, 8)}</p>
          <p className="text-xs text-muted-foreground">
            {new Date(order.placed_at).toLocaleString(undefined, {
              day: "numeric",
              month: "short",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>
        <span className={cn("rounded-full px-2.5 py-1 text-xs font-medium", meta.className)}>
          {meta.label}
        </span>
      </div>

      {/* Items */}
      <ul className="mt-4 space-y-2 border-t pt-4 text-sm">
        {order.items.map((item) => (
          <li key={item.id} className="flex items-center justify-between">
            <span>
              {item.quantity}× {item.product_name}
            </span>
            <span className="text-muted-foreground">
              {formatPrice(item.line_total, order.currency)}
            </span>
          </li>
        ))}
      </ul>

      {/* Shipping address + earnings */}
      <div className="mt-4 grid gap-4 border-t pt-4 text-sm sm:grid-cols-2">
        <div>
          <p className="mb-1 text-xs font-medium tracking-wide text-muted-foreground uppercase">
            Ship to
          </p>
          <p className="font-medium">{order.ship_full_name}</p>
          <p className="text-muted-foreground">
            {order.ship_line1}
            {order.ship_line2 ? `, ${order.ship_line2}` : ""}
            <br />
            {order.ship_city}, {order.ship_state} {order.ship_postal_code}
            <br />
            {order.ship_phone}
          </p>
        </div>
        <div className="sm:text-right">
          <p className="mb-1 text-xs font-medium tracking-wide text-muted-foreground uppercase">
            Your earning
          </p>
          <p className="font-display text-lg font-bold">{formatPrice(order.net_amount, order.currency)}</p>
          <p className="text-xs text-muted-foreground">
            {formatPrice(order.subtotal, order.currency)} − {order.commission_percent}% fee
          </p>
        </div>
      </div>

      {/* Fulfillment actions */}
      {(order.status === "paid" || order.status === "processing") && (
        <div className="mt-4 space-y-3 border-t pt-4">
          {order.status === "paid" && (
            <Button variant="outline" size="sm" onClick={() => advance("processing")} disabled={update.isPending}>
              Start packing
            </Button>
          )}
          <div className="flex flex-wrap items-end gap-3">
            <div className="grid gap-1">
              <label className="text-xs text-muted-foreground">Courier</label>
              <select
                value={courier}
                onChange={(e) => setCourier(e.target.value)}
                className="h-9 w-40 rounded-md border border-input bg-background px-3 text-sm shadow-xs focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
              >
                <option value="">Select courier…</option>
                {carriers.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid gap-1">
              <label className="text-xs text-muted-foreground">Tracking #</label>
              <Input
                value={tracking}
                onChange={(e) => setTracking(e.target.value)}
                placeholder="TRK123456"
                className="h-9 w-44"
              />
            </div>
            <Button
              size="sm"
              onClick={() => advance("shipped")}
              disabled={update.isPending || !courier || !tracking.trim()}
            >
              {update.isPending ? <Loader2 className="size-4 animate-spin" /> : <Truck className="size-4" />}
              Mark shipped
            </Button>
          </div>
        </div>
      )}

      {order.status === "shipped" && (
        <div className="mt-4 border-t pt-4">
          <div className="mb-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
            <span>
              {order.courier_display && `${order.courier_display} · `}
              {order.tracking_number || "No tracking number"}
            </span>
            {order.tracking_link && (
              <a
                href={order.tracking_link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 font-medium text-primary hover:underline"
              >
                Track <ExternalLink className="size-3.5" />
              </a>
            )}
          </div>
          <Button variant="outline" size="sm" onClick={() => advance("delivered")} disabled={update.isPending}>
            <PackageCheck className="size-4" /> Mark delivered
          </Button>
        </div>
      )}
    </Card>
  );
}
