"use client";

import { ChevronDown, Flame, Menu } from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { KyndlButton } from "@/components/landing/kyndl-button";
import { HeaderUserMenu } from "@/components/layout/header-user-menu";
import { PageContainer } from "@/components/layout/page-container";
import { AgeConsentDialog } from "@/components/red-zone/age-consent-dialog";
import { Logo } from "@/components/shared/logo";
import { ROUTES } from "@/constants/routes";
import { CartButton } from "@/features/gifts/components/cart-button";
import { NotificationBell } from "@/features/notifications/components/notification-bell";
import { hasRedZoneConsent, setRedZoneConsent } from "@/lib/red-zone-consent";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth.store";

const MarketingExperienceMenus = dynamic(
  () =>
    import("@/components/layout/marketing-experience-menus").then(
      (m) => m.MarketingExperienceMenus,
    ),
  { ssr: false },
);

/** Top-level destinations, in the order they appear in the bar. */
const PRIMARY_LINKS = [
  { href: ROUTES.memoryBankStory, label: "Memory Bank" },
  { href: ROUTES.kyndStory, label: "Kynd" },
  { href: ROUTES.gifts, label: "Gifts" },
  { href: ROUTES.recommend, label: "For you" },
  { href: ROUTES.games, label: "Games" },
  { href: ROUTES.pricing, label: "Pricing" },
] as const;

export function MarketingHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [redZoneAsking, setRedZoneAsking] = useState(false);
  // Keep menu chunk mounted after first open so close animations still run.
  const [menusReady, setMenusReady] = useState(false);

  const isHydrated = useAuthStore((s) => s.isHydrated);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isLoggedIn = isHydrated && isAuthenticated;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const openMega = () => {
    setMenusReady(true);
    setMegaOpen(true);
  };

  const openMobile = () => {
    setMenusReady(true);
    setMobileOpen(true);
  };

  const goRedZone = () => {
    if (hasRedZoneConsent()) {
      router.push(ROUTES.redZone);
    } else {
      setRedZoneAsking(true);
    }
  };

  const isActive = (href: string) =>
    href === ROUTES.home ? pathname === href : pathname.startsWith(href);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 transition-all duration-300",
        scrolled || megaOpen
          ? "border-b border-[#F2DACE] bg-[#FFF7F1]/85 backdrop-blur-xl"
          : "border-b border-transparent bg-transparent",
      )}
      onMouseLeave={() => setMegaOpen(false)}
    >
      <PageContainer
        size="xl"
        className="flex h-16 items-center justify-between gap-4"
      >
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={openMobile}
            aria-label="Open menu"
            className="-ml-1 inline-flex size-10 items-center justify-center rounded-full text-[#7A6258] transition-colors hover:bg-white/70 hover:text-[#3A2A25] lg:hidden"
          >
            <Menu className="size-5" />
          </button>
          <Logo className="[&_text]:fill-[#3A2A25]" />
        </div>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Main">
          <div className="relative" onMouseEnter={openMega}>
            <Link
              href={ROUTES.experiences}
              className={cn(
                "inline-flex items-center gap-1 rounded-full px-3.5 py-2 text-sm transition-colors",
                megaOpen || isActive(ROUTES.experiences)
                  ? "text-[#3A2A25]"
                  : "text-[#7A6258] hover:text-[#3A2A25]",
              )}
              aria-expanded={megaOpen}
              onFocus={openMega}
            >
              Experiences
              <ChevronDown
                className={cn(
                  "size-3.5 transition-transform duration-300",
                  megaOpen && "rotate-180",
                )}
              />
            </Link>
          </div>

          {PRIMARY_LINKS.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className={cn(
                "rounded-full px-3.5 py-2 text-sm transition-colors",
                link.label === "Memory Bank"
                  ? isActive(link.href)
                    ? "text-[#C75B39]"
                    : "text-[#C75B39]/80 hover:text-[#C75B39]"
                  : isActive(link.href)
                    ? "text-[#3A2A25]"
                    : "text-[#7A6258] hover:text-[#3A2A25]",
              )}
            >
              {link.label}
            </Link>
          ))}

          <button
            type="button"
            onClick={goRedZone}
            className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-medium text-[#C2415A] transition-colors hover:text-[#9e1f3c]"
          >
            <Flame className="size-3.5" />
            Red Zone
          </button>
        </nav>

        <div className="flex items-center gap-1 sm:gap-2">
          <CartButton />
          {isLoggedIn && <NotificationBell keepAlive={false} />}
          {!isHydrated ? (
            <div
              aria-hidden
              className="h-9 w-24 animate-pulse rounded-full bg-[#F2DACE]/80"
            />
          ) : isLoggedIn ? (
            <HeaderUserMenu />
          ) : (
            <>
              <Link
                href={ROUTES.login}
                className="hidden px-2 text-sm text-[#7A6258] transition-colors hover:text-[#3A2A25] lg:inline"
              >
                Log in
              </Link>
              <KyndlButton href={ROUTES.register} size="default">
                Get Started
              </KyndlButton>
            </>
          )}
        </div>
      </PageContainer>

      {menusReady ? (
        <MarketingExperienceMenus
          megaOpen={megaOpen}
          mobileOpen={mobileOpen}
          onMegaNavigate={() => setMegaOpen(false)}
          onMobileClose={() => setMobileOpen(false)}
          onRedZone={goRedZone}
          isLoggedIn={isLoggedIn}
          accountReady={isHydrated}
        />
      ) : null}

      <AgeConsentDialog
        open={redZoneAsking}
        onConfirm={() => {
          setRedZoneConsent();
          setRedZoneAsking(false);
          router.push(ROUTES.redZone);
        }}
        onCancel={() => setRedZoneAsking(false)}
      />
    </header>
  );
}
