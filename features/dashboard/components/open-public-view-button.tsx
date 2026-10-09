"use client";

import { ExternalLink } from "lucide-react";
import Link from "next/link";

import { cn } from "@/lib/utils";

/**
 * Opens the real audience viewer (`/v/<public_token>`) in a new tab.
 * Disabled until the creation has been saved at least once (token exists).
 * Shows the last-saved cloud state — same caveat as the Publish-tab Preview.
 */
export function OpenPublicViewButton({
  publicToken,
  dirty = false,
  className,
  compact = false,
}: {
  publicToken: string | null;
  /** When true, hint that unsaved local edits won't appear yet. */
  dirty?: boolean;
  className?: string;
  /** Smaller chrome for tight toolbars (e.g. scrapbook). */
  compact?: boolean;
}) {
  const enabled = Boolean(publicToken);
  const href = publicToken ? `/v/${publicToken}` : undefined;
  const title = !enabled
    ? "Save once to open the public view"
    : dirty
      ? "Opens the last saved version — save to include recent edits"
      : "Open how this looks for your audience";

  if (!enabled || !href) {
    return (
      <button
        type="button"
        disabled
        title={title}
        className={cn(
          "inline-flex items-center gap-1.5 font-medium text-[#92786c] opacity-50",
          compact
            ? "rounded-lg px-2.5 py-1.5 text-xs"
            : "rounded-full border border-[#f2dace] bg-white/70 px-3 py-1.5 text-sm",
          className,
        )}
      >
        <ExternalLink className={compact ? "size-3.5" : "size-3.5"} />
        {compact ? "Public view" : "Open public view"}
      </button>
    );
  }

  return (
    <Link
      href={href}
      target="_blank"
      rel="noreferrer"
      title={title}
      className={cn(
        "inline-flex items-center gap-1.5 font-medium text-[#3a2a25] transition-colors hover:text-[#c75b39]",
        compact
          ? "rounded-lg px-2.5 py-1.5 text-xs hover:bg-[#fff7f1]"
          : "rounded-full border border-[#f2dace] bg-white/70 px-3 py-1.5 text-sm hover:border-[#ff7a59]/40 hover:bg-white",
        className,
      )}
    >
      <ExternalLink className="size-3.5" />
      {compact ? "Public view" : "Open public view"}
    </Link>
  );
}
