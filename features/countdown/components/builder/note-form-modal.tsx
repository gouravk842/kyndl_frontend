"use client";

import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import type { CountdownNote } from "../../config";
import { useBuilderStore } from "../../store/builder.store";

interface FormState {
  label: string;
  message: string;
}

/**
 * Add / edit one waiting note — a label and the message read when it's opened.
 * Pass a `note` to edit, `null` to add. Mirrors the memory-jar note modal.
 */
export function NoteFormModal({
  note,
  onClose,
}: {
  note: CountdownNote | null;
  onClose: () => void;
}) {
  const addNote = useBuilderStore((s) => s.addNote);
  const updateNote = useBuilderStore((s) => s.updateNote);

  const [form, setForm] = useState<FormState>(() => ({
    label: note?.label ?? "",
    message: note?.message ?? "",
  }));

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
    if (!form.message.trim()) {
      toast.error("Write a message for this note.");
      return;
    }
    const data = { label: form.label.trim(), message: form.message.trim() };
    if (note) updateNote(note.id, data);
    else addNote(data);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-[#f2dace] bg-[#fffaf4] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-[#f2dace] px-5 py-4">
          <h2 className="font-display text-lg text-[#3a2a25]">
            {note ? "Edit note" : "Add a note"}
          </h2>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="grid size-8 place-items-center rounded-full text-[#92786c] hover:bg-[#fbeee6] hover:text-[#c75b39]"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="space-y-4 overflow-y-auto px-5 py-5">
          <Field label="Label (shown on the card)">
            <input
              className={inputCls}
              value={form.label}
              onChange={(e) => patch({ label: e.target.value })}
              placeholder="almost there"
            />
          </Field>
          <Field label="Message">
            <textarea
              className={`${inputCls} min-h-[140px] resize-y`}
              value={form.message}
              onChange={(e) => patch({ message: e.target.value })}
              placeholder="Write a little something to open while waiting…"
            />
          </Field>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-[#f2dace] px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full px-4 py-2 text-sm font-medium text-[#7a6258] hover:bg-[#fbeee6]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onSave}
            className="rounded-full bg-[#ff7a59] px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#f2596f]"
          >
            {note ? "Save changes" : "Add note"}
          </button>
        </div>
      </div>
    </div>
  );
}

const inputCls =
  "w-full rounded-lg border border-[#e3d2c5] bg-white px-3 py-2 text-sm text-[#3a2a25] outline-none transition-colors focus:border-[#ff7a59] focus:ring-2 focus:ring-[#ff7a59]/20";

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium tracking-wide text-[#92786c]">
        {label}
      </span>
      {children}
    </label>
  );
}
