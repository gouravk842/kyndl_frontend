"use client";

import {
  ImagePlus,
  Loader2,
  Music,
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
import { THEME_ORDER, THEMES } from "@/features/spotify-plaque/config";
import type { PlaqueSync } from "@/hooks/use-spotify-plaque-sync";
import { fileService } from "@/services/files/file.service";

import { useBuilderStore } from "../../store/builder.store";

export function BuilderPanel({
  sync,
  className,
}: {
  sync: PlaqueSync;
  className?: string;
}) {
  const doc = useBuilderStore((s) => s.doc);
  const setMeta = useBuilderStore((s) => s.setMeta);
  const setTheme = useBuilderStore((s) => s.setTheme);
  const setHidden = useBuilderStore((s) => s.setHidden);

  const tabs: BuilderTab[] = [
    {
      key: "plaque",
      label: "Plaque",
      content: (
        <div className="space-y-7">
          {/* The plaque */}
          <Section title="The plaque">
          <Field label="Title (script, top of frame)">
            <input
              className={inputCls}
              value={doc.title}
              onChange={(e) => setMeta({ title: e.target.value })}
              placeholder="Solamente tú"
            />
          </Field>
          <Field label="Caption (under the photo)">
            <input
              className={inputCls}
              value={doc.caption}
              onChange={(e) => setMeta({ caption: e.target.value })}
              placeholder="Te amo"
            />
          </Field>
          <Field label="Date / occasion">
            <input
              className={inputCls}
              value={doc.date}
              onChange={(e) => setMeta({ date: e.target.value })}
              placeholder="14 Feb. 2024"
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

        {/* Photos */}
        <Section title={`Photos (${doc.photos.length})`}>
          <PhotosPicker canUpload={sync.enabled} />
        </Section>

        {/* The song */}
        <Section title="The song">
          <Field label="Song title (shown by the scan strip)">
            <input
              className={inputCls}
              value={doc.songLabel}
              onChange={(e) => setMeta({ songLabel: e.target.value })}
              placeholder="Our song"
            />
          </Field>
          <Field label="Artist (optional)">
            <input
              className={inputCls}
              value={doc.artist}
              onChange={(e) => setMeta({ artist: e.target.value })}
              placeholder="The band"
            />
          </Field>
          <Field label="Track (plays behind the plaque)">
            <MusicPicker canUpload={sync.enabled} />
          </Field>
        </Section>

        {/* The hidden letter */}
        <Section title="The hidden letter">
          <p className="-mt-1 text-xs text-[#92786c]">
            Sealed in the envelope, stamped with the Kyndl mark. They unwrap it
            to read this.
          </p>
          <Field label="Message heading">
            <input
              className={inputCls}
              value={doc.hidden.heading}
              onChange={(e) => setHidden({ heading: e.target.value })}
              placeholder="Happy Anniversary"
            />
          </Field>
          <Field label="Message">
            <textarea
              className={`${inputCls} min-h-[120px] resize-y`}
              value={doc.hidden.body}
              onChange={(e) => setHidden({ body: e.target.value })}
              placeholder="The note they read when they unwrap the envelope…"
            />
          </Field>
        </Section>
        </div>
      ),
    },
  ];

  return (
    <BuilderShell
      title="Build your plaque"
      sync={sync}
      tabs={tabs}
      className={className}
    />
  );
}

// ── Photos picker (multi-upload + reorder) ─────────────────────────
function PhotosPicker({ canUpload }: { canUpload: boolean }) {
  const photos = useBuilderStore((s) => s.doc.photos);
  const addPhoto = useBuilderStore((s) => s.addPhoto);
  const removePhoto = useBuilderStore((s) => s.removePhoto);
  const movePhoto = useBuilderStore((s) => s.movePhoto);
  const urlFor = useBuilderStore((s) => s.urlFor);

  const [uploading, setUploading] = useState(false);
  const ref = useRef<HTMLInputElement>(null);

  const onPick = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (!files.length) return;
    setUploading(true);
    try {
      // Upload sequentially so ordering is predictable and errors are per-file.
      for (const file of files) {
        const fileId = await fileService.upload(file, "spotify-plaque");
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

  if (!canUpload) return <SignInHint>add photos</SignInHint>;

  return (
    <div className="space-y-2.5">
      <input
        ref={ref}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={onPick}
      />

      {photos.length > 0 && (
        <ul className="grid grid-cols-3 gap-2">
          {photos.map((p, i) => {
            const url = urlFor(p);
            return (
              <li
                key={p.id}
                className="group relative aspect-square overflow-hidden rounded-lg border border-[#e3d2c5] bg-white"
              >
                {url ? (
                  // eslint-disable-next-line @next/next/no-img-element -- transient/presigned URL
                  <img src={url} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="grid h-full place-items-center text-[#c9b4a5]">
                    <ImagePlus className="size-5" />
                  </div>
                )}
                {/* order controls */}
                <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-black/45 px-1 py-0.5 opacity-0 transition-opacity group-hover:opacity-100">
                  <button
                    type="button"
                    aria-label="Move earlier"
                    disabled={i === 0}
                    onClick={() => movePhoto(p.id, -1)}
                    className="grid size-6 place-items-center rounded text-sm text-white disabled:opacity-30"
                  >
                    ‹
                  </button>
                  <span className="text-[10px] font-semibold text-white">
                    {i + 1}
                  </span>
                  <button
                    type="button"
                    aria-label="Move later"
                    disabled={i === photos.length - 1}
                    onClick={() => movePhoto(p.id, 1)}
                    className="grid size-6 place-items-center rounded text-sm text-white disabled:opacity-30"
                  >
                    ›
                  </button>
                </div>
                <button
                  type="button"
                  aria-label="Remove photo"
                  onClick={() => removePhoto(p.id)}
                  className="absolute top-1 right-1 grid size-6 place-items-center rounded-full bg-black/55 text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-black/75"
                >
                  <X className="size-3" />
                </button>
              </li>
            );
          })}
        </ul>
      )}

      <button
        type="button"
        onClick={() => ref.current?.click()}
        disabled={uploading}
        className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-[#e3d2c5] bg-white px-3 py-3 text-sm font-medium text-[#92786c] transition-colors hover:border-[#ff7a59]/60 hover:text-[#c75b39] disabled:opacity-60"
      >
        {uploading ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <Plus className="size-4" />
        )}
        {uploading
          ? "Uploading…"
          : photos.length
            ? "Add more photos"
            : "Add photos"}
      </button>
      {photos.length > 1 && (
        <p className="text-xs text-[#92786c]">
          They cross-fade in this order as a slideshow.
        </p>
      )}
    </div>
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
      const fileId = await fileService.upload(file, "spotify-plaque");
      setMusic(fileId, URL.createObjectURL(file));
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Could not upload that track.",
      );
    } finally {
      setUploading(false);
    }
  };

  if (!canUpload) return <SignInHint>add music</SignInHint>;

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
            <Trash2 className="size-3.5" />
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
            <Music className="size-4" />
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
