"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";

import { ROUTES } from "@/constants/routes";
import { hasBuilder, newCreationHref } from "@/lib/creations";
import { experienceHref, getExperience } from "@/lib/experiences";
import { cn } from "@/lib/utils";
import { track } from "@/services/analytics/analytics.service";

/**
 * Floating growth CTA on every public `/v/<token>` view.
 * Links into the matching builder (`/dashboard?new=…`); proxy sends signed-out
 * viewers through login with that destination as `callbackUrl`.
 */
export function MakeYourOwnFab({
  experienceType,
  fromToken,
  /** Lift above bottom-right chat docks (memory-pages / memory-jar). */
  offsetForChat = false,
}: {
  experienceType: string;
  fromToken: string;
  offsetForChat?: boolean;
}) {
  const href = makeYourOwnHref(experienceType, fromToken);
  const name = getExperience(experienceType)?.name;

  useEffect(() => {
    track({
      name: "share.make_your_own_fab_shown",
      properties: { experience_type: experienceType, from_token: fromToken },
    });
  }, [experienceType, fromToken]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, delay: 0.55, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "pointer-events-none fixed right-4 z-50 sm:right-6",
        offsetForChat ? "bottom-[5.5rem] sm:bottom-24" : "bottom-4 sm:bottom-6",
      )}
    >
      <Link
        href={href}
        aria-label={
          name ? `Make your own ${name}` : "Make your own Kyndl experience"
        }
        onClick={() => {
          track({
            name: "share.make_your_own_fab_clicked",
            properties: {
              experience_type: experienceType,
              from_token: fromToken,
            },
          });
        }}
        className="pointer-events-auto inline-flex items-center gap-2 rounded-full bg-kyndl-red py-2.5 pr-4 pl-3 text-sm font-semibold text-kyndl-ivory shadow-[0_14px_36px_-12px_rgba(177,18,38,0.55)] outline-none transition-[transform,background-color] hover:bg-kyndl-red-bright hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-kyndl-gold focus-visible:ring-offset-2 active:translate-y-0 active:scale-[0.98]"
      >
        <span className="grid size-7 place-items-center rounded-full bg-white/15">
          <Sparkles className="size-3.5" aria-hidden />
        </span>
        <span className="leading-none">Make yours</span>
      </Link>
    </motion.div>
  );
}

function makeYourOwnHref(experienceType: string, fromToken: string): string {
  if (hasBuilder(experienceType)) {
    const base = newCreationHref(experienceType);
    const sep = base.includes("?") ? "&" : "?";
    return `${base}${sep}from=${encodeURIComponent(fromToken)}&ref=public-float`;
  }
  return experienceHref(experienceType) || ROUTES.experiences;
}
