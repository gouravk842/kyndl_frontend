"use client";

import {
  Building2,
  ChevronDown,
  ChevronUp,
  MapPin,
  Plus,
  Trash2,
} from "lucide-react";
import { useState } from "react";

import {
  BuilderShell,
  type BuilderTab,
} from "@/features/dashboard/components/builder-shell";
import type { MemoryCitySync } from "@/hooks/use-memory-city-sync";

import {
  GATE_OPTIONS,
  MOOD_OPTIONS,
  REWARD_OPTIONS,
  SHELL_OPTIONS,
  useBuilderStore,
} from "../../store/builder.store";
import type { CityMemory } from "../../types";

/**
 * The Memory City authoring rail — **meaning-first, never coordinate-first.** The
 * author writes what a moment *was* (its date, mood, words) and orders the list;
 * the layout engine turns that into a placed, growing city. There is deliberately
 * no "drag the building" control — position is derived, not authored.
 */
export function BuilderPanel({
  sync,
  onPreview,
  className,
}: {
  sync: MemoryCitySync;
  onPreview: () => void;
  className?: string;
}) {
  const doc = useBuilderStore((s) => s.doc);
  const selectedId = useBuilderStore((s) => s.selectedId);
  const setMeta = useBuilderStore((s) => s.setMeta);
  const addMemory = useBuilderStore((s) => s.addMemory);
  const selectMemory = useBuilderStore((s) => s.selectMemory);
  const removeMemory = useBuilderStore((s) => s.removeMemory);
  const moveMemory = useBuilderStore((s) => s.moveMemory);

  const memories = doc.memories;
  const selected = memories.find((m) => m.id === selectedId) ?? null;

  const tabs: BuilderTab[] = [
    {
      key: "city",
      label: "City",
      content: (
        <div className="space-y-7">
          <button
            type="button"
            onClick={onPreview}
            className="inline-flex w-full items-center justify-center gap-1.5 rounded-full border border-[#33406b] px-4 py-2 text-sm font-medium text-[#cdd6f4] transition-colors hover:border-[#6f7bb0] hover:bg-white/5"
          >
            <Building2 className="size-3.5" /> Walk the city
          </button>

          {/* City meta */}
          <Section title="The city">
            <Field label="Title">
              <input
                className={inputCls}
                value={doc.title}
                onChange={(e) => setMeta({ title: e.target.value })}
                placeholder="Our City of Years"
              />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="From">
                <input
                  className={inputCls}
                  value={doc.from ?? ""}
                  onChange={(e) => setMeta({ from: e.target.value })}
                  placeholder="Us"
                />
              </Field>
              <Field label="For">
                <input
                  className={inputCls}
                  value={doc.to ?? ""}
                  onChange={(e) => setMeta({ to: e.target.value })}
                  placeholder="You"
                />
              </Field>
            </div>
          </Section>

          {/* Memories */}
          <Section
            title={`Memories (${memories.length})`}
            action={
              <button
                type="button"
                onClick={() => addMemory()}
                className="inline-flex items-center gap-1 rounded-full bg-[#7fd9ff] px-3 py-1.5 text-xs font-semibold text-[#08131c] transition-colors hover:bg-[#a6e6ff]"
              >
                <Plus className="size-3.5" /> Add memory
              </button>
            }
          >
            <p className="-mt-1 mb-2 text-xs text-[#8b93b8]">
              The city arranges itself by date — oldest at the heart, newest on
              the frontier. Order breaks ties.
            </p>
            <ul className="space-y-1.5">
              {memories.map((memory, i) => (
                <li key={memory.id}>
                  <MemoryRow
                    memory={memory}
                    active={memory.id === selectedId}
                    canUp={i > 0}
                    canDown={i < memories.length - 1}
                    onSelect={() => selectMemory(memory.id)}
                    onRemove={() => removeMemory(memory.id)}
                    onUp={() => moveMemory(memory.id, -1)}
                    onDown={() => moveMemory(memory.id, 1)}
                  />
                </li>
              ))}
              {memories.length === 0 && (
                <li className="rounded-lg border border-dashed border-[#2a3458] px-3 py-6 text-center text-sm text-[#8b93b8]">
                  No memories yet — add the first place in your city.
                </li>
              )}
            </ul>
          </Section>

          {/* Selected memory editor */}
          {selected && (
            <Section title="Edit memory">
              <MemoryEditor memory={selected} />
            </Section>
          )}
        </div>
      ),
    },
  ];

  return (
    <BuilderShell
      title="Build your city"
      sync={sync}
      tabs={tabs}
      className={className}
    />
  );
}

