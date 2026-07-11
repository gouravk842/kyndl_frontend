"use client";

import { useState } from "react";

import {
  DEFAULT_ACTIVITIES,
  INTENSITY_LABELS,
  TRIGGER_LABELS,
} from "../data/activities";
import { type SeatId } from "../lib/board";
import { SEAT_COLOR_ORDER, SEAT_COLORS } from "../lib/colors";
import { useLudoStore } from "../store";
import type {
  ActivityConfig,
  ActivityIntensity,
  ActivityTrigger,
  GameConfig,
  SeatColorKey,
} from "../types";

/** Seats used per player count (2-player sits diagonally). */
const SEATS_FOR: Record<number, SeatId[]> = {
  2: [0, 2],
  3: [0, 1, 2],
  4: [0, 1, 2, 3],
};

interface Draft {
  name: string;
  color: SeatColorKey;
  isBot: boolean;
}

const DEFAULT_DRAFTS: Draft[] = [
  { name: "You", color: "rose", isBot: false },
  { name: "Partner", color: "teal", isBot: false },
  { name: "Player 3", color: "amber", isBot: true },
  { name: "Player 4", color: "plum", isBot: true },
];

export function SetupPanel() {
  const startGame = useLudoStore((s) => s.startGame);

  const [count, setCount] = useState(2);
  const [drafts, setDrafts] = useState<Draft[]>(DEFAULT_DRAFTS);
  const [activities, setActivities] = useState<ActivityConfig>(() =>
    structuredCloneConfig(DEFAULT_ACTIVITIES),
  );

  const updateDraft = (i: number, patch: Partial<Draft>) =>
    setDrafts((d) => d.map((x, idx) => (idx === i ? { ...x, ...patch } : x)));

  const pickColor = (i: number, color: SeatColorKey) => {
    setDrafts((d) => {
      const taker = d.findIndex((x, idx) => idx !== i && x.color === color);
      return d.map((x, idx) => {
        if (idx === i) return { ...x, color };
        if (idx === taker) return { ...x, color: d[i]!.color }; // swap to keep unique
        return x;
      });
    });
  };

  const setDeck = (key: ActivityIntensity, text: string) =>
    setActivities((a) => ({
      ...a,
      decks: { ...a.decks, [key]: text.split("\n") },
    }));

  const toggleTrigger = (t: ActivityTrigger) =>
    setActivities((a) => ({
      ...a,
      triggers: { ...a.triggers, [t]: !a.triggers[t] },
    }));

  const start = () => {
    const seats = SEATS_FOR[count]!;
    const config: GameConfig = {
      players: seats.map((seat, i) => ({
        seat,
        name: drafts[i]!.name.trim() || `Player ${i + 1}`,
        color: drafts[i]!.color,
        isBot: drafts[i]!.isBot,
      })),
      activities: {
        ...activities,
        decks: {
          sweet: activities.decks.sweet.map((s) => s.trim()).filter(Boolean),
          fun: activities.decks.fun.map((s) => s.trim()).filter(Boolean),
          spicy: activities.decks.spicy.map((s) => s.trim()).filter(Boolean),
        },
      },
    };
    startGame(config);
  };

  return (
    <div className="mx-auto w-full max-w-2xl">
      <div className="kyndl-card-soft rounded-3xl border border-[#F4DDD0] bg-white/90 p-5 sm:p-7">
        {/* Players */}
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-display text-xl text-[#3A2A25]">Players</h2>
            <div className="flex rounded-full border border-[#F2DACE] bg-[#FFF7F1] p-1">
              {[2, 3, 4].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setCount(n)}
                  className={`h-8 w-9 rounded-full text-sm transition-colors ${
                    count === n
                      ? "bg-gradient-to-r from-[#FF7A59] to-[#F2596F] font-medium text-white"
                      : "text-[#92786C] hover:text-[#3A2A25]"
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2.5">
            {drafts.slice(0, count).map((d, i) => {
              const color = SEAT_COLORS[d.color];
              return (
                <div
                  key={i}
                  className="flex flex-wrap items-center gap-2 rounded-2xl border border-[#F1E0D2] bg-white p-2.5"
                >
                  <span
                    className="h-7 w-7 shrink-0 rounded-full"
                    style={{
                      background: `radial-gradient(circle at 32% 28%, ${color.light}, ${color.base} 60%, ${color.shade})`,
                    }}
                  />
                  <input
                    value={d.name}
                    onChange={(e) => updateDraft(i, { name: e.target.value })}
                    maxLength={14}
                    className="min-w-0 flex-1 rounded-lg border border-[#F1E0D2] bg-[#FFFDFB] px-3 py-1.5 text-sm text-[#3A2A25] outline-none focus:border-[#FF7A59]"
                    placeholder={`Player ${i + 1}`}
                  />
                  <div className="flex gap-1">
                    {SEAT_COLOR_ORDER.map((key) => {
                      const c = SEAT_COLORS[key];
                      const selected = d.color === key;
                      return (
                        <button
                          key={key}
                          type="button"
                          aria-label={c.label}
                          onClick={() => pickColor(i, key)}
                          className="h-6 w-6 rounded-full transition-transform hover:scale-110"
                          style={{
                            background: c.base,
                            outline: selected ? `2px solid ${c.shade}` : "none",
                            outlineOffset: 2,
                          }}
                        />
                      );
                    })}
                  </div>
                  <button
                    type="button"
                    onClick={() => updateDraft(i, { isBot: !d.isBot })}
                    className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                      d.isBot
                        ? "bg-[#FFF1E9] text-[#C75B39]"
                        : "bg-[#F4F1EE] text-[#92786C]"
                    }`}
                  >
                    {d.isBot ? "🤖 CPU" : "🧑 Human"}
                  </button>
                </div>
              );
            })}
          </div>
        </section>

        {/* Couple activities */}
        <section className="mt-6">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h2 className="font-display text-xl text-[#3A2A25]">
                Couple activities
              </h2>
              <p className="text-xs text-[#92786C]">
                Draw a card when special moments happen on the board.
              </p>
            </div>
            <Toggle
              on={activities.enabled}
              onClick={() =>
                setActivities((a) => ({ ...a, enabled: !a.enabled }))
              }
            />
          </div>

          {activities.enabled && (
            <div className="space-y-4">
              {/* triggers */}
              <div className="grid grid-cols-2 gap-2">
                {(Object.keys(TRIGGER_LABELS) as ActivityTrigger[]).map((t) => {
                  const meta = TRIGGER_LABELS[t];
                  const on = activities.triggers[t];
                  return (
                    <button
                      key={t}
                      type="button"
                      onClick={() => toggleTrigger(t)}
                      className={`flex items-start gap-2 rounded-2xl border p-2.5 text-left transition-colors ${
                        on
                          ? "border-[#FF7A59]/45 bg-[#FFF6F1]"
                          : "border-[#F0E2D5] bg-white opacity-70"
                      }`}
                    >
                      <span className="text-lg leading-none">{meta.emoji}</span>
                      <span className="min-w-0">
                        <span className="block text-sm font-medium text-[#3A2A25]">
                          {meta.title}
                        </span>
                        <span className="block text-[11px] leading-tight text-[#92786C]">
                          {meta.hint}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* intensity */}
              <div>
                <p className="mb-1.5 text-xs font-medium tracking-wide text-[#92786C] uppercase">
                  Card mood
                </p>
                <div className="flex flex-wrap gap-2">
                  {(["sweet", "fun", "spicy", "mixed"] as const).map((key) => {
                    const meta = INTENSITY_LABELS[key];
                    const active = activities.intensity === key;
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() =>
                          setActivities((a) => ({ ...a, intensity: key }))
                        }
                        className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${
                          active
                            ? "border-transparent bg-gradient-to-r from-[#FF7A59] to-[#F2596F] font-medium text-white"
                            : "border-[#F2DACE] bg-white text-[#7A6258] hover:border-[#FF7A59]/50"
                        }`}
                      >
                        {meta.emoji} {meta.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* deck editing */}
              <details className="group rounded-2xl border border-[#F0E2D5] bg-[#FFFDFB] p-3">
                <summary className="cursor-pointer list-none text-sm font-medium text-[#3A2A25]">
                  ✏️ Edit the cards
                  <span className="ml-1 text-xs text-[#92786C]">
                    (one per line)
                  </span>
                </summary>
                <div className="mt-3 space-y-3">
                  {(["sweet", "fun", "spicy"] as ActivityIntensity[]).map(
                    (key) => (
                      <div key={key}>
                        <label className="mb-1 block text-xs font-medium text-[#92786C]">
                          {INTENSITY_LABELS[key].emoji}{" "}
                          {INTENSITY_LABELS[key].label} deck
                        </label>
                        <textarea
                          value={activities.decks[key].join("\n")}
                          onChange={(e) => setDeck(key, e.target.value)}
                          rows={4}
                          className="w-full resize-y rounded-xl border border-[#F1E0D2] bg-white px-3 py-2 text-sm text-[#3A2A25] outline-none focus:border-[#FF7A59]"
                        />
                      </div>
                    ),
                  )}
                </div>
              </details>
            </div>
          )}
        </section>

        <button
          type="button"
          onClick={start}
          className="mt-6 inline-flex h-12 w-full items-center justify-center rounded-full bg-gradient-to-r from-[#FF7A59] to-[#F2596F] text-base font-semibold text-white kyndl-glow-warm transition-transform hover:-translate-y-0.5"
        >
          Start the game →
        </button>
      </div>
    </div>
  );
}

function Toggle({ on, onClick }: { on: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={onClick}
      className={`relative h-7 w-12 rounded-full transition-colors ${
        on ? "bg-gradient-to-r from-[#FF7A59] to-[#F2596F]" : "bg-[#E7D8CB]"
      }`}
    >
      <span
        className="absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-all"
        style={{ left: on ? "calc(100% - 1.625rem)" : "0.125rem" }}
      />
    </button>
  );
}

/** Deep-ish clone so editing local decks never mutates the shared default. */
function structuredCloneConfig(c: ActivityConfig): ActivityConfig {
  return {
    ...c,
    triggers: { ...c.triggers },
    decks: {
      sweet: [...c.decks.sweet],
      fun: [...c.decks.fun],
      spicy: [...c.decks.spicy],
    },
  };
}
