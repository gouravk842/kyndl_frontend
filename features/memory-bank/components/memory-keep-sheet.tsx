"use client";

import { ImagePlus, Loader2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useRef, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { CalmPopup } from "@/components/ui/calm-popup";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ROUTES } from "@/constants/routes";
import { bankNameTaken } from "@/features/memory-bank/lib/bank-name";
import { markFirstRunDone } from "@/features/memory-bank/lib/first-run";
import { KeepsakeFace } from "@/features/memory-bank/lib/keepsake-face";
import { rememberCircle } from "@/features/memory-bank/lib/last-circle";
import { photoSrc } from "@/features/memory-bank/lib/preview";
import { LocationSearch } from "@/features/our-places/components/location-search";
import {
  useCreateCircle,
  useCreateMemory,
  useMemoryCircles,
  useRenameCircle,
  useUpdateMemory,
} from "@/hooks/use-memory-bank";
import { cn } from "@/lib/utils";
import { track } from "@/services/analytics/analytics.service";
import { fileService } from "@/services/files/file.service";
import type {
  BankMemory,
  MemoryCircle,
  MemoryLocation,
} from "@/types/memory-bank";

const MAX_PHOTOS = 12;

export type ComposerTab = "memory" | "bank";

type CoverDraft =
  | { kind: "none" }
  | { kind: "existing"; fileId: string; src: string | null }
  | { kind: "file"; file: File; src: string };

function initialCover(circle: MemoryCircle | null): CoverDraft {
  if (circle?.cover?.chosen && circle.cover.file_id) {
    return {
      kind: "existing",
      fileId: circle.cover.file_id,
      src: circle.cover.url,
    };
  }
  return { kind: "none" };
}

type DraftPhoto =
  | { key: string; kind: "existing"; fileId: string; src: string | null }
  | { key: string; kind: "file"; file: File; src: string };

function existingDrafts(memory: BankMemory | null): DraftPhoto[] {
  if (!memory) return [];
  return memory.photos.map((photo) => ({
    key: photo.id,
    kind: "existing" as const,
    fileId: photo.file_id,
    src: photoSrc(photo),
  }));
}

export function MemoryComposer({
  open,
  tab,
  onTabChange,
  onClose,
  circleId,
  memory = null,
  renameCircle = null,
  firstRun = false,
  namedCount = 0,
}: {
  open: boolean;
  tab: ComposerTab;
  onTabChange: (tab: ComposerTab) => void;
  onClose: () => void;
  circleId: string;
  memory?: BankMemory | null;
  renameCircle?: MemoryCircle | null;
  firstRun?: boolean;
  namedCount?: number;
}) {
  const editing = Boolean(memory);
  const renaming = Boolean(renameCircle);
  const showTabs = !editing && !renaming;
  const active: ComposerTab = editing ? "memory" : renaming ? "bank" : tab;
  const titleId =
    active === "bank" || renaming || firstRun
      ? "bank-name-title"
      : "keep-title";

  return (
    <CalmPopup
      open={open}
      onClose={() => {
        if (firstRun) return;
        onClose();
      }}
      labelledBy={titleId}
    >
      {open ? (
        <div className="flex min-h-0 flex-1 flex-col">
          {showTabs ? (
            <div className="px-5 pt-5">
              <div className="grid grid-cols-2 gap-1 rounded-xl bg-[#F2DACE]/55 p-1">
                <TabButton
                  selected={active === "memory"}
                  onClick={() => onTabChange("memory")}
                >
                  Memory
                </TabButton>
                <TabButton
                  selected={active === "bank"}
                  onClick={() => onTabChange("bank")}
                >
                  Bank
                </TabButton>
              </div>
            </div>
          ) : null}
          {showTabs || !renaming ? (
            <div
              className={
                active === "memory" ? "flex min-h-0 flex-1 flex-col" : "hidden"
              }
            >
              <KeepForm
                key={memory?.id ?? `new-${circleId}`}
                circleId={circleId}
                memory={memory}
                onClose={onClose}
                showHeader={!showTabs}
                autoFocus={active === "memory"}
              />
            </div>
          ) : null}
          {showTabs || renaming || firstRun ? (
            <div
              className={
                active === "bank" ? "flex min-h-0 flex-1 flex-col" : "hidden"
              }
            >
              <BankForm
                key={renameCircle?.id ?? "create"}
                firstRun={firstRun}
                namedCount={namedCount}
                renameCircle={renameCircle}
                onClose={onClose}
                autoFocus={active === "bank"}
              />
            </div>
          ) : null}
        </div>
      ) : null}
    </CalmPopup>
  );
}

