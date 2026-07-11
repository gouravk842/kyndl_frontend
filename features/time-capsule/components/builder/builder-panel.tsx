"use client";

import { Eye, ImagePlus, Loader2, Music, X } from "lucide-react";
import { type ChangeEvent, useRef, useState } from "react";
import { toast } from "sonner";

import { SignInLink } from "@/components/auth/sign-in-link";
import {
  BuilderShell,
  type BuilderTab,
} from "@/features/dashboard/components/builder-shell";
import { THEME_ORDER, THEMES } from "@/features/time-capsule/config";
import type { TimeCapsuleSync } from "@/hooks/use-time-capsule-sync";
import { fileService } from "@/services/files/file.service";

import { useBuilderStore } from "../../store/builder.store";

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
  sync: TimeCapsuleSync;
  onPreview?: () => void;
  className?: string;
}) {
  const doc = useBuilderStore((s) => s.doc);
  const setMeta = useBuilderStore((s) => s.setMeta);
  const setLetter = useBuilderStore((s) => s.setLetter);
  const setTheme = useBuilderStore((s) => s.setTheme);

  const tabs: BuilderTab[] = [
    {
      key: "capsule",
      label: "Capsule",
      content: (
        <div className="space-y-7">
          {onPreview && (
            <button
              type="button"
              onClick={onPreview}
              className="inline-flex items-center gap-1.5 rounded-full border border-[#e3d2c5] px-3 py-1.5 text-sm font-medium text-[#7a6258] transition-colors hover:bg-[#fbeee6]"
            >
              <Eye className="size-3.5" /> Preview the reveal
            </button>
          )}

          {/* The capsule */}
          <Section title="The capsule">
            <Field label="Title">
              <input
                className={inputCls}
                value={doc.title}
                onChange={(e) => setMeta({ title: e.target.value })}
                placeholder="Open when it's time"
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
            <Field label="From (sender)">
              <input
                className={inputCls}
                value={doc.senderName}
                onChange={(e) => setMeta({ senderName: e.target.value })}
                placeholder="me"
              />
            </Field>
            <Field label="Unlocks on">
              <input
                type="datetime-local"
                className={inputCls}
                value={isoToInput(doc.unlockDate)}
                onChange={(e) => setMeta({ unlockDate: e.target.value })}
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

          {/* While sealed */}
          <Section title="While it's sealed">
            <Field label="Teaser">
              <textarea
                className={`${inputCls} min-h-[80px] resize-y`}
                value={doc.teaser}
                onChange={(e) => setMeta({ teaser: e.target.value })}
                placeholder="Shown on the sealed capsule while it waits…"
              />
            </Field>
          </Section>

          {/* The letter */}
          <Section title="The letter (revealed on unlock)">
            <Field label="Greeting">
              <input
                className={inputCls}
                value={doc.letter.greeting}
                onChange={(e) => setLetter({ greeting: e.target.value })}
                placeholder="Dear you,"
              />
            </Field>
            <Field label="Message">
              <textarea
                className={`${inputCls} min-h-[140px] resize-y`}
                value={doc.letter.body}
                onChange={(e) => setLetter({ body: e.target.value })}
                placeholder="Everything you want them to read when it opens…"
              />
            </Field>
            <Field label="Sign-off">
              <input
                className={inputCls}
                value={doc.letter.signoff}
                onChange={(e) => setLetter({ signoff: e.target.value })}
                placeholder="Always yours,"
              />
            </Field>
          </Section>

          {/* Photos */}
          <Section title={`Photos (${doc.photos.length})`}>
            <PhotoPicker canUpload={sync.enabled} />
          </Section>

          {/* Music */}
          <Section title="Music">
            <MusicPicker canUpload={sync.enabled} />
          </Section>
        </div>
      ),
    },
  ];

  return (
    <BuilderShell
      title="Build your time capsule"
      sync={sync}
      tabs={tabs}
      className={className}
    />
  );
}

// ── Photo picker (multi) ───────────────────────────────────────────
function PhotoPicker({ canUpload }: { canUpload: boolean }) {
  const photos = useBuilderStore((s) => s.doc.photos);
  const addPhoto = useBuilderStore((s) => s.addPhoto);
  const removePhoto = useBuilderStore((s) => s.removePhoto);
  const urlFor = useBuilderStore((s) => s.urlFor);

  const [uploading, setUploading] = useState(false);
  const ref = useRef<HTMLInputElement>(null);

  const onPick = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (files.length === 0) return;
    setUploading(true);
    try {
      for (const file of files) {
        const fileId = await fileService.upload(file, "time-capsule");
        addPhoto(fileId, URL.createObjectURL(file));
      }
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Could not upload that photo.",
      );
    } finally {
      setUploading(false);
    }
  };

  if (!canUpload) return <SignInHint>add photos to the capsule</SignInHint>;

  return (
    <>
      <input
        ref={ref}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={onPick}
      />
      <div className="grid grid-cols-3 gap-2">
        {photos.map((p) => {
          const url = urlFor(p);
          return (
            <div
              key={p.fileId}
              className="relative aspect-square overflow-hidden rounded-lg bg-[#f4e9e0]"
            >
              {url && (
                // eslint-disable-next-line @next/next/no-img-element -- transient/presigned URL
                <img src={url} alt="" className="h-full w-full object-cover" />
              )}
              <button
                type="button"
                aria-label="Remove photo"
                onClick={() => removePhoto(p.fileId)}
                className="absolute top-1 right-1 grid size-6 place-items-center rounded-full bg-black/55 text-white hover:bg-black/75"
              >
                <X className="size-3" />
              </button>
            </div>
          );
        })}
        <button
          type="button"
          onClick={() => ref.current?.click()}
          disabled={uploading}
          className="flex aspect-square flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-[#e3d2c5] bg-white text-[#92786c] transition-colors hover:border-[#ff7a59]/60 hover:text-[#c75b39] disabled:opacity-60"
        >
          {uploading ? (
            <Loader2 className="size-5 animate-spin" />
          ) : (
            <ImagePlus className="size-5" />
          )}
          <span className="text-[11px] font-medium">
            {uploading ? "Uploading…" : "Add"}
          </span>
        </button>
      </div>
    </>
  );
}

// ── Music picker ───────────────────────────────────────────────────
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
      const fileId = await fileService.upload(file, "time-capsule");
      setMusic(fileId, URL.createObjectURL(file));
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Could not upload that track.",
      );
    } finally {
      setUploading(false);
    }
  };

  if (!canUpload) return <SignInHint>add music to the reveal</SignInHint>;

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
          { }
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
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-3">
      <h2 className="text-sm font-semibold tracking-wide text-[#3a2a25] uppercase">
        {title}
      </h2>
      {children}
    </section>
  );
}
