"use client";

import { Check, Link2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { useReferralProfile } from "@/hooks/use-referrals";
import { cn } from "@/lib/utils";
import { track } from "@/services/analytics/analytics.service";
import { useAuthStore } from "@/store/auth.store";

type Kind = "experience" | "gift";

function buildHref(code: string, kind: Kind, slug: string) {
  const segment = kind === "gift" ? "gift" : "exp";
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  return `${origin}/r/${code}/${segment}/${slug}`;
}

/**
 * Logged-in "Copy referral link" control for experience / gift product pages.
 * Hidden when signed out.
 */
export function ReferProductButton({
  kind,
  slug,
  className,
}: {
  kind: Kind;
  slug: string;
  className?: string;
}) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const { data: profile, isLoading } = useReferralProfile();
  const [copied, setCopied] = useState(false);

  if (!isAuthenticated) return null;

  async function onCopy() {
    if (!profile?.code) {
      toast.error("Referral code not ready yet — try again in a moment.");
      return;
    }
    const url = buildHref(profile.code, kind, slug);
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success("Referral link copied");
      track({
        name: "referral.link_copied",
        properties: { kind, slug, url },
      });
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Could not copy the link.");
    }
  }

  return (
    <button
      type="button"
      disabled={isLoading || !profile?.code}
      onClick={onCopy}
      className={cn(
        "inline-flex h-12 items-center justify-center gap-2 rounded-full border border-[#F2DACE] bg-white/70 px-6 text-base font-medium text-[#3A2A25] transition-all duration-500 hover:border-[#FF7A59]/50 hover:bg-white disabled:opacity-60",
        className,
      )}
    >
      {copied ? <Check className="size-4" /> : <Link2 className="size-4" />}
      {copied ? "Copied" : "Copy referral link"}
    </button>
  );
}
