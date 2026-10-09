"use client";

import { ImagePlus, Loader2, Trash2, X } from "lucide-react";
import { type ChangeEvent, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { SignInLink } from "@/components/auth/sign-in-link";
import { fileService } from "@/services/files/file.service";

import { CATEGORY_GLYPH, CATEGORY_LABELS } from "../../config";
import { useBuilderStore } from "../../store/builder.store";
import type { CalendarEvent, EventCategory } from "../../types";

const CATEGORIES = Object.keys(CATEGORY_LABELS) as EventCategory[];

interface FormState {
  date: string;
  title: string;
  note: string;
  category: EventCategory;
  recursYearly: boolean;
}

export type MemoryPrefill = {
  date?: string;
  title?: string;
  category?: EventCategory;
  recursYearly?: boolean;
  /** Shown as the note field placeholder when adding from a prompt. */
  noteHint?: string;
};

function initialState(
  event: CalendarEvent | null,
  prefillDate?: string,
  prefill?: MemoryPrefill,
): FormState {
  return {
    date: event?.date ?? prefillDate ?? prefill?.date ?? "",
    title: event?.title ?? prefill?.title ?? "",
    note: event?.note ?? "",
    category: event?.category ?? prefill?.category ?? "milestone",
    recursYearly: event?.recursYearly ?? prefill?.recursYearly ?? false,
  };
}

/**
 * Add / edit a calendar memory. Pass `event` to edit, `null` to add
 * (optionally with `prefillDate` / `prefill` from a day click or prompt).
 */
export function MemoryFormModal({
  event,
  prefillDate,
  prefill,
  canUpload,
  onClose,
}: {
  event: CalendarEvent | null;
  prefillDate?: string;
  prefill?: MemoryPrefill;
  canUpload: boolean;
  onClose: () => void;
}) {
  const createEvent = useBuilderStore((s) => s.createEvent);
  const updateEvent = useBuilderStore((s) => s.updateEvent);
  const removeEvent = useBuilderStore((s) => s.removeEvent);
  const setPhoto = useBuilderStore((s) => s.setPhoto);
  const removePhoto = useBuilderStore((s) => s.removePhoto);
  const photoUrl = useBuilderStore((s) => s.photoUrl);

  const [form, setForm] = useState<FormState>(() =>
    initialState(event, prefillDate, prefill),
  );
  const [stagedPhoto, setStagedPhoto] = useState<{
    fileId: string;
    url: string;
  } | null>(() => {
    if (!event?.photo) return null;
    const url = photoUrl(event);
    return url ? { fileId: event.photo.fileId, url } : null;
  });
  const [clearPhoto, setClearPhoto] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const patch = (p: Partial<FormState>) => setForm((f) => ({ ...f, ...p }));

  const save = () => {
    const title = form.title.trim();
    if (!title) {
      toast.error("Give this memory a title.");
      return;
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(form.date)) {
      toast.error("Pick a valid date.");
      return;
    }

    if (event) {
      updateEvent(event.id, {
        date: form.date,
        title,
        note: form.note.trim(),
        category: form.category,
        recursYearly: form.recursYearly,
      });
      if (clearPhoto) removePhoto(event.id);
      else if (stagedPhoto && stagedPhoto.fileId !== event.photo?.fileId) {
        setPhoto(event.id, stagedPhoto.fileId, stagedPhoto.url);
      }
    } else {
      const id = createEvent({
        date: form.date,
        title,
        note: form.note.trim(),
        category: form.category,
        recursYearly: form.recursYearly,
      });
      if (stagedPhoto) setPhoto(id, stagedPhoto.fileId, stagedPhoto.url);
    }
    onClose();
  };

  const onDelete = () => {
    if (!event) return;
    removeEvent(event.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center sm:items-center">
      <button
        type="button"
        aria-label="Close"
        className="absolute inset-0 bg-[#3a2a25]/45 backdrop-blur-[2px]"
        onClick={onClose}
      />
      <div className="relative z-10 flex max-h-[92dvh] w-full max-w-md flex-col overflow-hidden rounded-t-2xl bg-[#fffaf4] shadow-2xl sm:rounded-2xl">
        <div className="flex items-center justify-between border-b border-[#f2dace] px-5 py-4">
          <h2 className="font-display text-lg text-[#3a2a25]">
            {event ? "Edit memory" : "Add a memory"}
          </h2>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="grid size-8 place-items-center rounded-full text-[#92786c] hover:bg-[#fbeee6]"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto px-5 py-4">
          <Field label="Date">
            <input
              type="date"
              className={inputCls}
              value={form.date}
              onChange={(e) => patch({ date: e.target.value })}
            />
          </Field>
          <Field label="Title">
            <input
              className={inputCls}
              value={form.title}
              onChange={(e) => patch({ title: e.target.value })}
              placeholder="What happened?"
              maxLength={120}
            />
          </Field>
          <Field label="Note">
            <textarea
              className={`${inputCls} min-h-[88px] resize-y`}
              value={form.note}
              onChange={(e) => patch({ note: e.target.value })}
              placeholder={
                prefill?.noteHint ?? "A few words they'll want to read again…"
              }
              maxLength={4000}
            />
          </Field>
          <Field label="Category">
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {CATEGORIES.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => patch({ category: c })}
                  className={[
                    "rounded-lg border px-2 py-2 text-left text-xs transition-colors",
                    form.category === c
                      ? "border-[#ff7a59] bg-[#fbeee6] text-[#c75b39]"
                      : "border-[#f2dace] bg-white text-[#7a6258] hover:border-[#ff7a59]/50",
                  ].join(" ")}
                >
                  <span className="mr-1">{CATEGORY_GLYPH[c]}</span>
                  {CATEGORY_LABELS[c]}
                </button>
              ))}
            </div>
          </Field>
          <label className="flex items-center gap-2 text-sm text-[#5c4033]">
            <input
              type="checkbox"
              checked={form.recursYearly}
              onChange={(e) => patch({ recursYearly: e.target.checked })}
              className="size-4 rounded border-[#e3d2c5] accent-[#B11226]"
            />
            Repeat every year
          </label>
          <PhotoPicker
            canUpload={canUpload}
            photo={clearPhoto ? null : stagedPhoto}
            onSet={(p) => {
              setStagedPhoto(p);
              setClearPhoto(!p);
            }}
          />
        </div>

        <div className="flex items-center gap-2 border-t border-[#f2dace] px-5 py-4">
          {event && (
            <button
              type="button"
              onClick={onDelete}
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium text-[#c0392b] hover:bg-[#fbe1d8]"
            >
              <Trash2 className="size-3.5" /> Delete
            </button>
          )}
          <div className="flex-1" />
          <button
            type="button"
            onClick={onClose}
            className="rounded-full px-4 py-2 text-sm font-medium text-[#92786c] hover:bg-[#fbeee6]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={save}
            className="rounded-full bg-[#ff7a59] px-5 py-2 text-sm font-semibold text-white hover:bg-[#f2596f]"
          >
            {event ? "Save" : "Add"}
          </button>
        </div>
      </div>
    </div>
  );
}

function PhotoPicker({
  canUpload,
  photo,
  onSet,
}: {
  canUpload: boolean;
  photo: { fileId: string; url: string } | null;
  onSet: (photo: { fileId: string; url: string } | null) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const ref = useRef<HTMLInputElement>(null);

  const onPick = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploading(true);
    try {
      const fileId = await fileService.upload(file, "relationship-calendar");
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
        to add a photo to this memory.
      </div>
    );
  }

  return (
    <Field label="Photo">
      <input
        ref={ref}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={onPick}
      />
      {photo?.url ? (
        <div className="relative overflow-hidden rounded-lg">
          {/* eslint-disable-next-line @next/next/no-img-element -- transient/presigned URL */}
          <img src={photo.url} alt="" className="h-36 w-full object-cover" />
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
