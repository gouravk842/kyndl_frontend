"use client";

import { motion } from "framer-motion";

/**
 * The note beside the frame: a short parchment on a brass stand. It unrolls
 * from the top rod, and the handwriting rises onto the paper.
 */
export function ScrollNote({
  text,
  reducedMotion,
}: {
  text: string;
  reducedMotion: boolean;
}) {
  return (
    <motion.div
      className="flex w-full max-w-[188px] flex-col items-center"
      initial={reducedMotion ? false : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: reducedMotion ? 0.15 : 0.55,
        ease: [0.16, 1, 0.3, 1],
      }}
    >
      <div
        className="mb-1.5 flex items-center gap-2 text-[#e8c872]/80"
        aria-hidden
      >
        <span className="h-px w-5 bg-current" />
        <span className="size-1 rotate-45 bg-current" />
        <span className="h-px w-5 bg-current" />
      </div>
      <motion.div
        className="w-full origin-top"
        initial={reducedMotion ? false : { scaleY: 0.2 }}
        animate={{ scaleY: 1 }}
        transition={{
          duration: reducedMotion ? 0.15 : 0.7,
          ease: [0.16, 1, 0.3, 1],
        }}
      >
        <Rod />
        <div
          className="relative z-[1] -my-1 max-h-40 overflow-y-auto overscroll-contain px-3 py-3 text-center [scrollbar-width:none]"
          style={{
            backgroundColor: "#f6e7c8",
            backgroundImage:
              "linear-gradient(90deg, rgba(92, 52, 18, 0.16), transparent 12%, transparent 88%, rgba(92, 52, 18, 0.18)), radial-gradient(ellipse at 50% 0%, rgba(255,255,255,0.35), transparent 55%)",
            boxShadow:
              "inset 0 10px 14px rgba(90, 50, 16, 0.08), inset 0 -8px 12px rgba(90, 50, 16, 0.12)",
          }}
        >
          <motion.p
            className="font-hand text-[15px] leading-snug break-words whitespace-pre-wrap text-[#3c2616]"
            initial={reducedMotion ? false : { y: 18, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{
              duration: reducedMotion ? 0.15 : 0.55,
              delay: reducedMotion ? 0 : 0.25,
              ease: [0.16, 1, 0.3, 1],
            }}
          >
            {text}
          </motion.p>
        </div>
        <Rod />
      </motion.div>
      <div className="relative mt-0.5 h-9 w-16" aria-hidden>
        <span className="absolute top-0 left-1/2 h-8 w-px origin-top -translate-x-2 rotate-[16deg] bg-gradient-to-b from-[#e8c872] to-transparent" />
        <span className="absolute top-0 left-1/2 h-8 w-px origin-top translate-x-2 -rotate-[16deg] bg-gradient-to-b from-[#e8c872] to-transparent" />
        <span className="absolute top-0 left-1/2 size-1.5 -translate-x-1/2 rounded-full bg-[#f6e2a8] shadow-[0_0_6px_rgba(232,200,114,0.8)]" />
      </div>
    </motion.div>
  );
}

function Rod() {
  return (
    <div className="relative z-[2] mx-[-8px] h-3 rounded-full" aria-hidden>
      <div
        className="absolute inset-x-3 inset-y-0 rounded-full"
        style={{
          background:
            "linear-gradient(180deg, #fff3cc 0%, #e2bc62 40%, #8d5e1c 100%)",
          boxShadow: "0 2px 4px rgba(0,0,0,0.35)",
        }}
      />
      <Knob side="left" />
      <Knob side="right" />
    </div>
  );
}

function Knob({ side }: { side: "left" | "right" }) {
  return (
    <span
      className={`absolute top-1/2 size-3.5 -translate-y-1/2 rounded-full ${
        side === "left" ? "-left-0.5" : "-right-0.5"
      }`}
      style={{
        background:
          "radial-gradient(circle at 35% 32%, #fff6d4, #d7ae55 42%, #6a4314 80%)",
      }}
    />
  );
}
