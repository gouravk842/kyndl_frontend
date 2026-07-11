"use client";

import { Gift, Loader2, Package } from "lucide-react";
import Link from "next/link";

import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/shared/page-header";
import { ROUTES } from "@/constants/routes";
import { GiftsSectionNav } from "@/features/gifts/components/gifts-section-nav";
import { useGiftOrders } from "@/hooks/use-gifts";
import { formatPrice } from "@/lib/gifts";
import { cn } from "@/lib/utils";
import type { OrderStatus } from "@/types/gift";

const STATUS_META: Record<OrderStatus, { label: string; className: string }> = {
  pending_payment: {
    label: "Awaiting payment",
    className: "bg-[#FBECD2] text-[#9A6B12]",
  },
  paid: { label: "Confirmed", className: "bg-[#E6F0FF] text-[#2456A6]" },
  processing: { label: "Packing", className: "bg-[#E6F0FF] text-[#2456A6]" },
  shipped: { label: "Shipped", className: "bg-[#DDF3E7] text-[#1F7A4D]" },
  delivered: { label: "Delivered", className: "bg-[#DDF3E7] text-[#1F7A4D]" },
  cancelled: { label: "Cancelled", className: "bg-[#F7DDE3] text-[#C81D4E]" },
};

export function OrdersView() {
  const { data: orders, isLoading, isError } = useGiftOrders();

  return (
    <>
      <PageHeader
        eyebrow="Your bag, sent"
        title="Your orders"
        subtitle="Every little something you've sent."
        size="lg"
      >
        <GiftsSectionNav />
      </PageHeader>

      <PageContainer size="lg" className="py-10 md:py-14">
        {isLoading ? (
          <div className="flex justify-center py-20 text-[#C75B39]">
            <Loader2 className="size-6 animate-spin" />
          </div>
        ) : isError ? (
          <p className="py-20 text-center text-[#7A6258]">
            We couldn&apos;t load your orders. Please refresh.
          </p>
        ) : !orders || orders.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-[#F2DACE] bg-white/60 py-20 text-center">
            <Gift className="mx-auto size-10 text-[#E3A78C]" />
            <p className="mt-4 font-display text-xl text-[#3A2A25]">
              No orders yet
            </p>
            <Link
              href={ROUTES.gifts}
              className="mt-5 inline-flex h-11 items-center rounded-full bg-gradient-to-r from-[#FF7A59] to-[#F2596F] px-6 text-sm font-medium text-white kyndl-glow-warm"
            >
              Browse gifts
            </Link>
          </div>
        ) : (
          <ul className="flex flex-col gap-4">
            {orders.map((order) => {
              const meta = STATUS_META[order.status];
              return (
                <li
                  key={order.id}
                  className="rounded-3xl border border-[#F4DDD0] bg-white p-5 md:p-6"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="flex size-11 items-center justify-center rounded-2xl bg-[#FFF1E9] text-[#C75B39]">
                        <Package className="size-5" />
                      </span>
                      <div>
                        <p className="text-sm font-medium text-[#3A2A25]">
                          Order #{order.id.slice(0, 8)}
                        </p>
                        <p className="text-xs text-[#B08C7D]">
                          {new Date(order.created_at).toLocaleDateString(
                            undefined,
                            {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            },
                          )}
                        </p>
                      </div>
                    </div>
                    <span
                      className={cn(
                        "rounded-full px-3 py-1 text-xs font-medium",
                        meta.className,
                      )}
                    >
                      {meta.label}
                    </span>
                  </div>

                  <div className="mt-4 flex flex-wrap items-end justify-between gap-3 border-t border-[#F4DDD0] pt-4">
                    <p className="text-sm text-[#7A6258]">
                      {order.items
                        .map((i) => `${i.quantity}× ${i.product_name}`)
                        .join(", ")}
                    </p>
                    <span className="font-display text-lg text-[#3A2A25]">
                      {formatPrice(order.total, order.currency)}
                    </span>
                  </div>

                  {/* Shipping happens per vendor, so tracking links live on
                      each vendor sub-order, not the order as a whole. */}
                  {order.vendor_orders
                    ?.filter((vo) => vo.tracking_link)
                    .map((vo) => (
                      <a
                        key={vo.id}
                        href={vo.tracking_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-3 mr-4 inline-block text-sm font-medium text-[#C75B39] hover:underline"
                      >
                        Track {vo.vendor_name}
                        {vo.courier_display ? ` (${vo.courier_display})` : ""} →
                      </a>
                    ))}
                </li>
              );
            })}
          </ul>
        )}
      </PageContainer>
    </>
  );
}
