"use client";

import { motion } from "framer-motion";
import { HeartHandshake, Sparkles } from "lucide-react";

import { Flames } from "@/features/desire-deck/components/flames";
import { MakeOneBackCta } from "@/features/recipient-aftermath/components/make-one-back-cta";

import { HEAT_META, type Reveal } from "../config";

/**
 * The mutual reveal — shown to the partner right after they answer, and to the
 * owner on their results page. Only items neither side said no to appear, so
 * this is safe to show both. Never lists a one-sided answer.
 */
export function RevealView({
  reveal,
  intro,
  shareToken,
}: {
  reveal: Reveal;
  /** Optional line above the lists (e.g. "You and Sam both want…"). */
  intro?: string;
  /** Public share token — enables soft "make one back" after the partner finishes. */
  shareToken?: string;
}) {
  const nothing = reveal.matches.length === 0 && reveal.maybes.length === 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-md"
    >
      <div className="mb-6 text-center">
        <span className="mx-auto mb-3 grid size-14 place-items-center rounded-full bg-gradient-to-br from-[#ff4d6d] to-[#c81d4e] text-white shadow-lg">
          <HeartHandshake className="size-6" />
        </span>
        <h2 className="font-display text-2xl text-white">
          {nothing ? "No overlaps this time" : "You're both into…"}
        </h2>
        {intro && <p className="mt-2 text-sm text-white/55">{intro}</p>}
        {nothing && (
          <p className="mt-2 text-sm text-white/55">
            Nothing you both said yes (or maybe) to — but your answers stayed
            private. Try the list again sometime; tastes change.
          </p>
        )}
      </div>

      {reveal.matches.length > 0 && (
        <Section
          title="Matches"
          caption="you both said yes"
          items={reveal.matches}
          highlight
        />
      )}
      {reveal.maybes.length > 0 && (
        <Section
          title="Worth exploring"
          caption="at least one yes, no nos"
          items={reveal.maybes}
        />
      )}

      {shareToken && (
        <div className="mt-8">
          <MakeOneBackCta
            experienceType="desire-matcher"
            fromToken={shareToken}
            tone="on-dark"
          />
        </div>
      )}
    </motion.div>
  );
}

function Section({
  title,
  caption,
  items,
  highlight,
}: {
  title: string;
  caption: string;
  items: Reveal["matches"];
  highlight?: boolean;
}) {
  return (
    <section className="mb-5">
      <div className="mb-2 flex items-baseline justify-between">
        <h3 className="flex items-center gap-1.5 text-sm font-semibold tracking-wide text-white uppercase">
          {highlight && <Sparkles className="size-3.5 text-[#ff8fae]" />}
          {title}
        </h3>
        <span className="text-[0.65rem] tracking-wide text-white/40 uppercase">
          {caption}
        </span>
      </div>
      <ul className="space-y-2">
        {items.map((item, i) => (
          <motion.li
            key={item.id}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.05 * i, duration: 0.3 }}
            className={[
              "flex items-center gap-3 rounded-xl border px-4 py-3",
              highlight
                ? "border-[#ff4d6d]/40 bg-[#ff4d6d]/10"
                : "border-white/10 bg-white/[0.03]",
            ].join(" ")}
          >
            <span
              className="size-2.5 shrink-0 rounded-full"
              style={{ background: HEAT_META[item.heat].accent }}
              aria-hidden
            />
            <span className="flex-1 text-sm text-white/90">{item.label}</span>
            <Flames heat={item.heat} />
          </motion.li>
        ))}
      </ul>
    </section>
  );
}
