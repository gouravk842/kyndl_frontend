"use client";

import { Sparkles } from "lucide-react";

import {
  CATEGORY_GLYPH,
  MEMORY_PROMPTS,
  type MemoryPrompt,
} from "../../config";

/**
 * Shown when the calendar has no memories yet — prompt chips open the add
 * form so the first save isn't a blank page.
 */
export function EmptyPromptsCard({
  onPick,
  onPickDay,
}: {
  onPick: (prompt: MemoryPrompt) => void;
  onPickDay?: () => void;
}) {
  return (
    <div className="relative z-20 mx-auto w-full max-w-lg px-4 pt-4 sm:pt-6">
      <div className="rounded-2xl border border-[#D4A373]/45 bg-[#fffaf4]/95 p-5 shadow-[0_18px_40px_-28px_rgba(58,42,37,0.55)] backdrop-blur-sm sm:p-6">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-full bg-[#fbeee6] text-[#c75b39]">
            <Sparkles className="size-4" />
          </span>
          <div>
            <h2 className="font-display text-lg text-[#3a2a25] sm:text-xl">
              Start with a memory that matters
            </h2>
            <p className="mt-1 text-sm leading-relaxed text-[#92786c]">
              Pick a prompt — we’ll open the form. You choose the date and write
              it in your voice.
            </p>
          </div>
        </div>

        <ul className="mt-4 grid gap-2 sm:grid-cols-2">
          {MEMORY_PROMPTS.map((p) => (
            <li key={p.id}>
              <button
                type="button"
                onClick={() => onPick(p)}
                className="flex w-full items-start gap-2 rounded-xl border border-[#f2dace] bg-white px-3 py-2.5 text-left transition-colors hover:border-[#ff7a59]/55 hover:bg-[#fbeee6]"
              >
                <span className="mt-0.5 text-sm" aria-hidden>
                  {CATEGORY_GLYPH[p.category]}
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-medium text-[#3a2a25]">
                    {p.title}
                  </span>
                  <span className="mt-0.5 line-clamp-2 text-[11px] leading-snug text-[#92786c]">
                    {p.hint}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>

        {onPickDay && (
          <button
            type="button"
            onClick={onPickDay}
            className="mt-4 w-full text-center text-xs font-medium text-[#c75b39] hover:underline"
          >
            Or click any day on the calendar below
          </button>
        )}
      </div>
    </div>
  );
}

/** Compact prompt list for the builder rail (always available as ideas). */
export function PromptIdeas({
  onPick,
  compact,
}: {
  onPick: (prompt: MemoryPrompt) => void;
  compact?: boolean;
}) {
  const list = compact ? MEMORY_PROMPTS.slice(0, 4) : MEMORY_PROMPTS;
  return (
    <ul className="space-y-1.5">
      {list.map((p) => (
        <li key={p.id}>
          <button
            type="button"
            onClick={() => onPick(p)}
            className="flex w-full items-center gap-2 rounded-lg border border-[#f2dace] bg-white px-2.5 py-2 text-left text-sm transition-colors hover:border-[#ff7a59]/50 hover:bg-[#fbeee6]"
          >
            <span aria-hidden>{CATEGORY_GLYPH[p.category]}</span>
            <span className="min-w-0 flex-1 truncate font-medium text-[#3a2a25]">
              {p.title}
            </span>
            <span className="shrink-0 text-[10px] font-semibold tracking-wide text-[#c75b39] uppercase">
              Use
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
}