function TabButton({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  children: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "h-10 rounded-lg text-sm font-medium",
        selected
          ? "bg-[var(--mb-solar-void)] text-[var(--mb-solar-ink)] shadow-sm"
          : "text-[var(--mb-solar-muted)] hover:text-[var(--mb-solar-ink)]",
      )}
    >
      {children}
    </button>
  );
}

function BankForm({
  firstRun,
  namedCount,
  renameCircle,
  onClose,
  autoFocus = true,
}: {
  firstRun: boolean;
  namedCount: number;
  renameCircle: MemoryCircle | null;
  onClose: () => void;
  autoFocus?: boolean;
}) {
  const router = useRouter();
  const circles = useMemoryCircles();
  const create = useCreateCircle();
  const renameBank = useRenameCircle(renameCircle?.id ?? "");
  const renaming = Boolean(renameCircle);
  const [name, setName] = useState(renameCircle?.name ?? "");
  const [draftSeed] = useState(
    () => renameCircle?.id ?? `bank-${Math.random().toString(36).slice(2)}`,
  );
  const [cover, setCover] = useState<CoverDraft>(() =>
    initialCover(renameCircle),
  );
  const [coverDirty, setCoverDirty] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const banks = circles.data ?? [];
  const nameTaken = bankNameTaken(name, banks, renameCircle?.id);
  const pending = uploading || create.isPending || renameBank.isPending;
  const previewSeed = renameCircle?.id ?? draftSeed;

  function setChosenCover(next: CoverDraft) {
    setCover((prev) => {
      if (prev.kind === "file") URL.revokeObjectURL(prev.src);
      return next;
    });
    setCoverDirty(true);
  }

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    const trimmed = name.trim();
    if (!trimmed || pending || nameTaken) return;
    setUploading(true);
    try {
      let coverFileId: string | null | undefined;
      if (cover.kind === "file") {
        coverFileId = await fileService.upload(cover.file, "memory-bank");
      } else if (cover.kind === "existing") {
        coverFileId = cover.fileId;
      } else if (coverDirty) {
        coverFileId = null;
      }
      if (renaming && renameCircle) {
        const input: { name: string; cover_file_id?: string | null } = {
          name: trimmed,
        };
        if (coverFileId !== undefined) input.cover_file_id = coverFileId;
        renameBank.mutate(input, { onSuccess: () => onClose() });
        return;
      }
      create.mutate(
        {
          name: trimmed,
          ...(coverFileId ? { cover_file_id: coverFileId } : {}),
        },
        {
          onSuccess: (created) => {
            markFirstRunDone();
            rememberCircle(created.id);
            track({
              name: "memory_bank.circle_created",
              properties: { source: namedCount ? "space" : "first_run" },
            });
            onClose();
            router.push(ROUTES.memoryCircle(created.id));
          },
        },
      );
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <form
      data-hud
      onSubmit={onSubmit}
      className="flex min-h-0 flex-1 flex-col"
      onWheel={(event) => event.stopPropagation()}
    >
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-5">
        <h2
          id="bank-name-title"
          className="font-display text-xl text-[var(--mb-solar-ink)]"
        >
          {renaming ? "Rename bank" : firstRun ? "Name a bank" : "New bank"}
        </h2>
        <p className="mt-1 text-sm text-[var(--mb-solar-muted)]">
          {firstRun
            ? "One name. Everything you keep after this lives with them."
            : "Bank names are unique for your account."}
        </p>
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="relative mt-5 flex h-36 w-full items-center justify-center overflow-hidden rounded-2xl border border-dashed border-[#E3A78C] bg-white/50"
          aria-label="Bank photo"
        >
          {cover.kind === "none" ? (
            <span className="pointer-events-none absolute inset-0">
              <KeepsakeFace seed={previewSeed} />
            </span>
          ) : (
            // eslint-disable-next-line @next/next/no-img-element -- local or presigned preview
            <img
              src={cover.src || undefined}
              alt=""
              className="absolute inset-0 size-full object-cover"
            />
          )}
          <span className="relative z-10 flex min-h-11 items-center gap-2 rounded-full bg-[var(--mb-solar-void)]/90 px-3 text-sm text-[var(--mb-solar-ink)]">
            <ImagePlus className="size-4 text-[#C75B39]" />
            {cover.kind === "none" ? "Add a photo" : "Change photo"}
          </span>
        </button>
        {cover.kind !== "none" ? (
          <button
            type="button"
            onClick={() => setChosenCover({ kind: "none" })}
            className="mt-2 min-h-11 text-sm text-[var(--mb-solar-muted)] hover:text-[var(--mb-solar-ink)]"
          >
            Remove photo
          </button>
        ) : (
          <p className="mt-2 text-xs text-[var(--mb-solar-muted)]">
            Optional. Without one, a keepsake mark stays with this bank.
          </p>
        )}
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={(event) => {
            const file = Array.from(event.target.files ?? []).find((item) =>
              item.type.startsWith("image/"),
            );
            event.target.value = "";
            if (!file) return;
            setChosenCover({
              kind: "file",
              file,
              src: URL.createObjectURL(file),
            });
          }}
        />
        <Label htmlFor="bank-name" className="sr-only">
          Bank name
        </Label>
        <Input
          id="bank-name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Asha, or Us"
          maxLength={80}
          autoFocus={autoFocus}
          autoComplete="off"
          aria-invalid={nameTaken}
          className="mt-5 h-14 bg-transparent font-display text-lg"
        />
        {nameTaken ? (
          <p className="mt-2 text-xs text-destructive">
            You already have a bank with this name.
          </p>
        ) : (
          <p className="mt-2 text-xs text-[var(--mb-solar-muted)]">
            A name is enough to begin.
          </p>
        )}
      </div>
      <div className="flex gap-2 border-t border-[var(--mb-solar-line)] px-5 py-3">
        <Button
          type="submit"
          className="h-11 min-h-11 flex-1"
          disabled={!name.trim() || pending || nameTaken}
        >
          {pending ? <Loader2 className="size-4 animate-spin" /> : null}
          {renaming ? "Save" : firstRun ? "Begin" : "Add bank"}
        </Button>
        {firstRun ? null : (
          <Button
            type="button"
            variant="ghost"
            className="h-11 min-h-11"
            onClick={onClose}
          >
            Cancel
          </Button>
        )}
      </div>
      {firstRun ? (
        <button
          type="button"
          onClick={() => {
            markFirstRunDone();
            onClose();
          }}
          className="min-h-11 w-full pb-4 text-sm text-[var(--mb-solar-muted)] hover:text-[var(--mb-solar-ink)]"
        >
          Not sure yet
        </button>
      ) : null}
    </form>
  );
}

