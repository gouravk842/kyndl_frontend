"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Dices, Flame, Lock, RotateCcw } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { Dice3D } from "@/components/red-zone/dice-3d";
import { CatalogImage } from "@/features/activity-bank/components/catalog-image";
import { applyDice } from "@/features/activity-bank/demo-content";
import { DemoGate } from "@/features/activity-bank/demo-gate";
import {
  DICE_CONFIG,
  type DiceConfig,
  GRID_SIZE,
  HEAT_META,
  indexFor,
  type Position,
} from "@/features/dice-of-desire/config";

import { Die } from "./die";
import { Flames } from "./flames";
import { Scratch } from "./scratch";

/**
 * The interactive Dice of Desire — a "roll a position" chart. The board is a
 * 6×6 grid (die 1 down the side, die 2 across the top); every square starts
 * hidden. Roll the two dice — they tumble like real dice and land on a square,
 * which pops up as a card for a few seconds and is scratched off the board, so
 * the chart fills in over the night.
 */
type DiceOfDesireExperienceProps = {
  config?: DiceConfig;
  /** Skip the 18+ gate (used inside the authenticated builder preview). */
  skipGate?: boolean;
  assets?: Record<string, string>;
};

const ROLL_MS = 1000;
const POPUP_MS = 3800;

/** A fair die roll, 1–6. */
function rollDie(): number {
  return 1 + Math.floor(Math.random() * 6);
}

type Popup = { position: Position; dice: [number, number] };

export function DiceOfDesireExperience(props: DiceOfDesireExperienceProps) {
  return (
    <DemoGate
      authored={props.config}
      fallback={DICE_CONFIG}
      includeAdult
      apply={applyDice}
    >
      {(config) => <DiceOfDesirePlay {...props} config={config} />}
    </DemoGate>
  );
}

