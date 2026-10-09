"use client";

import { ChevronDown, Flame, Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { KyndlButton } from "@/components/landing/kyndl-button";
import { HeaderUserMenu } from "@/components/layout/header-user-menu";
import { PageContainer } from "@/components/layout/page-container";
import { AgeConsentDialog } from "@/components/red-zone/age-consent-dialog";
import { ExperienceIcon } from "@/components/shared/experience-icon";
import { Logo } from "@/components/shared/logo";
import { groupByCategory } from "@/constants/experience-taxonomy";
import { ROUTES } from "@/constants/routes";
import { CartButton } from "@/features/gifts/components/cart-button";
import { ideaHref } from "@/features/ideas/idea-href";
import { NotificationBell } from "@/features/notifications/components/notification-bell";
import { experienceHref, experiences } from "@/lib/experiences";
import { hasRedZoneConsent, setRedZoneConsent } from "@/lib/red-zone-consent";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth.store";

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

  // Wait until the cookie session has been checked. A saved name is not a login.
  const isHydrated = useAuthStore((s) => s.isHydrated);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isLoggedIn = isHydrated && isAuthenticated;

  // Group the catalog once — the same spine feeds desktop mega-menu + mobile drawer.
  const groups = useMemo(
    () =>
      groupByCategory(
        experiences.filter((e) => e.status === "live" && !e.adult),
      ),
    [],
  );

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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
          {/* Mobile menu trigger */}
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
            className="-ml-1 inline-flex size-10 items-center justify-center rounded-full text-[#7A6258] transition-colors hover:bg-white/70 hover:text-[#3A2A25] lg:hidden"
          >
            <Menu className="size-5" />
          </button>
          <Logo className="[&_text]:fill-[#3A2A25]" />
        </div>

        {/* ── Desktop nav ─────────────────────────────────────────── */}
        <nav className="hidden items-center gap-1 lg:flex" aria-label="Main">
          {/* Experiences — opens the mega-menu */}
          <div className="relative" onMouseEnter={() => setMegaOpen(true)}>
            <Link
              href={ROUTES.experiences}
              className={cn(
                "inline-flex items-center gap-1 rounded-full px-3.5 py-2 text-sm transition-colors",
                megaOpen || isActive(ROUTES.experiences)
                  ? "text-[#3A2A25]"
                  : "text-[#7A6258] hover:text-[#3A2A25]",
              )}
              aria-expanded={megaOpen}
              onFocus={() => setMegaOpen(true)}
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

        {/* ── Right cluster ───────────────────────────────────────── */}
        <div className="flex items-center gap-1 sm:gap-2">
          <CartButton />
          {isLoggedIn && <NotificationBell />}
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

      {/* ── Desktop mega-menu panel — centered under the header ────── */}
      <MegaMenu
        open={megaOpen}
        groups={groups}
        onNavigate={() => setMegaOpen(false)}
      />

      {/* ── Mobile drawer ─────────────────────────────────────────── */}
      <MobileDrawer
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        groups={groups}
        onRedZone={goRedZone}
        isLoggedIn={isLoggedIn}
        accountReady={isHydrated}
      />

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

type Groups = ReturnType<typeof groupByCategory<(typeof experiences)[number]>>;

/** How many sub-columns a shelf needs so a long list stays beside the others
 *  instead of wrapping under them and falling off the bottom of the screen. */
function shelfColumns(count: number) {
  return count > 5 ? 2 : 1;
}

function MegaMenu({
  open,
  groups,
  onNavigate,
}: {
  open: boolean;
  groups: Groups;
  onNavigate: () => void;
}) {
  const shelves = groups.map((group) => ({
    ...group,
    cols: shelfColumns(group.items.length),
  }));

  return (
    <div
      className={cn(
        // `pt-2` (instead of `mt-2`) keeps the 8px offset as *padding inside*
        // this element, so its hoverable box bridges the gap to the header and
        // the mouse never crosses dead space that would fire the header's
        // onMouseLeave and close the menu mid-drag.
        "absolute left-1/2 top-full z-50 hidden w-[min(72rem,calc(100vw-2rem))] -translate-x-1/2 pt-2 origin-top transition-all duration-200 lg:block",
        open
          ? "pointer-events-auto translate-y-0 scale-100 opacity-100"
          : "pointer-events-none -translate-y-1 scale-[0.98] opacity-0",
      )}
      aria-hidden={!open}
    >
      <div className="max-h-[calc(100dvh-5.5rem)] overflow-y-auto overscroll-contain rounded-3xl border border-[#EAD3C6] bg-[#FFFBF7] p-5 shadow-2xl shadow-[#3A2A25]/15 ring-1 ring-[#3A2A25]/5">
        <div
          className="grid gap-x-6 gap-y-4"
          style={{
            gridTemplateColumns: shelves
              .map((shelf) => `minmax(0,${shelf.cols}fr)`)
              .join(" "),
          }}
        >
          {shelves.map(({ category, items, cols }) => (
            <div key={category.id} className="min-w-0">
              <p className="mb-3 text-xs font-semibold tracking-[0.16em] text-[#C75B39] uppercase">
                {category.label}
              </p>
              <ul
                className="grid gap-x-3 gap-y-0.5"
                style={{
                  gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
                }}
              >
                {items.map((exp) => (
                  <li key={exp.slug}>
                    <Link
                      href={experienceHref(exp.slug)}
                      onClick={onNavigate}
                      className="group flex items-start gap-3 rounded-2xl p-2.5 transition-colors hover:bg-white"
                    >
                      <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl border border-[#F4DDD0] bg-white text-[#FF7A59] transition-colors group-hover:border-[#FF7A59]/40">
                        <ExperienceIcon name={exp.icon} className="size-4.5" />
                      </span>
                      <span className="min-w-0">
                        <span className="text-sm font-medium text-[#3A2A25]">
                          {exp.name}
                        </span>
                        <span className="mt-0.5 line-clamp-1 text-xs text-[#92786C]">
                          {exp.tagline}
                        </span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Panel footer — cross-links to the other worlds */}
        <div className="mt-5 flex items-center justify-between gap-4 border-t border-[#F2DACE] pt-4">
          <div className="flex flex-wrap items-center gap-2">
            <PanelPill href={ROUTES.memoryBankStory} onClick={onNavigate}>
              Memory Bank
            </PanelPill>
            <PanelPill href={ROUTES.kyndStory} onClick={onNavigate}>
              Kynd
            </PanelPill>
            <PanelPill href={ROUTES.gifts} onClick={onNavigate}>
              Physical gifts
            </PanelPill>
            <PanelPill href={ROUTES.recommend} onClick={onNavigate}>
              For you
            </PanelPill>
            <PanelPill href={ROUTES.games} onClick={onNavigate}>
              Games
            </PanelPill>
            <PanelPill href={ROUTES.pricing} onClick={onNavigate}>
              Pricing
            </PanelPill>
            <PanelPill
              href={ideaHref({ source: "experiences" })}
              onClick={onNavigate}
            >
              Submit an idea
            </PanelPill>
          </div>
          <Link
            href={ROUTES.experiences}
            onClick={onNavigate}
            className="inline-flex items-center gap-1 text-sm font-semibold text-[#C75B39] hover:text-[#9e3f21]"
          >
            See all experiences →
          </Link>
        </div>
      </div>
    </div>
  );
}

function PanelPill({
  href,
  children,
  onClick,
}: {
  href: string;
  children: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="inline-flex items-center rounded-full border border-[#F2DACE] bg-white/70 px-3.5 py-1.5 text-sm text-[#7A6258] transition-colors hover:border-[#FF7A59]/50 hover:text-[#3A2A25]"
    >
      {children}
    </Link>
  );
}

function MobileDrawer({
  open,
  onClose,
  groups,
  onRedZone,
  isLoggedIn,
  accountReady,
}: {
  open: boolean;
  onClose: () => void;
  groups: Groups;
  onRedZone: () => void;
  isLoggedIn: boolean;
  accountReady: boolean;
}) {
  // Lock body scroll while the drawer is open.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 z-50 bg-[#3A2A25]/40 backdrop-blur-sm transition-opacity duration-300 lg:hidden",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={onClose}
        aria-hidden
      />
      {/* Panel */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-[86%] max-w-sm flex-col bg-[#FFF7F1] shadow-2xl transition-transform duration-300 ease-out lg:hidden",
          open ? "translate-x-0" : "-translate-x-full",
        )}
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
      >
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-[#F2DACE] px-5">
          <Logo className="[&_text]:fill-[#3A2A25]" />
          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="inline-flex size-10 items-center justify-center rounded-full text-[#7A6258] transition-colors hover:bg-white hover:text-[#3A2A25]"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto overscroll-contain px-3 py-5">
          <Link
            href={ROUTES.memoryBankStory}
            onClick={onClose}
            className="mb-4 flex items-center justify-between rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-[#C75B39] kyndl-card-soft"
          >
            Memory Bank
            <span>→</span>
          </Link>
          <Link
            href={ROUTES.kyndStory}
            onClick={onClose}
            className="mb-4 flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-semibold text-[#3A2A25]"
          >
            <span>
              Kynd
              <span className="mt-0.5 block text-xs font-normal text-[#92786C]">
                Little things I know
              </span>
            </span>
            <span>→</span>
          </Link>
          <Link
            href={ROUTES.experiences}
            onClick={onClose}
            className="mb-2 flex items-center justify-between rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-[#3A2A25] kyndl-card-soft"
          >
            All experiences
            <span className="text-[#C75B39]">→</span>
          </Link>
          <Link
            href={ideaHref({ source: "experiences" })}
            onClick={onClose}
            className="mb-4 flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-medium text-[#C75B39]"
          >
            Don&apos;t see it? Submit an idea
            <span>→</span>
          </Link>

          {groups.map(({ category, items }) => (
            <div key={category.id} className="mb-5">
              <p className="mb-1.5 px-2 text-xs font-semibold tracking-[0.16em] text-[#C75B39] uppercase">
                {category.label}
              </p>
              <ul>
                {items.map((exp) => (
                  <li key={exp.slug}>
                    <Link
                      href={experienceHref(exp.slug)}
                      onClick={onClose}
                      className="flex items-center gap-3 rounded-2xl px-2 py-2.5 transition-colors active:bg-white"
                    >
                      <span className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-[#F4DDD0] bg-white text-[#FF7A59]">
                        <ExperienceIcon name={exp.icon} className="size-4.5" />
                      </span>
                      <span className="text-sm font-medium text-[#3A2A25]">
                        {exp.name}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div className="mt-2 space-y-1 border-t border-[#F2DACE] pt-4">
            {PRIMARY_LINKS.filter(
              (link) => link.label !== "Memory Bank" && link.label !== "Kynd",
            ).map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={onClose}
                className="block rounded-2xl px-4 py-3 text-sm font-medium text-[#3A2A25] transition-colors active:bg-white"
              >
                {link.label}
              </Link>
            ))}
            <button
              type="button"
              onClick={() => {
                onClose();
                onRedZone();
              }}
              className="flex w-full items-center gap-2 rounded-2xl px-4 py-3 text-left text-sm font-medium text-[#C2415A] transition-colors active:bg-white"
            >
              <Flame className="size-4" />
              Red Zone
            </button>
          </div>
        </div>

        {/* Sticky footer actions */}
        <div className="shrink-0 space-y-2 border-t border-[#F2DACE] bg-[#FCEEE3] px-5 py-4">
          {!accountReady ? (
            <div
              aria-hidden
              className="h-12 w-full animate-pulse rounded-full bg-[#F2DACE]/80"
            />
          ) : isLoggedIn ? (
            <KyndlButton
              href={ROUTES.dashboard}
              size="lg"
              className="w-full"
              onClick={onClose}
            >
              Go to dashboard
            </KyndlButton>
          ) : (
            <>
              <KyndlButton
                href={ROUTES.register}
                size="lg"
                className="w-full"
                onClick={onClose}
              >
                Get Started
              </KyndlButton>
              <Link
                href={ROUTES.login}
                onClick={onClose}
                className="block py-1.5 text-center text-sm text-[#7A6258]"
              >
                Already have an account? Log in
              </Link>
            </>
          )}
        </div>
      </div>
    </>
  );
}
