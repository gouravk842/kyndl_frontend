"use client";

import { Dialog } from "@base-ui/react/dialog";
import { ImagePlus, Loader2, X } from "lucide-react";
import { type ChangeEvent, useRef, useState } from "react";
import { toast } from "sonner";

import { SignInLink } from "@/components/auth/sign-in-link";
import { fileService } from "@/services/files/file.service";

import { useBuilderStore } from "../../store/builder.store";
import type { MemoryEntry } from "../../types";

/**
 * The one popup an author uses to capture a single memory: a photo, a title, a
 * caption and a few lines. Opened blank to add, or seeded with an existing
 * memory to edit. Everything lives in a local draft and is only committed to
 * the builder store on "Save" — so "Cancel" cleanly discards. The store then
 * re-arranges memories into album pages automatically.
 */
export function MemoryDialog({
  open,
  onOpenChange,
  memoryId,
  canUpload,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** The memory being edited, or null to add a new one. */
  memoryId: string | null;
  canUpload: boolean;
  /** Called with the memory's id once it's committed, for focusing it. */
  onSaved?: (id: string) => void;
}) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange} modal>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-[300] bg-[#3a281c]/50 backdrop-blur-sm transition-opacity duration-150 data-ending-style:opacity-0 data-starting-style:opacity-0" />
        <Dialog.Popup className="fixed top-1/2 left-1/2 z-[301] flex max-h-[92dvh] w-[min(94vw,32rem)] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-2xl border border-[#f2dace] bg-[#fffaf4] shadow-2xl transition duration-150 data-ending-style:scale-95 data-ending-style:opacity-0 data-starting-style:scale-95 data-starting-style:opacity-0">
          {/* Keyed on the target memory + open so the form seeds fresh state on
              every open, without a state-syncing effect. */}
          {open && (
            <MemoryForm
              key={`${memoryId ?? "new"}:${open}`}
              memoryId={memoryId}
              canUpload={canUpload}
              onClose={() => onOpenChange(false)}
              onSaved={onSaved}
            />
          )}
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function MemoryForm({
  memoryId,
  canUpload,
  onClose,
  onSaved,
}: {
  memoryId: string | null;
  canUpload: boolean;
  onClose: () => void;
  onSaved?: (id: string) => void;
}) {
  const addMemory = useBuilderStore((s) => s.addMemory);
  const updateMemory = useBuilderStore((s) => s.updateMemory);
  const setPhoto = useBuilderStore((s) => s.setPhoto);
  const photoUrl = useBuilderStore((s) => s.photoUrl);

  // Seed once from the target memory (read lazily on mount); the store is not
  // touched again until "Save".
  const [draft, setDraft] = useState<Omit<MemoryEntry, "id">>(() => {
    const editing = memoryId
      ? useBuilderStore.getState().memories.find((m) => m.id === memoryId)
      : null;
    return editing
      ? {
          photo: editing.photo,
          title: editing.title ?? "",
          caption: editing.caption ?? "",
          body: editing.body ?? "",
        }
      : {};
  });
  // Preview URLs for photos uploaded during this session, keyed by fileId, so
  // they render before the draft is saved (and before the store knows them).
  const [uploads, setUploads] = useState<Record<string, string>>({});

  const patch = (p: Partial<Omit<MemoryEntry, "id">>) =>
    setDraft((d) => ({ ...d, ...p }));

  const fileId = draft.photo?.fileId;
  const url = (fileId && uploads[fileId]) || photoUrl(fileId);

  const save = () => {
    const clean = {
      photo: draft.photo,
      title: (draft.title ?? "").trim(),
      caption: (draft.caption ?? "").trim(),
      body: (draft.body ?? "").trim(),
    };
    const id = memoryId ?? addMemory();
    updateMemory(id, clean);
    // Register any freshly-uploaded preview so it shows in the list + preview.
    if (clean.photo && uploads[clean.photo.fileId]) {
      setPhoto(id, clean.photo.fileId, uploads[clean.photo.fileId]!);
    }
    onSaved?.(id);
    onClose();
  };

  return (
    <>
      <div className="flex items-center justify-between border-b border-[#f2dace] px-5 py-4">
        <Dialog.Title className="font-display text-lg text-[#3a2a25]">
          {memoryId ? "Edit memory" : "Add a memory"}
        </Dialog.Title>
        <Dialog.Close className="grid size-8 place-items-center rounded-full text-[#92786c] hover:bg-[#f4e3d4] hover:text-[#3a2a25]">
          <X className="size-4" />
        </Dialog.Close>
      </div>

      <div className="space-y-4 overflow-y-auto px-5 py-5">
        <PhotoPicker
          canUpload={canUpload}
          url={url ?? null}
          onPick={(id, previewUrl) => {
            setUploads((u) => ({ ...u, [id]: previewUrl }));
            patch({ photo: { fileId: id } });
          }}
          onClear={() => patch({ photo: undefined })}
        />
        <Field label="Title">
          <input
            autoFocus
            className={inputCls}
            value={draft.title ?? ""}
            onChange={(e) => patch({ title: e.target.value })}
            placeholder="Inception (2010)"
          />
        </Field>
        <Field label="Caption">
          <input
            className={inputCls}
            value={draft.caption ?? ""}
            onChange={(e) => patch({ caption: e.target.value })}
            placeholder="University College London, England"
          />
        </Field>
        <Field label="Description">
          <textarea
            className={`${inputCls} min-h-24 resize-y`}
            value={draft.body ?? ""}
            onChange={(e) => patch({ body: e.target.value })}
            placeholder="A short note about this moment…"
          />
        </Field>
      </div>

      <div className="flex justify-end gap-2 border-t border-[#f2dace] px-5 py-4">
        <Dialog.Close className="rounded-full px-4 py-2 text-sm font-semibold text-[#7a6258] hover:bg-[#f4e3d4]">
          Cancel
        </Dialog.Close>
        <button
          type="button"
          onClick={save}
          className="rounded-full bg-[#ff7a59] px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#f2596f]"
        >
          {memoryId ? "Save changes" : "Add memory"}
        </button>
      </div>
    </>
  );
}

function PhotoPicker({
  canUpload,
  url,
  onPick,
  onClear,
}: {
  canUpload: boolean;
  url: string | null;
  onPick: (fileId: string, previewUrl: string) => void;
  onClear: () => void;
}) {
  const [uploading, setUploading] = useState(false);
  const ref = useRef<HTMLInputElement>(null);

  const onChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploading(true);
    try {
      const fileId = await fileService.upload(file, "memory-pages");
      onPick(fileId, URL.createObjectURL(file));
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
    <Field label="Photo">
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
          <img src={url} alt="" className="h-44 w-full object-cover" />
          <button
            type="button"
            aria-label="Remove photo"
            onClick={onClear}
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
          className="flex h-40 w-full flex-col items-center justify-center gap-1.5 rounded-lg border-2 border-dashed border-[#e3d2c5] bg-white text-[#92786c] transition-colors hover:border-[#ff7a59]/60 hover:text-[#c75b39] disabled:opacity-60"
        >
          {uploading ? (
            <Loader2 className="size-6 animate-spin" />
          ) : (
            <ImagePlus className="size-6" />
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
