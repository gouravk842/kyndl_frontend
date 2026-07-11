"use client";

import { ArrowUpRight, Package, Plus } from "lucide-react";
import Link from "next/link";

import { ExperienceIcon } from "@/components/shared/experience-icon";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import { GiftCard } from "@/features/gifts/components/gift-card";
import { creationMeta, newCreationHref } from "@/lib/creations";
import { formatPrice } from "@/lib/gifts";
import { cn } from "@/lib/utils";
import type { Creation } from "@/types/creation";
import type { Order, OrderStatus, WishlistItem } from "@/types/gift";

import type { DashboardCategory } from "../lib/categories";
import { CreationCard } from "./creation-card";
import { NewCreationGallery } from "./new-creation-gallery";

const ORDER_STATUS: Record<OrderStatus, string> = {
  pending_payment: "Awaiting payment",
  paid: "Confirmed",
  processing: "Packing",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

interface CategoryDetailProps {
  /** null → the "Start something new" view. */
  category: DashboardCategory | null;
  creations: Creation[];
  orders: Order[];
  wishlist: WishlistItem[];
}

/** Renders the items belonging to the selected category. */
export function CategoryDetail({
  category,
  creations,
  orders,
  wishlist,
}: CategoryDetailProps) {
  // "Start something new" pane.
  if (!category) {
    return (
      <Section
        title="Start something new"
        subtitle="Pick an experience and make it theirs."
      >
        <NewCreationGallery />
      </Section>
    );
  }

  if (category.kind === "experience") {
    const type = category.type!;
    const meta = creationMeta(type);
    const items = creations
      .filter((c) => c.type === type)
      .sort(
        (a, b) =>
          new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime(),
      );

    return (
      <Section
        title={meta.name}
        subtitle={`${items.length} ${items.length === 1 ? "keepsake" : "keepsakes"} you've made`}
        action={
          <Button render={<Link href={newCreationHref(type)} />} size="sm">
            <Plus className="size-3.5" />
            New {meta.name.toLowerCase()}
          </Button>
        }
      >
        {items.length === 0 ? (
          <EmptyPane message={`No ${meta.name.toLowerCase()} yet.`} />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {items.map((c) => (
              <CreationCard key={c.id} creation={c} />
            ))}
          </div>
        )}
      </Section>
    );
  }

  if (category.kind === "orders") {
    return (
      <Section
        title="Gifts ordered"
        subtitle="Everything you've sent."
        action={
          <Button
            render={<Link href={ROUTES.gifts} />}
            size="sm"
            variant="secondary"
          >
            Browse gifts
            <ArrowUpRight className="size-3.5" />
          </Button>
        }
      >
        <div className="space-y-3">
          {orders.map((order) => (
            <div
              key={order.id}
              className="rounded-2xl bg-card p-4 ring-1 ring-foreground/10"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="flex size-10 items-center justify-center rounded-xl bg-muted text-foreground/70">
                    <Package className="size-5" />
                  </span>
                  <div>
                    <p className="text-sm font-medium">
                      Order #{order.id.slice(0, 8)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(order.created_at).toLocaleDateString(undefined, {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </div>
                <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
                  {ORDER_STATUS[order.status]}
                </span>
              </div>

              <div className="mt-3 flex flex-wrap items-end justify-between gap-3 border-t border-foreground/10 pt-3">
                <p className="text-sm text-muted-foreground">
                  {order.items
                    .map((i) => `${i.quantity}× ${i.product_name}`)
                    .join(", ")}
                </p>
                <span className="font-heading text-base font-medium">
                  {formatPrice(order.total, order.currency)}
                </span>
              </div>

              {order.vendor_orders
                ?.filter((vo) => vo.tracking_link)
                .map((vo) => (
                  <a
                    key={vo.id}
                    href={vo.tracking_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 mr-4 inline-block text-sm font-medium text-primary hover:underline"
                  >
                    Track {vo.vendor_name}
                    {vo.courier_display ? ` (${vo.courier_display})` : ""} →
                  </a>
                ))}
            </div>
          ))}
        </div>
      </Section>
    );
  }

  // wishlist
  return (
    <Section
      title="Saved gifts"
      subtitle="The little things you're dreaming of."
      action={
        <Button
          render={<Link href={ROUTES.gifts} />}
          size="sm"
          variant="secondary"
        >
          Browse gifts
          <ArrowUpRight className="size-3.5" />
        </Button>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {wishlist.map((item, i) => (
          <GiftCard key={item.id} product={item.product} index={i} />
        ))}
      </div>
    </Section>
  );
}

function Section({
  title,
  subtitle,
  action,
  children,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-heading text-lg font-medium">{title}</h2>
          {subtitle && (
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          )}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

function EmptyPane({ message }: { message: string }) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-dashed border-foreground/15 bg-muted/30 px-6 py-14 text-center",
      )}
    >
      <ExperienceIcon
        name="Sparkles"
        className="mx-auto size-8 text-muted-foreground"
      />
      <p className="mt-3 text-sm text-muted-foreground">{message}</p>
    </div>
  );
}
