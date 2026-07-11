"use client";

import { ChevronDown, ChevronUp, ImageOff, Lock, Plus, Trash2 } from "lucide-react";

import { useBuilderStore } from "../../store/builder.store";
import type { MemoryEntry } from "../../types";

/**
 * The compact, reorderable list of memories that lives in the settings side
 * panel. Rows read like a standard admin list: thumbnail, title/caption, and a
 * small action cluster. Clicking a row opens the memory popup. There is no page
 * concept here — the store packs these onto album leaves automatically.
 *
 * When the viewer is a *contributor*, memories added by others are shown as
 * read-only (a lock, no edit/remove/move) — mirroring the server rule that a
 * contributor may only touch memories they added.
 */
export function MemoryList({
  onAdd,
  onEdit,
  activeId,
}: {
  onAdd: () => void;
  onEdit: (id: string) => void;
  activeId?: string | null;
}) {
  const memories = useBuilderStore((s) => s.memories);
  const moveMemory = useBuilderStore((s) => s.moveMemory);
  const removeMemory = useBuilderStore((s) => s.removeMemory);
  const photoUrl = useBuilderStore((s) => s.photoUrl);
  const canEditMemory = useBuilderStore((s) => s.canEditMemory);
  const viewerRole = useBuilderStore((s) => s.viewerRole);

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={onAdd}
        className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-[#ff7a59] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#f2596f]"
      >
        <Plus className="size-4" /> Add a memory
      </button>

      {viewerRole === "contributor" && (
        <p className="rounded-lg bg-[#fbeee6] px-3 py-2 text-xs text-[#92786c]">
          You&apos;re a contributor — add your own memories here. Others&apos;
          memories are shown but locked.
        </p>
      )}

      {memories.length === 0 ? (
        <p className="rounded-lg border border-dashed border-[#e3d2c5] px-3 py-5 text-center text-xs text-[#92786c]">
          No memories yet. Add your first — a photo, a title and a few lines.
          We&apos;ll arrange them into album pages for you.
        </p>
      ) : (
        <ul className="space-y-1.5">
          {memories.map((m, i) => {
            const editable = canEditMemory(m);
            return (
              <li key={m.id}>
                <MemoryRow
                  memory={m}
                  index={i}
                  active={m.id === activeId}
                  isFirst={i === 0}
                  isLast={i === memories.length - 1}
                  editable={editable}
                  url={photoUrl(m.photo?.fileId)}
                  onEdit={() => onEdit(m.id)}
                  onRemove={() => removeMemory(m.id)}
                  onUp={() => moveMemory(m.id, -1)}
                  onDown={() => moveMemory(m.id, 1)}
                />
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function MemoryRow({
  memory,
  index,
  active,
  isFirst,
  isLast,
  editable,
  url,
  onEdit,
  onRemove,
  onUp,
  onDown,
}: {
  memory: MemoryEntry;
  index: number;
  active: boolean;
  isFirst: boolean;
  isLast: boolean;
  editable: boolean;
  url: string | null;
  onEdit: () => void;
  onRemove: () => void;
  onUp: () => void;
  onDown: () => void;
}) {
  const heading = memory.title?.trim() || "Untitled memory";
  return (
    <div
      className={[
        "flex items-center gap-2.5 rounded-lg border p-2 transition-colors",
        active
          ? "border-[#ff7a59] bg-[#fbeee6]"
          : "border-[#f2dace] bg-white hover:border-[#ff7a59]/40",
        !editable && "opacity-90",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <button
        type="button"
        onClick={editable ? onEdit : undefined}
        disabled={!editable}
        className="flex min-w-0 flex-1 items-center gap-2.5 text-left disabled:cursor-default"
      >
        <span className="relative grid size-11 shrink-0 place-items-center overflow-hidden rounded-md bg-[#f4e3d4] text-[#b29a89]">
          {url ? (
            // eslint-disable-next-line @next/next/no-img-element -- transient/presigned URL
            <img src={url} alt="" className="h-full w-full object-cover" />
          ) : (
            <ImageOff className="size-4" />
          )}
          <span className="absolute -top-1 -left-1 grid size-4 place-items-center rounded-full bg-[#3a2a25] text-[9px] font-semibold text-white">
            {index + 1}
          </span>
        </span>
        <span className="min-w-0">
          <span className="flex items-center gap-1.5">
            <span className="truncate text-sm font-medium text-[#3a2a25]">
              {heading}
            </span>
            {!editable && (
              <span className="inline-flex shrink-0 items-center gap-0.5 rounded-full bg-[#f4e3d4] px-1.5 py-0.5 text-[10px] font-medium text-[#92786c]">
                <Lock className="size-2.5" />
                Locked
              </span>
            )}
          </span>
          {memory.caption?.trim() && (
            <span className="block truncate text-xs text-[#92786c]">
              {memory.caption}
            </span>
          )}
        </span>
      </button>

      {editable && (
        <>
          <div className="flex shrink-0 flex-col">
            <IconBtn label="Move earlier" onClick={onUp} disabled={isFirst}>
              <ChevronUp className="size-3.5" />
            </IconBtn>
            <IconBtn label="Move later" onClick={onDown} disabled={isLast}>
              <ChevronDown className="size-3.5" />
            </IconBtn>
          </div>
          <button
            type="button"
            aria-label="Delete memory"
            onClick={onRemove}
            className="grid size-7 shrink-0 place-items-center rounded-md text-[#b29a89] hover:bg-[#fbe1d8] hover:text-[#c75b39]"
          >
            <Trash2 className="size-3.5" />
          </button>
        </>
      )}
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
      className="grid size-5 place-items-center rounded text-[#92786c] hover:text-[#c75b39] disabled:opacity-25 disabled:hover:text-[#92786c]"
    >
      {children}
    </button>
  );
}
