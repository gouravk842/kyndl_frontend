"use client";

import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";

import {
  BuilderShell,
  type BuilderTab,
} from "@/features/dashboard/components/builder-shell";
import type { OurPlacesSync } from "@/hooks/use-our-places-sync";

import { MOOD_COLORS } from "../../config";
import { useBuilderStore } from "../../store/builder.store";
import type { PlaceDoc } from "../../types";
import { PlaceFormModal } from "./place-form-modal";

const TILE_OPTIONS = [
  { value: "positron", label: "Cream" },
  { value: "voyager", label: "Illustrated" },
] as const;

export function BuilderPanel({
  sync,
  className,
}: {
  sync: OurPlacesSync;
  className?: string;
}) {
  const map = useBuilderStore((s) => s.doc.map);
  const places = useBuilderStore((s) => s.doc.places);
  const selectedId = useBuilderStore((s) => s.selectedId);
  const setMap = useBuilderStore((s) => s.setMap);
  const setTileStyle = useBuilderStore((s) => s.setTileStyle);
  const selectPlace = useBuilderStore((s) => s.selectPlace);
  const movePlace = useBuilderStore((s) => s.movePlace);
  const removePlace = useBuilderStore((s) => s.removePlace);

  // The Add/Edit popup: `false` closed, `null` adding, a place when editing.
  const [editing, setEditing] = useState<PlaceDoc | null | false>(false);

  const tabs: BuilderTab[] = [
    {
      key: "map",
      label: "Map",
      content: (
        <div className="space-y-7">
          {/* Map settings */}
          <Section title="The map">
            <Field label="Title">
              <input
                className={inputCls}
                value={map.title}
                onChange={(e) => setMap({ title: e.target.value })}
                placeholder="Our Places"
              />
            </Field>
            <Field label="Subtitle">
              <input
                className={inputCls}
                value={map.subtitle}
                onChange={(e) => setMap({ subtitle: e.target.value })}
                placeholder="every place that is part of us"
              />
            </Field>
            <Field label="Base map">
              <div className="flex gap-2">
                {TILE_OPTIONS.map((t) => (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => setTileStyle(t.value)}
                    className={[
                      "flex-1 rounded-lg border px-3 py-2 text-sm transition-colors",
                      map.tileStyle === t.value
                        ? "border-[#ff7a59] bg-[#fbeee6] text-[#c75b39]"
                        : "border-[#f2dace] bg-white text-[#7a6258] hover:border-[#ff7a59]/50",
                    ].join(" ")}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </Field>
          </Section>

          {/* Places list */}
          <Section
            title={`Places (${places.length})`}
            action={
              <button
                type="button"
                onClick={() => setEditing(null)}
                className="inline-flex items-center gap-1 rounded-full bg-[#ff7a59] px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-[#f2596f]"
              >
                <Plus className="size-3.5" /> Add place
              </button>
            }
          >
            <ul className="space-y-1.5">
              {places.map((p, i) => (
                <li key={p.id}>
                  <PlaceRow
                    place={p}
                    active={p.id === selectedId}
                    isFirst={i === 0}
                    isLast={i === places.length - 1}
                    onSelect={() => {
                      selectPlace(p.id);
                      setEditing(p);
                    }}
                    onUp={() => movePlace(p.id, -1)}
                    onDown={() => movePlace(p.id, 1)}
                    onRemove={() => removePlace(p.id)}
                  />
                </li>
              ))}
              {places.length === 0 && (
                <li className="rounded-lg border border-dashed border-[#e3d2c5] px-3 py-6 text-center text-sm text-[#92786c]">
                  No places yet — add your first.
                </li>
              )}
            </ul>
          </Section>
        </div>
      ),
    },
  ];

  return (
    <>
      <BuilderShell
        title="Customize your map"
        sync={sync}
        tabs={tabs}
        className={className}
      />
      {editing !== false && (
        <PlaceFormModal
          place={editing}
          canUpload={sync.enabled}
          onClose={() => setEditing(false)}
        />
      )}
    </>
  );
}

// ── Place list row ─────────────────────────────────────────────────
function PlaceRow({
  place,
  active,
  isFirst,
  isLast,
  onSelect,
  onUp,
  onDown,
  onRemove,
}: {
  place: PlaceDoc;
  active: boolean;
  isFirst: boolean;
  isLast: boolean;
  onSelect: () => void;
  onUp: () => void;
  onDown: () => void;
  onRemove: () => void;
}) {
  return (
    <div
      className={[
        "flex items-center gap-2 rounded-lg border px-2.5 py-2 transition-colors",
        active
          ? "border-[#ff7a59] bg-[#fbeee6]"
          : "border-[#f2dace] bg-white hover:border-[#ff7a59]/40",
      ].join(" ")}
    >
      <span
        className="size-3 shrink-0 rounded-full"
        style={{ background: MOOD_COLORS[place.mood] }}
      />
      <button
        type="button"
        onClick={onSelect}
        className="min-w-0 flex-1 text-left"
      >
        <span className="block truncate text-sm font-medium text-[#3a2a25]">
          {place.name || "Untitled"}
        </span>
        {place.city ? (
          <span className="block truncate text-xs text-[#92786c]">
            {place.city}
          </span>
        ) : null}
      </button>
      <div className="flex shrink-0 items-center">
        <IconBtn label="Move up" onClick={onUp} disabled={isFirst}>
          ↑
        </IconBtn>
        <IconBtn label="Move down" onClick={onDown} disabled={isLast}>
          ↓
        </IconBtn>
        <button
          type="button"
          aria-label="Delete place"
          onClick={onRemove}
          className="grid size-7 place-items-center rounded-md text-[#b29a89] hover:bg-[#fbe1d8] hover:text-[#c75b39]"
        >
          <Trash2 className="size-3.5" />
        </button>
      </div>
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
      className="grid size-7 place-items-center rounded-md text-sm text-[#92786c] hover:bg-[#fbeee6] disabled:opacity-30"
    >
      {children}
    </button>
  );
}

// ── Small building blocks ──────────────────────────────────────────
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
        <h2 className="text-sm font-semibold tracking-wide text-[#3a2a25] uppercase">
          {title}
        </h2>
        {action}
      </div>
      {children}
    </section>
  );
}
