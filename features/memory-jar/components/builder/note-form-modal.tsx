"use client";

import { ImagePlus, Loader2, X } from "lucide-react";
import { type ChangeEvent, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { SignInLink } from "@/components/auth/sign-in-link";
import { fileService } from "@/services/files/file.service";

import type { JarNote } from "../../config";
import {
  nextNoteId,
  noteDefaults,
  PAPER_TONES,
  useBuilderStore,
} from "../../store/builder.store";

interface FormState {
  title: string;
  message: string;
  paperTone: string;
  rotation: number;
}

function initialState(note: JarNote | null, defaults: FormState): FormState {
  if (!note) return defaults;
  return {
    title: note.title,
    message: note.message,
    paperTone: note.paperTone,
    rotation: note.rotation,
  };
}

/**
 * Add / edit a jar note in a popup — title, message, an optional photo, and the
 * slip's paper colour + tilt. A sibling of our-places' `PlaceFormModal`: pass a
 * `note` to edit, `null` to add. The photo is uploaded immediately and staged
 * locally until the note is saved.
 */
export function NoteFormModal({
  note,
  canUpload,
  onClose,
}: {
  note: JarNote | null;
  canUpload: boolean;
  onClose: () => void;
}) {
  const notes = useBuilderStore((s) => s.doc.notes);
  const addNote = useBuilderStore((s) => s.addNote);
  const updateNote = useBuilderStore((s) => s.updateNote);
  const setNoteImage = useBuilderStore((s) => s.setNoteImage);
  const removeNoteImage = useBuilderStore((s) => s.removeNoteImage);
  const urlFor = useBuilderStore((s) => s.urlFor);

  // Defaults for a brand-new note (seeded by the id it will get).
  const defaults: FormState = {
    title: "",
    message: "",
    ...noteDefaults(nextNoteId(notes)),
  };

  const [form, setForm] = useState<FormState>(() =>
    initialState(note, defaults),
  );
  // Image staged locally until save: { fileId, url } or null (none/removed).
  const [image, setImage] = useState<{ fileId: string; url: string } | null>(
    note?.image
      ? { fileId: note.image.fileId, url: urlFor(note.image) ?? "" }
      : null,
  );

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
    const data = {
      title: form.title.trim(),
      message: form.message.trim(),
      paperTone: form.paperTone,
      rotation: form.rotation,
    };

    if (note) {
      updateNote(note.id, data);
      if (image) setNoteImage(note.id, image.fileId, image.url);
      else removeNoteImage(note.id);
    } else {
      const id = addNote({ ...data, image: image ? { fileId: image.fileId } : undefined });
      if (image) setNoteImage(id, image.fileId, image.url);
    }
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
        {/* Header */}
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

        {/* Body */}
        <div className="space-y-4 overflow-y-auto px-5 py-5">
          <ImagePicker canUpload={canUpload} image={image} onSet={setImage} />

          <Field label="Label (front of the slip)">
            <input
              className={inputCls}
              value={form.title}
              onChange={(e) => patch({ title: e.target.value })}
              placeholder="for a hard day"
            />
          </Field>

          <Field label="Message">
            <textarea
              className={`${inputCls} min-h-[150px] resize-y`}
              value={form.message}
              onChange={(e) => patch({ message: e.target.value })}
              placeholder="Write it like a letter to them…"
            />
          </Field>

          <div className="flex items-end gap-4">
            <Field label="Paper">
              <div className="flex flex-wrap items-center gap-1.5">
                {PAPER_TONES.map((tone) => (
                  <button
                    key={tone}
                    type="button"
                    aria-label={`Paper colour ${tone}`}
                    onClick={() => patch({ paperTone: tone })}
                    className={[
                      "size-6 rounded-full border transition-transform",
                      form.paperTone === tone
                        ? "border-[#ff7a59] ring-2 ring-[#ff7a59]/30"
                        : "border-black/10 hover:scale-110",
                    ].join(" ")}
                    style={{ background: tone }}
                  />
                ))}
                <input
                  type="color"
                  aria-label="Custom paper colour"
                  className="h-7 w-9 cursor-pointer rounded-md border border-[#e3d2c5] bg-white p-0.5"
                  value={form.paperTone}
                  onChange={(e) => patch({ paperTone: e.target.value })}
                />
              </div>
            </Field>
          </div>

          <Field label={`Tilt (${Math.round(form.rotation)}°)`}>
            <input
              type="range"
              min={-15}
              max={15}
              step={1}
              className="w-full accent-[#ff7a59]"
              value={form.rotation}
              onChange={(e) => patch({ rotation: Number(e.target.value) })}
            />
          </Field>
        </div>

        {/* Footer */}
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

// ── Image picker ───────────────────────────────────────────────────
function ImagePicker({
  canUpload,
  image,
  onSet,
}: {
  canUpload: boolean;
  image: { fileId: string; url: string } | null;
  onSet: (image: { fileId: string; url: string } | null) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const ref = useRef<HTMLInputElement>(null);

  const onPick = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploading(true);
    try {
      const fileId = await fileService.upload(file, "memory-jar");
      onSet({ fileId, url: URL.createObjectURL(file) });
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Could not upload that photo.",
      );
    } finally {
      setUploading(false);
    }
  };

  if (!canUpload) {
    return (
      <div className="rounded-lg border border-dashed border-[#e3d2c5] px-3 py-4 text-center text-xs text-[#92786c]">
        <SignInLink className="font-semibold text-[#c75b39] underline">
          Sign in
        </SignInLink>{" "}
        to add a photo to this note.
      </div>
    );
  }

  return (
    <Field label="Photo (optional)">
      <input
        ref={ref}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={onPick}
      />
      {image?.url ? (
        <div className="relative overflow-hidden rounded-lg">
          {/* eslint-disable-next-line @next/next/no-img-element -- transient/presigned URL */}
          <img src={image.url} alt="" className="h-36 w-full object-cover" />
          <button
            type="button"
            aria-label="Remove photo"
            onClick={() => onSet(null)}
            className="absolute top-2 right-2 grid size-7 place-items-center rounded-full bg-black/55 text-white hover:bg-black/75"
          >
            <X className="size-3.5" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => ref.current?.click()}
          disabled={uploading}
          className="flex h-32 w-full flex-col items-center justify-center gap-1.5 rounded-lg border-2 border-dashed border-[#e3d2c5] bg-white text-[#92786c] transition-colors hover:border-[#ff7a59]/60 hover:text-[#c75b39] disabled:opacity-60"
        >
          {uploading ? (
            <Loader2 className="size-5 animate-spin" />
          ) : (
            <ImagePlus className="size-5" />
          )}
          <span className="text-xs font-medium">
            {uploading ? "Uploading…" : "Add a photo"}
          </span>
        </button>
      )}
    </Field>
  );
}

// ── Small building blocks (mirrors builder-panel) ──────────────────
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
