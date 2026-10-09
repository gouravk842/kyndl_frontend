"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useEffect } from "react";
import { toast } from "sonner";

import { useReferralProfile } from "@/hooks/use-referrals";
import { cn } from "@/lib/utils";
import { track } from "@/services/analytics/analytics.service";
import { useAuthStore } from "@/store/auth.store";

import {
  makeOneBackHref,
  makeOneBackLabel,
  referralExperienceHref,
} from "../lib/make-one-back";
import { captureOccasionReminderIntent } from "../lib/occasion-reminder";

/**
 * Soft reciprocal CTA — "make one back" after receiving a keepsake.
 * Attribution via `?from=&ref=make-one-back`. Logged-in viewers also get a
 * one-tap copy of their referral link for this experience.
 */
export function MakeOneBackCta({
  experienceType,
  fromToken,
  tone = "default",
  className,
}: {
  experienceType: string;
  fromToken: string;
  /** `on-dark` for Moment celebrations; `on-warm` for keepsake sheets. */
  tone?: "default" | "on-dark" | "on-warm";
  className?: string;
}) {
  const href = makeOneBackHref(experienceType, fromToken);
  const label = makeOneBackLabel(experienceType);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const { data: profile } = useReferralProfile();

  useEffect(() => {
    if (!href) return;
    track({
      name: "share.make_one_back_shown",
      properties: { experience_type: experienceType, from_token: fromToken },
    });
  }, [href, experienceType, fromToken]);

  if (!href) return null;

  async function copyReferral() {
    if (!profile?.code) return;
    const url = `${window.location.origin}${referralExperienceHref(profile.code, experienceType)}`;
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Referral link copied");
      track({
        name: "referral.link_copied",
        properties: {
          kind: "experience",
          slug: experienceType,
          source: "make_one_back",
        },
      });
    } catch {
      toast.error("Could not copy the link.");
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.15 }}
      className={cn(
        "flex flex-col items-center gap-1.5 text-center",
        className,
      )}
    >
      <p
        className={cn(
          "text-sm",
          tone === "on-dark" && "text-white/55",
          tone === "on-warm" && "text-[#5b4233]/70",
          tone === "default" && "text-muted-foreground",
        )}
      >
        Felt something? You could send one back.
      </p>
      <Link
        href={href}
        onClick={() => {
          track({
            name: "share.make_one_back_clicked",
            properties: {
              experience_type: experienceType,
              from_token: fromToken,
            },
          });
          captureOccasionReminderIntent({
            experienceType,
            fromToken,
            triggeredBy: "make_one_back",
          });
        }}
        className={cn(
          "text-base font-medium underline-offset-4 transition-opacity hover:underline",
          tone === "on-dark" && "text-white/90 hover:opacity-90",
          tone === "on-warm" &&
            "font-display text-[#c75b39] hover:text-[#a8462c]",
          tone === "default" && "text-primary",
        )}
      >
        {label}
      </Link>
      {isAuthenticated && profile?.code ? (
        <button
          type="button"
          onClick={copyReferral}
          className={cn(
            "mt-1 text-xs underline-offset-2 hover:underline",
            tone === "on-dark" && "text-white/45",
            tone === "on-warm" && "text-[#5b4233]/55",
            tone === "default" && "text-muted-foreground",
          )}
        >
          Or copy your referral link for this
        </button>
      ) : null}
    </motion.div>
  );
}
