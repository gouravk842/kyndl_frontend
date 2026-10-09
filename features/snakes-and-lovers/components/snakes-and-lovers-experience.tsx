"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ArrowDown,
  ArrowUp,
  ChevronDown,
  Crown,
  Dices,
  Flame,
  Lock,
  Pause,
  RotateCcw,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";
import {
  type RefObject,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { Dice3D } from "@/components/red-zone/dice-3d";
import { ROUTES } from "@/constants/routes";
import { CatalogImage } from "@/features/activity-bank/components/catalog-image";
import { applySnakes } from "@/features/activity-bank/demo-content";
import { DemoGate } from "@/features/activity-bank/demo-gate";
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
import {
  dareKey,
  dareSeconds,
  pickDare,
} from "@/features/snakes-and-lovers/dare";
import { rollPath } from "@/features/snakes-and-lovers/move";
import {
  DEFAULT_SETUP,
  displayName,
  EMPTY_STATS,
  type GameSetup,
  type GameStats,
  loadSetup,
  playDiceSound,
  saveSetup,
} from "@/features/snakes-and-lovers/setup";

import { BoardOverlay } from "./board-overlay";
import { Flames } from "./flames";
import { SetupScreen } from "./setup-screen";

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
  assets?: Record<string, string>;
};

const ROLL_MS = 1000;
const HOP_MS = 200;
const CLIMB_MS = 480;
const SLIDE_MS = 540;

type Travel = "hop" | "climb" | "slide" | "idle";

const PLAYER_TONES = [
  { color: "#ff4d6d", dark: "#9c1330" },
  { color: "#ffb454", dark: "#9a6410" },
] as const;

type PlayerLook = { name: string; color: string; dark: string };

function playerLook(who: number, names: [string, string]): PlayerLook {
  const tone = PLAYER_TONES[who] ?? PLAYER_TONES[0]!;
  return { name: displayName(who, names), color: tone.color, dark: tone.dark };
}

/** A fair die roll, 1–6. */
function rollDie(): number {
  return 1 + Math.floor(Math.random() * 6);
}

type EventKind = "ladder" | "snake" | "bounce" | "land";

function arrival(event: EventKind, square: number): string {
  if (event === "ladder") return `Heat Rush on ${square}.`;
  if (event === "snake") return `Slow Burn on ${square}.`;
  if (event === "bounce") return `Bounced back to ${square}.`;
  return `Landed on ${square}.`;
}

type Wait = {
  remain: number;
  started: number;
  fn: () => void;
  timer: ReturnType<typeof setTimeout>;
};

type Popup =
  | {
      kind: "dare";
      who: number;
      pos: number;
      die: number;
      event: EventKind;
      square: Square | undefined;
    }
  | { kind: "safe"; who: number; pos: number; die: number; event: EventKind }
  | { kind: "win"; who: number; pos: number; die: number; event: EventKind };

type LogEntry = { id: number; text: string };

export function SnakesAndLoversExperience(
  props: SnakesAndLoversExperienceProps,
) {
  return (
    <DemoGate
      authored={props.config}
      fallback={SNAKES_CONFIG}
      includeAdult
      apply={applySnakes}
    >
      {(config) => <SnakesAndLoversPlay {...props} config={config} />}
    </DemoGate>
  );
}