function KeepForm({
  circleId,
  memory,
  onClose,
  showHeader,
  autoFocus = true,
}: {
  circleId: string;
  memory: BankMemory | null;
  onClose: () => void;
  showHeader?: boolean;
  autoFocus?: boolean;
}) {
  const circles = useMemoryCircles();
  const create = useCreateMemory();
  const update = useUpdateMemory(circleId);
  const fileRef = useRef<HTMLInputElement>(null);
  const editing = Boolean(memory);

  const [title, setTitle] = useState(memory?.title ?? "");
  const [note, setNote] = useState(
    memory && memory.note !== memory.title ? (memory.note ?? "") : "",
  );
  const [whoId, setWhoId] = useState(memory?.circle_id ?? circleId);
  const [when, setWhen] = useState(memory?.occurred_on ?? "");
  const [place, setPlace] = useState<MemoryLocation | null>(
    memory?.location ?? null,
  );
  const [photos, setPhotos] = useState<DraftPhoto[]>(() =>
    existingDrafts(memory),
  );
  const [uploading, setUploading] = useState(false);

  const destinations = circles.data ?? [];
  const selectedId = destinations.some((circle) => circle.id === whoId)
    ? whoId
    : ((destinations.find((circle) => !circle.is_loose) ?? destinations[0])
        ?.id ?? whoId);
  const busy = uploading || create.isPending || update.isPending;
  const canKeep = Boolean(title.trim()) && !busy && Boolean(selectedId);

  function addFiles(list: FileList | null) {
    const incoming = Array.from(list ?? []).filter((file) =>
      file.type.startsWith("image/"),
    );
    if (!incoming.length) return;
    setPhotos((prev) => {
      const room = MAX_PHOTOS - prev.length;
      const next = incoming.slice(0, room).map((file) => ({
        key: `${file.name}-${file.size}-${file.lastModified}-${Math.random()}`,
        kind: "file" as const,
        file,
        src: URL.createObjectURL(file),
      }));
      return [...prev, ...next];
    });
  }

  function removePhoto(key: string) {
    setPhotos((prev) => {
      const target = prev.find((photo) => photo.key === key);
      if (target?.kind === "file") URL.revokeObjectURL(target.src);
      return prev.filter((photo) => photo.key !== key);
    });
  }

  async function onKeep(event: React.FormEvent) {
    event.preventDefault();
    if (!canKeep) return;
    setUploading(true);
    try {
      const fileIds: string[] = [];
      for (const photo of photos) {
        if (photo.kind === "existing") {
          fileIds.push(photo.fileId);
        } else {
          fileIds.push(await fileService.upload(photo.file, "memory-bank"));
        }
      }
      const input = {
        title: title.trim(),
        note: note.trim(),
        occurred_on: when || null,
        location: place,
        photos: fileIds,
      };
      if (editing && memory) {
        update.mutate(
          { memoryId: memory.id, input },
          { onSuccess: () => onClose() },
        );
      } else {
        create.mutate(
          { circleId: selectedId, input },
          {
            onSuccess: () => {
              track({
                name: "memory_bank.memory_kept",
                properties: { photo_count: fileIds.length },
              });
              onClose();
            },
          },
        );
      }
    } catch (error) {
      const text = error instanceof Error ? error.message : "Upload failed.";
      toast.error(text);
    } finally {
      setUploading(false);
    }
  }

  return (
    <form
      onSubmit={onKeep}
      className="flex min-h-0 flex-1 flex-col"
      onWheel={(event) => event.stopPropagation()}
    >
      {showHeader ? (
        <div className="border-b border-[var(--mb-solar-line)] px-5 py-4">
          <h2
            id="keep-title"
            className="font-display text-xl text-[var(--mb-solar-ink)]"
          >
            {editing ? "Edit this memory" : "Keep a memory"}
          </h2>
          <p className="mt-1 text-sm text-[var(--mb-solar-muted)]">
            A title is enough. The rest can wait.
          </p>
        </div>
      ) : (
        <h2 id="keep-title" className="sr-only">
          Keep a memory
        </h2>
      )}
      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain px-5 py-4">
        <div className="space-y-1.5">
          <Label>Media</Label>
          <PhotoWell
            photos={photos}
            onPick={() => fileRef.current?.click()}
            onRemove={removePhoto}
          />
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            multiple
            className="sr-only"
            onChange={(event) => {
              addFiles(event.target.files);
              event.target.value = "";
            }}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="keep-title-field">Title</Label>
          <Input
            id="keep-title-field"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="The rain"
            maxLength={200}
            autoFocus={autoFocus}
            required
            className="h-11 font-display"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="keep-note">Description</Label>
          <textarea
            id="keep-note"
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder="Optional — what you want to remember"
            maxLength={8000}
            rows={4}
            className="w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="keep-when">Date</Label>
          <Input
            id="keep-when"
            type="date"
            value={when}
            onChange={(event) => setWhen(event.target.value)}
            className="h-11"
          />
        </div>
        <LocationSearch
          key={place?.label ?? "none"}
          inputId="keep-location"
          inlineResults
          lat={place?.lat ?? null}
          lng={place?.lng ?? null}
          label={place?.label || place?.name}
          onPick={(result) =>
            setPlace({
              name: result.name,
              label: result.label,
              lat: result.lat,
              lng: result.lng,
            })
          }
          onClear={() => setPlace(null)}
        />
        <div className="space-y-1.5">
          <Label htmlFor="keep-bank">Bank</Label>
          <BankSelect
            value={selectedId}
            circles={destinations}
            onChange={setWhoId}
            disabled={editing}
          />
        </div>
      </div>
      <div className="flex gap-2 border-t border-[var(--mb-solar-line)] px-5 py-3">
        <Button
          type="button"
          variant="ghost"
          className="h-11"
          onClick={onClose}
        >
          Cancel
        </Button>
        <Button type="submit" className="h-11 flex-1" disabled={!canKeep}>
          {busy ? <Loader2 className="size-4 animate-spin" /> : null}
          {editing ? "Save" : "Keep"}
        </Button>
      </div>
    </form>
  );
}

