"use client";

import { useState } from "react";

import type {
  GameSetup,
  HeatChoice,
  SkipCount,
} from "@/features/snakes-and-lovers/setup";

const HEAT_OPTIONS: { id: HeatChoice; label: string; hint: string }[] = [
  { id: "sweet", label: "Sweet", hint: "Warm and flirty" },
  { id: "spicy", label: "Spicy", hint: "Stops before wild" },
  { id: "wild", label: "Wild", hint: "The full pack" },
];

export function SetupScreen({
  value,
  onStart,
}: {
  value: GameSetup;
  onStart: (setup: GameSetup) => void;
}) {
  const [draft, setDraft] = useState(value);

  return (
    <form
      className="flex w-full max-w-md flex-col gap-6 rounded-3xl border border-white/10 bg-white/[0.04] px-6 py-8"
      onSubmit={(event) => {
        event.preventDefault();
        onStart({
          ...draft,
          names: [
            draft.names[0].trim() || "Player 1",
            draft.names[1].trim() || "Player 2",
          ],
        });
      }}
    >
      <div className="space-y-1 text-center">
        <h2 className="font-display text-3xl text-white">Before you roll</h2>
        <p className="text-base leading-relaxed text-white/70">
          Names, heat, and a few comfort settings. Saved on this device for next
          time.
        </p>
      </div>

      <div className="grid gap-3">
        {(["First player", "Second player"] as const).map((label, index) => (
          <label key={label} className="grid gap-1 text-base text-[#f6e8ec]">
            {label}
            <input
              value={draft.names[index] ?? ""}
              maxLength={24}
              autoComplete="nickname"
              onChange={(event) => {
                const names: [string, string] = [
                  draft.names[0],
                  draft.names[1],
                ];
                names[index] = event.target.value;
                setDraft({ ...draft, names });
              }}
              className="min-h-11 rounded-xl border border-white/15 bg-white/5 px-3 text-base text-white outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            />
          </label>
        ))}
      </div>

      <fieldset className="grid gap-2">
        <legend className="mb-1 text-base text-[#f6e8ec]">Heat</legend>
        <div className="grid grid-cols-3 gap-2">
          {HEAT_OPTIONS.map((option) => {
            const on = draft.heat === option.id;
            return (
              <button
                key={option.id}
                type="button"
                aria-pressed={on}
                onClick={() => setDraft({ ...draft, heat: option.id })}
                className={[
                  "min-h-11 rounded-xl border px-2 py-2 text-base font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white",
                  on
                    ? "border-white bg-white text-[#3d1220]"
                    : "border-white/20 text-white",
                ].join(" ")}
              >
                {option.label}
                <span
                  className={[
                    "mt-0.5 block text-sm",
                    on ? "text-[#3d1220]/70" : "text-white/60",
                  ].join(" ")}
                >
                  {option.hint}
                </span>
              </button>
            );
          })}
        </div>
      </fieldset>

      <fieldset className="grid gap-2">
        <legend className="mb-1 text-base text-[#f6e8ec]">Skips each</legend>
        <div className="grid grid-cols-2 gap-2">
          {([2, 3] as SkipCount[]).map((count) => {
            const on = draft.skips === count;
            return (
              <button
                key={count}
                type="button"
                aria-pressed={on}
                onClick={() => setDraft({ ...draft, skips: count })}
                className={[
                  "min-h-11 rounded-xl border text-base font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white",
                  on
                    ? "border-white bg-white text-[#3d1220]"
                    : "border-white/20 text-white",
                ].join(" ")}
              >
                {count} skips
              </button>
            );
          })}
        </div>
      </fieldset>

      <label className="flex min-h-11 items-center gap-3 text-base text-[#f6e8ec]">
        <input
          type="checkbox"
          checked={draft.timer}
          onChange={(event) =>
            setDraft({ ...draft, timer: event.target.checked })
          }
          className="size-5 accent-[#ff4d6d]"
        />
        Show a timer when a dare has one
      </label>
      <label className="flex min-h-11 items-center gap-3 text-base text-[#f6e8ec]">
        <input
          type="checkbox"
          checked={draft.sound}
          onChange={(event) =>
            setDraft({ ...draft, sound: event.target.checked })
          }
          className="size-5 accent-[#ff4d6d]"
        />
        Dice sound
      </label>

      <button
        type="submit"
        className="inline-flex min-h-11 items-center justify-center rounded-full bg-white px-7 text-base font-semibold text-[#7e1426] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7e1426]"
      >
        Play
      </button>
    </form>
  );
}