// ── Selected-memory editor ─────────────────────────────────────────
function MemoryEditor({ memory }: { memory: CityMemory }) {
  const updateMemory = useBuilderStore((s) => s.updateMemory);
  const memories = useBuilderStore((s) => s.doc.memories);
  const assets = useBuilderStore((s) => s.assets);
  const localPreviews = useBuilderStore((s) => s.localPreviews);
  const registerPreview = useBuilderStore((s) => s.registerPreview);
  const [uploading, setUploading] = useState(false);

  const photoUrl = memory.image?.fileId
    ? (localPreviews[memory.image.fileId] ?? assets[memory.image.fileId] ?? "")
    : (memory.imageUrl ?? "");

  const onUpload = async (file: File | undefined) => {
    if (!file) return;
    setUploading(true);
    try {
      const { fileService } = await import("@/services/files/file.service");
      const fileId = await fileService.upload(file, "memory-city");
      const url = URL.createObjectURL(file);
      registerPreview(fileId, url);
      updateMemory(memory.id, {
        image: { fileId },
        imageUrl: undefined,
      });
    } finally {
      setUploading(false);
    }
  };

  const gateType = memory.gate?.type ?? "";
  const rewardType = memory.reward?.type ?? "message";

  return (
    <div className="space-y-3">
      <Field label="Title">
        <input
          className={inputCls}
          value={memory.title}
          onChange={(e) => updateMemory(memory.id, { title: e.target.value })}
          placeholder="The morning we moved in"
        />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Date">
          <input
            type="date"
            className={inputCls}
            value={memory.date}
            onChange={(e) => updateMemory(memory.id, { date: e.target.value })}
          />
        </Field>
        <Field label="People">
          <input
            className={inputCls}
            value={memory.person ?? ""}
            onChange={(e) =>
              updateMemory(memory.id, { person: e.target.value })
            }
            placeholder="Us"
          />
        </Field>
      </div>
      <Field label="The memory">
        <textarea
          className={`${inputCls} min-h-[120px] resize-y`}
          value={memory.body}
          onChange={(e) => updateMemory(memory.id, { body: e.target.value })}
          placeholder="Write the moment this place holds… line breaks are kept."
        />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Mood (glow colour)">
          <select
            className={inputCls}
            value={memory.mood}
            onChange={(e) =>
              updateMemory(memory.id, {
                mood: e.target.value as CityMemory["mood"],
              })
            }
          >
            {MOOD_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Building">
          <select
            className={inputCls}
            value={memory.shellKind ?? ""}
            onChange={(e) =>
              updateMemory(memory.id, {
                shellKind: e.target.value || undefined,
              })
            }
          >
            <option value="">Auto</option>
            {SHELL_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <Field label="Photo">
        <div className="space-y-2">
          {photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={photoUrl}
              alt=""
              className="h-24 w-full rounded-lg object-cover"
            />
          ) : null}
          <input
            type="file"
            accept="image/*"
            disabled={uploading}
            className="block w-full text-xs text-[#8b93b8] file:mr-3 file:rounded-full file:border-0 file:bg-[#7fd9ff] file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-[#08131c]"
            onChange={(e) => onUpload(e.target.files?.[0])}
          />
          {uploading && <p className="text-xs text-[#8b93b8]">Uploading…</p>}
        </div>
      </Field>

      <Field label="Gate (optional puzzle)">
        <select
          className={inputCls}
          value={gateType}
          onChange={(e) => {
            const type = e.target.value;
            if (!type) {
              updateMemory(memory.id, { gate: undefined });
              return;
            }
            if (type === "question") {
              updateMemory(memory.id, {
                gate: {
                  type: "question",
                  config: {
                    prompt: "What's our special date?",
                    answers: ["answer"],
                  },
                },
              });
            } else if (type === "crossword") {
              updateMemory(memory.id, {
                gate: {
                  type: "crossword",
                  config: {
                    size: 3,
                    entries: [
                      {
                        answer: "US",
                        clue: "You and me",
                        row: 0,
                        col: 0,
                        dir: "across",
                      },
                    ],
                  },
                },
              });
            } else if (type === "image-puzzle") {
              updateMemory(memory.id, {
                gate: {
                  type: "image-puzzle",
                  config: { size: 3 },
                },
              });
            } else if (type === "time-lock") {
              const unlockAt = new Date(Date.now() + 86400000).toISOString();
              updateMemory(memory.id, {
                gate: {
                  type: "time-lock",
                  config: { unlockAt },
                },
              });
            }
          }}
        >
          {GATE_OPTIONS.map((o) => (
            <option key={o.value || "none"} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </Field>

      {gateType === "question" && memory.gate?.type === "question" && (
        <div className="space-y-2 rounded-lg border border-[#2a3458] p-3">
          <Field label="Question prompt">
            <input
              className={inputCls}
              value={(memory.gate.config as { prompt?: string }).prompt ?? ""}
              onChange={(e) =>
                updateMemory(memory.id, {
                  gate: {
                    type: "question",
                    config: {
                      ...(memory.gate!.config as object),
                      prompt: e.target.value,
                    },
                  },
                })
              }
            />
          </Field>
          <Field label="Accepted answer">
            <input
              className={inputCls}
              value={
                ((memory.gate.config as { answers?: string[] }).answers ??
                  [])[0] ?? ""
              }
              onChange={(e) =>
                updateMemory(memory.id, {
                  gate: {
                    type: "question",
                    config: {
                      ...(memory.gate!.config as object),
                      answers: [e.target.value],
                    },
                  },
                })
              }
            />
          </Field>
        </div>
      )}

      <Field label="Reward">
        <select
          className={inputCls}
          value={rewardType}
          onChange={(e) => {
            const type = e.target.value;
            if (type === "mystery-box") {
              updateMemory(memory.id, {
                reward: {
                  type: "mystery-box",
                  config: {
                    title: memory.title || "A little surprise",
                    body: memory.body || "…",
                    mood: memory.mood,
                    teaser: "Tap the box to open it",
                  },
                },
              });
            } else {
              updateMemory(memory.id, { reward: undefined });
            }
          }}
        >
          {REWARD_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Requires (unlock after)">
        <div className="max-h-36 space-y-1 overflow-y-auto rounded-lg border border-[#2a3458] p-2">
          {memories
            .filter((m) => m.id !== memory.id)
            .map((m) => {
              const on = memory.requires?.includes(m.id) ?? false;
              return (
                <label
                  key={m.id}
                  className="flex cursor-pointer items-center gap-2 text-xs text-[#cdd6f4]"
                >
                  <input
                    type="checkbox"
                    checked={on}
                    onChange={() => {
                      const cur = new Set(memory.requires ?? []);
                      if (on) cur.delete(m.id);
                      else cur.add(m.id);
                      updateMemory(memory.id, {
                        requires: cur.size ? [...cur] : undefined,
                      });
                    }}
                  />
                  <span className="truncate">{m.title || m.id}</span>
                </label>
              );
            })}
          {memories.length <= 1 && (
            <p className="text-xs text-[#8b93b8]">Add more memories first.</p>
          )}
        </div>
      </Field>
    </div>
  );
}

// ── Memory list row ────────────────────────────────────────────────
function MemoryRow({
  memory,
  active,
  canUp,
  canDown,
  onSelect,
  onRemove,
  onUp,
  onDown,
}: {
  memory: CityMemory;
  active: boolean;
  canUp: boolean;
  canDown: boolean;
  onSelect: () => void;
  onRemove: () => void;
  onUp: () => void;
  onDown: () => void;
}) {
  return (
    <div
      className={[
        "flex items-center gap-2 rounded-lg border px-2.5 py-2 transition-colors",
        active
          ? "border-[#7fd9ff] bg-[#7fd9ff]/10"
          : "border-[#27315a] bg-[#101a36] hover:border-[#7fd9ff]/40",
      ].join(" ")}
    >
      <MapPin className="size-3.5 shrink-0 text-[#7fd9ff]" />
      <button
        type="button"
        onClick={onSelect}
        className="min-w-0 flex-1 text-left"
      >
        <span className="block truncate text-sm font-medium text-[#e7e3f3]">
          {memory.title || "Untitled memory"}
        </span>
        {memory.date ? (
          <span className="block truncate text-xs text-[#8b93b8]">
            {memory.date}
          </span>
        ) : null}
      </button>
      <div className="flex shrink-0 flex-col">
        <button
          type="button"
          aria-label="Move earlier"
          disabled={!canUp}
          onClick={onUp}
          className="grid size-4 place-items-center text-[#7e87ad] hover:text-[#cdd6f4] disabled:opacity-30"
        >
          <ChevronUp className="size-3.5" />
        </button>
        <button
          type="button"
          aria-label="Move later"
          disabled={!canDown}
          onClick={onDown}
          className="grid size-4 place-items-center text-[#7e87ad] hover:text-[#cdd6f4] disabled:opacity-30"
        >
          <ChevronDown className="size-3.5" />
        </button>
      </div>
      <button
        type="button"
        aria-label="Delete memory"
        onClick={onRemove}
        className="grid size-7 place-items-center rounded-md text-[#7e87ad] hover:bg-white/5 hover:text-[#f0a0a0]"
      >
        <Trash2 className="size-3.5" />
      </button>
    </div>
  );
}

// ── Small building blocks ──────────────────────────────────────────
const inputCls =
  "w-full rounded-lg border border-[#2a3458] bg-[#101a36] px-3 py-2 text-sm text-[#e7e3f3] outline-none transition-colors placeholder:text-[#5d678f] focus:border-[#7fd9ff] focus:ring-2 focus:ring-[#7fd9ff]/20";

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium tracking-wide text-[#8b93b8]">
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
        <h2 className="text-sm font-semibold tracking-wide text-[#c8b88a] uppercase">
          {title}
        </h2>
        {action}
      </div>
      {children}
    </section>
  );
}
