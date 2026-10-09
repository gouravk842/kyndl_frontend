"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";

import {
  FOLDED_NOTE_CONFIG,
  type FoldedNoteConfig,
  type NoteChoice,
} from "@/features/folded-note/config";
import { cn } from "@/lib/utils";

type Props = {
  config?: FoldedNoteConfig;
  className?: string;
};

const CHOICES: { key: NoteChoice; label: string }[] = [
  { key: "yes", label: "Yes" },
  { key: "no", label: "No" },
  { key: "maybe", label: "Maybe" },
];

export function FoldedNoteExperience({
  config = FOLDED_NOTE_CONFIG,
  className,
}: Props) {
  const [phase, setPhase] = useState<"sealed" | "open" | "reacted">("sealed");
  const [choice, setChoice] = useState<NoteChoice | null>(null);

  return (
    <div
      className={cn(
        "relative flex min-h-dvh flex-col items-center justify-center overflow-hidden bg-[#f7efe4] px-5 py-12",
        className,
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          backgroundImage: "radial-gradient(#e8d5c4 1px, transparent 1px)",
          backgroundSize: "18px 18px",
        }}
      />

      <div className="relative z-10 w-full max-w-sm">
        <p className="text-center text-xs font-semibold tracking-[0.2em] text-[#92786c] uppercase">
          Pass quietly
        </p>
        <h1 className="mt-2 text-center font-display text-3xl text-[#3a2a25]">
          {config.title.trim() || "Folded Note"}
        </h1>
        <p className="mt-2 text-center text-sm text-[#7a6258]">
          From {config.fromName || "Me"} → {config.toName || "You"}
        </p>

        <AnimatePresence mode="wait">
          {phase === "sealed" && (
            <motion.button
              key="sealed"
              type="button"
              initial={{ opacity: 0, rotate: -4 }}
              animate={{ opacity: 1, rotate: -2 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={() => setPhase("open")}
              className="mx-auto mt-10 flex h-48 w-full max-w-xs flex-col items-center justify-center rounded-sm border border-[#e3d2c5] bg-[#fffaf4] shadow-[8px_12px_0_rgba(58,42,37,0.08)] transition-transform hover:-translate-y-1"
            >
              <span className="font-hand text-2xl text-[#c75b39]">
                Unfold me
              </span>
              <span className="mt-2 text-xs text-[#92786c]">tap to open</span>
            </motion.button>
          )}

          {phase === "open" && (
            <motion.div
              key="open"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-8 rounded-sm border border-[#e3d2c5] bg-[#fffaf4] p-6 shadow-[6px_10px_0_rgba(58,42,37,0.06)]"
            >
              {config.body.trim() && (
                <p className="font-hand text-xl leading-relaxed text-[#3a2a25]">
                  {config.body}
                </p>
              )}
              <p className="mt-6 text-sm font-semibold text-[#3a2a25]">
                {config.question || "Do you like me?"}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {CHOICES.map(({ key, label }) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => {
                      setChoice(key);
                      setPhase("reacted");
                    }}
                    className="rounded-full border border-[#e3d2c5] bg-white px-4 py-2 text-sm font-medium text-[#3a2a25] transition-colors hover:border-[#ff7a59] hover:bg-[#fff1e9]"
                  >
                    □ {label}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {phase === "reacted" && choice && (
            <motion.div
              key="react"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-8 rounded-3xl border border-[#f2dace] bg-white p-7 text-center shadow-[0_20px_50px_-24px_rgba(199,91,57,0.4)]"
            >
              <p className="text-xs font-semibold tracking-[0.16em] text-[#92786c] uppercase">
                You checked {choice}
              </p>
              <p className="mt-4 font-hand text-xl leading-relaxed text-[#3a2a25]">
                {config.reactions[choice]}
              </p>
              <button
                type="button"
                onClick={() => {
                  setChoice(null);
                  setPhase("sealed");
                }}
                className="mt-6 text-sm font-medium text-[#c75b39] underline-offset-4 hover:underline"
              >
                Fold again
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
