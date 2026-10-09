"use client";

import { ImagePlus, Loader2, Music, Plus, Trash2, X } from "lucide-react";
import { type ChangeEvent, useRef, useState } from "react";
import { toast } from "sonner";

import { SignInLink } from "@/components/auth/sign-in-link";
import {
  BuilderShell,
  type BuilderTab,
} from "@/features/dashboard/components/builder-shell";
import {
  sceneFor,
  THEME_ORDER,
  THEMES,
} from "@/features/timeless-treasure/config";
import type { TimelessTreasureSync } from "@/hooks/use-timeless-treasure-sync";
import { fileService } from "@/services/files/file.service";

import { useBuilderStore } from "../../store/builder.store";

export function BuilderPanel({
  sync,
  className,
}: {
  sync: TimelessTreasureSync;
  className?: string;
}) {
  const doc = useBuilderStore((s) => s.doc);
  const setMeta = useBuilderStore((s) => s.setMeta);
  const setTheme = useBuilderStore((s) => s.setTheme);
  const setTag = useBuilderStore((s) => s.setTag);
  const setLetter = useBuilderStore((s) => s.setLetter);

  const tabs: BuilderTab[] = [
    {
      key: "album",
      label: "Album",
      content: (
        <div className="space-y-7">
          {/* The album cover */}
          <Section title="The album">
            <Field label="For (recipient's name)">
              <input
                className={inputCls}
                value={doc.recipientName}
                maxLength={60}
                onChange={(e) => setMeta({ recipientName: e.target.value })}
                placeholder="Aanya"
              />
            </Field>
            <Field label="From (your name)">
              <input
                className={inputCls}
                value={doc.senderName}
                maxLength={60}
                onChange={(e) => setMeta({ senderName: e.target.value })}
                placeholder="Kabir"
              />
            </Field>
            <Field label="Leather & finish">
              <div className="flex flex-wrap gap-2">
                {THEME_ORDER.map((key) => {
                  const t = THEMES[key];
                  const s = sceneFor(key);
                  const active = doc.theme === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      aria-label={`${t.name} finish`}
                      aria-pressed={active}
                      onClick={() => setTheme(key)}
                      className={[
                        "grid h-12 w-16 place-items-center overflow-hidden rounded-lg border-2 transition-transform",
                        active
                          ? "border-[#ff7a59] ring-2 ring-[#ff7a59]/30"
                          : "border-black/10 hover:scale-105",
                      ].join(" ")}
                      style={{ background: s.leather }}
                      title={t.name}
                    >
                      {/* a dab of foil, as embossed on the real cover */}
                      <span
                        aria-hidden
                        className="block size-3 rounded-full"
                        style={{
                          background: s.foil,
                          boxShadow: "inset 0 1px 1px rgba(255,255,255,0.6)",
                        }}
                      />
                    </button>
                  );
                })}
              </div>
            </Field>
          </Section>

          {/* The opening note — the first card */}
          <Section title="Opening note · the first card">
            <Field label="Heading">
              <input
                className={inputCls}
                value={doc.letter.heading}
                maxLength={200}
                onChange={(e) => setLetter({ heading: e.target.value })}
                placeholder="For you"
              />
            </Field>
            <Field label="Your message">
              <textarea
                className={`${inputCls} min-h-[140px] resize-y`}
                value={doc.letter.body}
                onChange={(e) => setLetter({ body: e.target.value })}
                placeholder="The note they open on, before the photos…"
              />
            </Field>
          </Section>

          {/* The memories */}
          <Section title={`The memories (${doc.frames.length})`}>
            <FramesPicker canUpload={sync.enabled} />
          </Section>

          {/* The dedication — the last card */}
          <Section title="Dedication · the last card">
            <Field label="Dedication line">
              <input
                className={inputCls}
                value={doc.tag.title}
                maxLength={80}
                onChange={(e) => setTag({ title: e.target.value })}
                placeholder="Made of Happy Memories"
              />
            </Field>
            <Field label="Occasion (small line under it)">
              <input
                className={inputCls}
                value={doc.tag.occasion}
                maxLength={120}
                onChange={(e) => setTag({ occasion: e.target.value })}
                placeholder="Our first year · 2024"
              />
            </Field>
          </Section>

          {/* Music */}
          <Section title="Music (optional)">
            <Field label="Track (loops while the album is open)">
              <MusicPicker canUpload={sync.enabled} />
            </Field>
          </Section>
        </div>
      ),
    },
  ];

  return (
    <BuilderShell
      title="Build your treasure"
      sync={sync}
      tabs={tabs}
      className={className}
    />
  );
}

