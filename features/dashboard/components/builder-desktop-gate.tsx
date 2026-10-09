"use client";

import { ArrowLeft, ExternalLink, Monitor } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import { useMediaQuery } from "@/hooks/use-media-query";

/**
 * Warm full-pane message when the viewport is too narrow for the builder.
 * Editing needs room; recipients can still open a share link on this phone.
 */
export function BuilderDesktopGate({
  publicToken = null,
}: {
  publicToken?: string | null;
}) {
  const shareHref = publicToken ? `/v/${publicToken}` : null;

  return (
    <div className="flex min-h-[calc(100dvh-4rem)] w-full flex-col items-center justify-center bg-[#fffaf4] px-6 py-16 text-center">
      <div
        className="mb-5 grid size-14 place-items-center rounded-2xl border border-[#f2dace] bg-white/80 text-[#c75b39] shadow-[0_12px_40px_-24px_rgba(58,42,37,0.45)]"
        aria-hidden
      >
        <Monitor className="size-7" />
      </div>
      <h1 className="font-display text-2xl tracking-tight text-[#3a2a25] sm:text-3xl">
        This editor needs a wider screen
      </h1>
      <p className="mt-3 max-w-sm text-sm leading-relaxed text-[#92786c]">
        Building a keepsake works best on a tablet or laptop. Open this on a
        larger screen to edit — you can still view a shared link on this phone.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Button render={<Link href={ROUTES.dashboard} />} variant="secondary">
          <ArrowLeft className="size-4" />
          Back to library
        </Button>
        {shareHref ? (
          <Button
            render={<Link href={shareHref} target="_blank" rel="noreferrer" />}
          >
            <ExternalLink className="size-4" />
            Open share link
          </Button>
        ) : null}
      </div>
    </div>
  );
}

/**
 * Wraps every embedded builder so phones get the desktop gate once, instead of
 * per-experience split-pane hacks. SSR / desktop: children. Narrow: gate.
 */
export function GatedBuilder({
  children,
  publicToken = null,
}: {
  children: ReactNode;
  publicToken?: string | null;
}) {
  const isNarrow = useMediaQuery("(max-width: 767px)");
  if (isNarrow) {
    return <BuilderDesktopGate publicToken={publicToken} />;
  }
  return children;
}
