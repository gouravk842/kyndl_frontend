"use client";

import { motion } from "framer-motion";
import { Heart } from "lucide-react";

import { cn } from "@/lib/utils";

import { themeTokens } from "../lib/themes";
import type { MomentTheme } from "../types";

/**
 * The threshold. A sealed envelope the recipient must deliberately break to
 * begin — no content leaks until they choose to step in. One tap → the approach.
 */
export function SealPhase({
  theme,
  label,
  onOpen,
}: {
  theme: MomentTheme;
  label: string;
  onOpen: () => void;
}) {
  const t = themeTokens(theme);

  return (
    <motion.button
      type="button"
      onClick={onOpen}
      className="group relative flex flex-col items-center gap-8 outline-none"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      <motion.div
        className={cn(
          "relative flex size-32 items-center justify-center rounded-2xl border backdrop-blur-sm",
          t.accentBorder,
        )}
        style={{ background: `rgb(${t.particle} / 0.08)` }}
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.96 }}
      >
        <div
          className={cn(
            "absolute inset-0 rounded-2xl blur-xl transition-opacity group-hover:opacity-100 opacity-60",
          )}
          style={{ background: `rgb(${t.particle} / 0.25)` }}
        />
        <Heart
          className={cn("relative size-12", t.text)}
          style={{ fill: `rgb(${t.particle})` }}
        />
      </motion.div>

      <div className="flex flex-col items-center gap-2">
        <p className={cn("text-2xl", t.headlineFont, t.text)}>{label}</p>
        <p className={cn("text-sm uppercase tracking-[0.3em]", t.muted)}>
          tap to open
        </p>
      </div>
    </motion.button>
  );
}