// ── Frames picker (multi-upload + per-frame caption/date + reorder) ──
function FramesPicker({ canUpload }: { canUpload: boolean }) {
  const frames = useBuilderStore((s) => s.doc.frames);
  const addFrame = useBuilderStore((s) => s.addFrame);
  const updateFrame = useBuilderStore((s) => s.updateFrame);
  const removeFrame = useBuilderStore((s) => s.removeFrame);
  const moveFrame = useBuilderStore((s) => s.moveFrame);
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
        const fileId = await fileService.upload(file, "timeless-treasure");
        addFrame(fileId, URL.createObjectURL(file));
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

      {frames.length > 0 && (
        <ul className="space-y-2">
          {frames.map((f, i) => {
            const url = urlFor(f);
            return (
              <li
                key={f.id}
                className="flex gap-3 rounded-lg border border-[#e3d2c5] bg-white p-2"
              >
                <div className="relative size-16 shrink-0 overflow-hidden rounded-md bg-[#f6ecdf]">
                  {url ? (
                    // eslint-disable-next-line @next/next/no-img-element -- transient/presigned URL
                    <img
                      src={url}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="grid h-full place-items-center text-[#c9b4a5]">
                      <ImagePlus className="size-5" />
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1 space-y-1.5">
                  <textarea
                    className={`${smallInputCls} min-h-[3rem] resize-y`}
                    value={f.caption}
                    maxLength={160}
                    onChange={(e) =>
                      updateFrame(f.id, { caption: e.target.value })
                    }
                    placeholder="A line to write beside it…"
                  />
                  <input
                    className={smallInputCls}
                    value={f.date}
                    maxLength={40}
                    onChange={(e) =>
                      updateFrame(f.id, { date: e.target.value })
                    }
                    placeholder="Date, e.g. Aug 2023"
                  />
                </div>

                <div className="flex flex-col items-center justify-between">
                  <div className="flex flex-col">
                    <button
                      type="button"
                      aria-label="Move earlier"
                      disabled={i === 0}
                      onClick={() => moveFrame(f.id, -1)}
                      className="grid size-6 place-items-center rounded text-[#92786c] hover:bg-[#f6ecdf] disabled:opacity-30"
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      aria-label="Move later"
                      disabled={i === frames.length - 1}
                      onClick={() => moveFrame(f.id, 1)}
                      className="grid size-6 place-items-center rounded text-[#92786c] hover:bg-[#f6ecdf] disabled:opacity-30"
                    >
                      ↓
                    </button>
                  </div>
                  <button
                    type="button"
                    aria-label="Remove frame"
                    onClick={() => removeFrame(f.id)}
                    className="grid size-6 place-items-center rounded-full text-[#b29a89] hover:bg-[#fbe1d8] hover:text-[#c75b39]"
                  >
                    <X className="size-3.5" />
                  </button>
                </div>
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
          : frames.length
            ? "Add more photos"
            : "Add photos"}
      </button>
      {frames.length > 0 && (
        <p className="text-xs text-[#92786c]">
          Drawn out of the pocket one at a time in this order — your line is
          pencilled beside each photo, and it develops as it appears.
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
      const fileId = await fileService.upload(file, "timeless-treasure");
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

const smallInputCls =
  "w-full rounded-md border border-[#e3d2c5] bg-white px-2 py-1 text-xs text-[#3a2a25] outline-none transition-colors focus:border-[#ff7a59] focus:ring-2 focus:ring-[#ff7a59]/20";

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
