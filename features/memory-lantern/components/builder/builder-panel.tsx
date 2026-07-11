"use client";

import { ImagePlus, Loader2, Plus, X } from "lucide-react";
import { type ChangeEvent, useRef, useState } from "react";
import { toast } from "sonner";

import { SignInLink } from "@/components/auth/sign-in-link";
import {
  BuilderShell,
  type BuilderTab,
} from "@/features/dashboard/components/builder-shell";
import { DEFAULT_MATERIAL, DEFAULT_MOTION } from "@/features/memory-lantern/config";
import { sampleGlowColor } from "@/features/memory-lantern/lib/sample-color";
import type { MemoryLanternSync } from "@/hooks/use-memory-lantern-sync";
import { fileService } from "@/services/files/file.service";

import { useBuilderStore } from "../../store/builder.store";

export function BuilderPanel({
  sync,
  className,
}: {
  sync: MemoryLanternSync;
  className?: string;
}) {
  const doc = useBuilderStore((s) => s.doc);
  const setMeta = useBuilderStore((s) => s.setMeta);
  const setMaterial = useBuilderStore((s) => s.setMaterial);
  const setMotion = useBuilderStore((s) => s.setMotion);
  const setAmbience = useBuilderStore((s) => s.setAmbience);
  const setFinale = useBuilderStore((s) => s.setFinale);

  const material = doc.material ?? DEFAULT_MATERIAL;
  const motion = doc.motion ?? DEFAULT_MOTION;

  const tabs: BuilderTab[] = [
    {
      key: "lantern",
      label: "Lantern",
      badge: doc.panes.length,
      content: (
        <div className="space-y-7">
          <Section title="The lantern">
            <Field label="Title (shown above it)">
              <input
                className={inputCls}
                value={doc.title}
                maxLength={120}
                onChange={(e) => setMeta({ title: e.target.value })}
                placeholder="The two of us"
              />
            </Field>
            <Field label="Subtitle (a small line under the title)">
              <input
                className={inputCls}
                value={doc.subtitle}
                maxLength={200}
                onChange={(e) => setMeta({ subtitle: e.target.value })}
                placeholder="watch it turn — each side wakes a memory"
              />
            </Field>
            <Field label="For (name, optional)">
              <input
                className={inputCls}
                value={doc.recipientName}
                maxLength={120}
                onChange={(e) => setMeta({ recipientName: e.target.value })}
                placeholder="you"
              />
            </Field>
          </Section>

          <Section title={`Facets (${doc.panes.length})`}>
            <FacetsPicker canUpload={sync.enabled} />
          </Section>

          <Section title="Glow & motion">
            <Field label="Inner glow colour">
              <ColorRow
                value={material.coreColor}
                onChange={(coreColor) => setMaterial({ coreColor })}
              />
            </Field>
            <RangeField
              label="Frostiness of the resting sides"
              min={0}
              max={1}
              step={0.05}
              value={material.frost}
              onChange={(frost) => setMaterial({ frost })}
            />
            <RangeField
              label="Turning speed"
              min={0}
              max={1}
              step={0.02}
              value={motion.autoSpin}
              onChange={(autoSpin) => setMotion({ autoSpin })}
            />
          </Section>

          <Section title="Ambience">
            <label className="flex items-center gap-2.5 text-sm text-[#3a2a25]">
              <input
                type="checkbox"
                className="size-4 accent-[#ff7a59]"
                checked={doc.ambience?.timeOfDayAware ?? false}
                onChange={(e) =>
                  setAmbience({ timeOfDayAware: e.target.checked })
                }
              />
              Dim & warm with the hour it&rsquo;s opened
            </label>
            <Field label="Anniversary (it flares on this date)">
              <input
                type="date"
                className={inputCls}
                value={doc.ambience?.anniversary ?? ""}
                onChange={(e) => setAmbience({ anniversary: e.target.value })}
              />
            </Field>
          </Section>

          <Section title="Finale">
            <Field label="Heading (once every side is seen)">
              <input
                className={inputCls}
                value={doc.finale?.heading ?? ""}
                maxLength={200}
                onChange={(e) => setFinale({ heading: e.target.value })}
                placeholder="You saw every side"
              />
            </Field>
            <Field label="Message">
              <textarea
                className={`${inputCls} min-h-[90px] resize-y`}
                value={doc.finale?.body ?? ""}
                onChange={(e) => setFinale({ body: e.target.value })}
                placeholder="of the two of us."
              />
            </Field>
          </Section>
        </div>
      ),
    },
  ];

  return (
    <BuilderShell
      title="Build your lantern"
      sync={sync}
      tabs={tabs}
      className={className}
    />
  );
}

