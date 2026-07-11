"use client";

import { Pencil, Sparkles, Trash2 } from "lucide-react";
import { useState } from "react";

import {
  BuilderShell,
  type BuilderTab,
} from "@/features/dashboard/components/builder-shell";
import type { ChocolateBouquetSync } from "@/hooks/use-chocolate-bouquet-sync";

import type { Chocolate, ChocolateType } from "../../config";
import { CHOCOLATE_TYPE_LIST, kindOf } from "../../lib/chocolate-kinds";
import { MAX_CHOCOLATES, useBuilderStore } from "../../store/builder.store";
import { ChocolateFormModal } from "./chocolate-form-modal";

/** Modal state: `null` closed · `{ id }` editing an existing chocolate. */
type EditorState = { id: number } | null;

export function BuilderPanel({
  sync,
  onPreview,
  className,
}: {
  sync: ChocolateBouquetSync;
  onPreview: () => void;
  className?: string;
}) {
  const doc = useBuilderStore((s) => s.doc);
  const selectedId = useBuilderStore((s) => s.selectedId);
  const setMeta = useBuilderStore((s) => s.setMeta);
  const addChocolate = useBuilderStore((s) => s.addChocolate);
  const selectChocolate = useBuilderStore((s) => s.selectChocolate);
  const removeChocolate = useBuilderStore((s) => s.removeChocolate);

  const [editor, setEditor] = useState<EditorState>(null);

  const chocolates = doc.chocolates;
  const atCap = chocolates.length >= MAX_CHOCOLATES;

  function handleAdd(type: ChocolateType) {
    const id = addChocolate(type);
    if (id != null) setEditor({ id });
  }

  const tabs: BuilderTab[] = [
    {
      key: "bouquet",
      label: "Bouquet",
      content: (
        <div className="space-y-7">
          <button
            type="button"
            onClick={onPreview}
            className="inline-flex w-full items-center justify-center gap-1.5 rounded-full border border-[#4a2a33] px-4 py-2 text-sm font-medium text-[#f0d0c8] transition-colors hover:border-[#d6465a] hover:bg-white/5"
          >
            <Sparkles className="size-3.5" /> Preview the bouquet
          </button>

          <Section title="The bouquet">
            <Field label="For (recipient)">
              <input
                className={inputCls}
                value={doc.recipientName}
                onChange={(e) => setMeta({ recipientName: e.target.value })}
                placeholder="you"
              />
            </Field>
            <Field label="Bouquet name">
              <input
                className={inputCls}
                value={doc.bouquetName}
                onChange={(e) => setMeta({ bouquetName: e.target.value })}
                placeholder="A bouquet of us"
              />
            </Field>
            <Field label="Subtitle">
              <input
                className={inputCls}
                value={doc.subtitle}
                onChange={(e) => setMeta({ subtitle: e.target.value })}
                placeholder="tap a chocolate, then tear it open"
              />
            </Field>
            <Field label="Message when every chocolate is opened">
              <textarea
                className={`${inputCls} min-h-[80px] resize-y`}
                value={doc.allOpenedMessage}
                onChange={(e) => setMeta({ allOpenedMessage: e.target.value })}
                placeholder="A closing line shown once all the chocolates are unwrapped…"
              />
            </Field>
          </Section>

          <Section title="Wrapping">
            <div className="grid grid-cols-2 gap-3">
              <ColorField
                label="Tissue paper"
                value={doc.wrapColor}
                onChange={(v) => setMeta({ wrapColor: v })}
              />
              <ColorField
                label="Ribbon / bow"
                value={doc.bowColor}
                onChange={(v) => setMeta({ bowColor: v })}
              />
            </div>
          </Section>
        </div>
      ),
    },
    {
      key: "chocolates",
      label: "Chocolates",
      badge: chocolates.length,
      content: (
        <div className="space-y-4">
          <Section title="Add a chocolate">
            {atCap ? (
              <p className="rounded-lg border border-dashed border-[#4a2a33] px-3 py-3 text-center text-xs text-[#c99]">
                A bouquet holds up to {MAX_CHOCOLATES} chocolates.
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {CHOCOLATE_TYPE_LIST.map((k) => (
                  <button
                    key={k.type}
                    type="button"
                    onClick={() => handleAdd(k.type)}
                    className="flex items-center gap-2 rounded-lg border border-[#3a2028] bg-[#221016] px-3 py-2 text-left transition-colors hover:border-[#d6465a]"
                  >
                    <span
                      className="size-3 shrink-0 rounded-full"
                      style={{ background: k.wrapper }}
                    />
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-medium text-[#f0e3e0]">
                        {k.label}
                      </span>
                      <span className="block truncate text-[11px] text-[#a98a90]">
                        {k.hint}
                      </span>
                    </span>
                  </button>
                ))}
              </div>
            )}
          </Section>

          <ul className="space-y-1.5">
            {chocolates.map((c) => (
              <li key={c.id}>
                <ChocolateRow
                  chocolate={c}
                  active={c.id === selectedId}
                  onEdit={() => {
                    selectChocolate(c.id);
                    setEditor({ id: c.id });
                  }}
                  onRemove={() => removeChocolate(c.id)}
                />
              </li>
            ))}
            {chocolates.length === 0 && (
              <li className="rounded-lg border border-dashed border-[#3a2028] px-3 py-6 text-center text-sm text-[#a98a90]">
                No chocolates yet — add your first memory above.
              </li>
            )}
          </ul>
        </div>
      ),
    },
  ];

  return (
    <>
      <BuilderShell
        title="Fill your bouquet"
        sync={sync}
        tabs={tabs}
        className={className}
      />
      {editor && (
        <ChocolateFormModal id={editor.id} onClose={() => setEditor(null)} />
      )}
    </>
  );
}

function ChocolateRow({
  chocolate,
  active,
  onEdit,
  onRemove,
}: {
  chocolate: Chocolate;
  active: boolean;
  onEdit: () => void;
  onRemove: () => void;
}) {
  const kind = kindOf(chocolate.type);
  return (
    <div
      className={[
        "flex items-center gap-2 rounded-lg border px-2.5 py-2 transition-colors",
        active
          ? "border-[#d6465a] bg-[#d6465a]/10"
          : "border-[#3a2028] bg-[#1c0e13] hover:border-[#d6465a]/40",
      ].join(" ")}
    >
      <span
        className="size-3.5 shrink-0 rounded-full"
        style={{ background: kind.wrapper }}
      />
      <button type="button" onClick={onEdit} className="min-w-0 flex-1 text-left">
        <span className="block truncate text-sm font-medium text-[#f0e3e0]">
          {chocolate.label || "Untitled"}
        </span>
        <span className="block truncate text-xs text-[#a98a90]">
          {kind.label}
          {chocolate.date ? ` · ${chocolate.date}` : ""}
        </span>
      </button>
      <button
        type="button"
        aria-label="Edit chocolate"
        onClick={onEdit}
        className="grid size-7 place-items-center rounded-md text-[#a98a90] hover:bg-white/5 hover:text-[#f0c0b8]"
      >
        <Pencil className="size-3.5" />
      </button>
      <button
        type="button"
        aria-label="Delete chocolate"
        onClick={onRemove}
        className="grid size-7 place-items-center rounded-md text-[#a98a90] hover:bg-white/5 hover:text-[#f0a0a0]"
      >
        <Trash2 className="size-3.5" />
      </button>
    </div>
  );
}

const inputCls =
  "w-full rounded-lg border border-[#3a2028] bg-[#1c0e13] px-3 py-2 text-sm text-[#f0e3e0] outline-none transition-colors placeholder:text-[#8a6a70] focus:border-[#d6465a] focus:ring-2 focus:ring-[#d6465a]/20";

function ColorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium tracking-wide text-[#a98a90]">
        {label}
      </span>
      <div className="flex items-center gap-2 rounded-lg border border-[#3a2028] bg-[#1c0e13] px-2 py-1.5">
        <input
          type="color"
          value={value || "#cdd7e6"}
          onChange={(e) => onChange(e.target.value)}
          className="size-7 shrink-0 cursor-pointer rounded border-0 bg-transparent"
        />
        <input
          className="min-w-0 flex-1 bg-transparent text-sm text-[#f0e3e0] outline-none"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="#cdd7e6"
        />
      </div>
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
      <span className="mb-1 block text-xs font-medium tracking-wide text-[#a98a90]">
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
      <h2 className="text-sm font-semibold uppercase tracking-wide text-[#e0a89e]">
        {title}
      </h2>
      {children}
    </section>
  );
}
