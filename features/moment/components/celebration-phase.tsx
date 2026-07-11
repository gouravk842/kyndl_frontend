"use client";

import { motion } from "framer-motion";
import { useState } from "react";

import { cn } from "@/lib/utils";

import { themeTokens } from "../lib/themes";
import type { MomentAnswer, MomentCelebration, MomentPlan, MomentTheme } from "../types";
import { HeartsBurst } from "./hearts-burst";

export type SubmitState = "idle" | "sending" | "sent" | "error";

/**
 * The release. After the question, the screen blooms — names together, hearts
 * up — and the recipient seals their answer back to the creator with an optional
 * note. This is where the emotion travels home. A graceful, hearts-free variant
 * handles an honest "no".
 */
export function CelebrationPhase({
  theme,
  answer,
  celebration,
  plan,
  submitState,
  onSeal,
}: {
  theme: MomentTheme;
  answer: MomentAnswer;
  celebration: MomentCelebration;
  plan?: MomentPlan;
  submitState: SubmitState;
  onSeal: (payload: { note: string; responderName: string }) => void;
}) {
  const t = themeTokens(theme);
  const [note, setNote] = useState("");
  const [name, setName] = useState(celebration.recipientName ?? "");
  const yes = answer === "yes";
  const sealed = submitState === "sent";

  const headline = yes ? celebration.headline : "Thank you for being honest";
  const subtext = yes
    ? celebration.subtext
    : "However you feel, it took courage to open this. That matters.";

  return (
    <div className="relative flex w-full max-w-md flex-col items-center gap-7 px-8 text-center">
      {yes && <HeartsBurst />}

      <motion.div
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="flex flex-col items-center gap-3"
      >
        {yes && celebration.askerName && celebration.recipientName && (
          <p className={cn("text-2xl", t.headlineFont, t.muted)}>
            {celebration.askerName} &amp; {celebration.recipientName}
          </p>
        )}
        <h1 className={cn("text-4xl leading-tight sm:text-5xl", t.headlineFont, t.text)}>
          {headline}
        </h1>
        {subtext && <p className={cn("text-base", t.muted)}>{subtext}</p>}
      </motion.div>

      {yes && plan && (plan.when || plan.where) && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className={cn("rounded-2xl border px-6 py-4", t.accentBorder)}
          style={{ background: `rgb(${t.particle} / 0.08)` }}
        >
          {plan.when && <p className={cn("text-lg font-medium", t.text)}>{plan.when}</p>}
          {plan.where && <p className={cn("text-sm", t.muted)}>{plan.where}</p>}
        </motion.div>
      )}

      {sealed ? (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={cn("text-lg", t.headlineFont, t.text)}
        >
          Your answer is on its way 💌
        </motion.p>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: yes ? 0.8 : 0.3 }}
          className="flex w-full flex-col items-stretch gap-3"
        >
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name (optional)"
            className={cn(
              "rounded-xl border bg-white/10 px-4 py-2.5 text-center outline-none placeholder:opacity-50",
              t.accentBorder,
              t.text,
            )}
          />
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={yes ? "Say something back…" : "Want to leave a word?"}
            rows={2}
            className={cn(
              "resize-none rounded-xl border bg-white/10 px-4 py-2.5 text-center outline-none placeholder:opacity-50",
              t.accentBorder,
              t.text,
            )}
          />
          <button
            type="button"
            disabled={submitState === "sending"}
            onClick={() => onSeal({ note: note.trim(), responderName: name.trim() })}
            className={cn(
              "rounded-full px-8 py-3 text-lg font-semibold shadow-lg disabled:opacity-60",
              t.accentBg,
              t.accentText,
            )}
          >
            {submitState === "sending" ? "Sending…" : "Seal my answer"}
          </button>
          {submitState === "error" && (
            <p className="text-sm text-red-400">
              Couldn&apos;t send — tap to try again.
            </p>
          )}
        </motion.div>
      )}
    </div>
  );
}
