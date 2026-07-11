"use client";

import {
  Clock,
  HelpCircle,
  Lock,
  Pencil,
  Plus,
  Puzzle,
  Sparkles,
  Trash2,
} from "lucide-react";
import { useState } from "react";

import {
  BuilderShell,
  type BuilderTab,
} from "@/features/dashboard/components/builder-shell";
import type { ConstellationSync } from "@/hooks/use-constellation-sync";

import type { FinaleGlyph, Star } from "../../config";
import { useBuilderStore } from "../../store/builder.store";
import { StarFormModal } from "./star-form-modal";

/** Modal state: `null` closed · `{ star: null }` adding · `{ star }` editing. */
type EditorState = { star: Star | null } | null;

const GLYPH_OPTIONS: { value: FinaleGlyph | "none"; label: string }[] = [
  { value: "heart", label: "Heart" },
  { value: "infinity", label: "Infinity" },
  { value: "initials", label: "Initials" },
  { value: "none", label: "Just the lines" },
];

export function BuilderPanel({
  sync,
  onPreview,
  className,
}: {
  sync: ConstellationSync;
  onPreview: () => void;
  className?: string;
}) {
  const doc = useBuilderStore((s) => s.doc);
  const selectedId = useBuilderStore((s) => s.selectedId);
  const setMeta = useBuilderStore((s) => s.setMeta);
  const setFinale = useBuilderStore((s) => s.setFinale);
  const selectStar = useBuilderStore((s) => s.selectStar);
  const removeStar = useBuilderStore((s) => s.removeStar);

  const [editor, setEditor] = useState<EditorState>(null);

  const stars = doc.stars;
  const glyph = doc.finale.glyph ?? "none";

  const tabs: BuilderTab[] = [
    {
      key: "sky",
      label: "Sky",
      content: (
        <div className="space-y-7">
          <button
            type="button"
            onClick={onPreview}
            className="inline-flex w-full items-center justify-center gap-1.5 rounded-full border border-[#33406b] px-4 py-2 text-sm font-medium text-[#cdd6f4] transition-colors hover:border-[#6f7bb0] hover:bg-white/5"
          >
            <Sparkles className="size-3.5" /> Preview the sky
          </button>

          {/* Sky meta */}
          <Section title="The sky">
          <Field label="For (recipient)">
            <input
              className={inputCls}
              value={doc.recipientName}
              onChange={(e) => setMeta({ recipientName: e.target.value })}
              placeholder="you"
            />
          </Field>
          <Field label="Constellation name">
            <input
              className={inputCls}
              value={doc.constellationName}
              onChange={(e) => setMeta({ constellationName: e.target.value })}
              placeholder="The two of us"
            />
          </Field>
          <Field label="Subtitle">
            <input
              className={inputCls}
              value={doc.subtitle}
              onChange={(e) => setMeta({ subtitle: e.target.value })}
              placeholder="tap a star to open a memory"
            />
          </Field>
          <Field label="Message when every star is read">
            <textarea
              className={`${inputCls} min-h-[80px] resize-y`}
              value={doc.allStarsOpenedMessage}
              onChange={(e) =>
                setMeta({ allStarsOpenedMessage: e.target.value })
              }
              placeholder="A closing line shown once all the stars are open…"
            />
          </Field>
        </Section>

        {/* Finale */}
        <Section title="The finale shape">
          <Field label="Shape that ignites at the end">
            <select
              className={inputCls}
              value={glyph}
              onChange={(e) => {
                const v = e.target.value;
                setFinale({ glyph: v === "none" ? null : (v as FinaleGlyph) });
              }}
            >
              {GLYPH_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </Field>
          {glyph === "initials" && (
            <Field label="Initials (1–2 letters)">
              <input
                className={inputCls}
                value={doc.finale.initials ?? ""}
                maxLength={3}
                onChange={(e) => setFinale({ initials: e.target.value })}
                placeholder="A+J"
              />
            </Field>
          )}
        </Section>
        </div>
      ),
    },
    {
      key: "stars",
      label: "Stars",
      badge: stars.length,
      content: (
        <div className="space-y-3">
          <button
            type="button"
            onClick={() => setEditor({ star: null })}
            className="inline-flex w-full items-center justify-center gap-1.5 rounded-full bg-[#f0c869] px-4 py-2 text-sm font-semibold text-[#241a05] transition-colors hover:bg-[#f6dd8c]"
          >
            <Plus className="size-4" /> Add star
          </button>

          <p className="text-xs text-[#8b93b8]">
            Order sets how the lines connect. Drag a star on the sky to move it.
          </p>

          <ul className="space-y-1.5">
            {stars.map((star) => (
              <li key={star.id}>
                <StarRow
                  star={star}
                  active={star.id === selectedId}
                  onEdit={() => {
                    selectStar(star.id);
                    setEditor({ star });
                  }}
                  onRemove={() => removeStar(star.id)}
                />
              </li>
            ))}
            {stars.length === 0 && (
              <li className="rounded-lg border border-dashed border-[#2a3458] px-3 py-6 text-center text-sm text-[#8b93b8]">
                No stars yet — add your first memory.
              </li>
            )}
          </ul>
        </div>
      ),
    },
  ];

  return (
    <>
      <BuilderShell
        title="Customize your sky"
        sync={sync}
        tabs={tabs}
        className={className}
      />
      {editor && (
        <StarFormModal star={editor.star} onClose={() => setEditor(null)} />
      )}
    </>
  );
}

// The little icon + word describing a star's gate, for the list row.
const GATE_BADGE: Record<
  string,
  { icon: typeof Lock; label: string }
> = {
  question: { icon: HelpCircle, label: "Question" },
  "image-puzzle": { icon: Puzzle, label: "Jigsaw" },
  "time-lock": { icon: Clock, label: "Timed" },
};

// ── Star list row ──────────────────────────────────────────────────
function StarRow({
  star,
  active,
  onEdit,
  onRemove,
}: {
  star: Star;
  active: boolean;
  onEdit: () => void;
  onRemove: () => void;
}) {
  const badge = star.unlock ? GATE_BADGE[star.unlock.type] : undefined;
  const gatedIcon = badge?.icon ?? (star.unlock ? Lock : undefined);
  const requiresCount = star.requires?.length ?? 0;
  return (
    <div
      className={[
        "flex items-center gap-2 rounded-lg border px-2.5 py-2 transition-colors",
        active
          ? "border-[#f0c869] bg-[#f0c869]/10"
          : "border-[#27315a] bg-[#101a36] hover:border-[#f0c869]/40",
      ].join(" ")}
    >
      <Sparkles className="size-3.5 shrink-0 text-[#f0c869]" />
      <button
        type="button"
        onClick={onEdit}
        className="min-w-0 flex-1 text-left"
      >
        <span className="block truncate text-sm font-medium text-[#e7e3f3]">
          {star.label || "Untitled star"}
        </span>
        {(() => {
          const bits: string[] = [];
          if (star.date) bits.push(star.date);
          if (badge) bits.push(badge.label);
          if (requiresCount > 0)
            bits.push(`after ${requiresCount} star${requiresCount > 1 ? "s" : ""}`);
          return bits.length > 0 ? (
            <span className="block truncate text-xs text-[#8b93b8]">
              {bits.join(" · ")}
            </span>
          ) : null;
        })()}
      </button>
      {gatedIcon
        ? (() => {
            const GateIcon = gatedIcon;
            return (
              <GateIcon
                className="size-3.5 shrink-0 text-[#9aa2cc]"
                aria-label={badge ? `${badge.label} gate` : "Locked"}
              />
            );
          })()
        : null}
      <button
        type="button"
        aria-label="Edit star"
        onClick={onEdit}
        className="grid size-7 place-items-center rounded-md text-[#7e87ad] hover:bg-white/5 hover:text-[#f0c869]"
      >
        <Pencil className="size-3.5" />
      </button>
      <button
        type="button"
        aria-label="Delete star"
        onClick={onRemove}
        className="grid size-7 place-items-center rounded-md text-[#7e87ad] hover:bg-white/5 hover:text-[#f0a0a0]"
      >
        <Trash2 className="size-3.5" />
      </button>
    </div>
  );
}

// ── Small building blocks ──────────────────────────────────────────
const inputCls =
  "w-full rounded-lg border border-[#2a3458] bg-[#101a36] px-3 py-2 text-sm text-[#e7e3f3] outline-none transition-colors placeholder:text-[#5d678f] focus:border-[#f0c869] focus:ring-2 focus:ring-[#f0c869]/20";

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium tracking-wide text-[#8b93b8]">
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
        <h2 className="text-sm font-semibold tracking-wide text-[#c8b88a] uppercase">
          {title}
        </h2>
        {action}
      </div>
      {children}
    </section>
  );
}