function SnakesAndLoversPlay({
  config,
  skipGate = false,
  assets,
}: SnakesAndLoversExperienceProps & { config: SnakesConfig }) {
  const reduceMotion = useReducedMotion();

  const [entered, setEntered] = useState(skipGate);
  const [pos, setPos] = useState<[number, number]>([0, 0]);
  const [turn, setTurn] = useState(0);
  const [die, setDie] = useState(1);
  const [nonce, setNonce] = useState(0);
  const [rolling, setRolling] = useState(false);
  const [moving, setMoving] = useState(false);
  const [travel, setTravel] = useState<Travel>("idle");
  const [winner, setWinner] = useState<number | null>(null);
  const [visited, setVisited] = useState<Set<number>>(new Set());
  const [popup, setPopup] = useState<Popup | null>(null);
  const [skips, setSkips] = useState<[number, number]>([
    DEFAULT_SETUP.skips,
    DEFAULT_SETUP.skips,
  ]);
  const [paused, setPaused] = useState(false);
  const [setup, setSetup] = useState<GameSetup>(DEFAULT_SETUP);
  const [hydrated, setHydrated] = useState(false);
  const [playing, setPlaying] = useState(skipGate);
  const [stats, setStats] = useState<GameStats>(EMPTY_STATS);
  const [log, setLog] = useState<LogEntry[]>([]);

  const waits = useRef<Wait[]>([]);
  const pausedRef = useRef(false);
  const usedRef = useRef<Set<string>>(new Set());
  const resumeRef = useRef<HTMLButtonElement>(null);
  const setupRef = useRef(setup);
  const logId = useRef(0);
  // eslint-disable-next-line react-hooks/refs -- game callbacks read the latest setup
  setupRef.current = setup;

  const byId = useMemo(() => {
    const m = new Map<number, Square>();
    for (const s of config.squares) m.set(s.id, s);
    return m;
  }, [config.squares]);

  const clearTimers = useCallback(() => {
    waits.current.forEach((wait) => clearTimeout(wait.timer));
    waits.current = [];
  }, []);

  useEffect(() => clearTimers, [clearTimers]);

  const after = useCallback((ms: number, fn: () => void) => {
    const wait: Wait = {
      remain: ms,
      started: Date.now(),
      fn,
      timer: 0 as unknown as ReturnType<typeof setTimeout>,
    };
    wait.timer = setTimeout(() => {
      waits.current = waits.current.filter((item) => item !== wait);
      fn();
    }, ms);
    waits.current.push(wait);
  }, []);

  const pauseGame = useCallback(() => {
    if (pausedRef.current) return;
    pausedRef.current = true;
    const now = Date.now();
    for (const wait of waits.current) {
      clearTimeout(wait.timer);
      // eslint-disable-next-line react-hooks/immutability -- pause freezes the remaining delay on this timer
      wait.remain = Math.max(0, wait.remain - (now - wait.started));
    }
    setPaused(true);
  }, []);

  const resumeGame = useCallback(() => {
    if (!pausedRef.current) return;
    pausedRef.current = false;
    setPaused(false);
    const now = Date.now();
    for (const wait of waits.current) {
      // eslint-disable-next-line react-hooks/immutability -- resume restarts the frozen delay
      wait.started = now;
      wait.timer = setTimeout(() => {
        waits.current = waits.current.filter((item) => item !== wait);
        wait.fn();
      }, wait.remain);
    }
  }, []);

  const moveToken = useCallback((who: number, to: number, mark: boolean) => {
    setPos((prev) => {
      const next: [number, number] = [prev[0], prev[1]];
      next[who] = to;
      return next;
    });
    if (mark && to >= 1) setVisited((prev) => new Set(prev).add(to));
  }, []);

  const pushLog = useCallback((text: string) => {
    const id = logId.current + 1;
    logId.current = id;
    setLog((prev) => [{ id, text }, ...prev].slice(0, 16));
  }, []);

  useEffect(() => {
    const saved = loadSetup();
    // eslint-disable-next-line react-hooks/set-state-in-effect -- hydrate the saved game setup
    setSetup(saved);

    if (skipGate) setSkips([saved.skips, saved.skips]);

    setHydrated(true);
  }, [skipGate]);

  const resolve = useCallback(
    (
      who: number,
      square: number,
      dieValue: number,
      landed: number,
      event: EventKind,
    ) => {
      setMoving(false);
      setTravel("idle");
      const name = displayName(who, setupRef.current.names);
      pushLog(`${name} rolled ${dieValue}. ${arrival(event, square)}`);
      setStats((prev) => ({
        ...prev,
        moves: prev.moves + 1,
        biggestSlide:
          event === "snake"
            ? Math.max(prev.biggestSlide, Math.max(0, landed - square))
            : prev.biggestSlide,
      }));
      if (square === CLIMAX_SQUARE) {
        setWinner(who);
        setPopup({ kind: "win", who, pos: square, die: dieValue, event });
        return;
      }
      if (SAFE_SQUARES.has(square)) {
        setPopup({ kind: "safe", who, pos: square, die: dieValue, event });
        return;
      }
      const dare = pickDare(
        config.squares,
        square,
        usedRef.current,
        setupRef.current.heat,
      );
      setPopup({
        kind: "dare",
        who,
        pos: square,
        die: dieValue,
        event,
        square: dare,
      });
    },
    [config.squares, pushLog],
  );

  const advance = useCallback(
    (steps: number, from: number, who: number) => {
      const { path, landed, bounced } = rollPath(from, steps, CLIMAX_SQUARE);
      const ladder = LADDERS[landed];
      const snake = SNAKES[landed];
      const event: EventKind =
        ladder !== undefined
          ? "ladder"
          : snake !== undefined
            ? "snake"
            : bounced
              ? "bounce"
              : "land";
      const finalSquare = ladder ?? snake ?? landed;

      // Reduced motion skips the walk and lands on the resolved square.
      if (reduceMotion) {
        moveToken(who, landed, true);
        if (finalSquare !== landed) moveToken(who, finalSquare, true);
        resolve(who, finalSquare, steps, landed, event);
        return;
      }

      setMoving(true);
      setTravel("hop");
      path.forEach((square, i) => {
        after((i + 1) * HOP_MS, () =>
          moveToken(who, square, i === path.length - 1),
        );
      });

      after((path.length + 1) * HOP_MS, () => {
        if (ladder !== undefined) {
          setTravel("climb");
          moveToken(who, ladder, true);
          after(CLIMB_MS, () => resolve(who, ladder, steps, landed, "ladder"));
        } else if (snake !== undefined) {
          setTravel("slide");
          moveToken(who, snake, true);
          after(SLIDE_MS, () => resolve(who, snake, steps, landed, "snake"));
        } else {
          resolve(who, landed, steps, landed, event);
        }
      });
    },
    [after, moveToken, reduceMotion, resolve],
  );

  const empty = config.squares.length === 0;
  const busy = rolling || moving || !!popup || paused;

  const roll = useCallback(() => {
    if (busy || winner !== null || empty) return;
    clearTimers();
    if (setupRef.current.sound) playDiceSound();
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
  }, [
    busy,
    winner,
    empty,
    clearTimers,
    pos,
    turn,
    reduceMotion,
    advance,
    after,
  ]);

  const closePopup = useCallback(
    (advanceTurn: boolean) => {
      setPopup(null);
      if (advanceTurn && winner === null) setTurn((t) => (t === 0 ? 1 : 0));
    },
    [winner],
  );

  const finishDare = useCallback(() => {
    if (popup?.kind === "dare" && popup.square) {
      const key = dareKey(popup.square);
      if (key) usedRef.current.add(key);
      const label = popup.square.name.trim() || "the dare";
      pushLog(
        `${displayName(popup.who, setupRef.current.names)} did ${label}.`,
      );
      setStats((prev) => ({ ...prev, daresDone: prev.daresDone + 1 }));
    }
    closePopup(true);
  }, [popup, closePopup, pushLog]);

  const skipDare = useCallback(() => {
    if (popup?.kind !== "dare") return;
    const who = popup.who;
    if ((skips[who] ?? 0) <= 0) return;
    setSkips((prev) => {
      const next: [number, number] = [prev[0], prev[1]];
      next[who] = Math.max(0, (prev[who] ?? 0) - 1);
      return next;
    });
    const label = popup.square?.name.trim() || "the dare";
    pushLog(`${displayName(who, setupRef.current.names)} skipped ${label}.`);
    setStats((prev) => ({ ...prev, skipsUsed: prev.skipsUsed + 1 }));
    closePopup(true);
  }, [popup, skips, closePopup, pushLog]);

  const playAgain = useCallback(() => {
    clearTimers();
    setPos([0, 0]);
    setTurn(0);
    setDie(1);
    setRolling(false);
    setMoving(false);
    setTravel("idle");
    setWinner(null);
    setVisited(new Set());
    setPopup(null);
    setSkips([setupRef.current.skips, setupRef.current.skips]);
    setStats(EMPTY_STATS);
    setLog([]);
    usedRef.current = new Set();
    pausedRef.current = false;
    setPaused(false);
  }, [clearTimers]);

  const startPlay = useCallback((next: GameSetup) => {
    saveSetup(next);
    setSetup(next);
    setSkips([next.skips, next.skips]);
    setPlaying(true);
  }, []);

  const endGame = useCallback(() => {
    pausedRef.current = false;
    setPaused(false);
    playAgain();
  }, [playAgain]);

  useEffect(() => {
    if (!paused) return;
    resumeRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") resumeGame();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [paused, resumeGame]);

  // ── Act 1: the 18+ gate, then a short setup ──────────────────────
  if (!entered) {
    return <AgeGate onEnter={() => setEntered(true)} />;
  }
  if (!hydrated) return null;
  if (!playing) {
    return (
      <div className="flex w-full justify-center">
        <SetupScreen value={setup} onStart={startPlay} />
      </div>
    );
  }

  const current = playerLook(turn, setup.names);
  const boardGrid = {
    gridTemplateColumns: "repeat(10, minmax(0, 1fr))",
    gridTemplateRows: "repeat(10, minmax(0, 1fr))",
  } as const;

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-6 lg:flex-row lg:items-start lg:justify-center lg:gap-8">
      {/* The board */}
      <div className="w-full min-w-0 max-w-2xl lg:flex-1">
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
              containerType: "size",
            }}
          >
            {/* Tiles, then paths, then numbers. Numbers stay above the paths. */}
            <div className="grid h-full w-full" style={boardGrid}>
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

            <div className="absolute inset-0 z-[1]">
              <BoardOverlay />
            </div>

            <div
              className="pointer-events-none absolute inset-0 z-[2] grid"
              style={boardGrid}
            >
              {config.squares.map((sq) => {
                const { row, col } = cellPosition(sq.id);
                return (
                  <BoardLabel key={sq.id} square={sq} row={row} col={col} />
                );
              })}
            </div>

            {/* The two tokens */}
            <div className="pointer-events-none absolute inset-0 z-[3]">
              {pos.map((p, who) =>
                p >= 1 ? (
                  <Token
                    key={who}
                    player={who}
                    square={p}
                    active={who === turn && winner === null}
                    shared={pos[0] === pos[1]}
                    travel={who === turn ? travel : "idle"}
                    reduceMotion={!!reduceMotion}
                  />
                ) : null,
              )}
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="mt-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-base text-[#f6e8ec]">
          <span className="inline-flex items-center gap-1.5">
            <ArrowUp className="size-4 text-[#f2c862]" aria-hidden />
            Heat Rush
          </span>
          <span className="inline-flex items-center gap-1.5">
            <ArrowDown className="size-4 text-[#8ee0b4]" aria-hidden />
            Slow Burn
          </span>
          <span className="inline-flex items-center gap-1">
            <ShieldCheck className="size-4 text-[#9ad7c0]" aria-hidden />
            Safe
          </span>
        </div>
      </div>

      <div className="flex w-full max-w-2xl flex-col items-center gap-5 lg:w-64 lg:max-w-none lg:shrink-0">
        {/* The control rail */}
        <aside className="flex w-full flex-col items-center gap-5">
          {/* Whose turn */}
          <div className="flex w-full items-center justify-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3">
            {[0, 1].map((i) => {
              const pl = playerLook(i, setup.names);
              const acting = i === turn && winner === null;
              return (
                <div
                  key={i}
                  aria-current={acting ? "true" : undefined}
                  className={[
                    "flex flex-1 flex-col items-center gap-1 rounded-xl px-2 py-2 transition-all duration-300",
                    acting ? "scale-[1.04] bg-white/[0.08]" : "opacity-55",
                  ].join(" ")}
                  style={
                    acting
                      ? {
                          boxShadow: `0 0 0 2px ${pl.color}, 0 0 18px ${pl.color}66`,
                        }
                      : undefined
                  }
                >
                  <span className="inline-flex items-center gap-1.5 text-base font-semibold text-white/90">
                    <span
                      className="size-2.5 rounded-full"
                      style={{ background: pl.color }}
                    />
                    {pl.name}
                  </span>
                  <span className="text-sm text-white/70">
                    {(pos[i] ?? 0) >= 1 ? `Square ${pos[i]}` : "Start"}
                  </span>
                  <span
                    className="text-sm text-white/80"
                    aria-label={`${skips[i] ?? 0} skips left`}
                  >
                    {skips[i] ?? 0} {skips[i] === 1 ? "skip" : "skips"}
                  </span>
                  <span
                    aria-hidden
                    className="h-0.5 w-8 rounded-full"
                    style={{ background: acting ? pl.color : "transparent" }}
                  />
                </div>
              );
            })}
          </div>

          {/* The die */}
          <Dice3D value={die} rollNonce={nonce} rolling={rolling} size={62} />

          {winner === null ? (
            <>
              <p className="text-center text-sm text-white/65">
                <span
                  className="font-semibold"
                  style={{ color: current.color }}
                >
                  {current.name}
                </span>
                {busy ? " is moving…" : "'s turn to roll"}
              </p>
              <button
                type="button"
                onClick={roll}
                disabled={busy || empty}
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#ff4d6d] to-[#c81d4e] px-7 py-3 text-sm font-semibold tracking-wide text-white shadow-[0_8px_30px_rgba(200,29,78,0.45)] transition-transform hover:scale-[1.03] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Dices className={`size-4 ${rolling ? "animate-spin" : ""}`} />
                {rolling ? "Rolling…" : "Roll the die"}
              </button>
              <p className="max-w-[14rem] text-center text-sm leading-snug text-white/55">
                {empty
                  ? "Add dares to begin."
                  : "Take turns. First to 100 directs the finale."}
              </p>
            </>
          ) : (
            <button
              type="button"
              onClick={playAgain}
              className="inline-flex min-h-11 items-center gap-1.5 rounded-full px-4 text-base font-medium text-white/80 transition-colors hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              <RotateCcw className="size-4" /> Play again
            </button>
          )}
          <button
            type="button"
            onClick={pauseGame}
            className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full border border-white/25 px-5 text-base font-medium text-[#f6e8ec] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            <Pause className="size-4" aria-hidden />
            Pause / Safe word
          </button>
        </aside>
        <ActivityLog entries={log} />
      </div>

      {/* The reveal */}
      <AnimatePresence>
        {popup && (
          <ResultPopup
            key={`${popup.kind}-${popup.pos}-${popup.who}-${popup.kind === "dare" ? dareKey(popup.square ?? { name: "" }) : ""}`}
            popup={popup}
            assets={assets}
            reduceMotion={!!reduceMotion}
            finale={byId.get(CLIMAX_SQUARE)}
            skipsLeft={popup.kind === "dare" ? (skips[popup.who] ?? 0) : 0}
            paused={paused}
            names={setup.names}
            showTimer={setup.timer}
            stats={stats}
            onContinue={
              popup.kind === "dare" ? finishDare : () => closePopup(true)
            }
            onSkip={skipDare}
            onPause={pauseGame}
            onPlayAgain={playAgain}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {paused && (
          <PauseScreen
            resumeRef={resumeRef}
            reduceMotion={!!reduceMotion}
            onResume={resumeGame}
            onEnd={endGame}
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
  const isClimax = square.id === CLIMAX_SQUARE;
  const [from, to] = meta.tile;

  // Climax square gets a gilded tile; everything else is its heat tier.
  const tileBg = isClimax
    ? "linear-gradient(160deg, rgba(255,255,255,0.45), rgba(255,255,255,0) 42%), linear-gradient(155deg, #ffe49a, #d99a2b)"
    : `linear-gradient(160deg, rgba(255,255,255,0.40), rgba(255,255,255,0) 44%), linear-gradient(155deg, ${from}, ${to})`;

  return (
    <div
      className="relative overflow-hidden"
      style={{
        gridColumnStart: col + 1,
        gridRowStart: row + 1,
        background: tileBg,
        boxShadow: `inset 1px 1px 1px rgba(255,255,255,0.5), inset -1px -1px 2px rgba(0,0,0,0.3)${visited ? `, inset 0 0 7px ${meta.accent}` : ""}`,
      }}
    ></div>
  );
}

/** Square number, safe mark, and finale crown. Painted above the paths. */
function BoardLabel({
  square,
  row,
  col,
}: {
  square: Square;
  row: number;
  col: number;
}) {
  const isSafe = SAFE_SQUARES.has(square.id);
  const isClimax = square.id === CLIMAX_SQUARE;
  // Spicy and wild tiles are dark red. The finale is gilded, so it keeps dark type.
  const onDark =
    !isClimax && (square.heat === "spicy" || square.heat === "wild");
  const ink = onDark ? "#fff7f5" : "#2a0812";
  const chip = onDark ? "#3c0a14" : "#fff6f8";

  return (
    <div
      className="relative"
      style={{
        gridColumnStart: col + 1,
        gridRowStart: row + 1,
        containerType: "size",
      }}
    >
      <span
        className="absolute top-[4%] left-[4%] rounded-sm px-[0.18em] py-[0.02em] font-extrabold leading-none tabular-nums"
        style={{
          fontSize: "clamp(0.7rem, 30cqmin, 1rem)",
          color: ink,
          background: chip,
        }}
      >
        {square.id}
      </span>
      {isClimax && (
        <Crown
          className="absolute top-1/2 left-1/2 h-[38%] w-[38%] -translate-x-1/2 -translate-y-1/2 text-[#5c2a00]"
          aria-hidden
        />
      )}
      {isSafe && (
        <span
          className="absolute right-[4%] bottom-[4%] grid h-[36%] w-[36%] place-items-center rounded-full"
          style={{ background: chip, color: onDark ? "#e9fff6" : "#064e3b" }}
        >
          <ShieldCheck className="h-[70%] w-[70%]" aria-hidden />
        </span>
      )}
    </div>
  );
}

// ── A player's token on the board — a glossy 3D bead ──────────────────
function Token({
  player,
  square,
  active,
  shared,
  travel,
  reduceMotion,
}: {
  player: number;
  square: number;
  active: boolean;
  shared: boolean;
  travel: Travel;
  reduceMotion: boolean;
}) {
  const { x, y } = cellCenter(square);
  const p = PLAYER_TONES[player] ?? PLAYER_TONES[0]!;
  const nudge = shared ? (player === 0 ? -2.2 : 2.2) : 0;
  const duration = reduceMotion
    ? 0
    : travel === "climb"
      ? CLIMB_MS / 1000
      : travel === "slide"
        ? SLIDE_MS / 1000
        : HOP_MS / 1000;

  return (
    <motion.div
      className="absolute top-0 left-0 h-full w-full"
      initial={false}
      animate={{ x: `${x + nudge}%`, y: `${y}%` }}
      transition={{ duration, ease: travel === "slide" ? "easeIn" : "easeOut" }}
    >
      <div
        className="absolute top-0 left-0"
        style={{ transform: "translate(-50%, -58%)" }}
      >
        <div
          className="relative"
          style={{
            width: "clamp(1.35rem, 6cqmin, 2.15rem)",
            height: "clamp(1.35rem, 6cqmin, 2.15rem)",
          }}
        >
          <span className="absolute top-[86%] left-1/2 block h-[18%] w-[72%] -translate-x-1/2 rounded-full bg-black/50 blur-[2px]" />
          <motion.span
            key={travel === "hop" ? `hop-${square}` : "rest"}
            animate={
              !reduceMotion && travel === "hop"
                ? { y: [0, -8, 0] }
                : !reduceMotion && active && travel === "idle"
                  ? { y: [0, -3, 0] }
                  : { y: 0 }
            }
            transition={
              travel === "hop"
                ? { duration: HOP_MS / 1000, ease: "easeOut" }
                : {
                    duration: 1.1,
                    repeat:
                      active && travel === "idle" && !reduceMotion
                        ? Infinity
                        : 0,
                    ease: "easeInOut",
                  }
            }
            className="absolute inset-0 block rounded-full"
            style={{
              background: `radial-gradient(circle at 34% 28%, #ffffff 0%, ${p.color} 46%, ${p.dark} 100%)`,
              boxShadow: `0 3px 6px rgba(0,0,0,0.5), 0 0 0 2px #fff, inset 0 -2px 3px rgba(0,0,0,0.35), inset 0 2px 2px rgba(255,255,255,0.75)${active ? `, 0 0 12px ${p.color}` : ""}`,
            }}
          />
        </div>
      </div>
    </motion.div>
  );
}

// ── The reveal — pops over the board; the couple read it, then continue ──
function ResultPopup({
  popup,
  reduceMotion,
  finale,
  skipsLeft,
  paused,
  names,
  showTimer,
  stats,
  onContinue,
  onSkip,
  onPause,
  onPlayAgain,
  assets,
}: {
  popup: Popup;
  reduceMotion: boolean;
  finale: Square | undefined;
  skipsLeft: number;
  paused: boolean;
  names: [string, string];
  showTimer: boolean;
  stats: GameStats;
  onContinue: () => void;
  onSkip: () => void;
  onPause: () => void;
  onPlayAgain: () => void;
  assets?: Record<string, string>;
}) {
  const player = playerLook(popup.who, names);
  const wide = useWidePanel();
  const enter = reduceMotion
    ? { opacity: 0 }
    : wide
      ? { opacity: 0, x: 28 }
      : { opacity: 0, y: 28 };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-[90] flex items-end bg-[#12060c]/45 lg:items-stretch lg:justify-end"
      role="dialog"
      aria-modal="true"
      aria-labelledby="snl-dare-title"
    >
      <motion.div
        initial={enter}
        animate={{ opacity: 1, x: 0, y: 0 }}
        exit={
          reduceMotion
            ? { opacity: 0 }
            : wide
              ? { opacity: 0, x: 24 }
              : { opacity: 0, y: 20 }
        }
        transition={{ type: "spring", stiffness: 260, damping: 28 }}
        className="relative flex max-h-[86dvh] w-full flex-col overflow-y-auto rounded-t-3xl border border-white/15 px-6 py-7 text-center shadow-[0_24px_60px_rgba(0,0,0,0.45)] lg:max-h-none lg:h-full lg:max-w-md lg:justify-center lg:rounded-none lg:border-y-0 lg:border-r-0 lg:px-8"
        style={{ background: cardBg(popup) }}
      >
        <p className="sr-only" aria-live="polite">
          {popup.kind === "dare"
            ? `Square ${popup.pos}. ${popup.square?.name ?? ""}. ${popup.square?.note ?? ""}`
            : popup.kind === "safe"
              ? `Safe square ${popup.pos}.`
              : `${player.name} reaches 100.`}
        </p>
        {popup.kind === "win" ? (
          <WinBody
            who={popup.who}
            names={names}
            finale={finale}
            stats={stats}
            reduceMotion={reduceMotion}
          />
        ) : popup.kind === "safe" ? (
          <SafeBody player={player} pos={popup.pos} />
        ) : (
          <DareBody
            player={player}
            pos={popup.pos}
            event={popup.event}
            square={popup.square}
            assets={assets}
            reduceMotion={reduceMotion}
            paused={paused}
            showTimer={showTimer}
          />
        )}

        <div className="relative mt-6 flex flex-col gap-3">
          {popup.kind === "win" ? (
            <>
              <button
                type="button"
                onClick={onPlayAgain}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-white px-7 text-base font-semibold text-[#7e1426] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7e1426]"
              >
                <RotateCcw className="size-4" /> Play again
              </button>
              <Link
                href={ROUTES.snakesAndLoversBuild}
                className="inline-flex min-h-11 items-center justify-center rounded-full border border-white/30 px-5 text-base font-medium text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                Edit dares
              </Link>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={onContinue}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-white/95 px-7 text-base font-semibold text-[#7e1426] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7e1426]"
              >
                Done
              </button>
              {popup.kind === "dare" && (
                <button
                  type="button"
                  onClick={onSkip}
                  disabled={skipsLeft <= 0}
                  className="inline-flex min-h-11 items-center justify-center rounded-full border border-white/30 px-5 text-base font-medium text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {skipsLeft > 0 ? `Skip · ${skipsLeft} left` : "No skips left"}
                </button>
              )}
              <button
                type="button"
                onClick={onPause}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-white/25 px-5 text-base font-medium text-[#f6e8ec] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                <Pause className="size-4" aria-hidden />
                Pause
              </button>
            </>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

function useWidePanel() {
  const [wide, setWide] = useState(false);
  useEffect(() => {
    const query = window.matchMedia("(min-width: 1024px)");
    const apply = () => setWide(query.matches);
    apply();
    query.addEventListener("change", apply);
    return () => query.removeEventListener("change", apply);
  }, []);
  return wide;
}

function cardBg(popup: Popup): string {
  if (popup.kind === "win")
    return "linear-gradient(155deg, #3d0a16 0%, #8a0f1d 100%)";
  if (popup.kind === "safe")
    return "linear-gradient(155deg, #10261f 0%, #163a2e 100%)";
  return HEAT_META[popup.square?.heat ?? "flirty"].card;
}

function DareBody({
  player,
  pos,
  event,
  square,
  reduceMotion,
  paused,
  showTimer,
  assets,
}: {
  player: PlayerLook;
  pos: number;
  event: EventKind;
  square: Square | undefined;
  reduceMotion: boolean;
  paused: boolean;
  showTimer: boolean;
  assets?: Record<string, string>;
}) {
  const heat = square?.heat ?? "flirty";
  const meta = HEAT_META[heat];
  const named = (square?.name ?? "").trim().length > 0;
  const seconds = dareSeconds(square?.note);
  return (
    <>
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -top-12 left-1/2 h-40 w-40 -translate-x-1/2 rounded-full blur-3xl"
        style={{ background: meta.glow }}
        animate={
          reduceMotion ? {} : { scale: [0.8, 1.15, 1], opacity: [0.6, 1, 0.85] }
        }
        transition={{ duration: 0.8 }}
      />
      <div className="relative flex items-center justify-between gap-3">
        <span
          className="text-sm font-medium tracking-[0.14em] uppercase"
          style={{ color: player.color }}
        >
          {player.name}
        </span>
        {showTimer && seconds !== null && (
          <TimerRing seconds={seconds} paused={paused} />
        )}
      </div>

      <p className="relative mt-3 text-base font-medium text-white/80">
        Square {pos}
        {event === "ladder"
          ? " · Heat Rush"
          : event === "snake"
            ? " · Slow Burn"
            : event === "bounce"
              ? " · Bounced back"
              : ""}
      </p>

      {named ? (
        <>
          <motion.h3
            id="snl-dare-title"
            initial={reduceMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: 0.1,
              type: "spring",
              stiffness: 260,
              damping: 20,
            }}
            className="relative mt-2 font-display text-3xl leading-tight text-white sm:text-4xl"
          >
            {square!.name}
          </motion.h3>
          <CatalogImage fileId={square?.image?.fileId} assets={assets} />
        </>
      ) : (
        <p
          id="snl-dare-title"
          className="relative mt-2 text-base text-white/70"
        >
          This square is still blank — add a dare to it in the builder.
        </p>
      )}

      {named && square?.note && (
        <motion.p
          initial={reduceMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="relative mt-3 text-base leading-relaxed text-white/80"
        >
          {square.note}
        </motion.p>
      )}

      <div className="relative mt-4 flex items-center justify-center gap-2">
        <Flames heat={heat} className="[&_svg]:size-5" />
        <span className="text-base font-medium text-white">{meta.label}</span>
      </div>
    </>
  );
}

function TimerRing({ seconds, paused }: { seconds: number; paused: boolean }) {
  const [left, setLeft] = useState(seconds);
  const leftRef = useRef(seconds);

  useEffect(() => {
    if (paused || leftRef.current <= 0) return;
    const id = setInterval(() => {
      leftRef.current = Math.max(0, leftRef.current - 1);
      setLeft(leftRef.current);
    }, 1000);
    return () => clearInterval(id);
  }, [paused]);

  const radius = 16;
  const circumference = 2 * Math.PI * radius;
  const progress = left / seconds;

  return (
    <div
      className="relative grid size-12 shrink-0 place-items-center"
      aria-hidden
    >
      <svg viewBox="0 0 40 40" className="absolute inset-0 -rotate-90">
        <circle
          cx="20"
          cy="20"
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.2)"
          strokeWidth="3"
        />
        <circle
          cx="20"
          cy="20"
          r={radius}
          fill="none"
          stroke="#fff7f5"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - progress)}
        />
      </svg>
      <span className="text-sm font-semibold text-white">{left}</span>
    </div>
  );
}

function SafeBody({ player, pos }: { player: PlayerLook; pos: number }) {
  return (
    <>
      <span className="relative mx-auto grid size-12 place-items-center rounded-full bg-white/10 text-[#9ad7c0]">
        <ShieldCheck className="size-6" />
      </span>
      <p
        className="relative mt-3 text-[0.6rem] font-medium tracking-[0.16em] uppercase"
        style={{ color: player.color }}
      >
        {player.name} · Square {pos}
      </p>
      <h3
        id="snl-dare-title"
        className="relative mt-1 font-display text-3xl text-white"
      >
        Safe square
      </h3>
      <p className="relative mt-2 text-base leading-relaxed text-white/80">
        Catch your breath. Check in with each other — is everyone still a yes?
        The safe word always wins. When you{"'"}re both ready, carry on up.
      </p>
    </>
  );
}

function WinBody({
  who,
  names,
  finale,
  stats,
  reduceMotion,
}: {
  who: number;
  names: [string, string];
  finale: Square | undefined;
  stats: GameStats;
  reduceMotion: boolean;
}) {
  const player = playerLook(who, names);
  const slide =
    stats.biggestSlide > 0 ? `${stats.biggestSlide} squares` : "No slides";
  return (
    <>
      <motion.span
        className="relative mx-auto grid size-14 place-items-center rounded-full bg-gradient-to-br from-[#ff4d6d] to-[#c81d4e] text-white shadow-lg"
        animate={
          reduceMotion ? {} : { scale: [0.8, 1.1, 1], rotate: [0, -8, 0] }
        }
        transition={{ duration: 0.6 }}
      >
        <Crown className="size-7" />
      </motion.span>
      <p
        className="relative mt-3 text-base font-medium"
        style={{ color: player.color }}
      >
        {player.name} reaches 100
      </p>
      <h3
        id="snl-dare-title"
        className="relative mt-1 font-display text-3xl leading-tight text-white"
      >
        {finale?.name?.trim() || "Climax"}
      </h3>
      <p className="relative mt-2 text-base leading-relaxed text-white/80">
        {finale?.note?.trim() ||
          "You made it to the top. The winner directs the finale — and it's for the two of you."}
      </p>
      <dl className="relative mt-5 grid grid-cols-2 gap-x-4 gap-y-3 text-left text-base text-white">
        <div>
          <dt className="text-white/65">Dares done</dt>
          <dd className="font-semibold">{stats.daresDone}</dd>
        </div>
        <div>
          <dt className="text-white/65">Skips used</dt>
          <dd className="font-semibold">{stats.skipsUsed}</dd>
        </div>
        <div>
          <dt className="text-white/65">Biggest slide</dt>
          <dd className="font-semibold">{slide}</dd>
        </div>
        <div>
          <dt className="text-white/65">Moves</dt>
          <dd className="font-semibold">{stats.moves}</dd>
        </div>
      </dl>
      <div className="relative mt-4 flex items-center justify-center">
        <Flames heat="wild" />
      </div>
    </>
  );
}

function ActivityLog({ entries }: { entries: LogEntry[] }) {
  const [open, setOpen] = useState(false);
  const touched = useRef(false);

  useEffect(() => {
    const query = window.matchMedia("(min-width: 1024px)");
    if (query.matches && !touched.current) setOpen(true);
  }, []);

  return (
    <section className="w-full rounded-2xl border border-white/10 bg-white/[0.04]">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => {
          touched.current = true;
          setOpen((value) => !value);
        }}
        className="flex min-h-11 w-full items-center justify-between px-4 text-base font-medium text-[#f6e8ec] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
      >
        Activity log
        <ChevronDown
          className={[
            "size-4 transition-transform",
            open ? "rotate-180" : "",
          ].join(" ")}
          aria-hidden
        />
      </button>
      {open && (
        <ol className="max-h-64 space-y-2 overflow-y-auto px-4 pb-4 text-base leading-snug text-white/75">
          {entries.length === 0 ? (
            <li>Rolls and dares will show up here.</li>
          ) : (
            entries.map((entry) => <li key={entry.id}>{entry.text}</li>)
          )}
        </ol>
      )}
    </section>
  );
}

function PauseScreen({
  resumeRef,
  reduceMotion,
  onResume,
  onEnd,
}: {
  resumeRef: RefObject<HTMLButtonElement | null>;
  reduceMotion: boolean;
  onResume: () => void;
  onEnd: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: reduceMotion ? 0 : 0.2 }}
      className="fixed inset-0 z-[100] grid place-items-center bg-[#140810]/75 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="snl-pause-title"
    >
      <div className="w-full max-w-sm rounded-3xl border border-white/10 bg-[#241018] px-7 py-10 text-center">
        <h2 id="snl-pause-title" className="font-display text-3xl text-white">
          Paused
        </h2>
        <p className="mt-3 text-base leading-relaxed text-white/80">
          Take a breath. Nothing happens until you both want to go on.
        </p>
        <div className="mt-8 flex flex-col gap-3">
          <button
            ref={resumeRef}
            type="button"
            onClick={onResume}
            className="inline-flex min-h-11 items-center justify-center rounded-full bg-white px-7 text-base font-semibold text-[#3d1220] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3d1220]"
          >
            Resume
          </button>
          <button
            type="button"
            onClick={onEnd}
            className="inline-flex min-h-11 items-center justify-center rounded-full border border-white/25 px-7 text-base font-medium text-[#f6e8ec] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            End game
          </button>
        </div>
      </div>
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
