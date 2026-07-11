"use client";

import { motion, useReducedMotion } from "framer-motion";

import type { HandFont } from "@/features/scrapbook/types";
import { cn } from "@/lib/utils";

type HandwrittenNoteProps = {
  text: string;
  font?: HandFont;
  ink?: string;
  /** Fade/write the words in when the page is viewed. */
  draw?: boolean;
};

/**
 * Handwritten ink note. Cursive or casual hand, with an optional "being
 * written" reveal that respects reduced-motion.
 */
export function HandwrittenNote({
  text,
  font = "hand",
  ink = "#3a2a25",
  draw = false,
}: HandwrittenNoteProps) {
  const reduceMotion = useReducedMotion();
  const animate = draw && !reduceMotion;

  return (
    <p
      className={cn(
        "max-w-[15rem] leading-snug",
        font === "cursive" ? "font-cursive text-2xl" : "font-hand text-xl",
      )}
      style={{
        color: ink,
        textShadow: "0 1px 0 rgba(255,255,255,0.4)",
      }}
    >
      {animate ? (
        <motion.span
          initial={{ opacity: 0, clipPath: "inset(0 100% 0 0)" }}
          whileInView={{ opacity: 1, clipPath: "inset(0 0% 0 0)" }}
          viewport={{ once: true }}
          transition={{ duration: 1.6, ease: "easeInOut" }}
          className="inline-block"
        >
          {text}
        </motion.span>
      ) : (
        text
      )}
    </p>
  );
}
