"use client";

import { ImagePlus, Loader2, Mic, X } from "lucide-react";
import { type ChangeEvent, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { SignInLink } from "@/components/auth/sign-in-link";
import { fileService } from "@/services/files/file.service";

import type { Reason } from "../../config";
import { useBuilderStore } from "../../store/builder.store";

function toLocalInput(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function fromLocalInput(local: string): string {
  const d = new Date(local);
  return Number.isNaN(d.getTime()) ? local : d.toISOString();
}

interface FormState {
  label: string;
  message: string;
  teaser: string;
  unlockAt: string;
}

function initialState(
  reason: Reason | null,
  fallbackUnlockAt: string,
): FormState {
  if (!reason) {
    return {
      label: "",
      message: "",
      teaser: "",
      unlockAt: toLocalInput(fallbackUnlockAt),
    };
  }
  return {
    label: reason.label,
    message: reason.message,
    teaser: reason.teaser,
    unlockAt: toLocalInput(reason.unlockAt),
  };
}

/**
 * Add / edit a reason — message, label, teaser, unlock time override, optional
 * photo + voice. Media uploads require sign-in (same as Memory Jar).
 */
export function ReasonFormModal({
  reason,
  canUpload,
  onClose,
}: {
  reason: Reason | null;
  canUpload: boolean;
  onClose: () => void;
}) {
  const doc = useBuilderStore((s) => s.doc);
  const addReason = useBuilderStore((s) => s.addReason);
  const updateReason = useBuilderStore((s) => s.updateReason);
  const setReasonImage = useBuilderStore((s) => s.setReasonImage);
  const clearReasonImage = useBuilderStore((s) => s.clearReasonImage);
  const setReasonAudio = useBuilderStore((s) => s.setReasonAudio);
  const clearReasonAudio = useBuilderStore((s) => s.clearReasonAudio);
  const urlFor = useBuilderStore((s) => s.urlFor);

  const fallbackUnlockAt = (() => {
    if (reason) return reason.unlockAt;
    const anchorMs = Date.parse(doc.anchorAt);
    if (Number.isNaN(anchorMs)) return doc.anchorAt;
    return new Date(
      anchorMs + doc.intervalHours * 60 * 60 * 1000 * doc.reasons.length,
    ).toISOString();
  })();

  const [form, setForm] = useState<FormState>(() =>
    initialState(reason, fallbackUnlockAt),
  );
  const [image, setImage] = useState<{ fileId: string; url: string } | null>(
    reason?.image
      ? { fileId: reason.image.fileId, url: urlFor(reason.image) ?? "" }
      : null,
  );
  const [audio, setAudio] = useState<{ fileId: string; url: string } | null>(
    reason?.audio
      ? { fileId: reason.audio.fileId, url: urlFor(reason.audio) ?? "" }
      : null,
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
    const message = form.message.trim();
    const hasMedia = !!(image || audio);
    if (!message && !hasMedia) {
      toast.error("Add a message, photo, or voice note.");
      return;
    }

    const data = {
      label: form.label.trim(),
      message: message || " ",
      teaser: form.teaser.trim(),
      unlockAt: form.unlockAt ? fromLocalInput(form.unlockAt) : doc.anchorAt,
    };

    if (reason) {
      updateReason(reason.id, data);
      if (image) setReasonImage(reason.id, image.fileId, image.url);
      else clearReasonImage(reason.id);
      if (audio) setReasonAudio(reason.id, audio.fileId, audio.url);
      else clearReasonAudio(reason.id);
    } else {
      if (doc.reasons.length >= 24) {
        toast.error("You already have 24 reasons.");
        return;
      }
      const id = addReason();
      if (!id) {
        toast.error("Could not add another reason.");
        return;
      }
      updateReason(id, data);
      if (image) setReasonImage(id, image.fileId, image.url);
      if (audio) setReasonAudio(id, audio.fileId, audio.url);
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
        <div className="flex items-center justify-between border-b border-[#f2dace] px-5 py-4">
          <h2 className="font-display text-lg text-[#3a2a25]">
            {reason ? `Edit reason ${reason.n}` : "Add a reason"}
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
          <Field label="The reason">
            <textarea
              className={`${inputCls} min-h-[120px] resize-y`}
              value={form.message}
              onChange={(e) => patch({ message: e.target.value })}
              placeholder="Why you love them…"
            />
          </Field>

          <Field label="Label (optional)">
            <input
              className={inputCls}
              value={form.label}
              onChange={(e) => patch({ label: e.target.value })}
              placeholder="Morning · Why I stay"
            />
          </Field>

          <Field label="Teaser while locked (optional)">
            <input
              className={inputCls}
              value={form.teaser}
              onChange={(e) => patch({ teaser: e.target.value })}
              placeholder="Opens at 3pm"
            />
          </Field>

          <Field label="Unlocks at">
            <input
              type="datetime-local"
              className={inputCls}
              value={form.unlockAt}
              onChange={(e) => patch({ unlockAt: e.target.value })}
            />
          </Field>

          <ImagePicker canUpload={canUpload} image={image} onSet={setImage} />
          <AudioPicker canUpload={canUpload} audio={audio} onSet={setAudio} />
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
            className="rounded-full bg-[#c75b39] px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#B11226]"
          >
            {reason ? "Save changes" : "Add reason"}
          </button>
        </div>
      </div>
    </div>
  );
}

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
      const fileId = await fileService.upload(file, "twenty-four-reasons");
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
        to add a photo.
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
          className="flex h-28 w-full flex-col items-center justify-center gap-1.5 rounded-lg border-2 border-dashed border-[#e3d2c5] bg-white text-[#92786c] transition-colors hover:border-[#c75b39]/50 hover:text-[#c75b39] disabled:opacity-60"
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

function AudioPicker({
  canUpload,
  audio,
  onSet,
}: {
  canUpload: boolean;
  audio: { fileId: string; url: string } | null;
  onSet: (audio: { fileId: string; url: string } | null) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const ref = useRef<HTMLInputElement>(null);

  const onPick = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploading(true);
    try {
      const fileId = await fileService.upload(file, "twenty-four-reasons");
      onSet({ fileId, url: URL.createObjectURL(file) });
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Could not upload that audio.",
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
        to add a voice note.
      </div>
    );
  }

  return (
    <Field label="Voice note (optional)">
      <input
        ref={ref}
        type="file"
        accept="audio/*"
        className="hidden"
        onChange={onPick}
      />
      {audio?.url ? (
        <div className="flex items-center gap-2 rounded-lg border border-[#e3d2c5] bg-white px-3 py-2">
          <Mic className="size-4 shrink-0 text-[#c75b39]" />
          <audio src={audio.url} controls className="h-8 min-w-0 flex-1" />
          <button
            type="button"
            aria-label="Remove audio"
            onClick={() => onSet(null)}
            className="grid size-7 shrink-0 place-items-center rounded-md text-[#b29a89] hover:bg-[#fbe1d8] hover:text-[#c75b39]"
          >
            <X className="size-3.5" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => ref.current?.click()}
          disabled={uploading}
          className="flex h-16 w-full flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-[#e3d2c5] bg-white text-[#92786c] transition-colors hover:border-[#c75b39]/50 hover:text-[#c75b39] disabled:opacity-60"
        >
          {uploading ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Mic className="size-4" />
          )}
          <span className="text-xs font-medium">
            {uploading ? "Uploading…" : "Add a voice note"}
          </span>
        </button>
      )}
    </Field>
  );
}

const inputCls =
  "w-full rounded-lg border border-[#e3d2c5] bg-white px-3 py-2 text-sm text-[#3a2a25] outline-none transition-colors focus:border-[#c75b39] focus:ring-2 focus:ring-[#c75b39]/20";

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