function BankSelect({
  value,
  circles,
  onChange,
  disabled,
}: {
  value: string;
  circles: MemoryCircle[];
  onChange: (id: string) => void;
  disabled?: boolean;
}) {
  const current = useMemo(
    () => circles.find((circle) => circle.id === value),
    [circles, value],
  );
  return (
    <select
      id="keep-bank"
      value={value}
      disabled={disabled}
      onChange={(event) => onChange(event.target.value)}
      className="h-11 w-full rounded-lg border border-input bg-transparent px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-60"
    >
      {circles.map((circle) => (
        <option key={circle.id} value={circle.id}>
          {circle.is_loose ? `${circle.name} (unfiled)` : circle.name}
        </option>
      ))}
      {!current && value ? <option value={value}>This bank</option> : null}
    </select>
  );
}

function PhotoWell({
  photos,
  onPick,
  onRemove,
}: {
  photos: DraftPhoto[];
  onPick: () => void;
  onRemove: (key: string) => void;
}) {
  if (!photos.length) {
    return (
      <button
        type="button"
        onClick={onPick}
        className="flex h-28 w-full flex-col items-center justify-center rounded-2xl border border-dashed border-[#E3A78C] bg-white/60 text-sm text-[var(--mb-solar-muted)] hover:border-[#C75B39] hover:text-[var(--mb-solar-ink)]"
      >
        <ImagePlus className="size-6 text-[#C75B39]" />
        <span className="mt-1.5">Add photos</span>
      </button>
    );
  }
  return (
    <ul className="flex gap-2 overflow-x-auto pb-1">
      {photos.map((photo) => (
        <li key={photo.key} className="relative shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element -- local or presigned preview */}
          <img
            src={photo.src || undefined}
            alt=""
            className="size-20 rounded-xl object-cover"
          />
          <button
            type="button"
            onClick={() => onRemove(photo.key)}
            className="absolute top-1 right-1 flex size-6 items-center justify-center rounded-full bg-[#3A2A25]/80 text-white"
            aria-label="Remove photo"
          >
            <X className="size-3.5" />
          </button>
        </li>
      ))}
      {photos.length < MAX_PHOTOS ? (
        <li>
          <button
            type="button"
            onClick={onPick}
            className="flex size-20 items-center justify-center rounded-xl border border-dashed border-[#E3A78C] text-[#C75B39]"
            aria-label="Add photo"
          >
            <ImagePlus className="size-5" />
          </button>
        </li>
      ) : null}
    </ul>
  );
}
