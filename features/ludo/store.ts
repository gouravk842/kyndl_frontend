import { create } from "zustand";

import { DEFAULT_ACTIVITIES } from "./data/activities";
import { LAST_POS, type SeatId } from "./lib/board";
import { SEAT_COLORS } from "./lib/colors";
import { confettiBurst } from "./lib/confetti";
import {
  botPickToken,
  capturesAt,
  destinationFor,
  isFinishMove,
  isStarPos,
  movableTokens,
  rollDie,
  waypointsFor,
} from "./lib/engine";
import {
  playCapture,
  playDice,
  playHome,
  playStar,
  playStep,
  playWin,
  setMuted,
} from "./lib/sound";
import type {
  ActivityConfig,
  ActivityPrompt,
  ActivityTrigger,
  GameConfig,
  GameState,
  PendingMove,
  Player,
} from "./types";

/** Timing (ms). Tuned to feel like physical play without dragging. */
const DICE_ROLL_MS = 750;
const STEP_MS = 165; // per-cell hop
const SETTLE_MS = 140; // pause after a token lands
const BOT_THINK_MS = 650;
const PASS_MS = 800;

interface LudoStore extends GameState {
  muted: boolean;
  /** Active hop the renderer should play before the next interaction. */
  pendingMove: PendingMove | null;
  /** Bonus/extra turn earned, applied after any activity is dismissed. */
  _pendingExtra: boolean;

  startGame: (config: GameConfig) => void;
  resetToSetup: () => void;
  rematch: () => void;
  roll: () => void;
  selectToken: (tokenIndex: number) => void;
  dismissActivity: () => void;
  toggleMuted: () => void;
}

function buildPlayers(config: GameConfig): Player[] {
  return config.players.map((p) => ({
    seat: p.seat,
    name: p.name,
    color: p.color,
    isBot: p.isBot,
    tokens: [0, 1, 2, 3].map((index) => ({ index, pos: -1 })),
  }));
}

function drawActivity(
  cfg: ActivityConfig,
  trigger: ActivityTrigger,
  seat: SeatId,
): ActivityPrompt | null {
  if (!cfg.enabled || !cfg.triggers[trigger]) return null;
  const pool =
    cfg.intensity === "mixed"
      ? [...cfg.decks.sweet, ...cfg.decks.fun, ...cfg.decks.spicy]
      : cfg.decks[cfg.intensity];
  const clean = pool.filter((s) => s.trim().length > 0);
  if (clean.length === 0) return null;
  const text = clean[Math.floor(Math.random() * clean.length)]!;
  return {
    id: `${trigger}-${seat}-${Date.now()}-${Math.floor(Math.random() * 1e4)}`,
    trigger,
    seat,
    text,
  };
}

const INITIAL: GameState = {
  phase: "setup",
  players: [],
  config: { players: [], activities: DEFAULT_ACTIVITIES },
  turn: 0,
  dice: null,
  diceRolling: false,
  busy: false,
  movable: [],
  sixStreak: 0,
  finishOrder: [],
  activity: null,
  message: "",
};

