"use client";

import { Lock, Plus, Trash2 } from "lucide-react";

import {
  BuilderShell,
  type BuilderTab,
} from "@/features/dashboard/components/builder-shell";
import type { RelationshipCalendarSync } from "@/hooks/use-relationship-calendar-sync";

import type { MemoryPrompt } from "../../config";
import { CATEGORY_GLYPH, CATEGORY_LABELS } from "../../config";
import { useBuilderStore } from "../../store/builder.store";
import type { CalendarEvent } from "../../types";
import { PromptIdeas } from "./empty-prompts";

export function BuilderPanel({
  sync,
  className,
  onAdd,
  onEdit,
  onPrompt,
}: {
  sync: RelationshipCalendarSync;
  className?: string;
  onAdd: (prefillDate?: string) => void;
  onEdit: (event: CalendarEvent) => void;
  onPrompt: (prompt: MemoryPrompt) => void;
}) {
  const doc = useBuilderStore((s) => s.doc);
  const setMeta = useBuilderStore((s) => s.setMeta);
  const setWeekStartsOn = useBuilderStore((s) => s.setWeekStartsOn);
  const removeEvent = useBuilderStore((s) => s.removeEvent);
  const selectEvent = useBuilderStore((s) => s.selectEvent);
  const selectedId = useBuilderStore((s) => s.selectedId);
  const canEditMeta = useBuilderStore((s) => s.canEditMeta);
  const canEditEvent = useBuilderStore((s) => s.canEditEvent);
  const viewerRole = useBuilderStore((s) => s.viewerRole);
  const metaEditable = canEditMeta();
  const isContributor = viewerRole === "contributor";

  const sorted = [...doc.events].sort((a, b) => a.date.localeCompare(b.date));

  const tabs: BuilderTab[] = [
    {
      key: "calendar",
      label: "Calendar",
      badge: doc.events.length,
      content: (
        <div className="space-y-7">
          {isContributor && (
            <div className="rounded-xl border border-[#D4A373]/40 bg-[#fff7f0] px-3 py-2.5 text-xs leading-relaxed text-[#8B6B4A]">
              You’re a contributor — add your own memories. Calendar title,
              together-since, and other people’s days stay with the owner.
              Invite more people from the{" "}
              <span className="font-semibold">People</span> tab (owner/admin).
            </div>
          )}

          <Section title="The calendar">
            <Field label="Title">
              <input
                className={inputCls}
                value={doc.title}
                onChange={(e) => setMeta({ title: e.target.value })}
                placeholder="Our Calendar"
                disabled={!metaEditable}
              />
            </Field>
            <Field label="Subtitle">
              <input
                className={inputCls}
                value={doc.subtitle}
                onChange={(e) => setMeta({ subtitle: e.target.value })}
                placeholder="moments that made us"
                disabled={!metaEditable}
              />
            </Field>
            <Field label="Names">
              <input
                className={inputCls}
                value={doc.partnerNames}
                onChange={(e) => setMeta({ partnerNames: e.target.value })}
                placeholder="Alex & Sam"
                disabled={!metaEditable}
              />
            </Field>
            <Field label="Together since">
              <input
                type="date"
                className={inputCls}
                value={doc.togetherSince || ""}
                onChange={(e) => setMeta({ togetherSince: e.target.value })}
                disabled={!metaEditable}
              />
              <p className="mt-1 text-[11px] text-[#92786c]">
                Shows “Together for …” and highlights your anniversary each
                year.
              </p>
            </Field>
            <Field label="Week starts on">
              <div className="flex gap-2">
                {(
                  [
                    { value: 0 as const, label: "Sunday" },
                    { value: 1 as const, label: "Monday" },
                  ] as const
                ).map((o) => (
                  <button
                    key={o.value}
                    type="button"
                    disabled={!metaEditable}
                    onClick={() => setWeekStartsOn(o.value)}
                    className={[
                      "flex-1 rounded-lg border px-3 py-2 text-sm transition-colors disabled:opacity-50",
                      doc.weekStartsOn === o.value
                        ? "border-[#ff7a59] bg-[#fbeee6] text-[#c75b39]"
                        : "border-[#f2dace] bg-white text-[#7a6258] hover:border-[#ff7a59]/50",
                    ].join(" ")}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
            </Field>
          </Section>

          <Section
            title={`Memories (${doc.events.length})`}
            action={
              <button
                type="button"
                onClick={() => onAdd()}
                className="inline-flex items-center gap-1 rounded-full bg-[#ff7a59] px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-[#f2596f]"
              >
                <Plus className="size-3.5" /> Add
              </button>
            }
          >
            <ul className="space-y-1.5">
              {sorted.map((ev) => {
                const mine = canEditEvent(ev);
                return (
                  <li key={ev.id}>
                    <MemoryRow
                      event={ev}
                      active={ev.id === selectedId}
                      locked={!mine}
                      onSelect={() => {
                        selectEvent(ev.id);
                        if (mine) onEdit(ev);
                      }}
                      onRemove={() => removeEvent(ev.id)}
                    />
                  </li>
                );
              })}
              {sorted.length === 0 && (
                <li className="rounded-lg border border-dashed border-[#e3d2c5] px-3 py-6 text-center text-sm text-[#92786c]">
                  No memories yet — pick an idea below, or click a day on the
                  calendar.
                </li>
              )}
            </ul>
          </Section>

          <Section title="Ideas to start">
            <p className="-mt-1 text-xs text-[#92786c]">
              Tap one — we fill the title; you pick the date and write the note.
            </p>
            <PromptIdeas onPick={onPrompt} compact={doc.events.length > 0} />
          </Section>
        </div>
      ),
    },
  ];

  return (
    <BuilderShell
      title={isContributor ? "Add your memories" : "Customize your calendar"}
      sync={sync}
      tabs={tabs}
      className={className}
    />
  );
}

function MemoryRow({
  event,
  active,
  locked,
  onSelect,
  onRemove,
}: {
  event: CalendarEvent;
  active: boolean;
  locked?: boolean;
  onSelect: () => void;
  onRemove: () => void;
}) {
  return (
    <div
      className={[
        "flex items-center gap-2 rounded-lg border px-2.5 py-2 transition-colors",
        locked
          ? "border-[#f2dace] bg-[#faf6f1] opacity-80"
          : active
            ? "border-[#ff7a59] bg-[#fbeee6]"
            : "border-[#f2dace] bg-white hover:border-[#ff7a59]/40",
      ].join(" ")}
    >
      <span className="shrink-0 text-sm" aria-hidden>
        {locked ? (
          <Lock className="size-3.5 text-[#b29a89]" />
        ) : (
          CATEGORY_GLYPH[event.category]
        )}
      </span>
      <button
        type="button"
        onClick={onSelect}
        className="min-w-0 flex-1 text-left"
      >
        <span className="block truncate text-sm font-medium text-[#3a2a25]">
          {event.title || "Untitled"}
        </span>
        <span className="block truncate text-xs text-[#92786c]">
          {event.date}
          {event.recursYearly ? " · yearly" : ""}
          {" · "}
          {CATEGORY_LABELS[event.category]}
          {locked ? " · theirs" : ""}
        </span>
      </button>
      {!locked && (
        <button
          type="button"
          aria-label="Delete memory"
          onClick={onRemove}
          className="grid size-7 place-items-center rounded-md text-[#b29a89] hover:bg-[#fbe1d8] hover:text-[#c75b39]"
        >
          <Trash2 className="size-3.5" />
        </button>
      )}
    </div>
  );
}

const inputCls =
  "w-full rounded-lg border border-[#e3d2c5] bg-white px-3 py-2 text-sm text-[#3a2a25] outline-none transition-colors focus:border-[#ff7a59] focus:ring-2 focus:ring-[#ff7a59]/20 disabled:cursor-not-allowed disabled:bg-[#f7efe4] disabled:opacity-70";

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