function DiceOfDesirePlay({
  config,
  skipGate = false,
  assets,
}: DiceOfDesireExperienceProps & { config: DiceConfig }) {
  const reduceMotion = useReducedMotion();

  const [entered, setEntered] = useState(skipGate);
  const [rolling, setRolling] = useState(false);
  const [dice, setDice] = useState<[number, number]>([1, 1]);
  const [nonce, setNonce] = useState(0);
  const [scratched, setScratched] = useState<Set<number>>(new Set());
  const [lastId, setLastId] = useState<number | null>(null);
  const [popup, setPopup] = useState<Popup | null>(null);

  const tumbleRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const settleRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const popupRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // A quick lookup from grid id → position.
  const byId = useMemo(() => {
    const m = new Map<number, Position>();
    for (const p of config.positions) m.set(p.id, p);
    return m;
  }, [config.positions]);

  const clearTimers = useCallback(() => {
    if (tumbleRef.current) clearInterval(tumbleRef.current);
    if (settleRef.current) clearTimeout(settleRef.current);
    if (popupRef.current) clearTimeout(popupRef.current);
  }, []);

  // Tidy up timers if the component unmounts mid-roll.
  useEffect(() => clearTimers, [clearTimers]);

  const settle = useCallback(
    (d1: number, d2: number) => {
      const id = indexFor(d1, d2);
      setDice([d1, d2]);
      setLastId(id);
      setScratched((prev) => new Set(prev).add(id));
      setRolling(false);

      const position = byId.get(id);
      if (position) {
        setPopup({ position, dice: [d1, d2] });
        popupRef.current = setTimeout(() => setPopup(null), POPUP_MS);
      }
    },
    [byId],
  );

  const roll = useCallback(() => {
    if (rolling || config.positions.length === 0) return;
    clearTimers();
    setPopup(null);
    const d1 = rollDie();
    const d2 = rollDie();
    setDice([d1, d2]);
    setNonce((n) => n + 1);

    if (reduceMotion) {
      settle(d1, d2);
      return;
    }

    setRolling(true);
    settleRef.current = setTimeout(() => settle(d1, d2), ROLL_MS);
  }, [rolling, config.positions.length, reduceMotion, settle, clearTimers]);

  const clearBoard = useCallback(() => {
    clearTimers();
    setScratched(new Set());
    setLastId(null);
    setPopup(null);
  }, [clearTimers]);

  // ── Act 1: the 18+ gate ───────────────────────────────────────────
  if (!entered) {
    return <AgeGate onEnter={() => setEntered(true)} />;
  }

  const empty = config.positions.length === 0;
  const total = config.positions.length || GRID_SIZE * GRID_SIZE;
  const rows = Array.from({ length: GRID_SIZE }, (_, r) => r);
  const cols = Array.from({ length: GRID_SIZE }, (_, c) => c);

  return (
    <div className="flex w-full max-w-2xl flex-col items-center gap-6 sm:flex-row sm:items-center sm:justify-center sm:gap-7">
      {/* The chart — a rosy card on the dark table, with the result popup over it */}
      <div className="relative w-full max-w-[22rem] overflow-hidden rounded-[1.75rem] border border-white/10 bg-gradient-to-b from-[#fbe3ec] to-[#f3c2d4] p-4 shadow-[0_24px_70px_rgba(0,0,0,0.55)]">
        <h2 className="text-center font-display text-xl leading-tight text-[#9c1840] sm:text-2xl">
          {config.gameTitle || "Roll for us"}
        </h2>
        {scratched.size === 0 && config.intro && (
          <p className="mx-auto mt-1 max-w-[16rem] text-center text-[0.7rem] leading-snug text-[#9c1840]/65">
            {config.intro}
          </p>
        )}

        <div className="mt-3">
          <div
            className="mx-auto grid gap-1.5"
            style={{
              gridTemplateColumns: `1.4rem repeat(${GRID_SIZE}, minmax(0, 1fr))`,
            }}
          >
            {/* Header row: empty corner + die-2 values */}
            <span aria-hidden />
            {cols.map((c) => (
              <div key={`h-${c}`} className="flex justify-center pb-0.5">
                <Die value={c + 1} size={20} accent="#9c1840" flat />
              </div>
            ))}

            {/* Body rows: die-1 value + the six squares */}
            {rows.map((r) => (
              <Row key={`r-${r}`}>
                <div className="flex items-center justify-center">
                  <Die value={r + 1} size={20} accent="#9c1840" flat />
                </div>
                {cols.map((c) => {
                  const id = r * GRID_SIZE + c;
                  return (
                    <Cell
                      key={id}
                      position={byId.get(id) ?? null}
                      revealed={scratched.has(id)}
                      latest={id === lastId && !rolling}
                      reduceMotion={!!reduceMotion}
                    />
                  );
                })}
              </Row>
            ))}
          </div>
        </div>

        <p className="mt-3 text-center text-[0.65rem] font-semibold tracking-[0.18em] text-[#9c1840]/55 uppercase">
          {scratched.size} of {total} uncovered
        </p>

        {/* The reveal — pops over the board, then fades on its own */}
        <AnimatePresence>
          {popup && (
            <ResultPopup
              key={`p-${lastId}`}
              popup={popup}
              assets={assets}
              reduceMotion={!!reduceMotion}
              onClose={() => setPopup(null)}
            />
          )}
        </AnimatePresence>
      </div>

      {/* The dice rail — beside the board so nothing needs scrolling */}
      <aside className="flex shrink-0 flex-col items-center gap-4">
        <div className="flex items-end gap-4">
          {dice.map((v, i) => (
            <Dice3D
              key={i}
              value={v}
              rollNonce={nonce}
              rolling={rolling}
              index={i}
              size={54}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={roll}
          disabled={rolling || empty}
          className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#ff4d6d] to-[#c81d4e] px-7 py-3 text-sm font-semibold tracking-wide text-white shadow-[0_8px_30px_rgba(200,29,78,0.45)] transition-transform hover:scale-[1.03] active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Dices className={`size-4 ${rolling ? "animate-spin" : ""}`} />
          {rolling
            ? "Rolling…"
            : scratched.size > 0
              ? "Roll again"
              : "Roll the dice"}
        </button>

        {scratched.size > 0 ? (
          <button
            type="button"
            onClick={clearBoard}
            disabled={rolling}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-white/55 transition-colors hover:text-white/85 disabled:opacity-40"
          >
            <RotateCcw className="size-3.5" />
            Clear board
          </button>
        ) : (
          <p className="max-w-[9rem] text-center text-[0.7rem] leading-snug text-white/45">
            {empty ? "Add positions to begin." : "Two dice pick the square."}
          </p>
        )}
      </aside>
    </div>
  );
}

// ── A row wrapper that lays its children onto the parent grid ─────────
function Row({ children }: { children: React.ReactNode }) {
  return <div className="contents">{children}</div>;
}

// ── A single board square ────────────────────────────────────────────
function Cell({
  position,
  revealed,
  latest,
  reduceMotion,
}: {
  position: Position | null;
  revealed: boolean;
  latest: boolean;
  reduceMotion: boolean;
}) {
  const meta = position ? HEAT_META[position.heat] : null;
  return (
    <motion.div
      animate={latest && !reduceMotion ? { scale: [1, 1.16, 1] } : { scale: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={[
        "relative grid aspect-square place-items-center overflow-hidden rounded-[0.6rem] border p-1 text-center transition-shadow",
        latest
          ? "z-10 border-[#c81d4e] shadow-[0_0_0_2px_rgba(200,29,78,0.55),0_8px_22px_rgba(200,29,78,0.4)]"
          : "border-[#e3a9bf]/60",
      ].join(" ")}
      style={{
        background: revealed
          ? meta
            ? `linear-gradient(160deg, #ffffff 0%, ${meta.accent}26 100%)`
            : "#ffffff"
          : "linear-gradient(160deg, #fff6fa 0%, #f7d3e0 100%)",
      }}
    >
      {revealed && position ? (
        <motion.div
          initial={reduceMotion ? false : { rotateY: -90, opacity: 0 }}
          animate={{ rotateY: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          className="grid size-full place-items-center"
        >
          <span
            className="absolute top-1 right-1 size-1.5 rounded-full"
            style={{ background: meta?.accent }}
            aria-hidden
          />
          <span className="line-clamp-3 px-0.5 text-[0.56rem] font-semibold leading-[1.05] text-[#7e1426] sm:text-[0.62rem]">
            {position.name || "—"}
          </span>
          <Scratch animate={!reduceMotion} />
        </motion.div>
      ) : (
        // Hidden: a faint covered tile, contents kept secret until earned.
        <>
          <span
            aria-hidden
            className="absolute inset-1 rounded-[0.4rem] border border-white/40"
          />
          <span
            aria-hidden
            className="size-2 rotate-45 rounded-[2px] bg-[#cf7a99]/45"
          />
        </>
      )}
    </motion.div>
  );
}

// ── The square the dice landed on — pops over the board, then fades ───
function ResultPopup({
  popup,
  reduceMotion,
  onClose,
  assets,
}: {
  popup: Popup;
  reduceMotion: boolean;
  onClose: () => void;
  assets?: Record<string, string>;
}) {
  const { position, dice } = popup;
  const meta = HEAT_META[position.heat];
  const named = position.name.trim().length > 0;
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      onClick={onClose}
      className="absolute inset-0 z-20 grid cursor-pointer place-items-center bg-[#2a0a18]/55 p-3 backdrop-blur-sm"
      style={{ perspective: 1000 }}
    >
      <motion.div
        initial={
          reduceMotion
            ? { opacity: 0 }
            : { opacity: 0, scale: 0.7, rotateX: -45, y: 12 }
        }
        animate={{ opacity: 1, scale: 1, rotateX: 0, y: 0 }}
        exit={
          reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.85, y: -8 }
        }
        transition={{ type: "spring", stiffness: 240, damping: 18 }}
        className="relative w-full max-w-[15rem] overflow-hidden rounded-2xl border border-white/15 px-5 py-5 text-center shadow-[0_24px_60px_rgba(0,0,0,0.6)]"
        style={{ background: meta.card, transformStyle: "preserve-3d" }}
      >
        <motion.div
          aria-hidden
          className="pointer-events-none absolute -top-12 left-1/2 h-40 w-40 -translate-x-1/2 rounded-full blur-3xl"
          style={{ background: meta.glow }}
          animate={
            reduceMotion
              ? {}
              : { scale: [0.8, 1.15, 1], opacity: [0.6, 1, 0.85] }
          }
          transition={{ duration: 0.8 }}
        />
        <div className="relative flex items-center justify-between">
          <span className="text-[0.6rem] font-medium tracking-[0.18em] text-white/45 uppercase">
            Rolled {dice[0]} · {dice[1]}
          </span>
          <span
            className="rounded-full px-2 py-0.5 text-[0.55rem] font-semibold tracking-wide uppercase"
            style={{ color: meta.accent, background: "rgba(255,255,255,0.1)" }}
          >
            {meta.label}
          </span>
        </div>

        {named ? (
          <>
            <motion.h3
              initial={reduceMotion ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: 0.12,
                type: "spring",
                stiffness: 260,
                damping: 20,
              }}
              className="relative mt-3 font-display text-2xl leading-tight text-white"
            >
              {position.name}
            </motion.h3>
            <CatalogImage fileId={position.image?.fileId} assets={assets} />
          </>
        ) : (
          <p className="relative mt-3 text-sm text-white/60">
            This square is still blank — add a position to it in the builder.
          </p>
        )}

        {named && position.note && (
          <motion.p
            initial={reduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.22 }}
            className="relative mt-2 text-[0.8rem] leading-relaxed text-white/70"
          >
            {position.note}
          </motion.p>
        )}

        <div className="relative mt-4 flex items-center justify-center">
          <Flames heat={position.heat} />
        </div>

        {/* Auto-dismiss progress bar */}
        {!reduceMotion && (
          <motion.span
            aria-hidden
            className="absolute bottom-0 left-0 h-0.5"
            style={{ background: meta.accent }}
            initial={{ width: "100%" }}
            animate={{ width: "0%" }}
            transition={{ duration: POPUP_MS / 1000, ease: "linear" }}
          />
        )}
      </motion.div>
    </motion.div>
  );
}

// ── The 18+ consent gate ─────────────────────────────────────────────
function AgeGate({ onEnter }: { onEnter: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex w-full max-w-sm flex-col items-center gap-5 rounded-3xl border border-white/10 bg-white/[0.04] px-7 py-10 text-center backdrop-blur"
    >
      <span className="grid size-14 place-items-center rounded-full bg-gradient-to-br from-[#ff4d6d] to-[#c81d4e] text-white shadow-lg">
        <Lock className="size-6" />
      </span>
      <div className="space-y-2">
        <h2 className="font-display text-2xl text-white">For grown-ups only</h2>
        <p className="text-sm leading-relaxed text-white/55">
          This game is for consenting adults sharing a private moment. By
          entering you confirm you{"'"}re 18 or older and you both want to be
          here.
        </p>
      </div>
      <button
        type="button"
        onClick={onEnter}
        className="inline-flex items-center gap-2 rounded-full bg-white px-7 py-3 text-sm font-semibold text-[#7e1426] transition-transform hover:scale-[1.03] active:scale-95"
      >
        <Flame className="size-4" /> We{"'"}re in
      </button>
    </motion.div>
  );
}
