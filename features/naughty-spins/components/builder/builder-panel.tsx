"use client";

import { Eye, Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";

import {
  BuilderShell,
  type BuilderTab,
} from "@/features/dashboard/components/builder-shell";
import type { NaughtySpinsSync } from "@/hooks/use-naughty-spins-sync";

import type { SpinCategory } from "../../config";
import { useBuilderStore } from "../../store/builder.store";
import { CategoryFormModal } from "./category-form-modal";

export function BuilderPanel({
  sync,
  onPreview,
  className,
}: {
  sync: NaughtySpinsSync;
  onPreview?: () => void;
  className?: string;
}) {
  const doc = useBuilderStore((s) => s.doc);
  const setMeta = useBuilderStore((s) => s.setMeta);
  const moveCategory = useBuilderStore((s) => s.moveCategory);
  const removeCategory = useBuilderStore((s) => s.removeCategory);

  // Category form: closed (null) | adding (set, category=null) | editing (set).
  const [form, setForm] = useState<{ category: SpinCategory | null } | null>(
    null,
  );

  const categories = doc.categories;

  const tabs: BuilderTab[] = [
    {
      key: "wheel",
      label: "Wheel",
      content: (
        <div className="space-y-7">
          {onPreview && (
            <button
              type="button"
              onClick={onPreview}
              className="inline-flex w-full items-center justify-center gap-1.5 rounded-full border border-white/15 px-3 py-1.5 text-sm font-medium text-white/70 transition-colors hover:bg-white/10"
            >
              <Eye className="size-3.5" /> Preview
            </button>
          )}

          {/* Wheel settings */}
          <Section title="The wheel">
          <Field label="For (recipient)">
            <input
              className={inputCls}
              value={doc.recipientName}
              onChange={(e) => setMeta({ recipientName: e.target.value })}
              placeholder="you"
            />
          </Field>
          <Field label="Wheel title">
            <input
              className={inputCls}
              value={doc.wheelTitle}
              onChange={(e) => setMeta({ wheelTitle: e.target.value })}
              placeholder="Naughty Spins"
            />
          </Field>
          <Field label="Cover message">
            <textarea
              className={`${inputCls} min-h-[80px] resize-y`}
              value={doc.intro}
              onChange={(e) => setMeta({ intro: e.target.value })}
              placeholder="Shown on the cover, before the first spin…"
            />
          </Field>
        </Section>

        {/* Categories list */}
        <Section
          title={`Categories (${categories.length})`}
          action={
            <button
              type="button"
              onClick={() => setForm({ category: null })}
              className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-[#ff4d6d] to-[#c81d4e] px-3 py-1.5 text-xs font-semibold text-white transition-transform hover:scale-[1.04]"
            >
              <Plus className="size-3.5" /> Add category
            </button>
          }
        >
          <ul className="space-y-1.5">
            {categories.map((c, i) => (
              <li key={c.id}>
                <CategoryRow
                  category={c}
                  isFirst={i === 0}
                  isLast={i === categories.length - 1}
                  onEdit={() => setForm({ category: c })}
                  onUp={() => moveCategory(c.id, -1)}
                  onDown={() => moveCategory(c.id, 1)}
                  onRemove={() => removeCategory(c.id)}
                />
              </li>
            ))}
            {categories.length === 0 && (
              <li className="rounded-lg border border-dashed border-white/12 px-3 py-8 text-center text-sm text-white/40">
                No categories yet — tap{" "}
                <span className="font-semibold text-[#ff8fae]">
                  Add category
                </span>{" "}
                to build your first wedge.
              </li>
            )}
          </ul>
          {categories.length === 1 && (
            <p className="text-xs text-[#ffb38a]">
              Add at least one more — a wheel needs two wedges to spin.
            </p>
          )}
        </Section>
        </div>
      ),
    },
  ];

  return (
    <>
      <BuilderShell
        title="Build your wheel"
        sync={sync}
        tabs={tabs}
        className={className}
      />
      {form && (
        <CategoryFormModal
          category={form.category}
          onClose={() => setForm(null)}
        />
      )}
    </>
  );
}

// ── Category list row ──────────────────────────────────────────────
function CategoryRow({
  category,
  isFirst,
  isLast,
  onEdit,
  onUp,
  onDown,
  onRemove,
}: {
  category: SpinCategory;
  isFirst: boolean;
  isLast: boolean;
  onEdit: () => void;
  onUp: () => void;
  onDown: () => void;
  onRemove: () => void;
}) {
  const count = category.prompts.length;
  return (
    <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-2.5 py-2 transition-colors hover:border-white/20">
      <span
        className="size-3 shrink-0 rounded-full"
        style={{ background: category.color }}
        aria-hidden
      />
      <button type="button" onClick={onEdit} className="min-w-0 flex-1 text-left">
        <span className="block truncate text-sm font-medium text-white/90">
          {category.label || "Untitled category"}
        </span>
        <span className="mt-0.5 block text-xs text-white/40">
          {count} prompt{count === 1 ? "" : "s"}
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
          aria-label="Edit category"
          onClick={onEdit}
          className="grid size-7 place-items-center rounded-md text-white/50 hover:bg-white/10 hover:text-[#ff8fae]"
        >
          <Pencil className="size-3.5" />
        </button>
        <button
          type="button"
          aria-label="Delete category"
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
