"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Check, Lock, X } from "lucide-react";
import { useEffect, useState } from "react";

import type { ModuleInteractionProps } from "../types";
import type { ImagePuzzleConfig } from "./index";

// Second stop of the fallback tile gradient (when no photo is set). A soft
// violet, kept as a literal so this gate stays host-agnostic.
const FALLBACK_GRADIENT_STOP = "#A98BFF";

/** Neighbour positions (up/down/left/right) of a board index, by grid size. */
function neighbours(index: number, size: number): number[] {
  const r = Math.floor(index / size);
  const c = index % size;
  const out: number[] = [];
  if (r > 0) out.push(index - size);
  if (r < size - 1) out.push(index + size);
  if (c > 0) out.push(index - 1);
  if (c < size - 1) out.push(index + 1);
  return out;
}

/** Deterministic pseudo-random in [0,1) — pure (safe to use during render). */
function frand(seed: number) {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

/**
 * Scramble from solved by walking the blank through legal moves. Seeded + pure,
 * so the board can be built in a `useState` initializer (no effect, no
 * `Math.random` in render) and stays solvable by construction.
 */
function scramble(size: number, seed: number): number[] {
  const n = size * size;
  const board = Array.from({ length: n }, (_, i) => i);
  let blank = n - 1;
  for (let i = 0; i < n * n * 12; i++) {
    const opts = neighbours(blank, size);
    const pick = opts[Math.floor(frand(seed + i) * opts.length)]!;
    [board[blank], board[pick]] = [board[pick]!, board[blank]!];
    blank = pick;
  }
  return board;
}

const isSolved = (board: number[]) => board.every((v, i) => v === i);

/**
 * The image-puzzle gate. A sliding-tile board (slices of a photo, or numbered
 * accent tiles) the recipient reassembles; the last move flips to "Unlocked" and
 * calls `onSolve`. (Default export so it can be lazy-loaded.)
 */
export default function ImagePuzzleInteraction({
  config,
  onSolve,
  onClose,
}: ModuleInteractionProps<ImagePuzzleConfig>) {
  const size = config.size;
  const n = size * size;
  const blank = n - 1;
  const accent = "#7fd9ff";

  const [board, setBoard] = useState<number[]>(() => {
    const seed = size * 31 + (config.prompt?.length ?? 7);
    let b = scramble(size, seed);
    for (let k = 1; isSolved(b); k++) b = scramble(size, seed + 1000 * k);
    return b;
  });
  const [done, setDone] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.code === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const slide = (index: number) => {
    if (done) return;
    const blankPos = board.indexOf(blank);
    if (!neighbours(index, size).includes(blankPos)) return;
    const next = board.slice();
    [next[blankPos], next[index]] = [next[index]!, next[blankPos]!];
    setBoard(next);
    if (isSolved(next)) {
      setDone(true);
      window.setTimeout(onSolve, 750);
    }
  };

  return (
    <motion.div
      className="pointer-events-auto absolute inset-0 z-20 flex items-center justify-center bg-black/55 px-6 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
      onClick={onClose}
    >
      <motion.div
        className="relative w-full max-w-sm rounded-3xl border border-white/10 bg-[#15122a] p-6 text-white shadow-2xl"
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

        <p className="mb-4 text-sm text-white/80">
          {config.prompt ?? "Slide the tiles to rebuild the picture."}
        </p>

        <div
          className="relative mx-auto aspect-square w-full max-w-[18rem] overflow-hidden rounded-xl bg-black/30"
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${size}, 1fr)`,
            // Explicit equal rows too: image tiles have no text content, so
            // without this the implicit rows collapse to ~0 height and the photo
            // never shows. Square cells fill the aspect-square board evenly.
            gridTemplateRows: `repeat(${size}, 1fr)`,
            gap: 4,
          }}
        >
          {board.map((value, pos) => {
            if (value === blank && !done) return <div key={pos} />;
            const homeR = Math.floor(value / size);
            const homeC = value % size;
            const tileStyle = config.imageUrl
              ? {
                  backgroundImage: `url(${config.imageUrl})`,
                  backgroundSize: `${size * 100}% ${size * 100}%`,
                  backgroundPosition: `${(homeC / (size - 1)) * 100}% ${(homeR / (size - 1)) * 100}%`,
                }
              : {
                  background: `linear-gradient(135deg, ${accent}cc, ${FALLBACK_GRADIENT_STOP}aa)`,
                };
            return (
              <button
                key={pos}
                type="button"
                onClick={() => slide(pos)}
                className="flex items-center justify-center rounded-md text-sm font-semibold text-white/90 transition-transform active:scale-95"
                style={tileStyle}
              >
                {!config.imageUrl && value !== blank ? value + 1 : ""}
              </button>
            );
          })}
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
