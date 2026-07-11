"use client";

import { Eye } from "lucide-react";
import { useState } from "react";

import {
  BuilderShell,
  type BuilderTab,
} from "@/features/dashboard/components/builder-shell";
import type { DiceOfDesireSync } from "@/hooks/use-dice-of-desire-sync";

import { GRID_SIZE, HEAT_META, type Position } from "../../config";
import { useBuilderStore } from "../../store/builder.store";
import { PositionFormModal } from "./position-form-modal";

export function BuilderPanel({
  sync,
  onPreview,
  className,
}: {
  sync: DiceOfDesireSync;
  onPreview?: () => void;
  className?: string;
}) {
  const doc = useBuilderStore((s) => s.doc);
  const setMeta = useBuilderStore((s) => s.setMeta);

  // The square open in the editor (null = closed).
  const [editing, setEditing] = useState<Position | null>(null);

  // Split the flat 36 into rows by die 1.
  const rows = Array.from({ length: GRID_SIZE }, (_, r) =>
    doc.positions.slice(r * GRID_SIZE, r * GRID_SIZE + GRID_SIZE),
  );

  const tabs: BuilderTab[] = [
    {
      key: "dice",
      label: "Game",
      content: (
        <div className="space-y-7">
          {onPreview && (
            <div className="flex justify-end">
              <button
                type="button"
                onClick={onPreview}
                className="inline-flex items-center gap-1.5 rounded-full border border-white/15 px-3 py-1.5 text-sm font-medium text-white/70 transition-colors hover:bg-white/10"
              >
                <Eye className="size-3.5" /> Preview
              </button>
            </div>
          )}
          {/* Game settings */}
          <Section title="The game">
            <Field label="For (recipient)">
              <input
                className={inputCls}
                value={doc.recipientName}
                onChange={(e) => setMeta({ recipientName: e.target.value })}
                placeholder="you"
              />
            </Field>
            <Field label="Game title">
              <input
                className={inputCls}
                value={doc.gameTitle}
                onChange={(e) => setMeta({ gameTitle: e.target.value })}
                placeholder="Roll for us"
              />
            </Field>
            <Field label="Cover message">
              <textarea
                className={`${inputCls} min-h-[80px] resize-y`}
                value={doc.intro}
                onChange={(e) => setMeta({ intro: e.target.value })}
                placeholder="Shown on the table, before the first roll…"
              />
            </Field>
          </Section>

          {/* The grid */}
          <Section title="The board (6 × 6)">
            <p className="-mt-1 text-xs text-white/40">
              The first die picks the row, the second the column. Tap any square
              to reword it.
            </p>

            <div className="overflow-x-auto">
              <table className="w-full border-separate border-spacing-1 text-left">
                <thead>
                  <tr>
                    <th className="w-6" aria-hidden />
                    {Array.from({ length: GRID_SIZE }, (_, c) => (
                      <th
                        key={c}
                        className="pb-1 text-center text-[0.65rem] font-semibold text-white/40"
                      >
                        {c + 1}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, r) => (
                    <tr key={r}>
                      <th className="pr-1 text-center text-[0.65rem] font-semibold text-white/40">
                        {r + 1}
                      </th>
                      {row.map((p) => (
                        <td key={p.id}>
                          <GridCell
                            position={p}
                            onClick={() => setEditing(p)}
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Section>
        </div>
      ),
    },
  ];

  return (
    <>
      <BuilderShell
        title="Build your game"
        sync={sync}
        tabs={tabs}
        className={className}
      />
      {editing && (
        <PositionFormModal
          position={editing}
          onClose={() => setEditing(null)}
        />
      )}
    </>
  );
}

// ── A single grid square ───────────────────────────────────────────
function GridCell({
  position,
  onClick,
}: {
  position: Position;
  onClick: () => void;
}) {
  const meta = HEAT_META[position.heat];
  return (
    <button
      type="button"
      onClick={onClick}
      title={position.name || "Empty square"}
      className="flex aspect-square w-full flex-col items-center justify-center gap-1 rounded-md border border-white/10 bg-white/[0.03] px-1 py-1 text-center transition-colors hover:border-white/30 hover:bg-white/[0.07]"
    >
      <span
        className="size-2 shrink-0 rounded-full"
        style={{ background: meta.accent }}
        aria-hidden
      />
      <span className="line-clamp-2 text-[0.6rem] leading-tight text-white/75">
        {position.name || "—"}
      </span>
    </button>
  );
}

// ── Small building blocks ──────────────────────────────────────────
const inputCls =
  "w-full rounded-lg border border-white/12 bg-white/5 px-3 py-2 text-sm text-white outline-none transition-colors placeholder:text-white/30 focus:border-[#ff4d6d] focus:ring-2 focus:ring-[#ff4d6d]/25";

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium tracking-wide text-white/50">
        {label}
      </span>
      {children}
    </label>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-3">
      <h2 className="text-sm font-semibold tracking-wide text-white/80 uppercase">
        {title}
      </h2>
      {children}
    </section>
  );
}
