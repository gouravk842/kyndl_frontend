"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Crown, Dices, Flame, Lock, RotateCcw, ShieldCheck } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { Dice3D } from "@/components/red-zone/dice-3d";
import {
  cellCenter,
  cellPosition,
  CLIMAX_SQUARE,
  HEAT_META,
  LADDERS,
  SAFE_SQUARES,
  SNAKES,
  SNAKES_CONFIG,
  type SnakesConfig,
  type Square,
} from "@/features/snakes-and-lovers/config";

import { BoardOverlay } from "./board-overlay";
import { Flames } from "./flames";

/**
 * The interactive Snakes & Lovers — Snakes & Ladders with a dare on every
 * square. Two players share one device and take turns rolling a die up a 100
 * square track. A ladder is a "Heat Rush" (climb to a hotter dare); a snake is a
 * "Slow Burn" (slide back into a teasing one); reaching 100 is the climax and
 * the winner directs the finale. Every landing reveals its square's dare.
 */
type SnakesAndLoversExperienceProps = {
  config?: SnakesConfig;
  /** Skip the 18+ gate (used inside the authenticated builder preview). */
  skipGate?: boolean;
};

const ROLL_MS = 1000;
const STEP_MS = 520;

const PLAYERS = [
  { name: "Player 1", color: "#ff4d6d", dark: "#9c1330" },
  { name: "Player 2", color: "#ffb454", dark: "#9a6410" },
] as const;

/** A fair die roll, 1–6. */
function rollDie(): number {
  return 1 + Math.floor(Math.random() * 6);
}

type EventKind = "ladder" | "snake" | "bounce" | "land";

type Popup =
  | { kind: "dare"; who: number; pos: number; die: number; event: EventKind; square: Square | undefined }
  | { kind: "safe"; who: number; pos: number; die: number; event: EventKind }
  | { kind: "win"; who: number; pos: number; die: number; event: EventKind };

