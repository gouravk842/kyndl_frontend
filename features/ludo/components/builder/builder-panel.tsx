"use client";

import { Eye } from "lucide-react";

import {
  BuilderShell,
  type BuilderTab,
} from "@/features/dashboard/components/builder-shell";
import type { LudoSync } from "@/hooks/use-ludo-sync";

import {
  DEFAULT_ACTIVITIES,
  INTENSITY_LABELS,
  TRIGGER_LABELS,
} from "../../data/activities";
import { SEAT_COLOR_ORDER, SEAT_COLORS } from "../../lib/colors";
import { useBuilderStore } from "../../store/builder.store";
import type { ActivityIntensity, ActivityTrigger } from "../../types";

export function BuilderPanel({
  sync,
  onPreview,
  className,
}: {
  sync: LudoSync;
  onPreview?: () => void;
  className?: string;
}) {
  const doc = useBuilderStore((s) => s.doc);
  const setMeta = useBuilderStore((s) => s.setMeta);
  const setCount = useBuilderStore((s) => s.setCount);
  const updatePlayer = useBuilderStore((s) => s.updatePlayer);
  const setPlayerColor = useBuilderStore((s) => s.setPlayerColor);
  const setActivitiesEnabled = useBuilderStore((s) => s.setActivitiesEnabled);
  const setIntensity = useBuilderStore((s) => s.setIntensity);
  const toggleTrigger = useBuilderStore((s) => s.toggleTrigger);
  const setDeck = useBuilderStore((s) => s.setDeck);

  const players = doc.players;
  const count = players.length;
  const activities = doc.activities;

  const tabs: BuilderTab[] = [
    {
      key: "board",
      label: "Board",
      content: (
        <div className="space-y-7">
          {onPreview && (
            <button
              type="button"
              onClick={onPreview}
              className="inline-flex items-center gap-1.5 rounded-full border border-[#e3d2c5] px-3 py-1.5 text-sm font-medium text-[#7a6258] transition-colors hover:bg-[#fbeee6]"
            >
              <Eye className="size-3.5" /> Play a preview
            </button>
          )}

          {/* The board */}
          <Section title="The board">
            <Field label="Title">
              <input
                className={inputCls}
                value={doc.title}
                onChange={(e) => setMeta({ title: e.target.value })}
                placeholder="Ludo for Two"
              />
            </Field>
            <Field label="Intro (shown above the board)">
              <textarea
                className={`${inputCls} min-h-[70px] resize-y`}
                value={doc.intro}
                onChange={(e) => setMeta({ intro: e.target.value })}
                placeholder="Our board, our rules…"
              />
            </Field>
          </Section>

          {/* Players */}
          <Section
            title="Players"
            action={
              <div className="flex rounded-full border border-[#f2dace] bg-[#fff7f1] p-1">
                {[2, 3, 4].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setCount(n)}
                    className={`h-7 w-8 rounded-full text-sm transition-colors ${
                      count === n
                        ? "bg-gradient-to-r from-[#ff7a59] to-[#f2596f] font-medium text-white"
                        : "text-[#92786c] hover:text-[#3a2a25]"
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            }
          >
            <div className="space-y-2.5">
              {players.map((p, i) => {
                const color = SEAT_COLORS[p.color];
                return (
                  <div
                    key={p.seat}
                    className="flex flex-wrap items-center gap-2 rounded-2xl border border-[#f1e0d2] bg-white p-2.5"
                  >
                    <span
                      className="h-7 w-7 shrink-0 rounded-full"
                      style={{
                        background: `radial-gradient(circle at 32% 28%, ${color.light}, ${color.base} 60%, ${color.shade})`,
                      }}
                    />
                    <input
                      value={p.name}
                      onChange={(e) => updatePlayer(i, { name: e.target.value })}
                      maxLength={14}
                      className="min-w-0 flex-1 rounded-lg border border-[#f1e0d2] bg-[#fffdfb] px-3 py-1.5 text-sm text-[#3a2a25] outline-none focus:border-[#ff7a59]"
                      placeholder={`Player ${i + 1}`}
                    />
                    <div className="flex gap-1">
                      {SEAT_COLOR_ORDER.map((key) => {
                        const c = SEAT_COLORS[key];
                        const selected = p.color === key;
                        return (
                          <button
                            key={key}
                            type="button"
                            aria-label={c.label}
                            onClick={() => setPlayerColor(i, key)}
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
                      onClick={() => updatePlayer(i, { isBot: !p.isBot })}
                      className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                        p.isBot
                          ? "bg-[#fff1e9] text-[#c75b39]"
                          : "bg-[#f4f1ee] text-[#92786c]"
                      }`}
                    >
                      {p.isBot ? "🤖 CPU" : "🧑 Human"}
                    </button>
                  </div>
                );
              })}
            </div>
          </Section>

          {/* Couple activities */}
          <Section
            title="Couple activities"
            action={
              <Toggle
                on={activities.enabled}
                onClick={() => setActivitiesEnabled(!activities.enabled)}
              />
            }
          >
            <p className="-mt-1 text-xs text-[#92786c]">
              Draw a card when special moments happen on the board.
            </p>

            {activities.enabled && (
              <div className="space-y-4">
                {/* triggers */}
                <div className="grid grid-cols-2 gap-2">
                  {(Object.keys(TRIGGER_LABELS) as ActivityTrigger[]).map(
                    (t) => {
                      const meta = TRIGGER_LABELS[t];
                      const on = activities.triggers[t];
                      return (
                        <button
                          key={t}
                          type="button"
                          onClick={() => toggleTrigger(t)}
                          className={`flex items-start gap-2 rounded-2xl border p-2.5 text-left transition-colors ${
                            on
                              ? "border-[#ff7a59]/45 bg-[#fff6f1]"
                              : "border-[#f0e2d5] bg-white opacity-70"
                          }`}
                        >
                          <span className="text-lg leading-none">
                            {meta.emoji}
                          </span>
                          <span className="min-w-0">
                            <span className="block text-sm font-medium text-[#3a2a25]">
                              {meta.title}
                            </span>
                            <span className="block text-[11px] leading-tight text-[#92786c]">
                              {meta.hint}
                            </span>
                          </span>
                        </button>
                      );
                    },
                  )}
                </div>

                {/* intensity */}
                <div>
                  <p className="mb-1.5 text-xs font-medium tracking-wide text-[#92786c] uppercase">
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
                          onClick={() => setIntensity(key)}
                          className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${
                            active
                              ? "border-transparent bg-gradient-to-r from-[#ff7a59] to-[#f2596f] font-medium text-white"
                              : "border-[#f2dace] bg-white text-[#7a6258] hover:border-[#ff7a59]/50"
                          }`}
                        >
                          {meta.emoji} {meta.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* deck editing */}
                <div className="space-y-3 rounded-2xl border border-[#f0e2d5] bg-[#fffdfb] p-3">
                  <p className="text-sm font-medium text-[#3a2a25]">
                    ✏️ Edit the cards{" "}
                    <span className="text-xs text-[#92786c]">(one per line)</span>
                  </p>
                  {(["sweet", "fun", "spicy"] as ActivityIntensity[]).map(
                    (key) => (
                      <div key={key}>
                        <label className="mb-1 block text-xs font-medium text-[#92786c]">
                          {INTENSITY_LABELS[key].emoji}{" "}
                          {INTENSITY_LABELS[key].label} deck
                        </label>
                        <textarea
                          value={activities.decks[key].join("\n")}
                          onChange={(e) =>
                            setDeck(key, e.target.value.split("\n"))
                          }
                          rows={4}
                          className="w-full resize-y rounded-xl border border-[#f1e0d2] bg-white px-3 py-2 text-sm text-[#3a2a25] outline-none focus:border-[#ff7a59]"
                          placeholder={
                            DEFAULT_ACTIVITIES.decks[key][0] ?? "One card per line…"
                          }
                        />
                      </div>
                    ),
                  )}
                </div>
              </div>
            )}
          </Section>
        </div>
      ),
    },
  ];

  return (
    <BuilderShell
      title="Build your Ludo"
      sync={sync}
      tabs={tabs}
      className={className}
    />
  );
}

// ── Small building blocks ──────────────────────────────────────────
const inputCls =
  "w-full rounded-lg border border-[#e3d2c5] bg-white px-3 py-2 text-sm text-[#3a2a25] outline-none transition-colors focus:border-[#ff7a59] focus:ring-2 focus:ring-[#ff7a59]/20";

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium tracking-wide text-[#92786c]">
        {label}
      </span>
      {children}
    </label>
  );
}

function Section({
  title,
  action,
  children,
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold tracking-wide text-[#3a2a25] uppercase">
          {title}
        </h2>
        {action}
      </div>
      {children}
    </section>
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
        on ? "bg-gradient-to-r from-[#ff7a59] to-[#f2596f]" : "bg-[#e7d8cb]"
      }`}
    >
      <span
        className="absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-all"
        style={{ left: on ? "calc(100% - 1.625rem)" : "0.125rem" }}
      />
    </button>
  );
}
