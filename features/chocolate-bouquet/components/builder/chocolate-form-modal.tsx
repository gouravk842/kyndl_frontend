"use client";

import { X } from "lucide-react";
import { useEffect } from "react";

import type { ChocolateType } from "../../config";
import { CHOCOLATE_TYPE_LIST } from "../../lib/chocolate-kinds";
import { useBuilderStore } from "../../store/builder.store";

const inputCls =
  "w-full rounded-lg border border-[#3a2028] bg-[#1c0e13] px-3 py-2 text-sm text-[#f0e3e0] outline-none transition-colors placeholder:text-[#8a6a70] focus:border-[#d6465a] focus:ring-2 focus:ring-[#d6465a]/20";

/** Edit one chocolate's memory. Writes straight to the builder store. */
export function ChocolateFormModal({
  id,
  onClose,
}: {
  id: number;
  onClose: () => void;
}) {
  const chocolate = useBuilderStore((s) =>
    s.doc.chocolates.find((c) => c.id === id),
  );
  const update = useBuilderStore((s) => s.updateChocolate);

  // If the chocolate vanished (deleted elsewhere), close.
  useEffect(() => {
    if (!chocolate) onClose();
  }, [chocolate, onClose]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  if (!chocolate) return null;

  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div aria-hidden className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Edit chocolate"
        className="relative w-full max-w-md overflow-hidden rounded-2xl border border-[#3a2028] bg-[#150a0f] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-[#2a161c] px-5 py-3">
          <h2 className="text-sm font-semibold text-[#f0e3e0]">Edit chocolate</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="grid size-8 place-items-center rounded-md text-[#a98a90] hover:bg-white/5 hover:text-white"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="max-h-[70vh] space-y-4 overflow-y-auto px-5 py-4">
          <Field label="Kind of chocolate">
            <select
              className={inputCls}
              value={chocolate.type}
              onChange={(e) =>
                update(id, { type: e.target.value as ChocolateType })
              }
            >
              {CHOCOLATE_TYPE_LIST.map((k) => (
                <option key={k.type} value={k.type}>
                  {k.label} — {k.hint}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Title">
            <input
              className={inputCls}
              value={chocolate.label}
              onChange={(e) => update(id, { label: e.target.value })}
              placeholder="the night we met"
            />
          </Field>

          <Field label="Date / caption">
            <input
              className={inputCls}
              value={chocolate.date}
              onChange={(e) => update(id, { date: e.target.value })}
              placeholder="that first spring"
            />
          </Field>

          <Field label="The memory">
            <textarea
              className={`${inputCls} min-h-[120px] resize-y`}
              value={chocolate.message}
              onChange={(e) => update(id, { message: e.target.value })}
              placeholder="Write the moment this chocolate holds…"
            />
          </Field>

          <Field label="Photo URL (optional)">
            <input
              className={inputCls}
              value={chocolate.imageUrl ?? ""}
              onChange={(e) =>
                update(id, { imageUrl: e.target.value || null })
              }
              placeholder="https://… or /chocolate-bouquet/photo.jpg"
            />
          </Field>

          {chocolate.type === "voice" && (
            <Field label="Voice note audio URL">
              <input
                className={inputCls}
                value={chocolate.audioUrl ?? ""}
                onChange={(e) =>
                  update(id, { audioUrl: e.target.value || null })
                }
                placeholder="https://…/voice-note.mp3"
              />
            </Field>
          )}
        </div>

        <div className="border-t border-[#2a161c] px-5 py-3 text-right">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-[#d6465a] px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#e75c70]"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium tracking-wide text-[#a98a90]">
        {label}
      </span>
      {children}
    </label>
  );
}
