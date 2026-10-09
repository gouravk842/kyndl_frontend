"use client";

import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { ActivityBankPicker } from "@/features/activity-bank/components/activity-bank-picker";
import { lineText } from "@/features/activity-bank/map";

import { CATEGORY_COLORS, type SpinCategory } from "../../config";
import { categoryDefaults, useBuilderStore } from "../../store/builder.store";

interface FormState {
  label: string;
  color: string;
  /** Edited as one prompt per line; split on save. */
  promptsText: string;
}

function initialState(
  category: SpinCategory | null,
  defaultColor: string,
): FormState {
  if (!category) return { label: "", color: defaultColor, promptsText: "" };
  return {
    label: category.label,
    color: category.color,
    promptsText: category.prompts.join("\n"),
  };
}

/** Split a multiline prompt block into trimmed, non-empty lines. */
function splitPrompts(text: string): string[] {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

/**
 * Add / edit a wheel category in a popup — its label, wedge colour, and the
 * stack of prompts dealt when the wheel lands on it (one per line). A sibling of
 * Desire Deck's `CardFormModal`: pass a `category` to edit, `null` to add.
 */
export function CategoryFormModal({
  category,
  onClose,
}: {
  category: SpinCategory | null;
  onClose: () => void;
}) {
  const categories = useBuilderStore((s) => s.doc.categories);
  const addCategory = useBuilderStore((s) => s.addCategory);
  const updateCategory = useBuilderStore((s) => s.updateCategory);

  const [form, setForm] = useState<FormState>(() =>
    initialState(category, categoryDefaults(categories).color),
  );
  const patch = (p: Partial<FormState>) => setForm((f) => ({ ...f, ...p }));
  const [bankOpen, setBankOpen] = useState(false);

  // Close on Escape.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const promptCount = splitPrompts(form.promptsText).length;

  const onSave = () => {
    if (!form.label.trim()) {
      toast.error("Give this category a name.");
      return;
    }
    const data = {
      label: form.label.trim(),
      color: form.color,
      prompts: splitPrompts(form.promptsText),
    };
    if (category) updateCategory(category.id, data);
    else addCategory(data);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#1a0a13] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <h2 className="font-display text-lg text-white">
            {category ? "Edit category" : "Add a category"}
          </h2>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="grid size-8 place-items-center rounded-full text-white/50 hover:bg-white/10 hover:text-white"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Body */}
        <div className="space-y-5 overflow-y-auto px-5 py-5">
          <Field label="Name">
            <input
              className={inputCls}
              value={form.label}
              onChange={(e) => patch({ label: e.target.value })}
              placeholder="Action, Deep Talk, Dare…"
              maxLength={40}
            />
          </Field>

          <Field label="Wedge colour">
            <div className="flex flex-wrap items-center gap-2">
              {CATEGORY_COLORS.map((c) => {
                const active = form.color.toLowerCase() === c.toLowerCase();
                return (
                  <button
                    key={c}
                    type="button"
                    aria-label={`Colour ${c}`}
                    onClick={() => patch({ color: c })}
                    className={[
                      "size-8 rounded-full transition-transform hover:scale-110",
                      active
                        ? "ring-2 ring-white ring-offset-2 ring-offset-[#1a0a13]"
                        : "",
                    ].join(" ")}
                    style={{ background: c }}
                  />
                );
              })}
              <label className="relative size-8 cursor-pointer overflow-hidden rounded-full border border-white/20">
                <span
                  className="block size-full"
                  style={{ background: form.color }}
                />
                <input
                  type="color"
                  value={form.color}
                  onChange={(e) => patch({ color: e.target.value })}
                  className="absolute inset-0 cursor-pointer opacity-0"
                  aria-label="Custom colour"
                />
              </label>
            </div>
          </Field>

          <Field label={`Prompts — one per line (${promptCount})`}>
            <button
              type="button"
              onClick={() => setBankOpen(true)}
              className="mb-2 rounded-full border border-white/20 px-3 py-1.5 text-xs font-semibold text-white/80 hover:bg-white/10"
            >
              Add from the bank
            </button>
            <textarea
              className={`${inputCls} min-h-[160px] resize-y`}
              value={form.promptsText}
              onChange={(e) => patch({ promptsText: e.target.value })}
              placeholder={
                "Kiss me somewhere new.\nTell me what you've been thinking about.\nYou're in charge for the next spin."
              }
            />
          </Field>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 border-t border-white/10 px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full px-4 py-2 text-sm font-medium text-white/60 hover:bg-white/10"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onSave}
            className="rounded-full bg-gradient-to-r from-[#ff4d6d] to-[#c81d4e] px-5 py-2 text-sm font-semibold text-white transition-transform hover:scale-[1.03]"
          >
            {category ? "Save changes" : "Add category"}
          </button>
        </div>
      </div>
      <ActivityBankPicker
        open={bankOpen}
        includeAdult
        initialKind={/talk/i.test(form.label) ? "truth" : "dare"}
        onClose={() => setBankOpen(false)}
        onPick={(picked) => {
          const lines = picked.map((item) => lineText(item));
          const existing = form.promptsText.trim();
          patch({
            promptsText: [existing, ...lines].filter(Boolean).join("\n"),
          });
        }}
      />
    </div>
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
      <span className="mb-1.5 block text-xs font-medium tracking-wide text-white/50">
        {label}
      </span>
      {children}
    </label>
  );
}
