"use client";

import { ImagePlus, Loader2, X } from "lucide-react";
import { type ChangeEvent, type ReactNode, useRef, useState } from "react";
import { toast } from "sonner";

import { SignInLink } from "@/components/auth/sign-in-link";
import {
  BuilderShell,
  type BuilderTab,
} from "@/features/dashboard/components/builder-shell";
import type { MemoryPagesSync } from "@/hooks/use-memory-pages-sync";
import { fileService } from "@/services/files/file.service";

import { useBuilderStore } from "../../store/builder.store";
import type { PageTheme } from "../../types";
import { MemoryList } from "./memory-list";

const SURFACES: { value: PageTheme; label: string }[] = [
  { value: "paper", label: "Classic cream" },
  { value: "desk", label: "Wooden desk" },
];

/** A palette of album cover colours; the first clears back to the default. */
const COVER_COLORS = [
  { value: "", label: "Default" },
  { value: "#3f5647", label: "Forest" },
  { value: "#5b2333", label: "Burgundy" },
  { value: "#26374d", label: "Navy" },
  { value: "#7a4a2b", label: "Cognac" },
  { value: "#2b2b30", label: "Charcoal" },
];

/**
 * The settings side panel — every album-level control lives here so the main
 * screen is free for the live book. Uses the shared {@link BuilderShell} for the
 * header + tab chrome (incl. the automatic People / Interaction tabs); this
 * component just supplies the album-specific tabs: Look (album details, cover,
 * surface) and Memories (the reorderable list).
 */
export function BuilderSidebar({
  sync,
  onAdd,
  onEdit,
  activeId,
}: {
  sync: MemoryPagesSync;
  onAdd: () => void;
  onEdit: (id: string) => void;
  activeId: string | null;
}) {
  const memoryCount = useBuilderStore((s) => s.memories.length);

  const tabs: BuilderTab[] = [
    {
      key: "look",
      label: "Look",
      content: (
        <div className="space-y-6">
          <Section title="Album details">
            <AlbumDetails />
          </Section>
          <Section title="Cover">
            <CoverSettings canUpload={sync.enabled} />
          </Section>
          <Section title="Surface">
            <SurfaceSetting />
          </Section>
        </div>
      ),
    },
    {
      key: "memories",
      label: "Memories",
      badge: memoryCount > 0 ? memoryCount : undefined,
      content: <MemoryList onAdd={onAdd} onEdit={onEdit} activeId={activeId} />,
    },
  ];

  return <BuilderShell title="Build your album" sync={sync} tabs={tabs} />;
}

// ── Labelled sub-section (used to group the Look tab) ────────────────
function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="mb-3 text-sm font-semibold tracking-[0.08em] text-[#3a2a25] uppercase">
        {title}
      </h2>
      {children}
    </section>
  );
}

// ── Section bodies ──────────────────────────────────────────────────
function AlbumDetails() {
  const title = useBuilderStore((s) => s.album.title);
  const subtitle = useBuilderStore((s) => s.album.subtitle);
  const setAlbum = useBuilderStore((s) => s.setAlbum);
  return (
    <div className="space-y-4">
      <Field label="Title">
        <input
          className={inputCls}
          value={title}
          onChange={(e) => setAlbum({ title: e.target.value })}
          placeholder="Our Album"
        />
      </Field>
      <Field label="Subtitle">
        <input
          className={inputCls}
          value={subtitle ?? ""}
          onChange={(e) => setAlbum({ subtitle: e.target.value })}
          placeholder="a few moments worth keeping"
        />
      </Field>
    </div>
  );
}

