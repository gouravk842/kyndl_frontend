"use client";

import { Eye, Pencil, Plus, Sparkles, Trash2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { ROUTES } from "@/constants/routes";
import { ActivityBankPicker } from "@/features/activity-bank/components/activity-bank-picker";
import { heatForType, lineText } from "@/features/activity-bank/map";
import { fileRef } from "@/features/activity-bank/previews";
import {
  BuilderShell,
  type BuilderTab,
} from "@/features/dashboard/components/builder-shell";
import type { DesireMatcherSync } from "@/hooks/use-desire-matcher-sync";

import {
  type Answer,
  ANSWER_META,
  HEAT_META,
  type MatcherItem,
} from "../../config";
import { useBuilderStore } from "../../store/builder.store";
import { ItemFormModal } from "./item-form-modal";

export function BuilderPanel({
  sync,
  onPreview,
  className,
}: {
  sync: DesireMatcherSync;
  onPreview?: () => void;
  className?: string;
}) {
  const doc = useBuilderStore((s) => s.doc);
  const setMeta = useBuilderStore((s) => s.setMeta);
  const moveItem = useBuilderStore((s) => s.moveItem);
  const removeItem = useBuilderStore((s) => s.removeItem);
  const setOwnerAnswer = useBuilderStore((s) => s.setOwnerAnswer);

  const [form, setForm] = useState<{ item: MatcherItem | null } | null>(null);
  const [bankOpen, setBankOpen] = useState(false);
  const addItem = useBuilderStore((s) => s.addItem);
  const items = doc.items;

  const tabs: BuilderTab[] = [
    {
      key: "matcher",
      label: "Matcher",
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
          {sync.creationId && (
            <Link
              href={`${ROUTES.desireMatcherResults}?id=${sync.creationId}`}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-[#ff8fae] hover:underline"
            >
              <Sparkles className="size-3.5" /> View your matches
            </Link>
          )}
          <Section title="The matcher">
            <Field label="Their name (who you're sending it to)">
              <input
                className={inputCls}
                value={doc.recipientName}
                onChange={(e) => setMeta({ recipientName: e.target.value })}
                placeholder="you"
              />
            </Field>
            <Field label="Your name (shown to them)">
              <input
                className={inputCls}
                value={doc.ownerName}
                onChange={(e) => setMeta({ ownerName: e.target.value })}
                placeholder="me"
              />
            </Field>
            <Field label="Title">
              <input
                className={inputCls}
                value={doc.title}
                onChange={(e) => setMeta({ title: e.target.value })}
                placeholder="What are we both into?"
              />
            </Field>
            <Field label="Intro message">
              <textarea
                className={`${inputCls} min-h-[80px] resize-y`}
                value={doc.intro}
                onChange={(e) => setMeta({ intro: e.target.value })}
                placeholder="Shown before they start answering…"
              />
            </Field>
          </Section>

          <Section
            title={`Items (${items.length})`}
            action={
              <span className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setBankOpen(true)}
                  className="rounded-full border border-white/20 px-3 py-1.5 text-xs font-semibold text-white/80 hover:bg-white/10"
                >
                  From the bank
                </button>
                <button
                  type="button"
                  onClick={() => setForm({ item: null })}
                  className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-[#ff4d6d] to-[#c81d4e] px-3 py-1.5 text-xs font-semibold text-white transition-transform hover:scale-[1.04]"
                >
                  <Plus className="size-3.5" /> Add item
                </button>
              </span>
            }
          >
            <p className="-mt-1 mb-2 text-xs text-white/40">
              Set <span className="text-white/70">your own</span> answer on each
              — only the ones you both say yes (or maybe) to are revealed.
            </p>
            <ul className="space-y-1.5">
              {items.map((it, i) => (
                <li key={it.id}>
                  <ItemRow
                    item={it}
                    ownerAnswer={doc.ownerAnswers[it.id] ?? "yes"}
                    isFirst={i === 0}
                    isLast={i === items.length - 1}
                    onAnswer={(a) => setOwnerAnswer(it.id, a)}
                    onEdit={() => setForm({ item: it })}
                    onUp={() => moveItem(it.id, -1)}
                    onDown={() => moveItem(it.id, 1)}
                    onRemove={() => removeItem(it.id)}
                  />
                </li>
              ))}
              {items.length === 0 && (
                <li className="rounded-lg border border-dashed border-white/12 px-3 py-8 text-center text-sm text-white/40">
                  No items yet — tap{" "}
                  <span className="font-semibold text-[#ff8fae]">Add item</span>{" "}
                  to add the first thing.
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
        title="Build your matcher"
        sync={sync}
        tabs={tabs}
        className={className}
      />
      {form && <ItemFormModal item={form.item} onClose={() => setForm(null)} />}
      <ActivityBankPicker
        open={bankOpen}
        includeAdult
        initialKind="dare"
        onClose={() => setBankOpen(false)}
        onPick={(picked) => {
          for (const item of picked) {
            const image = fileRef(item);
            const label = lineText(item).slice(0, 400);
            addItem({
              label,
              heat: heatForType(item.type.slug),
              ...(image ? { image } : {}),
            });
          }
        }}
      />
    </>
  );
}

// ── Item row: label + heat + the owner's own answer toggle ──────────
function ItemRow({
  item,
  ownerAnswer,
  isFirst,
  isLast,
  onAnswer,
  onEdit,
  onUp,
  onDown,
  onRemove,
}: {
  item: MatcherItem;
  ownerAnswer: Answer;
  isFirst: boolean;
  isLast: boolean;
  onAnswer: (a: Answer) => void;
  onEdit: () => void;
  onUp: () => void;
  onDown: () => void;
  onRemove: () => void;
}) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.03] px-2.5 py-2 transition-colors hover:border-white/20">
      <div className="flex items-center gap-2">
        <span
          className="size-2.5 shrink-0 rounded-full"
          style={{ background: HEAT_META[item.heat].accent }}
          aria-hidden
        />
        <button
          type="button"
          onClick={onEdit}
          className="min-w-0 flex-1 truncate text-left text-sm font-medium text-white/90"
        >
          {item.label || "Empty item"}
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
            aria-label="Edit item"
            onClick={onEdit}
            className="grid size-7 place-items-center rounded-md text-white/50 hover:bg-white/10 hover:text-[#ff8fae]"
          >
            <Pencil className="size-3.5" />
          </button>
          <button
            type="button"
            aria-label="Delete item"
            onClick={onRemove}
            className="grid size-7 place-items-center rounded-md text-white/40 hover:bg-white/10 hover:text-[#ff6f6f]"
          >
            <Trash2 className="size-3.5" />
          </button>
        </div>
      </div>
      {/* owner's own answer */}
      <div className="mt-2 flex items-center gap-1.5 pl-[18px]">
        <span className="mr-1 text-[0.65rem] tracking-wide text-white/35 uppercase">
          You
        </span>
        {(["yes", "maybe", "no"] as const).map((a) => {
          const active = ownerAnswer === a;
          const meta = ANSWER_META[a];
          return (
            <button
              key={a}
              type="button"
              onClick={() => onAnswer(a)}
              className="rounded-full border px-2.5 py-0.5 text-[0.7rem] font-semibold transition-colors"
              style={
                active
                  ? {
                      background: meta.color,
                      borderColor: meta.color,
                      color: "#1a0710",
                    }
                  : {
                      borderColor: "rgba(255,255,255,0.15)",
                      color: "rgba(255,255,255,0.5)",
                    }
              }
            >
              {meta.label}
            </button>
          );
        })}
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
