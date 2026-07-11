"use client";

import { Eye, Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";

import {
  BuilderShell,
  type BuilderTab,
} from "@/features/dashboard/components/builder-shell";
import type { DesireDeckSync } from "@/hooks/use-desire-deck-sync";

import { type DeckCard, HEAT_META } from "../../config";
import { useBuilderStore } from "../../store/builder.store";
import { Flames } from "../flames";
import { CardFormModal } from "./card-form-modal";

export function BuilderPanel({
  sync,
  onPreview,
  className,
}: {
  sync: DesireDeckSync;
  onPreview?: () => void;
  className?: string;
}) {
  const doc = useBuilderStore((s) => s.doc);
  const setMeta = useBuilderStore((s) => s.setMeta);
  const moveCard = useBuilderStore((s) => s.moveCard);
  const removeCard = useBuilderStore((s) => s.removeCard);

  // Card form: closed (null) | adding (set, card=null) | editing (card set).
  const [form, setForm] = useState<{ card: DeckCard | null } | null>(null);

  const cards = doc.cards;

  const tabs: BuilderTab[] = [
    {
      key: "deck",
      label: "Deck",
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

          {/* Deck settings */}
          <Section title="The deck">
          <Field label="For (recipient)">
            <input
              className={inputCls}
              value={doc.recipientName}
              onChange={(e) => setMeta({ recipientName: e.target.value })}
              placeholder="you"
            />
          </Field>
          <Field label="Deck title">
            <input
              className={inputCls}
              value={doc.deckTitle}
              onChange={(e) => setMeta({ deckTitle: e.target.value })}
              placeholder="for us"
            />
          </Field>
          <Field label="Cover message">
            <textarea
              className={`${inputCls} min-h-[80px] resize-y`}
              value={doc.intro}
              onChange={(e) => setMeta({ intro: e.target.value })}
              placeholder="Shown on the cover, before the first card…"
            />
          </Field>
          <Field label="Closing message">
            <textarea
              className={`${inputCls} min-h-[80px] resize-y`}
              value={doc.outro}
              onChange={(e) => setMeta({ outro: e.target.value })}
              placeholder="Shown once every card has been drawn…"
            />
          </Field>
        </Section>

        {/* Cards list */}
        <Section
          title={`Cards (${cards.length})`}
          action={
            <button
              type="button"
              onClick={() => setForm({ card: null })}
              className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-[#ff4d6d] to-[#c81d4e] px-3 py-1.5 text-xs font-semibold text-white transition-transform hover:scale-[1.04]"
            >
              <Plus className="size-3.5" /> Add card
            </button>
          }
        >
          <ul className="space-y-1.5">
            {cards.map((c, i) => (
              <li key={c.id}>
                <CardRow
                  card={c}
                  isFirst={i === 0}
                  isLast={i === cards.length - 1}
                  onEdit={() => setForm({ card: c })}
                  onUp={() => moveCard(c.id, -1)}
                  onDown={() => moveCard(c.id, 1)}
                  onRemove={() => removeCard(c.id)}
                />
              </li>
            ))}
            {cards.length === 0 && (
              <li className="rounded-lg border border-dashed border-white/12 px-3 py-8 text-center text-sm text-white/40">
                No cards yet — tap{" "}
                <span className="font-semibold text-[#ff8fae]">Add card</span> to
                deal your first one.
              </li>
            )}
          </ul>
        </Section>
        </div>
      ),
    },
  ];

  return (
    <>
      <BuilderShell
        title="Build your deck"
        sync={sync}
        tabs={tabs}
        className={className}
      />
      {form && (
        <CardFormModal card={form.card} onClose={() => setForm(null)} />
      )}
    </>
  );
}

// ── Card list row ──────────────────────────────────────────────────
function CardRow({
  card,
  isFirst,
  isLast,
  onEdit,
  onUp,
  onDown,
  onRemove,
}: {
  card: DeckCard;
  isFirst: boolean;
  isLast: boolean;
  onEdit: () => void;
  onUp: () => void;
  onDown: () => void;
  onRemove: () => void;
}) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-2.5 py-2 transition-colors hover:border-white/20">
      <span
        className="size-2.5 shrink-0 rounded-full"
        style={{ background: HEAT_META[card.heat].accent }}
        aria-hidden
      />
      <button type="button" onClick={onEdit} className="min-w-0 flex-1 text-left">
        <span className="block truncate text-sm font-medium text-white/90">
          {card.prompt || "Empty card"}
        </span>
        <span className="mt-0.5 flex items-center gap-1.5 text-xs text-white/40">
          {HEAT_META[card.heat].label} <Flames heat={card.heat} />
        </span>
      </button>
      <div className="flex shrink-0 items-center">
        <IconBtn label="Move up" onClick={onUp} disabled={isFirst}>
          ↑
        </IconBtn>
        <IconBtn label="Move down" onClick={onDown} disabled={isLast}>
          ↓
        </IconBtn>
        <button
          type="button"
          aria-label="Edit card"
          onClick={onEdit}
          className="grid size-7 place-items-center rounded-md text-white/50 hover:bg-white/10 hover:text-[#ff8fae]"
        >
          <Pencil className="size-3.5" />
        </button>
        <button
          type="button"
          aria-label="Delete card"
          onClick={onRemove}
          className="grid size-7 place-items-center rounded-md text-white/40 hover:bg-white/10 hover:text-[#ff6f6f]"
        >
          <Trash2 className="size-3.5" />
        </button>
      </div>
    </div>
  );
}

function IconBtn({
  label,
  onClick,
  disabled,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      className="grid size-7 place-items-center rounded-md text-sm text-white/50 hover:bg-white/10 disabled:opacity-30"
    >
      {children}
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
        <h2 className="text-sm font-semibold tracking-wide text-white/80 uppercase">
          {title}
        </h2>
        {action}
      </div>
      {children}
    </section>
  );
}
