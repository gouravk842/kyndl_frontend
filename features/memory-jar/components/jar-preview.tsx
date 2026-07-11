"use client";

import {
  AnimatePresence,
  motion,
  useAnimationControls,
  useReducedMotion,
} from "framer-motion";
import { useEffect, useState } from "react";

import { JAR_CONFIG, type JarConfig } from "@/features/memory-jar/config";

import { GlassJar } from "./glass-jar";

/**
 * A self-playing, non-interactive preview of the Memory Jar.
 *
 * Sits inside the product page's hero preview card in place of the static
 * icon + tagline placeholder, so a visitor sees what the experience *is* —
 * the jar unsealing and a note unfolding to read — without having to launch
 * the full experience first.
 *
 * On a loop: the lid pulses open, a folded slip rises out of the mouth, and
 * the open note beside the jar cross-fades to the next message. Honours
 * `prefers-reduced-motion` by cross-fading the messages with no movement.
 */
type JarPreviewProps = {
  config?: JarConfig;
};

// Rolled-up love notes packing the jar — purely visual, so the jar always
// reads full (like a hand-filled keepsake jar) even while a note is "out".
// Blush / rose / cream tones, hand-placed and overlapping.
const CURLS = [
  { left: "20%", top: "50%", rotate: -18, tone: "#ecc9cd" },
  { left: "42%", top: "48%", rotate: 12, tone: "#f0e2d0" },
  { left: "60%", top: "52%", rotate: -8, tone: "#e3b7bd" },
  { left: "26%", top: "60%", rotate: 20, tone: "#f2e6d6" },
  { left: "48%", top: "58%", rotate: -14, tone: "#e8c3c8" },
  { left: "64%", top: "62%", rotate: 8, tone: "#eddccb" },
  { left: "18%", top: "68%", rotate: -6, tone: "#e0b3ba" },
  { left: "38%", top: "70%", rotate: 16, tone: "#f1e4d3" },
  { left: "56%", top: "70%", rotate: -20, tone: "#eac6cb" },
  { left: "28%", top: "78%", rotate: 10, tone: "#f0e0cf" },
  { left: "48%", top: "80%", rotate: -12, tone: "#e5bcc2" },
  { left: "62%", top: "78%", rotate: 18, tone: "#efe1d0" },
  { left: "34%", top: "86%", rotate: -16, tone: "#e9c8cd" },
  { left: "52%", top: "87%", rotate: 6, tone: "#f2e5d5" },
];

