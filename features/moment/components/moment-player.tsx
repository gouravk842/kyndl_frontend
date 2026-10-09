"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";

import { themeTokens } from "../lib/themes";
import type { MomentAnswer, MomentDoc } from "../types";
import { AmbientBg } from "./ambient-bg";
import { ApproachPhase } from "./approach-phase";
import { CelebrationPhase, type SubmitState } from "./celebration-phase";
import { QuestionPhase } from "./question-phase";
import { SealPhase } from "./seal-phase";

type Phase = "seal" | "approach" | "question" | "celebration";

/**
 * The Moment Engine. Drives the five-beat arc — seal → approach → question →
 * bloom → answer-sent — over a single immersive, chrome-free surface. Pure given
 * its document and a `submit` function: the public viewer wires `submit` to the
 * respond API; the builder preview passes a stub. The recipient can never go
 * backwards — a Moment is lived forwards, once.
 */
export function MomentPlayer({
  doc,
  assets = {},
  submit,
  className = "h-dvh",
  experienceType,
  shareToken,
}: {
  doc: MomentDoc;
  assets?: Record<string, string>;
  submit?: (payload: {
    answer: MomentAnswer;
    note: string;
    responderName: string;
  }) => Promise<void>;
  /** Root height utility — overridden for inline product-page embeds. */
  className?: string;
  experienceType?: string;
  shareToken?: string;
}) {
  const t = themeTokens(doc.theme);
  const [phase, setPhase] = useState<Phase>("seal");
  const [answer, setAnswer] = useState<MomentAnswer>("yes");
  const [submitState, setSubmitState] = useState<SubmitState>("idle");

  function onAnswer(a: MomentAnswer) {
    setAnswer(a);
    setPhase("celebration");
  }

  async function onSeal(payload: { note: string; responderName: string }) {
    setSubmitState("sending");
    try {
      await submit?.({ answer, ...payload });
      setSubmitState("sent");
    } catch {
      setSubmitState("error");
    }
  }

  return (
    <div
      className={`relative flex w-full items-center justify-center overflow-hidden select-none ${className}`}
    >
      <AmbientBg theme={doc.theme} />

      <AnimatePresence mode="wait">
        <motion.div
          key={phase}
          className="relative z-10 flex w-full items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          {phase === "seal" && (
            <SealPhase
              theme={doc.theme}
              label={doc.sealLabel}
              onOpen={() =>
                setPhase(doc.approach.length ? "approach" : "question")
              }
            />
          )}

          {phase === "approach" && (
            <ApproachPhase
              theme={doc.theme}
              beats={doc.approach}
              assets={assets}
              onArrive={() => setPhase("question")}
            />
          )}

          {phase === "question" && (
            <QuestionPhase
              theme={doc.theme}
              question={doc.question}
              onAnswer={onAnswer}
            />
          )}

          {phase === "celebration" && (
            <CelebrationPhase
              theme={doc.theme}
              answer={answer}
              celebration={doc.celebration}
              plan={doc.plan}
              submitState={submitState}
              onSeal={onSeal}
              experienceType={experienceType}
              shareToken={shareToken}
            />
          )}
        </motion.div>
      </AnimatePresence>

      {/* A faint vignette to keep focus centred. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          boxShadow: `inset 0 0 200px 60px rgb(${t.particle} / 0.04)`,
        }}
      />
    </div>
  );
}