// ── Facets picker (upload + per-facet caption/date/glow + reorder) ──────
function FacetsPicker({ canUpload }: { canUpload: boolean }) {
  const panes = useBuilderStore((s) => s.doc.panes);
  const addPane = useBuilderStore((s) => s.addPane);
  const updatePane = useBuilderStore((s) => s.updatePane);
  const removePane = useBuilderStore((s) => s.removePane);
  const movePane = useBuilderStore((s) => s.movePane);
  const urlFor = useBuilderStore((s) => s.urlFor);

  const [uploading, setUploading] = useState(false);
  const ref = useRef<HTMLInputElement>(null);

  const onPick = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (!files.length) return;
    setUploading(true);
    try {
      // Upload sequentially so facet order is predictable and errors are per-file.
      for (const file of files) {
        const previewUrl = URL.createObjectURL(file);
        const [fileId, glow] = await Promise.all([
          fileService.upload(file, "memory-lantern"),
          sampleGlowColor(previewUrl),
        ]);
        addPane(fileId, previewUrl, glow);
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

      {panes.length > 0 && (
        <ul className="space-y-2.5">
          {panes.map((p, i) => {
            const url = urlFor(p.fileId);
            return (
              <li
                key={p.id}
                className="flex gap-2.5 rounded-lg border border-[#e3d2c5] bg-white p-2.5"
              >
                <div className="relative size-16 shrink-0 overflow-hidden rounded-md bg-[#f4e3d4]">
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
                  <span
                    className="absolute right-1 bottom-1 size-3 rounded-full ring-1 ring-white/70"
                    style={{ background: p.glowColor || "#f0c48a" }}
                    title="Room glow colour"
                  />
                </div>

                <div className="min-w-0 flex-1 space-y-1.5">
                  <input
                    className={smallInputCls}
                    value={p.caption}
                    maxLength={200}
                    onChange={(e) =>
                      updatePane(p.id, { caption: e.target.value })
                    }
                    placeholder="Caption — the beach at dawn"
                  />
                  <div className="flex items-center gap-1.5">
                    <input
                      className={smallInputCls}
                      value={p.date}
                      maxLength={120}
                      onChange={(e) =>
                        updatePane(p.id, { date: e.target.value })
                      }
                      placeholder="Aug 2025"
                    />
                    <input
                      type="color"
                      aria-label="Room glow colour"
                      value={p.glowColor || "#f0c48a"}
                      onChange={(e) =>
                        updatePane(p.id, { glowColor: e.target.value })
                      }
                      className="size-8 shrink-0 cursor-pointer rounded border border-[#e3d2c5] bg-white"
                    />
                  </div>
                </div>

                <div className="flex flex-col items-center justify-between">
                  <button
                    type="button"
                    aria-label="Remove facet"
                    onClick={() => removePane(p.id)}
                    className="grid size-6 place-items-center rounded-full text-[#b29a89] hover:bg-[#fbe1d8] hover:text-[#c75b39]"
                  >
                    <X className="size-3.5" />
                  </button>
                  <div className="flex flex-col">
                    <button
                      type="button"
                      aria-label="Move earlier"
                      disabled={i === 0}
                      onClick={() => movePane(p.id, -1)}
                      className="grid size-5 place-items-center text-sm text-[#92786c] disabled:opacity-30"
                    >
                      ‹
                    </button>
                    <button
                      type="button"
                      aria-label="Move later"
                      disabled={i === panes.length - 1}
                      onClick={() => movePane(p.id, 1)}
                      className="grid size-5 place-items-center text-sm text-[#92786c] disabled:opacity-30"
                    >
                      ›
                    </button>
                  </div>
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
          : panes.length
            ? "Add more photos"
            : "Add photos"}
      </button>
      {panes.length > 0 && (
        <p className="text-xs text-[#92786c]">
          Each photo is a facet; they circle the lantern in this order.
        </p>
      )}
    </div>
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
  "w-full rounded-md border border-[#e3d2c5] bg-white px-2 py-1.5 text-xs text-[#3a2a25] outline-none transition-colors focus:border-[#ff7a59]";

function ColorRow({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="size-9 cursor-pointer rounded border border-[#e3d2c5] bg-white"
      />
      <span className="text-xs text-[#92786c]">{value}</span>
    </div>
  );
}

function RangeField({
  label,
  min,
  max,
  step,
  value,
  onChange,
}: {
  label: string;
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium tracking-wide text-[#92786c]">
        {label}
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-[#ff7a59]"
      />
    </label>
  );
}

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
