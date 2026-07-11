"use client";

import { motion } from "framer-motion";
import { EyeOff, Image as ImageIcon, Mic, PenLine, Star } from "lucide-react";
import type { ComponentType } from "react";

import type { Chocolate } from "../../config";
import { kindOf } from "../../lib/chocolate-kinds";

const ICONS: Record<string, ComponentType<{ className?: string }>> = {
  Image: ImageIcon,
  PenLine,
  EyeOff,
  Star,
  Mic,
};

/**
 * The memory tucked inside a chocolate — shown once its foil has torn away.
 * The `type` shapes the reveal: a `secret` starts blurred and clears as it
 * opens, a `milestone` gets a little sparkle, a `voice` carries an audio note.
 */
export function RevealCard({
  chocolate,
  opened,
}: {
  chocolate: Chocolate;
  opened: boolean;
}) {
  const kind = kindOf(chocolate.type);
  const Icon = ICONS[kind.icon] ?? ImageIcon;

  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden rounded-[22px] bg-[#fbf3ea] shadow-[0_18px_50px_rgba(0,0,0,0.45)]">
      {/* accent header */}
      <div
        className="flex items-center gap-2 px-4 py-3 text-white"
        style={{ background: kind.accent }}
      >
        <Icon className="size-4 shrink-0" />
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold leading-tight">
            {chocolate.label || "A memory"}
          </p>
          {chocolate.date ? (
            <p className="truncate text-[11px] opacity-85">{chocolate.date}</p>
          ) : null}
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto p-4">
        {chocolate.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={chocolate.imageUrl}
            alt={chocolate.label}
            className="h-40 w-full rounded-xl object-cover transition-[filter] duration-700"
            style={{
              filter: kind.blurUntilOpen && !opened ? "blur(16px)" : "none",
            }}
          />
        ) : null}

        {chocolate.type === "voice" && chocolate.audioUrl ? (
          <audio controls src={chocolate.audioUrl} className="w-full">
            <track kind="captions" />
          </audio>
        ) : null}

        <p className="whitespace-pre-line font-serif text-[15px] leading-relaxed text-[#4a3b33]">
          {chocolate.message}
        </p>
      </div>

      {/* milestone sparkle */}
      {kind.celebrate && opened ? (
        <div aria-hidden className="pointer-events-none absolute inset-0">
          {[
            [12, 18],
            [80, 26],
            [30, 70],
            [68, 82],
            [50, 12],
          ].map(([x, yy], i) => (
            <motion.span
              key={i}
              className="absolute text-lg"
              style={{ left: `${x}%`, top: `${yy}%`, color: kind.accent }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: [0, 1.2, 0.9], opacity: [0, 1, 0.8] }}
              transition={{ delay: 0.2 + i * 0.12, duration: 0.9 }}
            >
              ✦
            </motion.span>
          ))}
        </div>
      ) : null}
    </div>
  );
}
