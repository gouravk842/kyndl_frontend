"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";

import { MakeOneBackCta } from "@/features/recipient-aftermath/components/make-one-back-cta";

import { MOOD_META, type Occasion, type Reveal } from "../config";
import { LookingGlass } from "./atmosphere";

/**
 * Ceremony reveal: fogged glass clears → gilt panels part → reflections rise.
 * Soft "make one back" sits under the reflections when opened from a share link.
 */
export function RevealView({
  reveal,
  intro,
  occasion,
  ownerName,
  recipientName,
  shareToken,
}: {
  reveal: Reveal;
  intro?: string;
  occasion?: Occasion;
  ownerName?: string;
  recipientName?: string;
  shareToken?: string;
}) {
  const reduce = useReducedMotion();
  const [step, setStep] = useState<"fog" | "open" | "list">(
    reduce ? "list" : "fog",
  );

  useEffect(() => {
    if (reduce) return;
    const t1 = window.setTimeout(() => setStep("open"), 900);
    const t2 = window.setTimeout(() => setStep("list"), 1750);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, [reduce]);

  const nothing =
    reveal.matches.length === 0 && reveal.softMatches.length === 0;
  const pair =
    ownerName && recipientName
      ? `${ownerName} & ${recipientName}`
      : ownerName || recipientName || null;

  return (
    <div className="relative w-full max-w-md">
      <AnimatePresence mode="wait">
        {step !== "list" && (
          <motion.div
            key="ceremony"
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col items-center"
          >
            <div className="relative">
              <LookingGlass size="lg">
                {step === "fog" ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-3"
                  >
                    <p className="font-cursive text-3xl text-[#8E1020]">
                      breathe on the glass
                    </p>
                    <p className="text-xs tracking-[0.2em] text-[#5a3223]/45 uppercase">
                      Opening your mirror
                    </p>
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="space-y-2"
                  >
                    <p className="font-display text-2xl text-[#2a1a14]">
                      {nothing ? "Still foggy" : "There you are"}
                    </p>
                    <p className="font-hand text-base text-[#5a3223]/60">
                      {nothing
                        ? "More to discover together"
                        : "Your reflections, together"}
                    </p>
                  </motion.div>
                )}
              </LookingGlass>

              {/* Parting gilt panels */}
              {step === "open" && !reduce && (
                <>
                  <motion.div
                    aria-hidden
                    className="absolute inset-y-0 left-0 w-1/2 overflow-hidden"
                    initial={{ x: 0 }}
                    animate={{ x: "-105%" }}
                    transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <div
                      className="h-full w-[200%] rounded-l-[50%]"
                      style={{
                        background:
                          "linear-gradient(90deg, rgba(201,160,106,0.92), rgba(240,217,176,0.75))",
                      }}
                    />
                  </motion.div>
                  <motion.div
                    aria-hidden
                    className="absolute inset-y-0 right-0 w-1/2 overflow-hidden"
                    initial={{ x: 0 }}
                    animate={{ x: "105%" }}
                    transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <div
                      className="ml-[-100%] h-full w-[200%] rounded-r-[50%]"
                      style={{
                        background:
                          "linear-gradient(270deg, rgba(201,160,106,0.92), rgba(240,217,176,0.75))",
                      }}
                    />
                  </motion.div>
                </>
              )}
            </div>
          </motion.div>
        )}

        {step === "list" && (
          <motion.div
            key="list"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
            className="w-full"
          >
            <header className="mb-7 text-center">
              {occasion === "girlfriend-day" && (
                <motion.div
                  initial={{ scale: 0.7, opacity: 0, rotate: -8 }}
                  animate={{ scale: 1, opacity: 1, rotate: -3 }}
                  transition={{ type: "spring", stiffness: 260, damping: 16 }}
                  className="mx-auto mb-4 flex size-[4.5rem] flex-col items-center justify-center rounded-full border-2 border-[#B11226]/35 bg-[#fff6f0] shadow-[0_8px_28px_rgba(177,18,38,0.15)]"
                  style={{
                    backgroundImage:
                      "radial-gradient(circle at 30% 25%, #fff, #f5e9e2 70%)",
                  }}
                >
                  <span className="font-cursive text-lg leading-none text-[#B11226]">
                    GF
                  </span>
                  <span className="mt-0.5 text-[0.55rem] font-semibold tracking-wider text-[#8E1020]/70 uppercase">
                    Aug 1
                  </span>
                </motion.div>
              )}

              <p className="text-[0.65rem] font-semibold tracking-[0.28em] text-[#B11226]/75 uppercase">
                {pair ?? "Your mirror"}
              </p>
              <h2 className="mt-2 font-display text-3xl text-[#2a1a14]">
                {nothing ? "More to discover" : "Your mirror"}
              </h2>
              <p className="mt-1 font-cursive text-2xl text-[#8E1020]/80">
                {nothing
                  ? "the glass is still warming"
                  : "reflections that match"}
              </p>
              {intro && (
                <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-[#5a3223]/60">
                  {intro}
                </p>
              )}
              {nothing && (
                <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-[#5a3223]/60">
                  No perfect overlaps yet — that&apos;s okay. You&apos;ve got
                  more to find in each other.
                </p>
              )}
            </header>

            {reveal.matches.length > 0 && (
              <ReflectionSection
                title="Perfect mirrors"
                caption="you both said that’s us"
                items={reveal.matches}
                highlight
              />
            )}
            {reveal.softMatches.length > 0 && (
              <ReflectionSection
                title="Soft echoes"
                caption="almost — worth talking about"
                items={reveal.softMatches}
              />
            )}

            <p className="mt-8 text-center font-hand text-sm text-[#5a3223]/40">
              {reveal.matches.length + reveal.softMatches.length} of{" "}
              {reveal.total} reflected
            </p>

            {shareToken && (
              <div className="mt-8">
                <MakeOneBackCta
                  experienceType="mirror-match"
                  fromToken={shareToken}
                  tone="on-warm"
                />
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ReflectionSection({
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
    <section className="mb-6">
      <div className="mb-3 flex items-end justify-between gap-3 border-b border-[#5a3223]/12 pb-2">
        <h3 className="font-display text-lg text-[#2a1a14]">{title}</h3>
        <span className="pb-0.5 text-[0.65rem] tracking-[0.12em] text-[#5a3223]/40 uppercase">
          {caption}
        </span>
      </div>
      <ul className="space-y-3">
        {items.map((item, i) => (
          <motion.li
            key={item.id}
            initial={{ opacity: 0, y: 14, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ delay: 0.08 * i, duration: 0.45 }}
            className="relative overflow-hidden rounded-2xl px-4 py-3.5"
            style={
              highlight
                ? {
                    background:
                      "linear-gradient(135deg, rgba(212,163,115,0.22), rgba(255,250,246,0.9))",
                    boxShadow:
                      "inset 0 0 0 1px rgba(212,163,115,0.45), 0 10px 28px rgba(90,50,35,0.08)",
                  }
                : {
                    background: "rgba(255,250,246,0.65)",
                    boxShadow: "inset 0 0 0 1px rgba(90,50,35,0.1)",
                  }
            }
          >
            {/* Tiny reflection under the row */}
            {highlight && (
              <span
                aria-hidden
                className="pointer-events-none absolute inset-x-6 bottom-0 h-px bg-gradient-to-r from-transparent via-[#D4A373]/70 to-transparent"
              />
            )}
            <div className="flex items-start gap-3">
              <span
                className="mt-1.5 size-2.5 shrink-0 rounded-full"
                style={{
                  background: MOOD_META[item.mood].color,
                  boxShadow: highlight
                    ? `0 0 14px ${MOOD_META[item.mood].color}`
                    : undefined,
                }}
                aria-hidden
              />
              <div className="min-w-0 flex-1">
                <p
                  className={[
                    "leading-snug text-[#2a1a14]",
                    highlight ? "font-display text-base" : "text-sm",
                  ].join(" ")}
                >
                  {item.label}
                </p>
                {/* Mirrored echo line */}
                <p
                  aria-hidden
                  className="mt-0.5 select-none truncate text-[0.7rem] text-[#5a3223]/25"
                  style={{
                    transform: "scaleY(-1)",
                    maskImage:
                      "linear-gradient(to bottom, rgba(0,0,0,0.35), transparent)",
                    WebkitMaskImage:
                      "linear-gradient(to bottom, rgba(0,0,0,0.35), transparent)",
                  }}
                >
                  {item.label}
                </p>
              </div>
              <span
                className="shrink-0 rounded-full px-2 py-0.5 text-[0.6rem] font-semibold tracking-wide uppercase"
                style={{
                  color: MOOD_META[item.mood].color,
                  background: `${MOOD_META[item.mood].color}14`,
                }}
              >
                {MOOD_META[item.mood].label}
              </span>
            </div>
          </motion.li>
        ))}
      </ul>
    </section>
  );
}
