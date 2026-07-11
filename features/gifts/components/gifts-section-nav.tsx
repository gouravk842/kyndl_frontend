"use client";

import { Heart, Package, Store } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";

/**
 * Sub-nav that ties the gift-shop area together. Shop, Wishlist, and Orders were
 * disconnected sibling pages with no way to move between them; these pill tabs
 * give the section a spine and a clear "you are here".
 */
const TABS = [
  { href: ROUTES.gifts, label: "Shop", icon: Store, exact: true },
  { href: ROUTES.giftWishlist, label: "Wishlist", icon: Heart, exact: false },
  { href: ROUTES.giftOrders, label: "Orders", icon: Package, exact: false },
] as const;

export function GiftsSectionNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Gift shop sections"
      className="flex flex-wrap items-center gap-2"
    >
      {TABS.map((tab) => {
        const active = tab.exact
          ? pathname === tab.href
          : pathname.startsWith(tab.href);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition-all duration-300",
              active
                ? "border-transparent bg-gradient-to-r from-[#FF7A59] to-[#F2596F] text-white kyndl-glow-warm"
                : "border-[#F2DACE] bg-white/70 text-[#7A6258] hover:border-[#FF7A59]/50 hover:text-[#3A2A25]",
            )}
          >
            <tab.icon className="size-4" />
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
