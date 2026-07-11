"use client";

import {
  Eye,
  ImagePlus,
  Loader2,
  Music,
  Pencil,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import { type ChangeEvent, useRef, useState } from "react";
import { toast } from "sonner";

import { SignInLink } from "@/components/auth/sign-in-link";
import {
  type CountdownNote,
  THEME_ORDER,
  THEMES,
} from "@/features/countdown/config";
import {
  BuilderShell,
  type BuilderTab,
} from "@/features/dashboard/components/builder-shell";
import type { CountdownSync } from "@/hooks/use-countdown-sync";
import { fileService } from "@/services/files/file.service";

import { useBuilderStore } from "../../store/builder.store";
import { NoteFormModal } from "./note-form-modal";

/** Stored ISO → the `YYYY-MM-DDTHH:mm` a datetime-local input wants (local). */
function isoToInput(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours(),
  )}:${pad(d.getMinutes())}`;
}

export function BuilderPanel({
  sync,
  onPreview,
  className,
}: {
  sync: CountdownSync;
  onPreview?: () => void;
  className?: string;
}) {
  const doc = useBuilderStore((s) => s.doc);
  const setMeta = useBuilderStore((s) => s.setMeta);
  const setReveal = useBuilderStore((s) => s.setReveal);
  const setTheme = useBuilderStore((s) => s.setTheme);
  const moveNote = useBuilderStore((s) => s.moveNote);
  const removeNote = useBuilderStore((s) => s.removeNote);

  const [form, setForm] = useState<{ note: CountdownNote | null } | null>(null);

  const notes = doc.notes;

  const tabs: BuilderTab[] = [
    {
      key: "countdown",
      label: "Countdown",
      content: (
        <div className="space-y-7">
          {onPreview && (
            <button
              type="button"
              onClick={onPreview}
              className="inline-flex items-center gap-1.5 rounded-full border border-[#e3d2c5] px-3 py-1.5 text-sm font-medium text-[#7a6258] transition-colors hover:bg-[#fbeee6]"
            >
              <Eye className="size-3.5" /> Preview
            </button>
          )}
          {/* The moment */}
        <Section title="The moment">
          <Field label="Headline">
            <input
              className={inputCls}
              value={doc.title}
              onChange={(e) => setMeta({ title: e.target.value })}
              placeholder="Until we're together again"
            />
          </Field>
          <Field label="For (recipient)">
            <input
              className={inputCls}
              value={doc.recipientName}
              onChange={(e) => setMeta({ recipientName: e.target.value })}
              placeholder="my love"
            />
          </Field>
          <Field label="Caption (above the headline)">
            <input
              className={inputCls}
              value={doc.occasion}
              onChange={(e) => setMeta({ occasion: e.target.value })}
              placeholder="counting down to"
            />
          </Field>
          <Field label="When it lands">
            <input
              type="datetime-local"
              className={inputCls}
              value={isoToInput(doc.targetDate)}
              onChange={(e) => setMeta({ targetDate: e.target.value })}
            />
          </Field>
          <Field label="Theme">
            <div className="flex flex-wrap gap-2">
              {THEME_ORDER.map((key) => {
                const t = THEMES[key];
                const active = doc.theme === key;
                return (
                  <button
                    key={key}
                    type="button"
                    aria-label={`${t.name} theme`}
                    aria-pressed={active}
                    onClick={() => setTheme(key)}
                    className={[
                      "h-12 w-16 overflow-hidden rounded-lg border-2 transition-transform",
                      active
                        ? "border-[#ff7a59] ring-2 ring-[#ff7a59]/30"
                        : "border-black/10 hover:scale-105",
                    ].join(" ")}
                    style={{ background: t.background }}
                    title={t.name}
                  />
                );
              })}
            </div>
          </Field>
        </Section>

        {/* While they wait */}
        <Section title="While they wait">
          <Field label="Anticipation message">
            <textarea
              className={`${inputCls} min-h-[80px] resize-y`}
              value={doc.anticipationMessage}
              onChange={(e) => setMeta({ anticipationMessage: e.target.value })}
              placeholder="Shown beneath the clock while it counts down…"
            />
          </Field>
        </Section>

        {/* The surprise */}
        <Section title="The surprise at zero">
          <Field label="Reveal headline">
            <input
              className={inputCls}
              value={doc.reveal.headline}
              onChange={(e) => setReveal({ headline: e.target.value })}
              placeholder="It's finally here."
            />
          </Field>
          <Field label="Reveal message">
            <textarea
              className={`${inputCls} min-h-[100px] resize-y`}
              value={doc.reveal.message}
              onChange={(e) => setReveal({ message: e.target.value })}
              placeholder="The note they read the moment the clock hits zero…"
            />
          </Field>
          <Field label="Reveal photo">
            <RevealImagePicker canUpload={sync.enabled} />
          </Field>
          <Field label="Reveal music">
            <MusicPicker canUpload={sync.enabled} />
          </Field>
        </Section>

        {/* Waiting notes */}
        <Section
          title={`Notes while waiting (${notes.length})`}
          action={
            <button
              type="button"
              onClick={() => setForm({ note: null })}
              className="inline-flex items-center gap-1 rounded-full bg-[#ff7a59] px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-[#f2596f]"
            >
              <Plus className="size-3.5" /> Add note
            </button>
          }
        >
          <ul className="space-y-1.5">
            {notes.map((n, i) => (
              <li key={n.id}>
                <NoteRow
                  note={n}
                  isFirst={i === 0}
                  isLast={i === notes.length - 1}
                  onEdit={() => setForm({ note: n })}
                  onUp={() => moveNote(n.id, -1)}
                  onDown={() => moveNote(n.id, 1)}
                  onRemove={() => removeNote(n.id)}
                />
              </li>
            ))}
            {notes.length === 0 && (
              <li className="rounded-lg border border-dashed border-[#e3d2c5] px-3 py-6 text-center text-sm text-[#92786c]">
                Optional — little notes they can open while the clock runs.
              </li>
            )}
          </ul>
        </Section>
        </div>
      ),
    },
  ];

  return (
    <>
      <BuilderShell
        title="Build your countdown"
        sync={sync}
        tabs={tabs}
        className={className}
      />
      {form && (
        <NoteFormModal note={form.note} onClose={() => setForm(null)} />
      )}
    </>
  );
}

// ── Reveal image picker ────────────────────────────────────────────
function RevealImagePicker({ canUpload }: { canUpload: boolean }) {
  const image = useBuilderStore((s) => s.doc.reveal.image);
  const setImage = useBuilderStore((s) => s.setRevealImage);
  const removeImage = useBuilderStore((s) => s.removeRevealImage);
  const urlFor = useBuilderStore((s) => s.urlFor);

  const [uploading, setUploading] = useState(false);
  const ref = useRef<HTMLInputElement>(null);
  const url = urlFor(image);

  const onPick = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploading(true);
    try {
      const fileId = await fileService.upload(file, "countdown");
      setImage(fileId, URL.createObjectURL(file));
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Could not upload that photo.",
      );
    } finally {
      setUploading(false);
    }
  };

  if (!canUpload) return <SignInHint>add a reveal photo</SignInHint>;

  return (
    <>
      <input
        ref={ref}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={onPick}
      />
      {image && url ? (
        <div className="relative overflow-hidden rounded-lg">
          {/* eslint-disable-next-line @next/next/no-img-element -- transient/presigned URL */}
          <img src={url} alt="" className="h-36 w-full object-cover" />
          <button
            type="button"
            aria-label="Remove photo"
            onClick={removeImage}
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
          className="flex h-28 w-full flex-col items-center justify-center gap-1.5 rounded-lg border-2 border-dashed border-[#e3d2c5] bg-white text-[#92786c] transition-colors hover:border-[#ff7a59]/60 hover:text-[#c75b39] disabled:opacity-60"
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
    </>
  );
}

// ── Reveal music picker ────────────────────────────────────────────
function MusicPicker({ canUpload }: { canUpload: boolean }) {
  const music = useBuilderStore((s) => s.doc.music);
  const setMusic = useBuilderStore((s) => s.setMusic);
  const removeMusic = useBuilderStore((s) => s.removeMusic);
  const urlFor = useBuilderStore((s) => s.urlFor);

  const [uploading, setUploading] = useState(false);
  const ref = useRef<HTMLInputElement>(null);
  const url = urlFor(music);

  const onPick = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploading(true);
    try {
      const fileId = await fileService.upload(file, "countdown");
      setMusic(fileId, URL.createObjectURL(file));
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Could not upload that track.",
      );
    } finally {
      setUploading(false);
    }
  };

  if (!canUpload) return <SignInHint>add reveal music</SignInHint>;

  return (
    <>
      <input
        ref={ref}
        type="file"
        accept="audio/*"
        className="hidden"
        onChange={onPick}
      />
      {music && url ? (
        <div className="flex items-center gap-2 rounded-lg border border-[#e3d2c5] bg-white px-3 py-2">
          <Music className="size-4 shrink-0 text-[#c75b39]" />
          <audio src={url} controls className="h-8 min-w-0 flex-1" />
          <button
            type="button"
            aria-label="Remove music"
            onClick={removeMusic}
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
          className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-[#e3d2c5] bg-white px-3 py-3 text-sm font-medium text-[#92786c] transition-colors hover:border-[#ff7a59]/60 hover:text-[#c75b39] disabled:opacity-60"
        >
          {uploading ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <ImagePlus className="size-4" />
          )}
          {uploading ? "Uploading…" : "Add a track"}
        </button>
      )}
    </>
  );
}

function SignInHint({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-dashed border-[#e3d2c5] px-3 py-3 text-center text-xs text-[#92786c]">
      <SignInLink className="font-semibold text-[#c75b39] underline">
        Sign in
      </SignInLink>{" "}
      to {children}.
    </div>
  );
}

// ── Note list row ──────────────────────────────────────────────────
function NoteRow({
  note,
  isFirst,
  isLast,
  onEdit,
  onUp,
  onDown,
  onRemove,
}: {
  note: CountdownNote;
  isFirst: boolean;
  isLast: boolean;
  onEdit: () => void;
  onUp: () => void;
  onDown: () => void;
  onRemove: () => void;
}) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-[#f2dace] bg-white px-2.5 py-2 transition-colors hover:border-[#ff7a59]/40">
      <button type="button" onClick={onEdit} className="min-w-0 flex-1 text-left">
        <span className="block truncate text-sm font-medium text-[#3a2a25]">
          {note.label || "Untitled note"}
        </span>
        {note.message ? (
          <span className="block truncate text-xs text-[#92786c]">
            {note.message}
          </span>
        ) : null}
      </button>
      <div className="flex shrink-0 items-center">
        <IconBtn label="Move up" onClick={onUp} disabled={isFirst}>
          ↑
        </IconBtn>
        <IconBtn label="Move down" onClick={onDown} disabled={isLast}>
          ↓
        </IconBtn>
        <button
          type="button"
          aria-label="Edit note"
          onClick={onEdit}
          className="grid size-7 place-items-center rounded-md text-[#92786c] hover:bg-[#fbeee6] hover:text-[#c75b39]"
        >
          <Pencil className="size-3.5" />
        </button>
        <button
          type="button"
          aria-label="Delete note"
          onClick={onRemove}
          className="grid size-7 place-items-center rounded-md text-[#b29a89] hover:bg-[#fbe1d8] hover:text-[#c75b39]"
        >
          <Trash2 className="size-3.5" />
        </button>
      </div>
    </div>
  );
}

function IconBtn({
  label,
  onClick,
  disabled,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      className="grid size-7 place-items-center rounded-md text-sm text-[#92786c] hover:bg-[#fbeee6] disabled:opacity-30"
    >
      {children}
    </button>
  );
}

// ── Small building blocks ──────────────────────────────────────────
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

function Section({
  title,
  action,
  children,
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold tracking-wide text-[#3a2a25] uppercase">
          {title}
        </h2>
        {action}
      </div>
      {children}
    </section>
  );
}
