"use client";

import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import {
  CLIMAX_SQUARE,
  type Heat,
  HEAT_META,
  HEAT_ORDER,
  LADDERS,
  SAFE_SQUARES,
  SNAKES,
  type Square,
} from "../../config";
import { useBuilderStore } from "../../store/builder.store";
import { Flames } from "../flames";

interface FormState {
  name: string;
  note: string;
  heat: Heat;
}

/** A one-line hint about this square's role on the board. */
function squareRole(id: number): string | null {
  if (id === CLIMAX_SQUARE) return "👑 The finale — shown when someone reaches 100.";
  if (LADDERS[id] !== undefined) return `🪜 Ladder — lands here and rushes up to ${LADDERS[id]}.`;
  if (SNAKES[id] !== undefined) return `🐍 Snake — lands here and slides back to ${SNAKES[id]}.`;
  if (SAFE_SQUARES.has(id)) return "🛡 Safe square — a check-in breather (its dare is skipped in play).";
  return null;
}

/**
 * Edit a single square of the track in a popup — its dare name, the playful
 * how-to, and its heat tier. The track is fixed at 100, so this only ever edits;
 * there's nothing to add or remove.
 */
export function SquareFormModal({
  square,
  onClose,
}: {
  square: Square;
  onClose: () => void;
}) {
  const updateSquare = useBuilderStore((s) => s.updateSquare);

  const [form, setForm] = useState<FormState>({
    name: square.name,
    note: square.note,
    heat: square.heat,
  });
  const patch = (p: Partial<FormState>) => setForm((f) => ({ ...f, ...p }));

  // Close on Escape.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const role = squareRole(square.id);

  const onSave = () => {
    if (!form.name.trim()) {
      toast.error("Give this square a dare.");
      return;
    }
    updateSquare(square.id, {
      name: form.name.trim(),
      note: form.note.trim(),
      heat: form.heat,
    });
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
            Square <span className="text-[#ff8fae]">{square.id}</span>
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
          {role && (
            <p className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-xs leading-relaxed text-white/55">
              {role}
            </p>
          )}

          <Field label="Dare">
            <input
              className={inputCls}
              value={form.name}
              onChange={(e) => patch({ name: e.target.value })}
              placeholder="Slow Kiss, Strip One, Wild Card…"
              maxLength={120}
            />
          </Field>

          <Field label="How-to (optional)">
            <textarea
              className={`${inputCls} min-h-[100px] resize-y`}
              value={form.note}
              onChange={(e) => patch({ note: e.target.value })}
              placeholder="A short, playful line for the two of you…"
              maxLength={2000}
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
            Save changes
          </button>
        </div>
      </div>
    </div>
  );
}

const inputCls =
  "w-full rounded-lg border border-white/12 bg-white/5 px-3 py-2 text-sm text-white outline-none transition-colors placeholder:text-white/30 focus:border-[#ff4d6d] focus:ring-2 focus:ring-[#ff4d6d]/25";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium tracking-wide text-white/50">
        {label}
      </span>
      {children}
    </label>
  );
}
