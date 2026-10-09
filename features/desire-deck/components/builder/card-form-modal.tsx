"use client";

import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { ActivityBankPicker } from "@/features/activity-bank/components/activity-bank-picker";
import { heatForType, lineText } from "@/features/activity-bank/map";
import { fileRef } from "@/features/activity-bank/previews";

import { type DeckCard, type Heat, HEAT_META, HEAT_ORDER } from "../../config";
import {
  cardDefaults,
  nextCardId,
  useBuilderStore,
} from "../../store/builder.store";
import { Flames } from "../flames";

interface FormState {
  prompt: string;
  heat: Heat;
  rotation: number;
  image: { fileId: string } | null;
}

function initialState(card: DeckCard | null, defaults: FormState): FormState {
  if (!card) return defaults;
  return {
    prompt: card.prompt,
    heat: card.heat,
    rotation: card.rotation,
    image: card.image ?? null,
  };
}

/**
 * Add / edit a deck card in a popup — the prompt, its heat tier, and the card's
 * tilt in the pile. A sibling of memory-jar's `NoteFormModal`: pass a `card` to
 * edit, `null` to add.
 */
export function CardFormModal({
  card,
  onClose,
}: {
  card: DeckCard | null;
  onClose: () => void;
}) {
  const cards = useBuilderStore((s) => s.doc.cards);
  const addCard = useBuilderStore((s) => s.addCard);
  const updateCard = useBuilderStore((s) => s.updateCard);

  const defaults: FormState = {
    prompt: "",
    image: null,
    ...cardDefaults(nextCardId(cards)),
  };

  const [form, setForm] = useState<FormState>(() =>
    initialState(card, defaults),
  );
  const [bankOpen, setBankOpen] = useState(false);
  const patch = (p: Partial<FormState>) => setForm((f) => ({ ...f, ...p }));

  // Close on Escape.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const onSave = () => {
    if (!form.prompt.trim()) {
      toast.error("Write something on this card.");
      return;
    }
    const data = {
      prompt: form.prompt.trim(),
      heat: form.heat,
      rotation: form.rotation,
      image: form.image,
    };
    if (card) updateCard(card.id, data);
    else addCard(data);
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
            {card ? "Edit card" : "Add a card"}
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
          <button
            type="button"
            onClick={() => setBankOpen(true)}
            className="rounded-full border border-white/20 px-3 py-1.5 text-xs font-semibold text-white/80 hover:bg-white/10"
          >
            Use a bank line
          </button>
          <Field label="The card">
            <textarea
              className={`${inputCls} min-h-[140px] resize-y`}
              value={form.prompt}
              onChange={(e) => patch({ prompt: e.target.value })}
              placeholder="A prompt, a dare, a question — written for the two of you…"
            />
          </Field>

          <Field label="Heat">
            <div className="grid grid-cols-2 gap-2">
              {HEAT_ORDER.map((h) => {
                const meta = HEAT_META[h];
                const active = form.heat === h;
                return (
                  <button
                    key={h}
                    type="button"
                    onClick={() => patch({ heat: h })}
                    className={[
                      "flex items-center justify-between gap-2 rounded-lg border px-3 py-2 text-sm transition-colors",
                      active
                        ? "border-transparent text-white"
                        : "border-white/12 text-white/55 hover:border-white/25",
                    ].join(" ")}
                    style={active ? { background: meta.card } : undefined}
                  >
                    <span className="font-medium">{meta.label}</span>
                    <Flames heat={h} />
                  </button>
                );
              })}
            </div>
          </Field>

          <Field label={`Tilt (${Math.round(form.rotation)}°)`}>
            <input
              type="range"
              min={-12}
              max={12}
              step={1}
              className="w-full accent-[#ff4d6d]"
              value={form.rotation}
              onChange={(e) => patch({ rotation: Number(e.target.value) })}
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
            {card ? "Save changes" : "Add card"}
          </button>
        </div>
      </div>
      <ActivityBankPicker
        open={bankOpen}
        includeAdult
        onClose={() => setBankOpen(false)}
        onPick={(picked) => {
          const item = picked[0];
          if (!item) return;
          const image = fileRef(item);
          setForm((current) => ({
            ...current,
            prompt: lineText(item),
            heat: heatForType(item.type.slug),
            image: image ?? null,
          }));
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
