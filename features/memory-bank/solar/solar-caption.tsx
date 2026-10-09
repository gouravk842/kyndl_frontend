"use client";

import { hashUnit } from "./layout";

export function SolarCaption({ text, sub }: { text: string; sub?: string }) {
  return (
    <span
      data-hud
      className="pointer-events-none absolute top-[calc(100%+6px)] left-1/2 z-50 w-max max-w-[9rem] -translate-x-1/2 rounded-full border border-[var(--mb-solar-line)] bg-[var(--mb-solar-void)]/95 px-2.5 py-1 text-center shadow-sm"
    >
      <span className="block truncate text-[11px] text-[var(--mb-solar-ink)]">
        {text}
      </span>
      {sub ? (
        <span className="block text-[10px] text-[var(--mb-solar-muted)]">
          {sub}
        </span>
      ) : null}
    </span>
  );
}

export function polaroidTilt(id: string) {
  return (hashUnit(id, 4) - 0.5) * 8;
}
