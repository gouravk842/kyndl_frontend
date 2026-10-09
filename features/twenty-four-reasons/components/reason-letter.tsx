"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

import type { Reason } from "../config";
import { OpeningHand, type OpeningPhase } from "./opening-hand";

/**
 * Realistic letter ceremony: a hand enters, lifts the wax seal, opens the flap,
 * draws the letter out, then steps aside so you can read.
 */
export function ReasonLetter({
  reason,
  assets = {},
  onClose,
}: {
  reason: Reason | null;
  assets?: Record<string, string>;
  onClose: () => void;
}) {
  const reduce = useReducedMotion();
  const [phase, setPhase] = useState<OpeningPhase>("idle");

  useEffect(() => {
    if (!reason) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- reset the letter ceremony when it closes
      setPhase("idle");
      return;
    }

    if (reduce) {
      setPhase("read");
      return;
    }

    setPhase("approach");
    const timers = [
      window.setTimeout(() => setPhase("lift"), 700),
      window.setTimeout(() => setPhase("flap"), 1400),
      window.setTimeout(() => setPhase("draw"), 2200),
      window.setTimeout(() => setPhase("read"), 3200),
    ];
    return () => timers.forEach((t) => window.clearTimeout(t));
  }, [reason, reduce]);

  useEffect(() => {
    if (!reason) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [reason, onClose]);

  if (typeof document === "undefined") return null;

  const imageUrl = reason?.image?.fileId
    ? assets[reason.image.fileId]
    : undefined;
  const audioUrl = reason?.audio?.fileId
    ? assets[reason.audio.fileId]
    : undefined;
  const n = reason ? String(reason.n).padStart(2, "0") : "";

  const showCeremony = phase !== "idle" && phase !== "read";
  const flapOpen = phase === "flap" || phase === "draw" || phase === "read";
  const sealBroken = phase === "lift" || flapOpen;
  const letterDrawn = phase === "draw" || phase === "read";
  const handGone = phase === "read";

  return createPortal(
    <AnimatePresence>
      {reason ? (
        <motion.div
          key={reason.id}
          className="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <button
            type="button"
            aria-label="Close letter"
            className="absolute inset-0 bg-[#1a100c]/55 backdrop-blur-[4px]"
            onClick={onClose}
            disabled={showCeremony}
          />

          {/* Soft desk spotlight */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-[18%] mx-auto h-[28rem] w-[28rem] rounded-full opacity-50 blur-3xl"
            style={{
              background:
                "radial-gradient(circle, rgba(255,236,210,0.55) 0%, transparent 70%)",
            }}
          />

          <div
            className="relative z-10 mx-3 mb-6 w-full max-w-md sm:mb-0"
            style={{ perspective: 1200 }}
          >
            <AnimatePresence mode="wait">
              {phase !== "read" ? (
                <motion.div
                  key="ceremony"
                  className="relative mx-auto flex min-h-[22rem] w-full items-center justify-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.35 }}
                >
                  {/* Envelope body */}
                  <div
                    className="relative w-[88%] overflow-visible rounded-md shadow-[0_30px_60px_rgba(42,26,20,0.4)]"
                    style={{
                      aspectRatio: "4 / 3",
                      background:
                        "linear-gradient(145deg, #f3e0cc 0%, #e4c7a8 48%, #d4a373 100%)",
                      transformStyle: "preserve-3d",
                    }}
                  >
                    {/* Paper grain */}
                    <div
                      aria-hidden
                      className="pointer-events-none absolute inset-0 opacity-[0.12] mix-blend-multiply"
                      style={{
                        backgroundImage:
                          "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
                      }}
                    />

                    {/* Letter sliding out from inside */}
                    <motion.div
                      aria-hidden={!letterDrawn}
                      className="absolute inset-x-[10%] top-[18%] z-[1] overflow-hidden rounded-sm border border-[#e8d5c4]/80 bg-[#fffdf8] shadow-md"
                      style={{ height: "58%" }}
                      initial={false}
                      animate={{
                        y: letterDrawn ? "-42%" : "18%",
                        opacity: phase === "approach" ? 0 : 1,
                      }}
                      transition={{
                        duration: 0.85,
                        ease: [0.22, 1, 0.36, 1],
                      }}
                    >
                      <div className="px-4 pt-3">
                        <p className="font-hand text-xs text-[#c75b39]">
                          Reason {n}
                        </p>
                        <p className="mt-2 line-clamp-4 font-hand text-sm leading-relaxed text-[#3a2a25]/80">
                          {reason.message.trim() || "···"}
                        </p>
                      </div>
                    </motion.div>

                    {/* Back flap pocket shadow */}
                    <div
                      aria-hidden
                      className="absolute inset-x-0 bottom-0 z-[2] h-[55%]"
                      style={{
                        background:
                          "linear-gradient(180deg, transparent 0%, rgba(90,50,35,0.12) 40%, rgba(90,50,35,0.2) 100%)",
                      }}
                    />

                    {/* Opening flap (hinged at top) */}
                    <motion.div
                      aria-hidden
                      className="absolute inset-x-0 top-0 z-[3] origin-top"
                      style={{
                        height: "52%",
                        transformStyle: "preserve-3d",
                        background:
                          "linear-gradient(180deg, #c9a06a 0%, #b8894f 55%, #a67c42 100%)",
                        clipPath: "polygon(0 0, 50% 100%, 100% 0)",
                        boxShadow: flapOpen
                          ? "0 -8px 20px rgba(42,26,20,0.2)"
                          : "none",
                      }}
                      initial={false}
                      animate={{
                        rotateX: flapOpen ? -168 : 0,
                      }}
                      transition={{
                        duration: 0.9,
                        ease: [0.33, 1, 0.32, 1],
                      }}
                    />

                    {/* Wax seal */}
                    <motion.div
                      aria-hidden
                      className="absolute top-[40%] left-1/2 z-[4] size-14 -translate-x-1/2 -translate-y-1/2 rounded-full"
                      style={{
                        background:
                          "radial-gradient(circle at 35% 28%, #d44a5c, #8E1020 70%)",
                        boxShadow: "0 8px 18px rgba(142,16,32,0.45)",
                      }}
                      initial={false}
                      animate={
                        sealBroken
                          ? {
                              y: 90,
                              x: 48,
                              rotate: 48,
                              opacity: 0,
                              scale: 0.85,
                            }
                          : { y: 0, x: 0, rotate: 0, opacity: 1, scale: 1 }
                      }
                      transition={{
                        duration: 0.7,
                        ease: [0.34, 1.2, 0.64, 1],
                      }}
                    >
                      <span className="absolute inset-[5px] rounded-full border border-[#D4A373]/65" />
                      <span className="absolute inset-0 grid place-items-center font-cursive text-lg text-[#f5e6d6]/85">
                        ♡
                      </span>
                    </motion.div>

                    <p className="absolute inset-x-0 bottom-4 z-[5] text-center font-hand text-sm tracking-wide text-[#5a3223]/65">
                      Reason {n}
                    </p>
                  </div>

                  {/* Photoreal hand — tips aimed at the wax seal */}
                  <motion.div
                    className="pointer-events-none absolute -right-8 top-[-12%] z-20 w-[78%] max-w-[19rem] sm:-right-12 sm:w-[82%]"
                    style={{ transformOrigin: "30% 78%" }}
                    initial={false}
                    animate={handPose(phase, handGone)}
                    transition={{
                      duration: phase === "approach" ? 0.85 : 0.6,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                  >
                    <OpeningHand className="h-auto w-full" />
                  </motion.div>

                  <p className="absolute -bottom-8 left-0 right-0 text-center font-hand text-sm text-[#f5e6d6]/75">
                    {phaseCaption(phase)}
                  </p>
                </motion.div>
              ) : (
                <motion.article
                  key="letter"
                  role="dialog"
                  aria-modal="true"
                  aria-labelledby={`reason-letter-${reason.id}`}
                  className="relative flex max-h-[min(88dvh,42rem)] flex-col overflow-hidden rounded-2xl border border-[#e8d5c4] shadow-2xl"
                  style={{
                    background:
                      "linear-gradient(165deg, #fffdf8 0%, #fdf6ee 50%, #f3e4d4 100%)",
                  }}
                  initial={{
                    y: 60,
                    opacity: 0,
                    rotateX: -18,
                    scale: 0.92,
                  }}
                  animate={{ y: 0, opacity: 1, rotateX: 0, scale: 1 }}
                  exit={{ y: 24, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 260, damping: 26 }}
                >
                  <div
                    aria-hidden
                    className="h-2.5 w-full opacity-40"
                    style={{
                      background:
                        "repeating-linear-gradient(90deg, transparent, transparent 8px, #c9a06a 8px, #c9a06a 10px)",
                    }}
                  />

                  <header className="flex items-start justify-between gap-3 px-6 pt-4 pb-2">
                    <div>
                      <p className="font-hand text-sm tracking-wide text-[#c75b39]">
                        Reason {n}
                      </p>
                      {reason.label.trim() ? (
                        <p
                          id={`reason-letter-${reason.id}`}
                          className="font-display mt-0.5 text-xl text-[#3a2a25]"
                        >
                          {reason.label}
                        </p>
                      ) : (
                        <p
                          id={`reason-letter-${reason.id}`}
                          className="font-cursive mt-1 text-2xl text-[#8E1020]"
                        >
                          for you
                        </p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={onClose}
                      className="rounded-full p-1.5 text-[#92786c] transition-colors hover:bg-[#e8d5c4]/50 hover:text-[#3a2a25]"
                      aria-label="Close"
                    >
                      <X className="size-5" />
                    </button>
                  </header>

                  <div className="min-h-0 flex-1 overflow-y-auto px-6 py-3">
                    {reason.message.trim() ? (
                      <motion.p
                        className="font-hand text-[1.15rem] leading-relaxed whitespace-pre-wrap text-[#3a2a25]"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15, duration: 0.45 }}
                      >
                        {reason.message}
                      </motion.p>
                    ) : null}

                    {imageUrl ? (
                      <motion.img
                        src={imageUrl}
                        alt=""
                        className="mt-5 max-h-64 w-full rounded-xl object-cover shadow-[0_12px_30px_rgba(90,50,35,0.15)]"
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.25 }}
                      />
                    ) : null}

                    {audioUrl ? (
                      <motion.div
                        className="mt-5 rounded-xl border border-[#e8d5c4] bg-white/70 px-3 py-3"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                      >
                        <p className="mb-1.5 font-hand text-sm text-[#c75b39]">
                          A voice for you
                        </p>
                        <audio src={audioUrl} controls className="w-full" />
                      </motion.div>
                    ) : null}
                  </div>

                  <footer className="px-6 pt-1 pb-5 text-center">
                    <p className="font-cursive text-lg text-[#8E1020]/70">
                      with love
                    </p>
                  </footer>
                </motion.article>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}

function handPose(phase: OpeningPhase, gone: boolean) {
  if (gone) {
    return { x: 140, y: -40, rotate: 12, opacity: 0, scale: 0.96 };
  }
  switch (phase) {
    case "approach":
      // Enter from upper-right, fingers still short of the seal
      return { x: 72, y: -48, rotate: 14, opacity: 1, scale: 1 };
    case "lift":
      // Fingertips settle on the wax seal
      return { x: 8, y: 6, rotate: 4, opacity: 1, scale: 1.04 };
    case "flap":
      // Lift + pull the flap open
      return { x: -6, y: -28, rotate: -8, opacity: 1, scale: 1.02 };
    case "draw":
      // Draw the letter upward with the hand
      return { x: 10, y: -56, rotate: -4, opacity: 1, scale: 0.98 };
    default:
      return { x: 72, y: -48, rotate: 14, opacity: 0, scale: 1 };
  }
}

function phaseCaption(phase: OpeningPhase): string {
  switch (phase) {
    case "approach":
      return "a hand reaches for the letter…";
    case "lift":
      return "breaking the seal…";
    case "flap":
      return "opening the envelope…";
    case "draw":
      return "drawing the letter out…";
    default:
      return "";
  }
}
