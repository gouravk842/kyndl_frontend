"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Check, Lock, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { hashAnswer } from "../answer-hash";
import type { ModuleInteractionProps } from "../types";
import type { CrosswordConfig, CrosswordEntry } from "./index";

const key = (r: number, c: number) => `${r},${c}`;

/** Cells an entry occupies, in answer order. */
function entryLength(e: CrosswordEntry): number {
  return e.answer?.length ?? e.letters ?? 1;
}

function entryCells(e: CrosswordEntry): { r: number; c: number }[] {
  return Array.from({ length: entryLength(e) }, (_, i) => ({
    r: e.dir === "down" ? e.row + i : e.row,
    c: e.dir === "across" ? e.col + i : e.col,
  }));
}

/**
 * The crossword gate. Fill every entry correctly (case-insensitive) and the
 * grid flips to "Unlocked", calling `onSolve`. (Default export so it can be
 * lazy-loaded.)
 */
export default function CrosswordInteraction({
  config,
  onSolve,
  onClose,
}: ModuleInteractionProps<CrosswordConfig>) {
  const { size, entries } = config;
  const [values, setValues] = useState<Record<string, string>>({});
  const [done, setDone] = useState(false);

  // Active cells + start-cell numbering (reading order), computed once.
  const { active, numbers, numbered } = useMemo(() => {
    const active = new Map<string, true>();
    for (const e of entries)
      for (const { r, c } of entryCells(e)) active.set(key(r, c), true);

    const starts = [...new Set(entries.map((e) => key(e.row, e.col)))].sort(
      (a, b) => {
        const [ar, ac] = a.split(",").map(Number);
        const [br, bc] = b.split(",").map(Number);
        return ar! - br! || ac! - bc!;
      },
    );
    const numbers = new Map(starts.map((k, i) => [k, i + 1]));
    const numbered = entries.map((e) => ({
      e,
      n: numbers.get(key(e.row, e.col))!,
    }));
    return { active, numbers, numbered };
  }, [entries]);

  useEffect(() => {
    const onKey = (ev: KeyboardEvent) => ev.code === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const entryWord = (e: CrosswordEntry, vals: Record<string, string>) =>
    entryCells(e)
      .map(({ r, c }) => vals[key(r, c)] ?? "")
      .join("");

  const allCorrect = async (vals: Record<string, string>) => {
    for (const e of entries) {
      const word = entryWord(e, vals);
      if (e.answer) {
        if (word.toUpperCase() !== e.answer.toUpperCase()) return false;
      } else if (e.answerHash) {
        if ((await hashAnswer(word)) !== e.answerHash) return false;
      } else {
        return false;
      }
    }
    return true;
  };

  const onCell = (k: string, raw: string) => {
    const next = { ...values, [k]: raw.slice(-1).toUpperCase() };
    setValues(next);
    if (done) return;
    void allCorrect(next).then((ok) => {
      if (!ok) return;
      setDone(true);
      window.setTimeout(onSolve, 750);
    });
  };

  const across = numbered.filter((x) => x.e.dir === "across");
  const down = numbered.filter((x) => x.e.dir === "down");

  return (
    <motion.div
      className="pointer-events-auto absolute inset-0 z-20 flex items-center justify-center bg-black/55 px-6 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
      onClick={onClose}
    >
      <motion.div
        className="relative w-full max-w-md rounded-3xl border border-white/10 bg-[#15122a] p-6 text-white shadow-2xl"
        initial={{ scale: 0.92, y: 14 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 24 }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 flex h-9 w-9 items-center justify-center rounded-full bg-black/40 text-white/70 transition-colors hover:bg-black/60 hover:text-white"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="mb-4 flex items-center gap-2 text-xs tracking-[0.2em] text-[#7fd9ff] uppercase">
          <Lock className="h-3.5 w-3.5" />
          Locked memory
        </div>

        <div
          className="mx-auto w-fit"
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${size}, 2.2rem)`,
            gap: 3,
          }}
        >
          {Array.from({ length: size * size }, (_, idx) => {
            const r = Math.floor(idx / size);
            const c = idx % size;
            const k = key(r, c);
            if (!active.has(k))
              return <div key={k} className="h-[2.2rem] w-[2.2rem]" />;
            const num = numbers.get(k);
            return (
              <div key={k} className="relative">
                {num && (
                  <span className="absolute top-0 left-0.5 z-10 text-[9px] text-white/50">
                    {num}
                  </span>
                )}
                <input
                  value={values[k] ?? ""}
                  onChange={(e) => onCell(k, e.target.value)}
                  maxLength={1}
                  disabled={done}
                  className="h-[2.2rem] w-[2.2rem] rounded-sm border border-white/15 bg-black/30 text-center text-sm font-semibold text-white uppercase outline-none focus:border-[#7fd9ff]/70"
                />
              </div>
            );
          })}
        </div>

        <div className="mt-5 grid grid-cols-2 gap-4 text-xs text-white/70">
          <div>
            <p className="mb-1 font-semibold text-white/85">Across</p>
            {across.map(({ e, n }) => (
              <p key={`a${n}`}>
                {n}. {e.clue}
              </p>
            ))}
          </div>
          <div>
            <p className="mb-1 font-semibold text-white/85">Down</p>
            {down.map(({ e, n }) => (
              <p key={`d${n}`}>
                {n}. {e.clue}
              </p>
            ))}
          </div>
        </div>

        <AnimatePresence>
          {done && (
            <motion.div
              key="solved"
              className="mt-4 flex items-center justify-center gap-2 text-[#7fd9ff]"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <Check className="h-5 w-5" />
              <span className="font-semibold">Unlocked</span>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
