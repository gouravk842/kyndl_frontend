"use client";

import { Atom, LayoutGrid, Sun } from "lucide-react";

import type { MemoryBankViewMode } from "@/features/memory-bank/lib/view-mode";
import { cn } from "@/lib/utils";

const OPTIONS: {
  view: MemoryBankViewMode;
  label: string;
  icon: typeof Sun;
}[] = [
  { view: "solar", label: "Solar view", icon: Sun },
  { view: "molecule", label: "Molecule view", icon: Atom },
  { view: "list", label: "List view", icon: LayoutGrid },
];

export function ViewToggle({
  view,
  onChange,
}: {
  view: MemoryBankViewMode;
  onChange: (view: MemoryBankViewMode) => void;
}) {
  return (
    <div
      role="group"
      aria-label="Memory bank view"
      className="inline-flex rounded-full border border-[var(--mb-solar-line)] bg-[var(--mb-solar-void)]/90 p-1 backdrop-blur-sm"
    >
      {OPTIONS.map((option) => {
        const Icon = option.icon;
        return (
          <button
            key={option.view}
            type="button"
            onClick={() => onChange(option.view)}
            className={cn(
              "inline-flex size-11 items-center justify-center rounded-full sm:size-8",
              view === option.view
                ? "bg-[var(--mb-solar-ink)] text-[var(--mb-solar-void)]"
                : "text-[var(--mb-solar-muted)] hover:text-[var(--mb-solar-ink)]",
            )}
            aria-pressed={view === option.view}
            aria-label={option.label}
          >
            <Icon className="size-3.5" />
          </button>
        );
      })}
    </div>
  );
}
