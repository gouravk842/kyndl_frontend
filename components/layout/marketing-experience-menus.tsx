"use client";

import { Flame, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";

import { KyndlButton } from "@/components/landing/kyndl-button";
import { ExperienceIcon } from "@/components/shared/experience-icon";
import { Logo } from "@/components/shared/logo";
import { useSiteSettings } from "@/components/site-settings/site-settings-provider";
import { groupByCategory } from "@/constants/experience-taxonomy";
import { ROUTES } from "@/constants/routes";
import { ideaHref } from "@/features/ideas/idea-href";
import { useExperienceCatalog } from "@/hooks/use-experience-catalog";
import { useMounted } from "@/hooks/use-mounted";
import type { ExperienceView } from "@/lib/experience-catalog";
import { experienceHref } from "@/lib/experiences";
import { visiblePrimaryLinks } from "@/lib/marketing-nav";
import { cn } from "@/lib/utils";

type Groups = ReturnType<typeof groupByCategory<ExperienceView>>;

function shelfColumns(count: number) {
  return count > 5 ? 2 : 1;
}

export function MarketingExperienceMenus({
  megaOpen,
  mobileOpen,
  onMegaNavigate,
  onMobileClose,
  onRedZone,
  isLoggedIn,
  accountReady,
}: {
  megaOpen: boolean;
  mobileOpen: boolean;
  onMegaNavigate: () => void;
  onMobileClose: () => void;
  onRedZone: () => void;
  isLoggedIn: boolean;
  accountReady: boolean;
}) {
  // Backend `is_visible` — never list the static registry alone.
  const { catalog } = useExperienceCatalog();
  const groups = useMemo(() => groupByCategory(catalog), [catalog]);

  return (
    <>
      <MegaMenu open={megaOpen} groups={groups} onNavigate={onMegaNavigate} />
      <MobileDrawer
        open={mobileOpen}
        onClose={onMobileClose}
        groups={groups}
        onRedZone={onRedZone}
        isLoggedIn={isLoggedIn}
        accountReady={accountReady}
      />
    </>
  );
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
  const settings = useSiteSettings();
  const shelves = groups.map((group) => ({
    ...group,
    cols: shelfColumns(group.items.length),
  }));

  return (
    <div
      className={cn(
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
                      prefetch={false}
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

        <div className="mt-5 flex items-center justify-between gap-4 border-t border-[#F2DACE] pt-4">
          <div className="flex flex-wrap items-center gap-2">
            {settings.show_memory_bank ? (
              <PanelPill href={ROUTES.memoryBankStory} onClick={onNavigate}>
                Memory Bank
              </PanelPill>
            ) : null}
            {settings.show_kynd ? (
              <PanelPill href={ROUTES.kyndStory} onClick={onNavigate}>
                Kynd
              </PanelPill>
            ) : null}
            {settings.show_gifts ? (
              <PanelPill href={ROUTES.gifts} onClick={onNavigate}>
                Physical gifts
              </PanelPill>
            ) : null}
            {settings.show_recommend ? (
              <PanelPill href={ROUTES.recommend} onClick={onNavigate}>
                For you
              </PanelPill>
            ) : null}
            {settings.show_games ? (
              <PanelPill href={ROUTES.games} onClick={onNavigate}>
                Games
              </PanelPill>
            ) : null}
            {settings.show_pricing ? (
              <PanelPill href={ROUTES.pricing} onClick={onNavigate}>
                Pricing
              </PanelPill>
            ) : null}
            <PanelPill
              href={ideaHref({ source: "experiences" })}
              onClick={onNavigate}
            >
              Submit an idea
            </PanelPill>
          </div>
          <Link
            href={ROUTES.experiences}
            prefetch={false}
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
      prefetch={false}
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
  const settings = useSiteSettings();
  const mounted = useMounted();
  const [backdropLive, setBackdropLive] = useState(false);
  const [openSnapshot, setOpenSnapshot] = useState(open);
  const primaryLinks = visiblePrimaryLinks(settings).filter(
    (link) => link.label !== "Memory Bank" && link.label !== "Kynd",
  );

  if (open !== openSnapshot) {
    setOpenSnapshot(open);
    if (!open) setBackdropLive(false);
  }

  // Ignore the opening tap's delayed click so the overlay doesn't dismiss
  // the drawer the moment it appears.
  useEffect(() => {
    if (!open) return;
    const id = window.setTimeout(() => setBackdropLive(true), 350);
    return () => window.clearTimeout(id);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const html = document.documentElement;
    const body = document.body;
    const prev = {
      htmlOverflow: html.style.overflow,
      bodyOverflow: body.style.overflow,
      htmlOverscroll: html.style.overscrollBehavior,
      bodyOverscroll: body.style.overscrollBehavior,
    };
    html.style.overflow = "hidden";
    body.style.overflow = "hidden";
    html.style.overscrollBehavior = "none";
    body.style.overscrollBehavior = "none";
    return () => {
      html.style.overflow = prev.htmlOverflow;
      body.style.overflow = prev.bodyOverflow;
      html.style.overscrollBehavior = prev.htmlOverscroll;
      body.style.overscrollBehavior = prev.bodyOverscroll;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!mounted) return null;

  return createPortal(
    <>
      <div
        className={cn(
          "fixed inset-0 z-[60] bg-[#3A2A25]/40 backdrop-blur-sm transition-opacity duration-300 touch-none lg:hidden",
          open && backdropLive
            ? "opacity-100"
            : open
              ? "pointer-events-none opacity-100"
              : "pointer-events-none opacity-0",
        )}
        onClick={(event) => {
          if (!backdropLive) return;
          if (event.target !== event.currentTarget) return;
          onClose();
        }}
        aria-hidden
      />
      <div
        className={cn(
          "fixed top-0 left-0 z-[70] flex h-dvh w-[86%] max-w-sm flex-col overflow-hidden bg-[#FFF7F1] shadow-2xl transition-transform duration-300 ease-out lg:hidden",
          open ? "translate-x-0" : "pointer-events-none -translate-x-full",
        )}
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        aria-hidden={!open}
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
          {settings.show_memory_bank ? (
            <Link
              href={ROUTES.memoryBankStory}
              onClick={onClose}
              className="mb-4 flex items-center justify-between rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-[#C75B39] kyndl-card-soft"
            >
              Memory Bank
              <span>→</span>
            </Link>
          ) : null}
          {settings.show_kynd ? (
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
          ) : null}
          {settings.show_experiences ? (
            <Link
              href={ROUTES.experiences}
              onClick={onClose}
              className="mb-2 flex items-center justify-between rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-[#3A2A25] kyndl-card-soft"
            >
              All experiences
              <span className="text-[#C75B39]">→</span>
            </Link>
          ) : null}
          <Link
            href={ideaHref({ source: "experiences" })}
            onClick={onClose}
            className="mb-4 flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-medium text-[#C75B39]"
          >
            Don&apos;t see it? Submit an idea
            <span>→</span>
          </Link>

          {settings.show_experiences
            ? groups.map(({ category, items }) => (
                <div key={category.id} className="mb-5">
                  <p className="mb-1.5 px-2 text-xs font-semibold tracking-[0.16em] text-[#C75B39] uppercase">
                    {category.label}
                  </p>
                  <ul>
                    {items.map((exp) => (
                      <li key={exp.slug}>
                        <Link
                          href={experienceHref(exp.slug)}
                          prefetch={false}
                          onClick={onClose}
                          className="flex items-center gap-3 rounded-2xl px-2 py-2.5 transition-colors active:bg-white"
                        >
                          <span className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-[#F4DDD0] bg-white text-[#FF7A59]">
                            <ExperienceIcon
                              name={exp.icon}
                              className="size-4.5"
                            />
                          </span>
                          <span className="text-sm font-medium text-[#3A2A25]">
                            {exp.name}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))
            : null}

          <div className="mt-2 space-y-1 border-t border-[#F2DACE] pt-4">
            {primaryLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={onClose}
                className="block rounded-2xl px-4 py-3 text-sm font-medium text-[#3A2A25] transition-colors active:bg-white"
              >
                {link.label}
              </Link>
            ))}
            {settings.show_red_zone ? (
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
            ) : null}
          </div>
        </div>

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
    </>,
    document.body,
  );
}