export function JarPreview({ config = JAR_CONFIG }: JarPreviewProps) {
  const reduceMotion = useReducedMotion();
  const notes = config.notes;
  const [index, setIndex] = useState(0);
  const lidControls = useAnimationControls();

  // Advance to the next note on a gentle loop.
  useEffect(() => {
    if (notes.length < 2) return;
    const id = setInterval(
      () => setIndex((i) => (i + 1) % notes.length),
      reduceMotion ? 4200 : 3600,
    );
    return () => clearInterval(id);
  }, [notes.length, reduceMotion]);

  // Pulse the lid each time a fresh note comes out — lift off the rim, settle.
  useEffect(() => {
    if (reduceMotion) return;
    let cancelled = false;
    void (async () => {
      await lidControls.start({
        y: "-72%",
        rotate: -11,
        transition: { duration: 0.32, ease: "easeOut" },
      });
      if (cancelled) return;
      await lidControls.start({
        y: "0%",
        rotate: 0,
        transition: { delay: 0.12, duration: 0.34, ease: "easeIn" },
      });
    })();
    return () => {
      cancelled = true;
    };
  }, [index, reduceMotion, lidControls]);

  const note = notes[index];
  if (!note) return null;

  return (
    <div className="absolute inset-0 flex items-center justify-center gap-4 px-6 py-7 sm:gap-6 sm:px-8">
      {/* warm candle glow behind the scene */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 60% 55% at 30% 60%, rgba(255,196,140,0.45) 0%, transparent 70%)",
        }}
      />

      {/* THE JAR — portrait, height-bounded by the card */}
      <div className="relative w-[34%] max-w-[150px] shrink-0">
        <GlassJar
          lidControls={lidControls}
          notesSlot={
            <>
              {CURLS.map((curl, i) => (
                <span
                  key={i}
                  aria-hidden
                  className="absolute block h-[6%] w-[24%]"
                  style={{
                    left: curl.left,
                    top: curl.top,
                    transform: `rotate(${curl.rotate}deg)`,
                    zIndex: i,
                  }}
                >
                  {/* the rolled paper body */}
                  <span
                    className="block h-full w-full rounded-full"
                    style={{
                      background: `linear-gradient(180deg, #fff8f0 0%, ${curl.tone} 100%)`,
                      boxShadow:
                        "0 1px 2px rgba(80,50,45,0.25), inset 0 1px 0 rgba(255,255,255,0.6)",
                    }}
                  />
                  {/* the spiral end of the roll */}
                  <span
                    className="absolute top-1/2 right-0 aspect-square h-full -translate-y-1/2 rounded-full"
                    style={{
                      background: `radial-gradient(circle at 50% 50%, ${curl.tone} 22%, #fff8f0 26%, ${curl.tone} 46%, #fbeee2 52%, ${curl.tone} 72%)`,
                      boxShadow: "inset 0 0 0 1px rgba(120,80,70,0.15)",
                    }}
                  />
                </span>
              ))}

              {/* a slip rising out of the mouth as each note is taken */}
              {!reduceMotion ? (
                <AnimatePresence>
                  <motion.span
                    key={index}
                    aria-hidden
                    className="absolute left-[36%] top-[16%] block h-[14%] w-[28%] rounded-[3px]"
                    style={{
                      background:
                        "linear-gradient(160deg, #fefaf4 0%, #f2e7d4 100%)",
                      boxShadow: "1px 2px 6px rgba(60,40,25,0.22)",
                    }}
                    initial={{ opacity: 0, y: "30%", scale: 0.9 }}
                    animate={{ opacity: [0, 1, 0], y: "-90%", scale: 1 }}
                    transition={{ duration: 0.9, ease: "easeOut" }}
                  />
                </AnimatePresence>
              ) : null}
            </>
          }
        />
      </div>

      {/* THE OPEN NOTE — the message, unfolding beside the jar */}
      <div className="relative flex max-w-[260px] flex-1 items-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={note.id}
            className="relative w-full px-5 pt-6 pb-5"
            style={{
              background: "#fefaf4",
              clipPath:
                "polygon(0% 4%, 9% 1%, 19% 5%, 31% 1%, 43% 4%, 56% 0%, 69% 4%, 82% 1%, 92% 5%, 100% 1%, 100% 100%, 0% 100%)",
              backgroundImage:
                "repeating-linear-gradient(transparent, transparent 21px, rgba(100,120,160,0.08) 22px)",
              boxShadow:
                "0 18px 44px rgba(40,25,15,0.28), inset 0 0 0 1px rgba(120,90,60,0.06)",
              borderRadius: "4px",
            }}
            initial={
              reduceMotion
                ? { opacity: 0 }
                : { opacity: 0, scaleX: 0.5, scaleY: 0.18, y: 16 }
            }
            animate={
              reduceMotion
                ? { opacity: 1 }
                : {
                    opacity: 1,
                    scaleX: 1,
                    scaleY: 1,
                    y: 0,
                    transition: {
                      opacity: { duration: 0.2 },
                      scaleX: { duration: 0.26, ease: "easeOut" },
                      scaleY: { delay: 0.18, duration: 0.36, ease: "easeOut" },
                      y: { duration: 0.4, ease: "easeOut" },
                    },
                  }
            }
            exit={
              reduceMotion
                ? { opacity: 0 }
                : {
                    opacity: 0,
                    scaleX: 0.5,
                    scaleY: 0.18,
                    y: 14,
                    transition: { duration: 0.26, ease: "easeIn" },
                  }
            }
          >
            {/* red notebook margin */}
            <div
              aria-hidden
              className="absolute inset-y-0 left-3"
              style={{ borderLeft: "2px solid rgba(220,80,80,0.3)" }}
            />
            <div className="pl-4">
              <p className="font-hand mb-1.5 text-sm lowercase tracking-wide text-[#c1502f]">
                {note.title}
              </p>
              <p
                className="font-hand line-clamp-4 text-base leading-relaxed sm:text-lg"
                style={{ color: "#3a2e1e" }}
              >
                {note.message}
              </p>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
