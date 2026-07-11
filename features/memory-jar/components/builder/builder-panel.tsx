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
  BuilderShell,
  type BuilderTab,
} from "@/features/dashboard/components/builder-shell";
import type { MemoryJarSync } from "@/hooks/use-memory-jar-sync";
import { fileService } from "@/services/files/file.service";

import type { JarNote } from "../../config";
import { useBuilderStore } from "../../store/builder.store";
import { NoteFormModal } from "./note-form-modal";

export function BuilderPanel({
  sync,
  onPreview,
  className,
}: {
  sync: MemoryJarSync;
  onPreview?: () => void;
  className?: string;
}) {
  const doc = useBuilderStore((s) => s.doc);
  const setMeta = useBuilderStore((s) => s.setMeta);
  const moveNote = useBuilderStore((s) => s.moveNote);
  const removeNote = useBuilderStore((s) => s.removeNote);
  const urlFor = useBuilderStore((s) => s.urlFor);

  // Note form modal: closed (null) | adding (set, note=null) | editing (note set).
  const [form, setForm] = useState<{ note: JarNote | null } | null>(null);

  const notes = doc.notes;

  const tabs: BuilderTab[] = [
    {
      key: "jar",
      label: "Jar",
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

          {/* Jar settings */}
          <Section title="The jar">
          <Field label="For (recipient)">
            <input
              className={inputCls}
              value={doc.recipientName}
              onChange={(e) => setMeta({ recipientName: e.target.value })}
              placeholder="my love"
            />
          </Field>
          <Field label="Jar label">
            <input
              className={inputCls}
              value={doc.jarLabel}
              onChange={(e) => setMeta({ jarLabel: e.target.value })}
              placeholder="open when you need me"
            />
          </Field>
          <Field label="Opening message">
            <textarea
              className={`${inputCls} min-h-[80px] resize-y`}
              value={doc.openingMessage}
              onChange={(e) => setMeta({ openingMessage: e.target.value })}
              placeholder="A welcome shown before any note is opened…"
            />
          </Field>
          <Field label="Closing message">
            <textarea
              className={`${inputCls} min-h-[80px] resize-y`}
              value={doc.closingMessage}
              onChange={(e) => setMeta({ closingMessage: e.target.value })}
              placeholder="The note shown once every slip has been opened…"
            />
          </Field>
          <Field label="Background music">
            <MusicPicker canUpload={sync.enabled} />
          </Field>
        </Section>

        {/* Notes list */}
        <Section
          title={`Notes (${notes.length})`}
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
                  thumbUrl={urlFor(n.image)}
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
              <li className="rounded-lg border border-dashed border-[#e3d2c5] px-3 py-8 text-center text-sm text-[#92786c]">
                No notes yet — tap{" "}
                <span className="font-semibold text-[#c75b39]">Add note</span> to
                fold your first slip into the jar.
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
        title="Customize your jar"
        sync={sync}
        tabs={tabs}
        className={className}
      />
      {form && (
        <NoteFormModal
          note={form.note}
          canUpload={sync.enabled}
          onClose={() => setForm(null)}
        />
      )}
    </>
  );
}

// ── Background-music picker ─────────────────────────────────────────
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
      const fileId = await fileService.upload(file, "memory-jar");
      setMusic(fileId, URL.createObjectURL(file));
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Could not upload that track.",
      );
    } finally {
      setUploading(false);
    }
  };

  if (!canUpload) {
    return (
      <div className="rounded-lg border border-dashed border-[#e3d2c5] px-3 py-3 text-center text-xs text-[#92786c]">
        <SignInLink className="font-semibold text-[#c75b39] underline">
          Sign in
        </SignInLink>{" "}
        to add background music.
      </div>
    );
  }

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

// ── Note list row ──────────────────────────────────────────────────
function NoteRow({
  note,
  thumbUrl,
  isFirst,
  isLast,
  onEdit,
  onUp,
  onDown,
  onRemove,
}: {
  note: JarNote;
  thumbUrl: string | null;
  isFirst: boolean;
  isLast: boolean;
  onEdit: () => void;
  onUp: () => void;
  onDown: () => void;
  onRemove: () => void;
}) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-[#f2dace] bg-white px-2.5 py-2 transition-colors hover:border-[#ff7a59]/40">
      {thumbUrl ? (
        // eslint-disable-next-line @next/next/no-img-element -- transient/presigned URL
        <img
          src={thumbUrl}
          alt=""
          className="size-7 shrink-0 rounded-md object-cover"
        />
      ) : (
        <span
          className="size-3 shrink-0 rounded-full border border-black/5"
          style={{ background: note.paperTone }}
        />
      )}
      <button
        type="button"
        onClick={onEdit}
        className="min-w-0 flex-1 text-left"
      >
        <span className="block truncate text-sm font-medium text-[#3a2a25]">
          {note.title || "Untitled note"}
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
