"use client";

import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { ActivityBankPicker } from "@/features/activity-bank/components/activity-bank-picker";
import { mirrorMoodForType } from "@/features/activity-bank/map";

import {
  type MirrorItem,
  type Mood,
  MOOD_META,
  MOOD_ORDER,
} from "../../config";
import { itemMoodDefault, useBuilderStore } from "../../store/builder.store";

interface FormState {
  label: string;
  mood: Mood;
}

/**
 * Add / edit a Mirror Match prompt — the text and its mood. The owner's own
 * yes/kinda/no answer is set inline in the list row, not here.
 */
export function ItemFormModal({
  item,
  onClose,
}: {
  item: MirrorItem | null;
  onClose: () => void;
}) {
  const items = useBuilderStore((s) => s.doc.items);
  const addItem = useBuilderStore((s) => s.addItem);
  const updateItem = useBuilderStore((s) => s.updateItem);

  const [form, setForm] = useState<FormState>(() =>
    item
      ? { label: item.label, mood: item.mood }
      : { label: "", mood: itemMoodDefault(items.length) },
  );
  const patch = (p: Partial<FormState>) => setForm((f) => ({ ...f, ...p }));
  const [bankOpen, setBankOpen] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const onSave = () => {
    if (!form.label.trim()) {
      toast.error("Write a prompt for this one.");
      return;
    }
    const data = { label: form.label.trim(), mood: form.mood };
    if (item) updateItem(item.id, data);
    else addItem(data);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#1a1210] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <h2 className="font-display text-lg text-white">
            {item ? "Edit prompt" : "Add a prompt"}
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

        <div className="space-y-5 overflow-y-auto px-5 py-5">
          <button
            type="button"
            onClick={() => setBankOpen(true)}
            className="rounded-full border border-white/20 px-3 py-1.5 text-xs font-semibold text-white/80 hover:bg-white/10"
          >
            Use a bank line
          </button>
          <Field label="The prompt">
            <textarea
              className={`${inputCls} min-h-[110px] resize-y`}
              value={form.label}
              onChange={(e) => patch({ label: e.target.value })}
              placeholder="Something true about you two…"
            />
          </Field>

          <Field label="Mood">
            <div className="grid grid-cols-2 gap-2">
              {MOOD_ORDER.map((m) => {
                const meta = MOOD_META[m];
                const active = form.mood === m;
                return (
                  <button
                    key={m}
                    type="button"
                    onClick={() => patch({ mood: m })}
                    className={[
                      "flex items-center justify-between gap-2 rounded-lg border px-3 py-2 text-sm transition-colors",
                      active
                        ? "border-transparent text-white"
                        : "border-white/12 text-white/55 hover:border-white/25",
                    ].join(" ")}
                    style={
                      active
                        ? {
                            background: `${meta.color}33`,
                            borderColor: meta.color,
                          }
                        : undefined
                    }
                  >
                    <span className="font-medium">{meta.label}</span>
                    <span
                      className="size-2.5 rounded-full"
                      style={{ background: meta.color }}
                      aria-hidden
                    />
                  </button>
                );
              })}
            </div>
          </Field>
        </div>

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
            className="rounded-full bg-gradient-to-r from-[#D4A373] to-[#B11226] px-5 py-2 text-sm font-semibold text-white transition-transform hover:scale-[1.03]"
          >
            {item ? "Save changes" : "Add prompt"}
          </button>
        </div>
      </div>
      <ActivityBankPicker
        open={bankOpen}
        initialKind="truth"
        openOnly
        onClose={() => setBankOpen(false)}
        onPick={(picked) => {
          const chosen = picked[0];
          if (!chosen || chosen.choices.length > 0) return;
          setForm((current) => ({
            ...current,
            label: chosen.text.slice(0, 400),
            mood: mirrorMoodForType(chosen.type.slug),
          }));
        }}
      />
    </div>
  );
}

const inputCls =
  "w-full rounded-lg border border-white/12 bg-white/5 px-3 py-2 text-sm text-white outline-none transition-colors placeholder:text-white/30 focus:border-[#D4A373] focus:ring-2 focus:ring-[#D4A373]/25";

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
