"use client";

import { Eye } from "lucide-react";
import { useState } from "react";

import { ActivityBankPicker } from "@/features/activity-bank/components/activity-bank-picker";
import { heatForType, titled } from "@/features/activity-bank/map";
import { fileRef } from "@/features/activity-bank/previews";
import {
  BuilderShell,
  type BuilderTab,
} from "@/features/dashboard/components/builder-shell";
import type { SnakesAndLoversSync } from "@/hooks/use-snakes-and-lovers-sync";

import {
  cellPosition,
  CLIMAX_SQUARE,
  HEAT_META,
  LADDERS,
  SAFE_SQUARES,
  SNAKES,
  type Square,
} from "../../config";
import { useBuilderStore } from "../../store/builder.store";
import { SquareFormModal } from "./square-form-modal";

export function BuilderPanel({
  sync,
  onPreview,
  className,
}: {
  sync: SnakesAndLoversSync;
  onPreview?: () => void;
  className?: string;
}) {
  const doc = useBuilderStore((s) => s.doc);
  const setMeta = useBuilderStore((s) => s.setMeta);
  const updateSquare = useBuilderStore((s) => s.updateSquare);
  const [bankOpen, setBankOpen] = useState(false);

  // The square open in the editor (null = closed).
  const [editing, setEditing] = useState<Square | null>(null);

  const tabs: BuilderTab[] = [
    {
      key: "board",
      label: "Game",
      content: (
        <div className="space-y-7">
          {onPreview && (
            <button
              type="button"
              onClick={onPreview}
              className="inline-flex items-center gap-1.5 rounded-full border border-white/15 px-3 py-1.5 text-sm font-medium text-white/70 transition-colors hover:bg-white/10"
            >
              <Eye className="size-3.5" /> Preview
            </button>
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
                placeholder="Snakes & Lovers"
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

          {/* The track */}
          <Section title="The board (100 squares)">
            <p className="-mt-1 text-xs text-white/40">
              Tap any square to reword its dare and set its heat. 🪜 ladders
              rush you hotter, 🐍 snakes tease you back, and 100 is the finale.
            </p>
            <button
              type="button"
              onClick={() => setBankOpen(true)}
              className="rounded-full border border-white/20 px-3 py-1.5 text-xs font-semibold text-white/80 hover:bg-white/10"
            >
              Fill empty squares from the bank
            </button>

            <div
              className="grid gap-px overflow-hidden rounded-lg bg-white/5 p-px"
              style={{
                gridTemplateColumns: "repeat(10, minmax(0, 1fr))",
                gridTemplateRows: "repeat(10, minmax(0, 1fr))",
              }}
            >
              {doc.squares.map((sq) => {
                const { row, col } = cellPosition(sq.id);
                return (
                  <GridCell
                    key={sq.id}
                    square={sq}
                    row={row}
                    col={col}
                    onClick={() => setEditing(sq)}
                  />
                );
              })}
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
        <SquareFormModal square={editing} onClose={() => setEditing(null)} />
      )}
      <ActivityBankPicker
        open={bankOpen}
        includeAdult
        initialKind="dare"
        onClose={() => setBankOpen(false)}
        onPick={(picked) => {
          const empty = doc.squares.filter((square) => !square.name.trim());
          picked.forEach((item, index) => {
            const square = empty[index];
            if (!square) return;
            const image = fileRef(item);
            const { title, body } = titled(item);
            updateSquare(square.id, {
              name: title,
              note: body,
              heat: heatForType(item.type.slug),
              ...(image ? { image } : {}),
            });
          });
        }}
      />
    </>
  );
}

// ── A single grid square ───────────────────────────────────────────
function GridCell({
  square,
  row,
  col,
  onClick,
}: {
  square: Square;
  row: number;
  col: number;
  onClick: () => void;
}) {
  const meta = HEAT_META[square.heat];
  const isLadder = LADDERS[square.id] !== undefined;
  const isSnake = SNAKES[square.id] !== undefined;
  const isSafe = SAFE_SQUARES.has(square.id);
  const isClimax = square.id === CLIMAX_SQUARE;

  let marker: string | null = null;
  if (isClimax) marker = "👑";
  else if (isLadder) marker = "🪜";
  else if (isSnake) marker = "🐍";
  else if (isSafe) marker = "🛡";

  return (
    <button
      type="button"
      onClick={onClick}
      title={`${square.id} · ${square.name || "Empty square"}`}
      style={{
        gridColumnStart: col + 1,
        gridRowStart: row + 1,
        background: `linear-gradient(160deg, rgba(255,255,255,0.02) 0%, ${meta.accent}26 100%)`,
      }}
      className="relative flex aspect-square flex-col items-center justify-center gap-0.5 p-0.5 text-center transition-colors hover:brightness-150"
    >
      <span className="absolute top-[1px] left-[2px] text-[0.45rem] font-bold text-white/40">
        {square.id}
      </span>
      {marker ? (
        <span className="text-[0.7rem] leading-none">{marker}</span>
      ) : (
        <span
          className="size-1.5 rounded-full"
          style={{ background: meta.accent }}
          aria-hidden
        />
      )}
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