export const useLudoStore = create<LudoStore>((set, get) => {
  /** Name of the player at turn index, for status copy. */
  const nameAt = (turn: number) => get().players[turn]?.name ?? "Player";

  /** Schedule a bot's roll if it's a bot's turn and the board is idle. */
  const maybeBotRoll = () => {
    const s = get();
    if (s.phase !== "playing" || s.activity || s.busy) return;
    const p = s.players[s.turn];
    if (p?.isBot && s.dice === null) {
      window.setTimeout(() => {
        const cur = get();
        if (cur.phase === "playing" && !cur.activity && !cur.busy) cur.roll();
      }, BOT_THINK_MS);
    }
  };

  /** Advance to the next seat still in the game (or grant a bonus turn). */
  const endStep = (extraTurn: boolean) => {
    const s = get();
    const remaining = s.players.filter(
      (p) => !p.tokens.every((t) => t.pos >= LAST_POS),
    );
    if (remaining.length <= 1) {
      set({ phase: "finished", dice: null, movable: [], busy: false });
      playWin();
      confettiBurst(90, 0.35);
      return;
    }

    if (extraTurn) {
      const p = s.players[s.turn]!;
      set({
        dice: null,
        movable: [],
        busy: false,
        message: `${p.name} earned a bonus roll!`,
      });
      maybeBotRoll();
      return;
    }

    // Pass to the next non-finished seat.
    let next = s.turn;
    for (let i = 0; i < s.players.length; i++) {
      next = (next + 1) % s.players.length;
      const np = s.players[next]!;
      if (!np.tokens.every((t) => t.pos >= LAST_POS)) break;
    }
    set({
      turn: next,
      dice: null,
      movable: [],
      sixStreak: 0,
      busy: false,
      message: `${nameAt(next)}'s turn — roll the dice.`,
    });
    maybeBotRoll();
  };

  /** Resolve captures / finishes / activities once a token has landed. */
  const resolveLanding = (seat: SeatId, tokenIndex: number, dest: number) => {
    const s = get();
    const cfg = s.config.activities;

    // Apply captures.
    const caps = capturesAt(s.players, seat, dest);
    let players = s.players;
    if (caps.length > 0) {
      players = players.map((p) => {
        const hit = caps.filter((c) => c.seat === p.seat);
        if (hit.length === 0) return p;
        return {
          ...p,
          tokens: p.tokens.map((t) =>
            hit.some((c) => c.tokenIndex === t.index) ? { ...t, pos: -1 } : t,
          ),
        };
      });
      playCapture();
      confettiBurst(20, 0.45);
    }

    const finished = isFinishMove(dest);
    if (finished) playHome();

    const me = players.find((p) => p.seat === seat)!;
    const justWon = me.tokens.every((t) => t.pos >= LAST_POS);
    const finishOrder =
      justWon && !s.finishOrder.includes(seat)
        ? [...s.finishOrder, seat]
        : s.finishOrder;

    // Decide if an activity card is drawn (priority: capture > home > star).
    let trigger: ActivityTrigger | null = null;
    if (caps.length > 0) trigger = "capture";
    else if (finished) trigger = "home";
    else if (isStarPos(seat, dest)) {
      trigger = "star";
      playStar();
    }
    const activity = trigger ? drawActivity(cfg, trigger, seat) : null;

    const extraTurn = s.dice === 6 || caps.length > 0 || finished;

    const colorLabel = SEAT_COLORS[me.color].label;
    let message = `${me.name} moved.`;
    if (caps.length > 0) message = `${me.name} sent a token home! 💥`;
    else if (finished) message = `${me.name} brought ${colorLabel} home! 🏠`;
    else if (trigger === "star") message = `${me.name} hit a star ⭐`;

    set({
      players,
      finishOrder,
      pendingMove: null,
      activity,
      _pendingExtra: extraTurn,
      message,
    });

    if (activity) return; // wait for dismissActivity to continue
    endStep(extraTurn);
  };

  /** Run a selected token's move: animate, then resolve. */
  const runMove = (tokenIndex: number) => {
    const s = get();
    const player = s.players[s.turn]!;
    const token = player.tokens.find((t) => t.index === tokenIndex)!;
    const dice = s.dice!;
    const dest = destinationFor(token.pos, dice);
    if (dest === null) return;

    const waypoints = waypointsFor(token.pos, dest);

    // Commit the new position immediately; the renderer animates the hop using
    // the waypoint list, then we resolve once it has visually arrived.
    set({
      busy: true,
      movable: [],
      pendingMove: { seat: player.seat, tokenIndex, waypoints },
      players: s.players.map((p) =>
        p.seat === player.seat
          ? {
              ...p,
              tokens: p.tokens.map((t) =>
                t.index === tokenIndex ? { ...t, pos: dest } : t,
              ),
            }
          : p,
      ),
    });

    // Footstep ticks per hop.
    waypoints.forEach((_, i) => window.setTimeout(playStep, i * STEP_MS));

    const total = waypoints.length * STEP_MS + SETTLE_MS;
    window.setTimeout(
      () => resolveLanding(player.seat, tokenIndex, dest),
      total,
    );
  };

  return {
    ...INITIAL,
    muted: false,
    pendingMove: null,
    _pendingExtra: false,

    startGame: (config) => {
      set({
        ...INITIAL,
        config,
        players: buildPlayers(config),
        phase: "playing",
        turn: 0,
        message: `${config.players[0]?.name ?? "Player"}'s turn — roll the dice.`,
      });
      maybeBotRoll();
    },

    resetToSetup: () => set({ ...INITIAL, config: get().config }),

    rematch: () => get().startGame(get().config),

    toggleMuted: () =>
      set((st) => {
        const muted = !st.muted;
        setMuted(muted);
        return { muted };
      }),

    roll: () => {
      const s = get();
      if (s.phase !== "playing" || s.busy || s.diceRolling || s.activity)
        return;
      if (s.dice !== null) return; // already rolled, must move first

      set({ diceRolling: true, message: "Rolling…" });
      playDice();

      window.setTimeout(() => {
        const value = rollDie();
        const cur = get();
        const player = cur.players[cur.turn]!;
        const streak = value === 6 ? cur.sixStreak + 1 : 0;

        // Three sixes in a row forfeits the turn (and may draw a dare).
        if (streak >= 3) {
          const activity = drawActivity(
            cur.config.activities,
            "sixes",
            player.seat,
          );
          set({
            dice: value,
            diceRolling: false,
            sixStreak: 0,
            movable: [],
            activity,
            _pendingExtra: false,
            message: `${player.name} rolled three sixes — turn forfeited!`,
          });
          if (!activity) window.setTimeout(() => endStep(false), PASS_MS);
          return;
        }

        const movable = movableTokens(player, value);
        set({ dice: value, diceRolling: false, sixStreak: streak, movable });

        if (movable.length === 0) {
          set({
            message:
              value === 6
                ? `${player.name} rolled a 6 but has no move.`
                : `No moves for ${player.name}.`,
          });
          window.setTimeout(() => endStep(false), PASS_MS);
          return;
        }

        if (movable.length === 1) {
          window.setTimeout(() => get().selectToken(movable[0]!), SETTLE_MS);
          return;
        }

        // Multiple options: a bot decides; a human is prompted to tap a token.
        if (player.isBot) {
          const pick = botPickToken(cur.players, player, value, movable);
          window.setTimeout(() => get().selectToken(pick), BOT_THINK_MS);
        } else {
          set({ message: `${player.name}, tap a token to move ${value}.` });
        }
      }, DICE_ROLL_MS);
    },

    selectToken: (tokenIndex) => {
      const s = get();
      if (s.busy || s.activity || s.dice === null) return;
      if (!s.movable.includes(tokenIndex)) return;
      runMove(tokenIndex);
    },

    dismissActivity: () => {
      const s = get();
      if (!s.activity) return;
      const extra = s._pendingExtra;
      set({ activity: null, _pendingExtra: false });
      endStep(extra);
    },
  };
});
