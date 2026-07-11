"use client";

import { ImagePlus, Loader2, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { useAuth } from "@/hooks/use-auth";
import { fileService } from "@/services/files/file.service";

import type { Star, StarGate, StarSize } from "../../config";
import { STAR_SIZES, useBuilderStore } from "../../store/builder.store";

/** How a star opens — the gate types surfaced in the builder. */
type GateType = "none" | "question" | "image-puzzle" | "time-lock";

const GATE_OPTIONS: { value: GateType; label: string; hint: string }[] = [
  { value: "none", label: "Opens right away", hint: "No challenge — a tap reveals it." },
  { value: "question", label: "Answer a question", hint: "They must answer to unlock it." },
  {
    value: "image-puzzle",
    label: "Solve a jigsaw",
    hint: "Slide the tiles into place. Uses this star's photo if it has one.",
  },
  {
    value: "time-lock",
    label: "Unlock at a set time",
    hint: "Sealed until a date & time you choose, then it opens itself.",
  },
];

interface FormState {
  label: string;
  date: string; // free-text caption ("Caption")
  timestamp: string; // real date, YYYY-MM-DD
  memory: string;
  size: StarSize;
  starImage: { fileId: string; url: string } | null;
  author: string;
  alwaysAsk: boolean;
  gateType: GateType;
  // question
  qPrompt: string;
  qAnswers: string; // one accepted answer per line
  qChoices: string; // optional multiple-choice options, one per line
  qHint: string;
  // image-puzzle
  puzzleSize: number; // 2–4
  puzzlePrompt: string;
  puzzleImage: { fileId: string; url: string } | null;
  // time-lock
  unlockAt: string; // datetime-local value ("YYYY-MM-DDTHH:mm")
  teaser: string;
  // sequential trail
  requires: number[];
}

/** Turn an ISO instant into the local value a `datetime-local` input wants. */
function toLocalInput(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours(),
  )}:${pad(d.getMinutes())}`;
}

/** Split a textarea of one-per-line values into a trimmed, non-empty list. */
function lines(value: string): string[] {
  return value
    .split("\n")
    .map((v) => v.trim())
    .filter(Boolean);
}

const EMPTY_STATE: FormState = {
  label: "",
  date: "",
  timestamp: "",
  memory: "",
  size: "medium",
  starImage: null,
  author: "",
  alwaysAsk: false,
  gateType: "none",
  qPrompt: "",
  qAnswers: "",
  qChoices: "",
  qHint: "",
  puzzleSize: 3,
  puzzlePrompt: "",
  puzzleImage: null,
  unlockAt: "",
  teaser: "",
  requires: [],
};

function initialState(
  star: Star | null,
  urlFor: (fileId: string) => string,
): FormState {
  if (!star) return { ...EMPTY_STATE };
  const base: FormState = {
    ...EMPTY_STATE,
    label: star.label,
    date: star.date,
    timestamp: star.timestamp ?? "",
    memory: star.memory,
    size: star.size,
    author: star.author ?? "",
    alwaysAsk: star.alwaysAsk ?? false,
    starImage: star.image?.fileId
      ? { fileId: star.image.fileId, url: urlFor(star.image.fileId) }
      : null,
    requires: star.requires ?? [],
  };
  const gate = star.unlock;
  const cfg = (gate?.config ?? {}) as Record<string, unknown>;
  if (gate?.type === "question") {
    base.gateType = "question";
    base.qPrompt = typeof cfg.prompt === "string" ? cfg.prompt : "";
    base.qAnswers = Array.isArray(cfg.answers) ? cfg.answers.join("\n") : "";
    base.qChoices = Array.isArray(cfg.choices) ? cfg.choices.join("\n") : "";
    base.qHint = typeof cfg.hint === "string" ? cfg.hint : "";
  } else if (gate?.type === "image-puzzle") {
    base.gateType = "image-puzzle";
    base.puzzleSize = typeof cfg.size === "number" ? cfg.size : 3;
    base.puzzlePrompt = typeof cfg.prompt === "string" ? cfg.prompt : "";
    const image = cfg.image as { fileId?: string } | undefined;
    if (image?.fileId) {
      base.puzzleImage = { fileId: image.fileId, url: urlFor(image.fileId) };
    }
  } else if (gate?.type === "time-lock") {
    base.gateType = "time-lock";
    base.unlockAt =
      typeof cfg.unlockAt === "string" ? toLocalInput(cfg.unlockAt) : "";
    base.teaser = typeof cfg.teaser === "string" ? cfg.teaser : "";
  }
  return base;
}

/** Build the `unlock` gate ref from the form, or `null` for "opens right away".
 * Returns `false` when the chosen gate is misconfigured (caller shows an error). */
function buildGate(form: FormState): StarGate | null | false {
  switch (form.gateType) {
    case "question": {
      const answers = lines(form.qAnswers);
      if (!form.qPrompt.trim() || answers.length === 0) return false;
      const choices = lines(form.qChoices);
      const config: Record<string, unknown> = {
        prompt: form.qPrompt.trim(),
        answers,
      };
      if (choices.length > 0) config.choices = choices;
      if (form.qHint.trim()) config.hint = form.qHint.trim();
      return { type: "question", config };
    }
    case "image-puzzle": {
      const config: Record<string, unknown> = { size: form.puzzleSize };
      if (form.puzzlePrompt.trim()) config.prompt = form.puzzlePrompt.trim();
      if (form.puzzleImage)
        config.image = { fileId: form.puzzleImage.fileId };
      return { type: "image-puzzle", config };
    }
    case "time-lock": {
      if (!form.unlockAt || Number.isNaN(Date.parse(form.unlockAt)))
        return false;
      const config: Record<string, unknown> = {
        unlockAt: new Date(form.unlockAt).toISOString(),
      };
      if (form.teaser.trim()) config.teaser = form.teaser.trim();
      return { type: "time-lock", config };
    }
    default:
      return null;
  }
}

/**
 * Add / edit a star in a popup. Pass a `star` to edit, `null` to add. A sibling
 * of memory-jar's `NoteFormModal`: the form is staged locally and only committed
 * to the builder store on save. A newly-added star is dropped near the centre of
 * the sky and selected, so the user can then drag it into place on the board.
 */
export function StarFormModal({
  star,
  onClose,
}: {
  star: Star | null;
  onClose: () => void;
}) {
  const addStar = useBuilderStore((s) => s.addStar);
  const updateStar = useBuilderStore((s) => s.updateStar);
  const allStars = useBuilderStore((s) => s.doc.stars);
  const assets = useBuilderStore((s) => s.assets);
  const localPreviews = useBuilderStore((s) => s.localPreviews);
  const registerPreview = useBuilderStore((s) => s.registerPreview);
  const { profile } = useAuth();
  // The author is stamped from the signed-in account (shown on the memory card).
  const authorName = profile?.full_name || profile?.email || "";
  // Other stars this one can wait on — never itself.
  const otherStars = allStars.filter((s) => s.id !== star?.id);

  const [form, setForm] = useState<FormState>(() =>
    initialState(
      star,
      (fileId) => localPreviews[fileId] ?? assets[fileId] ?? "",
    ),
  );
  const patch = (p: Partial<FormState>) => setForm((f) => ({ ...f, ...p }));

  const toggleRequire = (id: number) =>
    setForm((f) => ({
      ...f,
      requires: f.requires.includes(id)
        ? f.requires.filter((r) => r !== id)
        : [...f.requires, id],
    }));

  // ── photo uploads (star image + jigsaw image share one path) ──
  const [uploadingStar, setUploadingStar] = useState(false);
  const [uploadingPuzzle, setUploadingPuzzle] = useState(false);

  const uploadPhoto = async (
    file: File,
    apply: (ref: { fileId: string; url: string }) => void,
    setBusy: (v: boolean) => void,
  ) => {
    setBusy(true);
    try {
      const fileId = await fileService.upload(file, "constellation");
      const url = URL.createObjectURL(file);
      registerPreview(fileId, url); // preview shows immediately, before save
      apply({ fileId, url });
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Could not upload that photo.",
      );
    } finally {
      setBusy(false);
    }
  };

  // Close on Escape.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const onSave = () => {
    if (!form.label.trim()) {
      toast.error("Give this star a name.");
      return;
    }
    const gate = buildGate(form);
    if (gate === false) {
      toast.error(
        form.gateType === "question"
          ? "A question gate needs a prompt and at least one answer."
          : "Pick a valid date and time for the time lock.",
      );
      return;
    }
    const data: Partial<Omit<Star, "id">> = {
      label: form.label.trim(),
      date: form.date.trim(),
      timestamp: form.timestamp,
      memory: form.memory,
      size: form.size,
      image: form.starImage ? { fileId: form.starImage.fileId } : null,
      // Auto-attribute to the signed-in author; keep any name already on the star.
      author: form.author || authorName,
      alwaysAsk: form.alwaysAsk,
      unlock: gate,
      requires: form.requires,
    };
    if (star) updateStar(star.id, data);
    else addStar(data);
    onClose();
  };

  // ── wizard steps ──────────────────────────────────────────────────
  // The "Open after…" trail only exists once there's another star to
  // wait on, so it's an optional third step.
  const steps: { key: "basics" | "gate" | "trail"; title: string }[] = [
    { key: "basics", title: "The memory" },
    { key: "gate", title: "How it opens" },
    ...(otherStars.length > 0
      ? [{ key: "trail" as const, title: "Open after" }]
      : []),
  ];
  const [step, setStep] = useState(0);
  const idx = Math.min(step, steps.length - 1);
  const current = steps[idx]!; // steps always has ≥ 2 entries
  const isLast = idx >= steps.length - 1;

  /** Validate the current step's fields; toast + block advancing on failure. */
  const validateStep = (): boolean => {
    if (current.key === "basics" && !form.label.trim()) {
      toast.error("Give this star a name.");
      return false;
    }
    if (current.key === "gate" && buildGate(form) === false) {
      toast.error(
        form.gateType === "question"
          ? "A question gate needs a prompt and at least one answer."
          : "Pick a valid date and time for the time lock.",
      );
      return false;
    }
    return true;
  };

  const goNext = () => {
    if (!validateStep()) return;
    if (isLast) onSave();
    else setStep((s) => s + 1);
  };
  const goBack = () => setStep((s) => Math.max(0, s - 1));

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-[#f2dace] bg-[#fffaf4] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="border-b border-[#f2dace] px-5 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display text-lg text-[#3a2a25]">
                {star ? "Edit star" : "Add a star"}
              </h2>
              <p className="mt-0.5 text-xs text-[#92786c]">
                Step {idx + 1} of {steps.length} · {current.title}
              </p>
            </div>
            <button
              type="button"
              aria-label="Close"
              onClick={onClose}
              className="grid size-8 place-items-center rounded-full text-[#92786c] hover:bg-[#fbeee6] hover:text-[#c75b39]"
            >
              <X className="size-4" />
            </button>
          </div>
          {/* Step progress */}
          <div className="mt-3 flex gap-1.5">
            {steps.map((s, i) => (
              <span
                key={s.key}
                className={`h-1.5 flex-1 rounded-full transition-colors ${
                  i <= idx ? "bg-[#ff7a59]" : "bg-[#f2dace]"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Body */}
        <div className="space-y-4 overflow-y-auto px-5 py-5">
          {current.key === "basics" ? (
            <>
          <Field label="Label (the star's name)">
            <input
              className={inputCls}
              value={form.label}
              onChange={(e) => patch({ label: e.target.value })}
              placeholder="the night we met"
              autoFocus
            />
          </Field>
          <Field label="Date">
            <input
              type="date"
              className={inputCls}
              value={form.timestamp}
              onChange={(e) => patch({ timestamp: e.target.value })}
            />
          </Field>
          <Field label="Caption (a few words)">
            <input
              className={inputCls}
              value={form.date}
              onChange={(e) => patch({ date: e.target.value })}
              placeholder="that first spring"
            />
          </Field>
          <ImageUploadField
            label="Photo (optional)"
            image={form.starImage}
            uploading={uploadingStar}
            onFile={(file) =>
              uploadPhoto(file, (ref) => patch({ starImage: ref }), setUploadingStar)
            }
            onRemove={() => patch({ starImage: null })}
          />
          <Field label="The memory">
            <textarea
              className={`${inputCls} min-h-[150px] resize-y`}
              value={form.memory}
              onChange={(e) => patch({ memory: e.target.value })}
              placeholder="Write the moment this star holds… line breaks are kept."
            />
          </Field>
          <Field label="Size">
            <select
              className={inputCls}
              value={form.size}
              onChange={(e) => patch({ size: e.target.value as StarSize })}
            >
              {STAR_SIZES.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </Field>
          {form.author || authorName ? (
            <p className="text-xs text-[#92786c]">
              Signed as{" "}
              <span className="font-medium text-[#3a2a25]">
                {form.author || authorName}
              </span>{" "}
              — shown on this memory.
            </p>
          ) : null}
            </>
          ) : null}

          {/* ── How this memory opens ──────────────────────────── */}
          {current.key === "gate" ? (
          <div className="rounded-xl border border-[#f2dace] bg-[#fdf3ea] p-4">
            <p className="font-display text-sm text-[#3a2a25]">
              How this memory opens
            </p>
            <p className="mt-0.5 mb-3 text-xs text-[#92786c]">
              Put a little challenge in front of it — or let it open on a tap.
            </p>

            <Field label="Unlock with">
              <select
                className={inputCls}
                value={form.gateType}
                onChange={(e) => patch({ gateType: e.target.value as GateType })}
              >
                {GATE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </Field>
            <p className="mt-1 text-xs text-[#92786c]">
              {GATE_OPTIONS.find((o) => o.value === form.gateType)?.hint}
            </p>

            {form.gateType === "question" ? (
              <div className="mt-3 space-y-3">
                <Field label="Question">
                  <input
                    className={inputCls}
                    value={form.qPrompt}
                    onChange={(e) => patch({ qPrompt: e.target.value })}
                    placeholder="Where did we first meet?"
                  />
                </Field>
                <Field label="Accepted answers (one per line)">
                  <textarea
                    className={`${inputCls} min-h-[70px] resize-y`}
                    value={form.qAnswers}
                    onChange={(e) => patch({ qAnswers: e.target.value })}
                    placeholder={"Paris\nthe cafe on rue Cler"}
                  />
                </Field>
                <Field label="Multiple-choice options (optional, one per line)">
                  <textarea
                    className={`${inputCls} min-h-[70px] resize-y`}
                    value={form.qChoices}
                    onChange={(e) => patch({ qChoices: e.target.value })}
                    placeholder={"Leave empty for a free-text answer"}
                  />
                </Field>
                <Field label="Hint (optional)">
                  <input
                    className={inputCls}
                    value={form.qHint}
                    onChange={(e) => patch({ qHint: e.target.value })}
                    placeholder="Shown after a wrong guess"
                  />
                </Field>
              </div>
            ) : null}

            {form.gateType === "image-puzzle" ? (
              <div className="mt-3 space-y-3">
                <ImageUploadField
                  label="Puzzle photo"
                  image={form.puzzleImage}
                  uploading={uploadingPuzzle}
                  onFile={(file) =>
                    uploadPhoto(
                      file,
                      (ref) => patch({ puzzleImage: ref }),
                      setUploadingPuzzle,
                    )
                  }
                  onRemove={() => patch({ puzzleImage: null })}
                />
                <Field label="Difficulty">
                  <select
                    className={inputCls}
                    value={form.puzzleSize}
                    onChange={(e) =>
                      patch({ puzzleSize: Number(e.target.value) })
                    }
                  >
                    <option value={2}>Easy (2×2)</option>
                    <option value={3}>Medium (3×3)</option>
                    <option value={4}>Hard (4×4)</option>
                  </select>
                </Field>
                <Field label="Prompt (optional)">
                  <input
                    className={inputCls}
                    value={form.puzzlePrompt}
                    onChange={(e) => patch({ puzzlePrompt: e.target.value })}
                    placeholder="Rebuild the picture"
                  />
                </Field>
                <p className="text-xs text-[#92786c]">
                  {form.puzzleImage
                    ? "The tiles are slices of this puzzle photo."
                    : form.starImage
                      ? "No puzzle photo set — the tiles use this memory's photo."
                      : "No photo yet — the puzzle falls back to numbered tiles."}
                </p>
              </div>
            ) : null}

            {form.gateType === "time-lock" ? (
              <div className="mt-3 space-y-3">
                <Field label="Opens at">
                  <input
                    type="datetime-local"
                    className={inputCls}
                    value={form.unlockAt}
                    onChange={(e) => patch({ unlockAt: e.target.value })}
                  />
                </Field>
                <Field label="Teaser while it waits (optional)">
                  <input
                    className={inputCls}
                    value={form.teaser}
                    onChange={(e) => patch({ teaser: e.target.value })}
                    placeholder="Come back on our anniversary…"
                  />
                </Field>
              </div>
            ) : null}

            {/* Re-lock behaviour — only meaningful once there's a challenge. */}
            {form.gateType !== "none" ? (
              <label className="mt-4 flex cursor-pointer items-start gap-2.5 rounded-lg border border-[#f2dace] bg-white px-3 py-2.5">
                <input
                  type="checkbox"
                  className="mt-0.5 size-4 accent-[#ff7a59]"
                  checked={form.alwaysAsk}
                  onChange={(e) => patch({ alwaysAsk: e.target.checked })}
                />
                <span className="text-sm text-[#3a2a25]">
                  Ask every visit
                  <span className="mt-0.5 block text-xs text-[#92786c]">
                    On by choice: they must solve it each time. Off: solving once
                    keeps it open on this device.
                  </span>
                </span>
              </label>
            ) : null}
          </div>
          ) : null}

          {/* ── Sequential trail: which stars must open first ──── */}
          {current.key === "trail" && otherStars.length > 0 ? (
            <div className="rounded-xl border border-[#f2dace] bg-[#fdf3ea] p-4">
              <p className="font-display text-sm text-[#3a2a25]">
                Open after…
              </p>
              <p className="mt-0.5 mb-3 text-xs text-[#92786c]">
                Keep this star dark until these are read — light the sky in order.
              </p>
              <div className="space-y-1.5">
                {otherStars.map((s) => (
                  <label
                    key={s.id}
                    className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-[#3a2a25] hover:bg-[#fbeee6]"
                  >
                    <input
                      type="checkbox"
                      className="size-4 accent-[#ff7a59]"
                      checked={form.requires.includes(s.id)}
                      onChange={() => toggleRequire(s.id)}
                    />
                    <span className="truncate">
                      {s.label || `Star ${s.id}`}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          ) : null}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-2 border-t border-[#f2dace] px-5 py-4">
          <button
            type="button"
            onClick={idx === 0 ? onClose : goBack}
            className="rounded-full px-4 py-2 text-sm font-medium text-[#7a6258] hover:bg-[#fbeee6]"
          >
            {idx === 0 ? "Cancel" : "Back"}
          </button>
          <button
            type="button"
            onClick={goNext}
            className="rounded-full bg-[#ff7a59] px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#f2596f]"
          >
            {isLast ? (star ? "Save changes" : "Add star") : "Continue"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Small building blocks (mirrors builder-panel) ──────────────────
const inputCls =
  "w-full rounded-lg border border-[#e3d2c5] bg-white px-3 py-2 text-sm text-[#3a2a25] outline-none transition-colors placeholder:text-[#b6a396] focus:border-[#ff7a59] focus:ring-2 focus:ring-[#ff7a59]/20";

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

/** Upload-or-preview control for a single photo (star image / puzzle image).
 * Owns its own hidden file input; hands the picked `File` up via `onFile`. */
function ImageUploadField({
  label,
  image,
  uploading,
  onFile,
  onRemove,
}: {
  label: string;
  image: { url: string } | null;
  uploading: boolean;
  onFile: (file: File) => void;
  onRemove: () => void;
}) {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <Field label={label}>
      <input
        ref={ref}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          e.target.value = "";
          if (file) onFile(file);
        }}
      />
      {image?.url ? (
        <div className="relative overflow-hidden rounded-lg">
          {/* eslint-disable-next-line @next/next/no-img-element -- transient/presigned URL */}
          <img src={image.url} alt="" className="h-36 w-full object-cover" />
          <button
            type="button"
            aria-label="Remove photo"
            onClick={onRemove}
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
          className="flex h-32 w-full flex-col items-center justify-center gap-1.5 rounded-lg border-2 border-dashed border-[#e3d2c5] bg-white text-[#92786c] transition-colors hover:border-[#ff7a59]/60 hover:text-[#c75b39] disabled:opacity-60"
        >
          {uploading ? (
            <Loader2 className="size-5 animate-spin" />
          ) : (
            <ImagePlus className="size-5" />
          )}
          <span className="text-xs font-medium">
            {uploading ? "Uploading…" : "Upload a photo"}
          </span>
        </button>
      )}
    </Field>
  );
}