export function SnakesAndLoversExperience({
  config = SNAKES_CONFIG,
  skipGate = false,
}: SnakesAndLoversExperienceProps) {
  const reduceMotion = useReducedMotion();

  const [entered, setEntered] = useState(skipGate);
  const [pos, setPos] = useState<[number, number]>([0, 0]);
  const [turn, setTurn] = useState(0);
  const [die, setDie] = useState(1);
  const [nonce, setNonce] = useState(0);
  const [rolling, setRolling] = useState(false);
  const [moving, setMoving] = useState(false);
  const [winner, setWinner] = useState<number | null>(null);
  const [visited, setVisited] = useState<Set<number>>(new Set());
  const [popup, setPopup] = useState<Popup | null>(null);

  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const byId = useMemo(() => {
    const m = new Map<number, Square>();
    for (const s of config.squares) m.set(s.id, s);
    return m;
  }, [config.squares]);

  const clearTimers = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  }, []);

  useEffect(() => clearTimers, [clearTimers]);

  const after = useCallback((ms: number, fn: () => void) => {
    const t = setTimeout(fn, ms);
    timers.current.push(t);
  }, []);

  const moveToken = useCallback((who: number, to: number) => {
    setPos((prev) => {
      const next: [number, number] = [prev[0], prev[1]];
      next[who] = to;
      return next;
    });
    setVisited((prev) => (to >= 1 ? new Set(prev).add(to) : prev));
  }, []);

  const resolve = useCallback(
    (who: number, square: number, dieValue: number, _landed: number, event: EventKind) => {
      setMoving(false);
      if (square === CLIMAX_SQUARE) {
        setWinner(who);
        setPopup({ kind: "win", who, pos: square, die: dieValue, event });
        return;
      }
      if (SAFE_SQUARES.has(square)) {
        setPopup({ kind: "safe", who, pos: square, die: dieValue, event });
        return;
      }
      setPopup({ kind: "dare", who, pos: square, die: dieValue, event, square: byId.get(square) });
    },
    [byId],
  );

  const advance = useCallback(
    (steps: number, from: number, who: number) => {
      setMoving(true);
      let dest = from + steps;
      let bounced = false;
      if (dest > CLIMAX_SQUARE) {
        dest = CLIMAX_SQUARE - (dest - CLIMAX_SQUARE); // bounce back off 100
        bounced = true;
      }
      moveToken(who, dest);

      after(STEP_MS, () => {
        const ladder = LADDERS[dest];
        const snake = SNAKES[dest];
        if (ladder !== undefined) {
          moveToken(who, ladder);
          after(STEP_MS, () => resolve(who, ladder, steps, dest, "ladder"));
        } else if (snake !== undefined) {
          moveToken(who, snake);
          after(STEP_MS, () => resolve(who, snake, steps, dest, "snake"));
        } else {
          resolve(who, dest, steps, dest, bounced ? "bounce" : "land");
        }
      });
    },
    [after, moveToken, resolve],
  );

  const empty = config.squares.length === 0;
  const busy = rolling || moving || !!popup;

  const roll = useCallback(() => {
    if (busy || winner !== null || empty) return;
    clearTimers();
    const v = rollDie();
    const from = pos[turn] ?? 0;
    setDie(v);
    setNonce((n) => n + 1);

    if (reduceMotion) {
      advance(v, from, turn);
      return;
    }

    setRolling(true);
    after(ROLL_MS, () => {
      setRolling(false);
      advance(v, from, turn);
    });
  }, [busy, winner, empty, clearTimers, pos, turn, reduceMotion, advance, after]);

  const closePopup = useCallback(
    (advanceTurn: boolean) => {
      setPopup(null);
      if (advanceTurn && winner === null) setTurn((t) => (t === 0 ? 1 : 0));
    },
    [winner],
  );

  const playAgain = useCallback(() => {
    clearTimers();
    setPos([0, 0]);
    setTurn(0);
    setDie(1);
    setRolling(false);
    setMoving(false);
    setWinner(null);
    setVisited(new Set());
    setPopup(null);
  }, [clearTimers]);

  // ── Act 1: the 18+ gate ───────────────────────────────────────────
  if (!entered) {
    return <AgeGate onEnter={() => setEntered(true)} />;
  }

  const current = PLAYERS[turn]!;

  return (
    <div className="flex w-full max-w-3xl flex-col items-center gap-6 lg:flex-row lg:items-start lg:justify-center lg:gap-8">
      {/* The board */}
      <div className="w-full max-w-[26rem]">
        <h2 className="mb-2 text-center font-display text-xl leading-tight text-white sm:text-2xl">
          {config.gameTitle || "Snakes & Lovers"}
        </h2>

        {/* The wooden board */}
        <div
          className="relative rounded-[1.6rem] p-[5.5%] shadow-[0_28px_80px_rgba(0,0,0,0.6)]"
          style={{
            background:
              "linear-gradient(180deg, #7c4f29 0%, #5d3a1f 46%, #693f1e 54%, #46290f 100%)",
            boxShadow:
              "0 28px 80px rgba(0,0,0,0.6), inset 0 2px 3px rgba(255,225,180,0.35), inset 0 -4px 8px rgba(0,0,0,0.45)",
          }}
        >
          {/* wood grain */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 rounded-[1.6rem] opacity-40 mix-blend-overlay"
            style={{
              backgroundImage:
                "repeating-linear-gradient(96deg, rgba(0,0,0,0.10) 0 1.5px, rgba(255,255,255,0.05) 1.5px 4px), repeating-linear-gradient(92deg, rgba(0,0,0,0.06) 0 9px, rgba(255,240,210,0.04) 9px 16px)",
            }}
          />

          {/* recessed play area, ringed in brass */}
          <div
            className="relative aspect-square w-full overflow-hidden rounded-[0.5rem]"
            style={{
              border: "1.5px solid rgba(202,161,90,0.6)",
              boxShadow:
                "inset 0 0 0 1px rgba(0,0,0,0.5), inset 0 6px 16px rgba(0,0,0,0.55)",
              background: "#2a0a14",
            }}
          >
            {/* The 10×10 grid of squares */}
            <div
              className="grid h-full w-full gap-px"
              style={{
                gridTemplateColumns: `repeat(10, minmax(0, 1fr))`,
                gridTemplateRows: `repeat(10, minmax(0, 1fr))`,
              }}
            >
              {config.squares.map((sq) => {
                const { row, col } = cellPosition(sq.id);
                return (
                  <BoardCell
                    key={sq.id}
                    square={sq}
                    row={row}
                    col={col}
                    visited={visited.has(sq.id)}
                  />
                );
              })}
            </div>

            {/* Snakes & ladders drawn over the grid */}
            <div className="absolute inset-0">
              <BoardOverlay />
            </div>

            {/* The two tokens */}
            <div className="pointer-events-none absolute inset-0">
              {pos.map((p, who) =>
                p >= 1 ? (
                  <Token
                    key={who}
                    player={who}
                    square={p}
                    active={who === turn && winner === null}
                    reduceMotion={!!reduceMotion}
                  />
                ) : null,
              )}
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="mt-3 flex items-center justify-center gap-4 text-[0.7rem] text-white/55">
          <span className="inline-flex items-center gap-1.5">
            <span className="inline-block h-1.5 w-4 rounded-full bg-gradient-to-r from-[#7a5616] via-[#ffe9a8] to-[#8a6320]" />
            Heat Rush
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="inline-block h-1.5 w-4 rounded-full bg-gradient-to-r from-[#1f6b3a] to-[#3fae5e]" />
            Slow Burn
          </span>
          <span className="inline-flex items-center gap-1">
            <ShieldCheck className="size-3.5 text-[#9ad7c0]" /> Safe
          </span>
        </div>
      </div>

      {/* The control rail */}
      <aside className="flex w-full max-w-[16rem] shrink-0 flex-col items-center gap-5">
        {/* Whose turn */}
        <div className="flex w-full items-center justify-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3">
          {PLAYERS.map((pl, i) => (
            <div
              key={i}
              className={[
                "flex flex-1 flex-col items-center gap-1 rounded-xl px-2 py-2 transition-colors",
                i === turn && winner === null ? "bg-white/[0.06]" : "",
              ].join(" ")}
            >
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-white/80">
                <span
                  className="size-2.5 rounded-full"
                  style={{ background: pl.color }}
                />
                {pl.name}
              </span>
              <span className="text-[0.7rem] text-white/45">
                {(pos[i] ?? 0) >= 1 ? `Square ${pos[i]}` : "Start"}
              </span>
            </div>
          ))}
        </div>

        {/* The die */}
        <Dice3D value={die} rollNonce={nonce} rolling={rolling} size={62} />

        {winner === null ? (
          <>
            <p className="text-center text-sm text-white/65">
              <span className="font-semibold" style={{ color: current.color }}>
                {current.name}
              </span>
              {busy ? " is moving…" : "'s turn to roll"}
            </p>
            <button
              type="button"
              onClick={roll}
              disabled={busy || empty}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#ff4d6d] to-[#c81d4e] px-7 py-3 text-sm font-semibold tracking-wide text-white shadow-[0_8px_30px_rgba(200,29,78,0.45)] transition-transform hover:scale-[1.03] active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Dices className={`size-4 ${rolling ? "animate-spin" : ""}`} />
              {rolling ? "Rolling…" : "Roll the die"}
            </button>
            <p className="max-w-[12rem] text-center text-[0.7rem] leading-snug text-white/40">
              {empty ? "Add dares to begin." : "Take turns. First to 100 directs the finale."}
            </p>
          </>
        ) : (
          <button
            type="button"
            onClick={playAgain}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-white/65 transition-colors hover:text-white"
          >
            <RotateCcw className="size-4" /> Play again
          </button>
        )}
      </aside>

      {/* The reveal */}
      <AnimatePresence>
        {popup && (
          <ResultPopup
            key={`${popup.kind}-${popup.pos}-${popup.who}`}
            popup={popup}
            reduceMotion={!!reduceMotion}
            finale={byId.get(CLIMAX_SQUARE)}
            onContinue={() => closePopup(true)}
            onPlayAgain={playAgain}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ── A single board square ────────────────────────────────────────────
function BoardCell({
  square,
  row,
  col,
  visited,
}: {
  square: Square;
  row: number;
  col: number;
  visited: boolean;
}) {
  const meta = HEAT_META[square.heat];
  const isSafe = SAFE_SQUARES.has(square.id);
  const isClimax = square.id === CLIMAX_SQUARE;
  const [from, to] = meta.tile;

  // Climax square gets a gilded tile; everything else is its heat tier.
  const tileBg = isClimax
    ? "linear-gradient(160deg, rgba(255,255,255,0.45), rgba(255,255,255,0) 42%), linear-gradient(155deg, #ffe49a, #d99a2b)"
    : `linear-gradient(160deg, rgba(255,255,255,0.40), rgba(255,255,255,0) 44%), linear-gradient(155deg, ${from}, ${to})`;

  return (
    <div
      className="relative flex items-center justify-center overflow-hidden"
      style={{
        gridColumnStart: col + 1,
        gridRowStart: row + 1,
        background: tileBg,
        boxShadow: `inset 1px 1px 1px rgba(255,255,255,0.5), inset -1px -1px 2px rgba(0,0,0,0.3)${visited ? `, inset 0 0 7px ${meta.accent}` : ""}`,
      }}
    >
      <span
        className="absolute top-[1px] left-[2px] text-[0.5rem] font-extrabold text-[#4a0f1f]/75"
        style={{ textShadow: "0 1px 0 rgba(255,255,255,0.45)" }}
      >
        {square.id}
      </span>
      {isClimax && <Crown className="size-3 text-[#7a3a00]" aria-hidden />}
      {isSafe && (
        <ShieldCheck
          className="absolute right-[1px] bottom-[1px] size-2.5 text-[#0f6b47]"
          aria-hidden
        />
      )}
      {visited && !isClimax && !isSafe && (
        <span className="size-1 rounded-full bg-white/80" aria-hidden />
      )}
    </div>
  );
}

// ── A player's token on the board — a glossy 3D bead ──────────────────
function Token({
  player,
  square,
  active,
  reduceMotion,
}: {
  player: number;
  square: number;
  active: boolean;
  reduceMotion: boolean;
}) {
  const { x, y } = cellCenter(square);
  const p = PLAYERS[player]!;
  // Nudge the two tokens apart so both stay visible on a shared square.
  const nudge = player === 0 ? -26 : 26;
  return (
    <motion.div
      className="absolute"
      style={{ left: `${x}%`, top: `${y}%` }}
      initial={false}
      animate={{ left: `${x}%`, top: `${y}%` }}
      transition={
        reduceMotion ? { duration: 0 } : { type: "spring", stiffness: 240, damping: 24 }
      }
    >
      <div className="relative" style={{ transform: `translate(calc(-50% + ${nudge}%), -62%)` }}>
        {/* ground shadow */}
        <span className="absolute top-full left-1/2 block h-[0.16rem] w-[0.7rem] -translate-x-1/2 rounded-full bg-black/50 blur-[1px]" />
        <motion.span
          animate={active && !reduceMotion ? { y: [0, -3, 0] } : { y: 0 }}
          transition={{ duration: 1.1, repeat: active ? Infinity : 0, ease: "easeInOut" }}
          className="block rounded-full"
          style={{
            width: "1.05rem",
            height: "1.05rem",
            background: `radial-gradient(circle at 34% 28%, #ffffff 0%, ${p.color} 46%, ${p.dark} 100%)`,
            boxShadow: `0 2px 4px rgba(0,0,0,0.55), inset 0 -2px 3px rgba(0,0,0,0.4), inset 0 2px 2px rgba(255,255,255,0.6)${active ? `, 0 0 0 1.5px rgba(255,255,255,0.9), 0 0 9px ${p.color}` : ""}`,
          }}
        />
      </div>
    </motion.div>
  );
}

// ── The reveal — pops over the board; the couple read it, then continue ──
const EVENT_COPY: Record<EventKind, (pos: number) => string> = {
  ladder: (p) => `🪜 Heat Rush! Climbed to ${p}`,
  snake: (p) => `🐍 Slow Burn… teased back to ${p}`,
  bounce: (p) => `So close — bounced back to ${p}`,
  land: (p) => `Landed on ${p}`,
};

function ResultPopup({
  popup,
  reduceMotion,
  finale,
  onContinue,
  onPlayAgain,
}: {
  popup: Popup;
  reduceMotion: boolean;
  finale: Square | undefined;
  onContinue: () => void;
  onPlayAgain: () => void;
}) {
  const player = PLAYERS[popup.who]!;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-[90] grid place-items-center bg-[#2a0a18]/65 p-4 backdrop-blur-sm"
      style={{ perspective: 1000 }}
    >
      <motion.div
        initial={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.8, rotateX: -35, y: 14 }}
        animate={{ opacity: 1, scale: 1, rotateX: 0, y: 0 }}
        exit={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.9, y: -8 }}
        transition={{ type: "spring", stiffness: 240, damping: 20 }}
        className="relative w-full max-w-sm overflow-hidden rounded-3xl border border-white/15 px-6 py-7 text-center shadow-[0_24px_60px_rgba(0,0,0,0.6)]"
        style={{ background: cardBg(popup), transformStyle: "preserve-3d" }}
      >
        {popup.kind === "win" ? (
          <WinBody who={popup.who} finale={finale} reduceMotion={reduceMotion} />
        ) : popup.kind === "safe" ? (
          <SafeBody player={player} pos={popup.pos} />
        ) : (
          <DareBody
            player={player}
            pos={popup.pos}
            event={popup.event}
            square={popup.square}
            reduceMotion={reduceMotion}
          />
        )}

        <div className="relative mt-6">
          {popup.kind === "win" ? (
            <button
              type="button"
              onClick={onPlayAgain}
              className="inline-flex items-center gap-2 rounded-full bg-white px-7 py-3 text-sm font-semibold text-[#7e1426] transition-transform hover:scale-[1.03] active:scale-95"
            >
              <RotateCcw className="size-4" /> Play again
            </button>
          ) : (
            <button
              type="button"
              onClick={onContinue}
              className="inline-flex items-center gap-2 rounded-full bg-white/95 px-7 py-3 text-sm font-semibold text-[#7e1426] transition-transform hover:scale-[1.03] active:scale-95"
            >
              Done — pass it over
            </button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

function cardBg(popup: Popup): string {
  if (popup.kind === "win") return "linear-gradient(155deg, #3d0a16 0%, #8a0f1d 100%)";
  if (popup.kind === "safe") return "linear-gradient(155deg, #10261f 0%, #163a2e 100%)";
  return HEAT_META[popup.square?.heat ?? "flirty"].card;
}

function DareBody({
  player,
  pos,
  event,
  square,
  reduceMotion,
}: {
  player: (typeof PLAYERS)[number];
  pos: number;
  event: EventKind;
  square: Square | undefined;
  reduceMotion: boolean;
}) {
  const heat = square?.heat ?? "flirty";
  const meta = HEAT_META[heat];
  const named = (square?.name ?? "").trim().length > 0;
  return (
    <>
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -top-12 left-1/2 h-40 w-40 -translate-x-1/2 rounded-full blur-3xl"
        style={{ background: meta.glow }}
        animate={reduceMotion ? {} : { scale: [0.8, 1.15, 1], opacity: [0.6, 1, 0.85] }}
        transition={{ duration: 0.8 }}
      />
      <div className="relative flex items-center justify-between">
        <span className="text-[0.6rem] font-medium tracking-[0.16em] uppercase" style={{ color: player.color }}>
          {player.name}
        </span>
        <span
          className="rounded-full px-2 py-0.5 text-[0.55rem] font-semibold tracking-wide uppercase"
          style={{ color: meta.accent, background: "rgba(255,255,255,0.1)" }}
        >
          {meta.label}
        </span>
      </div>

      <p className="relative mt-2 text-[0.7rem] font-medium text-white/55">
        {EVENT_COPY[event](pos)}
      </p>

      {named ? (
        <motion.h3
          initial={reduceMotion ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, type: "spring", stiffness: 260, damping: 20 }}
          className="relative mt-2 font-display text-2xl leading-tight text-white"
        >
          {square!.name}
        </motion.h3>
      ) : (
        <p className="relative mt-2 text-sm text-white/60">
          This square is still blank — add a dare to it in the builder.
        </p>
      )}

      {named && square?.note && (
        <motion.p
          initial={reduceMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="relative mt-2 text-[0.85rem] leading-relaxed text-white/75"
        >
          {square.note}
        </motion.p>
      )}

      <div className="relative mt-4 flex items-center justify-center">
        <Flames heat={heat} />
      </div>
    </>
  );
}

function SafeBody({ player, pos }: { player: (typeof PLAYERS)[number]; pos: number }) {
  return (
    <>
      <span className="relative mx-auto grid size-12 place-items-center rounded-full bg-white/10 text-[#9ad7c0]">
        <ShieldCheck className="size-6" />
      </span>
      <p className="relative mt-3 text-[0.6rem] font-medium tracking-[0.16em] uppercase" style={{ color: player.color }}>
        {player.name} · Square {pos}
      </p>
      <h3 className="relative mt-1 font-display text-2xl text-white">Safe square</h3>
      <p className="relative mt-2 text-[0.85rem] leading-relaxed text-white/75">
        Catch your breath. Check in with each other — is everyone still a yes? The
        safe word always wins. When you{"'"}re both ready, carry on up.
      </p>
    </>
  );
}

function WinBody({
  who,
  finale,
  reduceMotion,
}: {
  who: number;
  finale: Square | undefined;
  reduceMotion: boolean;
}) {
  const player = PLAYERS[who]!;
  return (
    <>
      <motion.span
        className="relative mx-auto grid size-14 place-items-center rounded-full bg-gradient-to-br from-[#ff4d6d] to-[#c81d4e] text-white shadow-lg"
        animate={reduceMotion ? {} : { scale: [0.8, 1.1, 1], rotate: [0, -8, 0] }}
        transition={{ duration: 0.6 }}
      >
        <Crown className="size-7" />
      </motion.span>
      <p className="relative mt-3 text-[0.6rem] font-medium tracking-[0.16em] uppercase" style={{ color: player.color }}>
        {player.name} reaches 100
      </p>
      <h3 className="relative mt-1 font-display text-3xl leading-tight text-white">
        {finale?.name?.trim() || "Climax"}
      </h3>
      <p className="relative mt-2 text-[0.9rem] leading-relaxed text-white/80">
        {finale?.note?.trim() ||
          "You made it to the top. The winner directs the finale — and it's for the two of you."}
      </p>
      <div className="relative mt-4 flex items-center justify-center">
        <Flames heat="wild" />
      </div>
    </>
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
          This game is for consenting adults sharing a private moment. By entering
          you confirm you{"'"}re 18 or older and you both want to be here.
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
