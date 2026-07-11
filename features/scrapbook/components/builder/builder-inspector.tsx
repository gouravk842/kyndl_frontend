"use client";

import { type ChangeEvent, type ReactNode, useMemo, useRef } from "react";

import { cn } from "@/lib/utils";

import { ELEMENT_PALETTE, useBuilderStore } from "../../store/builder.store";
import type { PageStyle, PlacedElement } from "../../types";

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// ── small form primitives ──────────────────────────────────────
function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block space-y-1">
      <span className="text-xs font-medium tracking-wide text-[#92786C]">
        {label}
      </span>
      {children}
    </label>
  );
}

const inputCls =
  "w-full rounded-lg border border-[#F2DACE] bg-white px-3 py-2 text-sm text-[#3A2A25] outline-none focus:border-[#FF7A59]";

function TextInput({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <input
      className={inputCls}
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}

function TextArea({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <textarea
      className={cn(inputCls, "min-h-20 resize-y leading-relaxed")}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}

function Select({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <select
      className={inputCls}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

function Range({
  value,
  onChange,
  min,
  max,
  step = 1,
}: {
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step?: number;
}) {
  return (
    <div className="flex items-center gap-2">
      <input
        type="range"
        className="flex-1 accent-[#FF7A59]"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
      <span className="w-10 text-right text-xs text-[#92786C]">
        {Math.round(value)}
      </span>
    </div>
  );
}

function ImageInput({
  onPick,
  current,
}: {
  onPick: (dataUrl: string) => void;
  current?: string;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const onChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onPick(await readFileAsDataUrl(file));
  };
  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => ref.current?.click()}
        className="rounded-lg border border-[#F2DACE] bg-white px-3 py-2 text-sm text-[#3A2A25] hover:border-[#FF7A59]"
      >
        {current ? "Replace…" : "Upload…"}
      </button>
      {current && (
        <span className="text-xs text-[#92786C]">image attached</span>
      )}
      <input
        ref={ref}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={onChange}
      />
    </div>
  );
}

// ── element-specific fields ────────────────────────────────────
function ElementFields({
  el,
  patch,
  locked,
}: {
  el: PlacedElement;
  patch: (p: Record<string, unknown>) => void;
  /** Guided template mode — only content fields, no styling/layout. */
  locked?: boolean;
}) {
  switch (el.kind) {
    case "photo":
      return (
        <>
          <Field label="Photo">
            <ImageInput onPick={(src) => patch({ src })} current={el.src} />
          </Field>
          <Field label="Caption">
            <TextInput
              value={el.caption ?? ""}
              onChange={(caption) => patch({ caption })}
            />
          </Field>
          {!locked && (
            <Field label="Style">
              <Select
                value={el.style ?? "polaroid"}
                onChange={(style) => patch({ style })}
                options={[
                  { value: "polaroid", label: "Polaroid" },
                  { value: "single", label: "Single print" },
                  { value: "overlap", label: "Collage" },
                ]}
              />
            </Field>
          )}
        </>
      );
    case "note":
      return (
        <>
          <Field label="Text">
            <TextArea value={el.text} onChange={(text) => patch({ text })} />
          </Field>
          <Field label="Handwriting">
            <Select
              value={el.font ?? "hand"}
              onChange={(font) => patch({ font })}
              options={[
                { value: "hand", label: "Casual" },
                { value: "cursive", label: "Cursive" },
              ]}
            />
          </Field>
        </>
      );
    case "memoryCard":
      return (
        <>
          <Field label="Body">
            <TextArea value={el.body} onChange={(body) => patch({ body })} />
          </Field>
          <Field label="Date">
            <TextInput
              value={el.date ?? ""}
              onChange={(date) => patch({ date })}
            />
          </Field>
          <Field label="Place">
            <TextInput
              value={el.place ?? ""}
              onChange={(place) => patch({ place })}
            />
          </Field>
          <Field label="Paper">
            <Select
              value={el.variant ?? "journal"}
              onChange={(variant) => patch({ variant })}
              options={[
                { value: "journal", label: "Journal" },
                { value: "sticky", label: "Sticky note" },
                { value: "torn", label: "Torn scrap" },
              ]}
            />
          </Field>
        </>
      );
    case "decoration":
      return (
        <>
          <Field label="Sticker">
            <Select
              value={el.type}
              onChange={(type) => patch({ type })}
              options={[
                { value: "heart", label: "Heart" },
                { value: "star", label: "Star" },
                { value: "flower", label: "Flower" },
                { value: "washi", label: "Washi tape" },
                { value: "stamp", label: "Travel stamp" },
                { value: "ticket", label: "Ticket stub" },
              ]}
            />
          </Field>
          {(el.type === "stamp" || el.type === "ticket") && (
            <Field label="Label">
              <TextInput
                value={el.label ?? ""}
                onChange={(label) => patch({ label })}
              />
            </Field>
          )}
        </>
      );
    case "audio":
      return (
        <>
          <Field label="Title">
            <TextInput
              value={el.title}
              onChange={(title) => patch({ title })}
            />
          </Field>
          <Field label="Player">
            <Select
              value={el.player ?? "cassette"}
              onChange={(player) => patch({ player })}
              options={[
                { value: "cassette", label: "Cassette" },
                { value: "vinyl", label: "Vinyl record" },
              ]}
            />
          </Field>
          <p className="text-xs text-[#b29a89]">
            Audio file wiring needs a backend — drops in via the story data
            later.
          </p>
        </>
      );
    case "video":
      return (
        <>
          <Field label="Title">
            <TextInput
              value={el.title}
              onChange={(title) => patch({ title })}
            />
          </Field>
          <Field label="Frame">
            <Select
              value={el.frame ?? "tv"}
              onChange={(frame) => patch({ frame })}
              options={[
                { value: "tv", label: "Vintage TV" },
                { value: "photo", label: "Photo frame" },
              ]}
            />
          </Field>
          <Field label="Poster image">
            <ImageInput
              onPick={(poster) => patch({ poster })}
              current={el.poster}
            />
          </Field>
        </>
      );
    case "secret":
      return (
        <>
          <Field label="Teaser (folded)">
            <TextInput
              value={el.teaser ?? ""}
              onChange={(teaser) => patch({ teaser })}
            />
          </Field>
          <Field label="Hidden message">
            <TextArea
              value={el.message}
              onChange={(message) => patch({ message })}
            />
          </Field>
        </>
      );
    case "scratch":
      return (
        <>
          <Field label="Prompt">
            <TextInput
              value={el.prompt ?? ""}
              onChange={(prompt) => patch({ prompt })}
            />
          </Field>
          <Field label="Revealed text">
            <TextInput
              value={el.reveal.text ?? ""}
              onChange={(text) => patch({ reveal: { ...el.reveal, text } })}
            />
          </Field>
          <Field label="Revealed photo">
            <ImageInput
              onPick={(src) => patch({ reveal: { ...el.reveal, src } })}
              current={el.reveal.src}
            />
          </Field>
        </>
      );
    default:
      return null;
  }
}

// ── inspector ──────────────────────────────────────────────────
export function BuilderInspector() {
  const story = useBuilderStore((s) => s.story);
  const selectedPageId = useBuilderStore((s) => s.selectedPageId);
  const selectedElementId = useBuilderStore((s) => s.selectedElementId);
  const addElement = useBuilderStore((s) => s.addElement);
  const updateElement = useBuilderStore((s) => s.updateElement);
  const removeElement = useBuilderStore((s) => s.removeElement);
  const updatePage = useBuilderStore((s) => s.updatePage);
  const updateCover = useBuilderStore((s) => s.updateCover);

  const page = story.pages.find((p) => p.id === selectedPageId);
  const element = useMemo(
    () => page?.elements.find((e) => e.id === selectedElementId) ?? null,
    [page, selectedElementId],
  );

  const patch = (p: Record<string, unknown>) => {
    if (element) updateElement(element.id, p);
  };

  const locked = !!story.locked;

  return (
    <div className="flex h-full flex-col gap-5 overflow-y-auto p-4">
      {/* add palette — hidden in guided template mode */}
      {!locked && (
        <>
          <section>
            <h3 className="mb-2 text-xs font-semibold tracking-wide text-[#92786C] uppercase">
              Add to page
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {ELEMENT_PALETTE.map((p) => (
                <button
                  key={p.kind}
                  type="button"
                  onClick={() => addElement(p.kind)}
                  className="flex items-center gap-2 rounded-lg border border-[#F2DACE] bg-white px-3 py-2 text-sm text-[#3A2A25] transition-colors hover:border-[#FF7A59]/60 hover:bg-[#FFF1E9]"
                >
                  <span aria-hidden>{p.icon}</span>
                  {p.label}
                </button>
              ))}
            </div>
          </section>

          <div className="h-px bg-[#F2DACE]" />
        </>
      )}

      {element ? (
        locked && element.kind !== "photo" ? (
          // ── locked: non-photo elements are fixed ──
          <section className="space-y-2">
            <h3 className="text-sm font-semibold text-[#3A2A25] capitalize">
              {element.kind === "memoryCard" ? "Memory card" : element.kind}
            </h3>
            <p className="text-xs text-[#92786C]">
              This is part of the template’s design. Click a photo frame to add
              your own picture, or click the page to write.
            </p>
          </section>
        ) : (
          // ── element editor ──
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-[#3A2A25] capitalize">
                {element.kind === "memoryCard" ? "Memory card" : element.kind}
              </h3>
              {!locked && (
                <button
                  type="button"
                  onClick={() => removeElement(element.id)}
                  className="rounded-md px-2 py-1 text-xs text-[#C0392B] hover:bg-[#FDEBE6]"
                >
                  Delete
                </button>
              )}
            </div>

            <ElementFields el={element} patch={patch} locked={locked} />

            {!locked && (
              <div className="space-y-3 rounded-xl bg-[#FFF7F1] p-3">
                <p className="text-xs font-semibold tracking-wide text-[#92786C] uppercase">
                  Placement
                </p>
                <Field label="Horizontal">
                  <Range
                    value={element.x}
                    onChange={(x) => patch({ x })}
                    min={0}
                    max={96}
                  />
                </Field>
                <Field label="Vertical">
                  <Range
                    value={element.y}
                    onChange={(y) => patch({ y })}
                    min={0}
                    max={96}
                  />
                </Field>
                <Field label="Rotation">
                  <Range
                    value={element.rotate ?? 0}
                    onChange={(rotate) => patch({ rotate })}
                    min={-30}
                    max={30}
                  />
                </Field>
                <Field label="Size">
                  <Range
                    value={(element.scale ?? 1) * 100}
                    onChange={(v) => patch({ scale: v / 100 })}
                    min={50}
                    max={180}
                  />
                </Field>
              </div>
            )}
          </section>
        )
      ) : (
        // ── page + cover editor ──
        <section className="space-y-5">
          {!locked && page && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-[#3A2A25]">
                Page settings
              </h3>
              <Field label="Chapter name">
                <TextInput
                  value={page.chapter}
                  onChange={(chapter) => updatePage(page.id, { chapter })}
                />
              </Field>
              <Field label="Eyebrow">
                <TextInput
                  value={page.eyebrow ?? ""}
                  onChange={(eyebrow) => updatePage(page.id, { eyebrow })}
                />
              </Field>
              <Field label="Heading">
                <TextInput
                  value={page.heading ?? ""}
                  onChange={(heading) => updatePage(page.id, { heading })}
                />
              </Field>
              <Field label="Paper style">
                <Select
                  value={page.paper ?? "plain"}
                  onChange={(paper) =>
                    updatePage(page.id, { paper: paper as PageStyle })
                  }
                  options={[
                    { value: "plain", label: "Plain" },
                    { value: "ruled", label: "Ruled" },
                    { value: "dotted", label: "Dotted" },
                    { value: "grid", label: "Grid" },
                  ]}
                />
              </Field>
              <Field label="Paper tint">
                <input
                  type="color"
                  value={page.background ?? "#fffdf6"}
                  onChange={(e) =>
                    updatePage(page.id, { background: e.target.value })
                  }
                  className="h-9 w-full cursor-pointer rounded-lg border border-[#F2DACE] bg-white"
                />
              </Field>
            </div>
          )}

          {!locked && <div className="h-px bg-[#F2DACE]" />}

          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-[#3A2A25]">
              Cover & dedication
            </h3>
            <Field label="Title">
              <TextInput
                value={story.title}
                onChange={(title) => updateCover({ title })}
              />
            </Field>
            <Field label="Subtitle">
              <TextInput
                value={story.subtitle ?? ""}
                onChange={(subtitle) => updateCover({ subtitle })}
              />
            </Field>
            <Field label="Dedication">
              <TextInput
                value={story.dedication ?? ""}
                onChange={(dedication) => updateCover({ dedication })}
              />
            </Field>
            <Field label="Cover photo">
              <ImageInput
                onPick={(coverPhoto) => updateCover({ coverPhoto })}
                current={story.coverPhoto}
              />
            </Field>
            {!locked && (
              <Field label="Cover colour">
                <input
                  type="color"
                  value={story.coverColor ?? "#5e1722"}
                  onChange={(e) => updateCover({ coverColor: e.target.value })}
                  className="h-9 w-full cursor-pointer rounded-lg border border-[#F2DACE] bg-white"
                />
              </Field>
            )}
          </div>

          <p className="text-xs text-[#b29a89]">
            {locked
              ? "Tip: click the page to write, or click a photo frame to add your own picture. Use “Customise layout” to move things freely."
              : "Tip: click an element on the page to edit it, or drag it to reposition."}
          </p>
        </section>
      )}
    </div>
  );
}
