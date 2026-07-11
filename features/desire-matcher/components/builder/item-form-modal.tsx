"use client";

import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Flames } from "@/features/desire-deck/components/flames";

import { type Heat, HEAT_META, HEAT_ORDER, type MatcherItem } from "../../config";
import { itemHeatDefault, useBuilderStore } from "../../store/builder.store";

interface FormState {
  label: string;
  heat: Heat;
}

/**
 * Add / edit a Matcher item — the activity text and its heat tier. The owner's
 * own yes/maybe/no answer is set inline in the list row, not here.
 */
export function ItemFormModal({
  item,
  onClose,
}: {
  item: MatcherItem | null;
  onClose: () => void;
}) {
  const items = useBuilderStore((s) => s.doc.items);
  const addItem = useBuilderStore((s) => s.addItem);
  const updateItem = useBuilderStore((s) => s.updateItem);

  const [form, setForm] = useState<FormState>(() =>
    item
      ? { label: item.label, heat: item.heat }
      : { label: "", heat: itemHeatDefault(items.length) },
  );
  const patch = (p: Partial<FormState>) => setForm((f) => ({ ...f, ...p }));

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const onSave = () => {
    if (!form.label.trim()) {
      toast.error("Write something for this one.");
      return;
    }
    const data = { label: form.label.trim(), heat: form.heat };
    if (item) updateItem(item.id, data);
    else addItem(data);
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
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <h2 className="font-display text-lg text-white">
            {item ? "Edit item" : "Add an item"}
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
          <Field label="The activity">
            <textarea
              className={`${inputCls} min-h-[110px] resize-y`}
              value={form.label}
              onChange={(e) => patch({ label: e.target.value })}
              placeholder="Something you might both be into…"
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
            className="rounded-full bg-gradient-to-r from-[#ff4d6d] to-[#c81d4e] px-5 py-2 text-sm font-semibold text-white transition-transform hover:scale-[1.03]"
          >
            {item ? "Save changes" : "Add item"}
          </button>
        </div>
      </div>
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
