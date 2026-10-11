"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { ROUTES } from "@/constants/routes";
import { hasBuilder, newCreationHref } from "@/lib/creations";
import { experienceHref, getExperience } from "@/lib/experiences";
import { cn } from "@/lib/utils";
import { track } from "@/services/analytics/analytics.service";

import {
  RECIPIENT_AFTERMATH_ID,
  usePublicBottomChrome,
} from "./public-bottom-chrome";

/**
 * Floating growth CTA on every public `/v/<token>` view.
 * Links into the matching builder (`/dashboard?new=…`); proxy sends signed-out
 * viewers through login with that destination as `callbackUrl`.
 *
 * On small screens it shrinks to an icon and yields whenever experience chrome,
 * the aftermath block, or a focused form field needs the bottom of the viewport.
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
  const bottomChrome = usePublicBottomChrome();
  const yieldForContent = useFabYield();

  const hidden = bottomChrome || yieldForContent;

  useEffect(() => {
    if (hidden) return;
    track({
      name: "share.make_your_own_fab_shown",
      properties: { experience_type: experienceType, from_token: fromToken },
    });
  }, [experienceType, fromToken, hidden]);

  if (hidden) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.35, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "pointer-events-none fixed right-3 z-50 sm:right-6",
        offsetForChat
          ? "bottom-[5.5rem] sm:bottom-24"
          : "bottom-[max(0.75rem,env(safe-area-inset-bottom))] sm:bottom-6",
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
        className="pointer-events-auto inline-flex items-center gap-2 rounded-full bg-kyndl-red py-2.5 pr-3 pl-3 text-sm font-semibold text-kyndl-ivory shadow-[0_14px_36px_-12px_rgba(177,18,38,0.55)] outline-none transition-[transform,background-color,padding] hover:bg-kyndl-red-bright hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-kyndl-gold focus-visible:ring-offset-2 active:translate-y-0 active:scale-[0.98] sm:pr-4"
      >
        <span className="grid size-7 place-items-center rounded-full bg-white/15">
          <Sparkles className="size-3.5" aria-hidden />
        </span>
        {/* Full label from sm up — icon-only on phones so it doesn't eat the
            bottom strip shared with transport bars, music, and composers. */}
        <span className="hidden leading-none sm:inline">Make yours</span>
      </Link>
    </motion.div>
  );
}

/**
 * Hide the FAB when the recipient is in the aftermath / Leave a note zone, or
 * typing in a form — same problem on every experience that scrolls under the FAB.
 */
function useFabYield() {
  const [yieldForAftermath, setYieldForAftermath] = useState(false);
  const [yieldForFocus, setYieldForFocus] = useState(false);

  useEffect(() => {
    const root = document.getElementById(RECIPIENT_AFTERMATH_ID);
    if (!root) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setYieldForAftermath(Boolean(entry?.isIntersecting));
      },
      // Kick in once ~20% of the aftermath is on screen — early enough that
      // Leave a note isn't still under the pill.
      { root: null, threshold: 0.15, rootMargin: "0px 0px -8% 0px" },
    );
    observer.observe(root);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const isField = (el: EventTarget | null) => {
      if (!(el instanceof HTMLElement)) return false;
      const tag = el.tagName;
      return (
        tag === "INPUT" ||
        tag === "TEXTAREA" ||
        tag === "SELECT" ||
        el.isContentEditable
      );
    };

    const onFocusIn = (e: FocusEvent) => {
      if (isField(e.target)) setYieldForFocus(true);
    };
    const onFocusOut = (e: FocusEvent) => {
      // Defer so focus moving between fields doesn't flash the FAB back.
      requestAnimationFrame(() => {
        if (!isField(document.activeElement) && !isField(e.relatedTarget)) {
          setYieldForFocus(false);
        }
      });
    };

    document.addEventListener("focusin", onFocusIn);
    document.addEventListener("focusout", onFocusOut);
    return () => {
      document.removeEventListener("focusin", onFocusIn);
      document.removeEventListener("focusout", onFocusOut);
    };
  }, []);

  return yieldForAftermath || yieldForFocus;
}

function makeYourOwnHref(experienceType: string, fromToken: string): string {
  if (hasBuilder(experienceType)) {
    const base = newCreationHref(experienceType);
    const sep = base.includes("?") ? "&" : "?";
    return `${base}${sep}from=${encodeURIComponent(fromToken)}&ref=public-float`;
  }
  return experienceHref(experienceType) || ROUTES.experiences;
}
