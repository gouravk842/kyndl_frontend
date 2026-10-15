"use client";

import {
  ChartColumn,
  Compass,
  Feather,
  Heart,
  Home,
  LayoutDashboard,
  Library,
  Package,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  Receipt,
  Settings,
  Settings2,
  Share2,
  ShoppingBag,
  Store,
  Wallet,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { ExperienceIcon } from "@/components/shared/experience-icon";
import { Logo } from "@/components/shared/logo";
import { useSiteSettings } from "@/components/site-settings/site-settings-provider";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import {
  CREATE_KEY,
  HOME_KEY,
  resolveSelectedKey,
} from "@/features/dashboard/lib/categories";
import { useLibrary } from "@/features/dashboard/lib/use-library";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth.store";
import { useUiStore } from "@/store/ui.store";

type NavItem = {
  href: string;
  label: string;
  icon: typeof Compass;
};

// Shown only to shopkeepers (users who own an active vendor shop).
const shopNavItems: NavItem[] = [
  { href: ROUTES.shop, label: "Shop overview", icon: LayoutDashboard },
  { href: ROUTES.shopProducts, label: "Products", icon: Package },
  { href: ROUTES.shopOrders, label: "Orders", icon: Store },
  { href: ROUTES.shopExpenses, label: "Expenses", icon: Wallet },
  { href: ROUTES.shopReports, label: "P&L", icon: ChartColumn },
  { href: ROUTES.shopSettings, label: "Shop settings", icon: Settings2 },
];

export function DashboardSidebar() {
  const pathname = usePathname();
  const settings = useSiteSettings();
  const { sidebarOpen, toggleSidebar } = useUiStore();
  const isVendor = useAuthStore((s) => Boolean(s.user?.is_vendor));

  const { categories } = useLibrary();
  const dashboardCategory = useUiStore((s) => s.dashboardCategory);
  const setDashboardCategory = useUiStore((s) => s.setDashboardCategory);
  const selected = resolveSelectedKey(categories, dashboardCategory);
  const onDashboard = pathname === ROUTES.dashboard;

  const showLibrary = settings.show_experiences;
  const isShopMode = settings.site_mode === "v2";

  const shopperLinks: NavItem[] = [
    ...(settings.show_gifts
      ? [
          { href: ROUTES.gifts, label: "Shop gifts", icon: ShoppingBag },
          { href: ROUTES.giftOrders, label: "My orders", icon: Package },
          { href: ROUTES.giftWishlist, label: "Wishlist", icon: Heart },
        ]
      : []),
    ...(settings.show_memory_bank
      ? [{ href: ROUTES.memories, label: "Memories", icon: Library }]
      : []),
    ...(settings.show_kynd
      ? [{ href: ROUTES.kynd, label: "Kynd", icon: Feather }]
      : []),
    // Referrals stay on the full (v1) product; hide on ecommerce-first mode.
    ...(!isShopMode
      ? [{ href: ROUTES.referrals, label: "Referrals", icon: Share2 }]
      : []),
    ...(settings.show_experiences
      ? [{ href: ROUTES.experiences, label: "Explore", icon: Compass }]
      : []),
    { href: ROUTES.billing, label: "Billing", icon: Receipt },
    { href: ROUTES.settings, label: "Settings", icon: Settings },
  ];

  const renderLink = ({
    href,
    label,
    icon: Icon,
  }: {
    href: string;
    label: string;
    icon: typeof Compass;
  }) => {
    const active =
      href === ROUTES.shop || href === ROUTES.gifts
        ? pathname === href || pathname.startsWith(`${href}/`)
        : pathname === href || pathname.startsWith(`${href}/`);
    // Avoid /gifts matching /gifts/orders incorrectly for "Shop gifts" — use exact for gifts root.
    const isActive =
      href === ROUTES.gifts
        ? pathname === ROUTES.gifts ||
          (pathname.startsWith(`${ROUTES.gifts}/`) &&
            !pathname.startsWith(ROUTES.giftOrders) &&
            !pathname.startsWith(ROUTES.giftWishlist))
        : active;

    return (
      <Link
        key={href}
        href={href}
        className={rowClass(isActive)}
        title={sidebarOpen ? undefined : label}
      >
        <span className={iconTileClass()}>
          <Icon className="size-4 shrink-0" />
        </span>
        {sidebarOpen && <span className="truncate">{label}</span>}
      </Link>
    );
  };

  const renderCategory = (key: string, label: string, count?: number) => {
    const active = onDashboard && selected === key;
    return (
      <Link
        key={key}
        href={ROUTES.dashboard}
        onClick={() => setDashboardCategory(key)}
        aria-current={active ? "true" : undefined}
        className={rowClass(active)}
        title={sidebarOpen ? undefined : label}
      >
        {key === CREATE_KEY ? (
          <span
            className={cn(
              iconTileClass(),
              "border border-dashed border-border",
            )}
          >
            <Plus className="size-4 shrink-0" />
          </span>
        ) : key === HOME_KEY ? (
          <span className={iconTileClass()}>
            <Home className="size-4 shrink-0" />
          </span>
        ) : (
          <span className={iconTileClass()}>
            <ExperienceIcon
              name={
                categories.find((c) => c.key === key)?.iconName ?? "Sparkles"
              }
              className="size-4 shrink-0"
            />
          </span>
        )}
        {sidebarOpen && (
          <span className="min-w-0 flex-1 truncate">{label}</span>
        )}
        {sidebarOpen && typeof count === "number" && (
          <span
            className={cn(
              "shrink-0 rounded-full px-2 py-0.5 text-xs tabular-nums",
              active
                ? "bg-background/60 text-foreground"
                : "bg-muted text-muted-foreground",
            )}
          >
            {count}
          </span>
        )}
      </Link>
    );
  };

  return (
    <aside
      className={cn(
        "flex h-full flex-col border-r bg-sidebar text-sidebar-foreground transition-all duration-300",
        sidebarOpen ? "w-64" : "w-[72px]",
      )}
    >
      <div className="flex h-16 items-center justify-between border-b px-4">
        {sidebarOpen && <Logo size="sm" />}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          aria-label={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
        >
          {sidebarOpen ? (
            <PanelLeftClose className="size-4" />
          ) : (
            <PanelLeftOpen className="size-4" />
          )}
        </Button>
      </div>

      <nav
        className="flex-1 space-y-1 overflow-y-auto p-2"
        aria-label="Dashboard"
      >
        {renderCategory(HOME_KEY, "Home")}

        {showLibrary ? (
          <>
            <div className="my-2 border-t" />
            {sidebarOpen && (
              <p className="px-3 pb-1 pt-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">
                My library
              </p>
            )}
            {categories.map((cat) =>
              renderCategory(cat.key, cat.label, cat.count),
            )}
            {renderCategory(CREATE_KEY, "Start something new")}
          </>
        ) : null}

        <div className="my-2 border-t" />
        {shopperLinks.map(renderLink)}

        {isVendor && settings.show_gifts ? (
          <>
            <div className="my-2 border-t" />
            {sidebarOpen && (
              <p className="px-3 pb-1 pt-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">
                My shop
              </p>
            )}
            {shopNavItems.map(renderLink)}
          </>
        ) : null}
      </nav>
    </aside>
  );
}

function rowClass(active: boolean) {
  return cn(
    "flex items-center gap-3 rounded-lg px-2 py-1.5 text-sm transition-colors",
    active
      ? "bg-sidebar-accent text-sidebar-accent-foreground"
      : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-foreground",
  );
}

function iconTileClass() {
  return "flex size-8 shrink-0 items-center justify-center rounded-lg";
}