function CoverSettings({ canUpload }: { canUpload: boolean }) {
  const coverColor = useBuilderStore((s) => s.album.coverColor);
  const setAlbum = useBuilderStore((s) => s.setAlbum);
  return (
    <div className="space-y-4">
      <Field label="Cover photo">
        <CoverPhotoField canUpload={canUpload} />
      </Field>
      <Field label="Cover colour">
        <div className="flex flex-wrap gap-2">
          {COVER_COLORS.map((c) => {
            const selected = (coverColor ?? "") === c.value;
            return (
              <button
                key={c.value || "default"}
                type="button"
                title={c.label}
                aria-label={c.label}
                onClick={() => setAlbum({ coverColor: c.value })}
                className={cls(
                  "size-8 rounded-full border-2 transition-transform hover:scale-105",
                  selected
                    ? "border-[#ff7a59] ring-2 ring-[#ff7a59]/30"
                    : "border-[#e3d2c5]",
                )}
                style={{
                  background:
                    c.value ||
                    "repeating-linear-gradient(45deg,#7a5c43,#7a5c43 4px,#8a6a4e 4px,#8a6a4e 8px)",
                }}
              />
            );
          })}
        </div>
      </Field>
    </div>
  );
}

function SurfaceSetting() {
  const surface = useBuilderStore((s) => s.surface);
  const setSurface = useBuilderStore((s) => s.setSurface);
  return (
    <div className="flex gap-2">
      {SURFACES.map((s) => (
        <button
          key={s.value}
          type="button"
          onClick={() => setSurface(s.value)}
          className={cls(
            "flex-1 rounded-lg border px-3 py-2 text-sm transition-colors",
            surface === s.value
              ? "border-[#ff7a59] bg-[#fbeee6] text-[#c75b39]"
              : "border-[#e3d2c5] bg-white text-[#7a6258] hover:border-[#ff7a59]/50",
          )}
        >
          {s.label}
        </button>
      ))}
    </div>
  );
}

function CoverPhotoField({ canUpload }: { canUpload: boolean }) {
  const coverPhoto = useBuilderStore((s) => s.album.coverPhoto);
  const photoUrl = useBuilderStore((s) => s.photoUrl);
  const setCoverPhoto = useBuilderStore((s) => s.setCoverPhoto);
  const removeCoverPhoto = useBuilderStore((s) => s.removeCoverPhoto);
  const [uploading, setUploading] = useState(false);
  const ref = useRef<HTMLInputElement>(null);
  const url = photoUrl(coverPhoto?.fileId);

  const onChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploading(true);
    try {
      const fileId = await fileService.upload(file, "memory-pages");
      setCoverPhoto(fileId, URL.createObjectURL(file));
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
      <div className="rounded-lg border border-dashed border-[#e3d2c5] px-3 py-3 text-center text-xs text-[#92786c]">
        <SignInLink className="font-semibold text-[#c75b39] underline">
          Sign in
        </SignInLink>{" "}
        to add a cover photo.
      </div>
    );
  }

  return (
    <>
      <input
        ref={ref}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={onChange}
      />
      {url ? (
        <div className="relative overflow-hidden rounded-lg">
          {/* eslint-disable-next-line @next/next/no-img-element -- transient/presigned URL */}
          <img src={url} alt="" className="h-28 w-full object-cover" />
          <button
            type="button"
            aria-label="Remove cover photo"
            onClick={removeCoverPhoto}
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
          className="flex h-20 w-full flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-[#e3d2c5] bg-white text-[#92786c] transition-colors hover:border-[#ff7a59]/60 hover:text-[#c75b39] disabled:opacity-60"
        >
          {uploading ? (
            <Loader2 className="size-5 animate-spin" />
          ) : (
            <ImagePlus className="size-5" />
          )}
          <span className="text-xs font-medium">
            {uploading ? "Uploading…" : "Add a cover photo"}
          </span>
        </button>
      )}
    </>
  );
}

// ── Small building blocks ───────────────────────────────────────────
function cls(...parts: (string | false | undefined)[]): string {
  return parts.filter(Boolean).join(" ");
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
      <span className="mb-1.5 block text-xs font-medium tracking-wide text-[#92786c]">
        {label}
      </span>
      {children}
    </label>
  );
}
