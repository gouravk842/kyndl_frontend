"use client";

import { useEffect, useState } from "react";

import { useRelationshipCalendarSync } from "@/hooks/use-relationship-calendar-sync";
import { useAuthStore } from "@/store/auth.store";

import type { MemoryPrompt } from "../../config";
import { shiftMonth, toDateKey } from "../../lib/calendar";
import { useBuilderStore } from "../../store/builder.store";
import type { CalendarEvent } from "../../types";
import { CalendarGrid } from "../calendar-grid";
import { BuilderPanel } from "./builder-panel";
import { EmptyPromptsCard } from "./empty-prompts";
import { MemoryFormModal, type MemoryPrefill } from "./memory-form-modal";

const SURFACE =
  "radial-gradient(ellipse 80% 50% at 50% 0%, #fffaf3 0%, transparent 55%), linear-gradient(165deg, #f7efe4 0%, #ead9c4 55%, #e0c9ae 100%)";

type Editing =
  | false
  | {
      event: CalendarEvent | null;
      prefillDate?: string;
      prefill?: MemoryPrefill;
    };

/**
 * Relationship Calendar builder: editor rail beside a live ornate month grid.
 * Owner invites contributors via People; contributors only edit their own days.
 */
export function RelationshipCalendarBuilder() {
  const sync = useRelationshipCalendarSync();
  const userId = useAuthStore((s) => (s.user ? String(s.user.id) : null));
  const setViewer = useBuilderStore((s) => s.setViewer);
  const canEditEvent = useBuilderStore((s) => s.canEditEvent);

  const doc = useBuilderStore((s) => s.doc);
  const photoUrl = useBuilderStore((s) => s.photoUrl);
  const viewYear = useBuilderStore((s) => s.viewYear);
  const viewMonth = useBuilderStore((s) => s.viewMonth);
  const setViewMonth = useBuilderStore((s) => s.setViewMonth);
  const selectEvent = useBuilderStore((s) => s.selectEvent);

  const [editing, setEditing] = useState<Editing>(false);

  useEffect(() => {
    setViewer(userId, sync.myRole);
  }, [userId, sync.myRole, setViewer]);

  const openAdd = (prefillDate?: string, prefill?: MemoryPrefill) =>
    setEditing({ event: null, prefillDate, prefill });

  const openPrompt = (prompt: MemoryPrompt) => {
    openAdd(undefined, {
      title: prompt.title,
      category: prompt.category,
      recursYearly: prompt.recursYearly,
      noteHint: prompt.hint,
    });
  };

  const openEdit = (event: CalendarEvent) => {
    if (!canEditEvent(event)) return;
    selectEvent(event.id);
    setEditing({ event });
  };

  const isEmpty = doc.events.length === 0;

  return (
    <div className="flex h-[calc(100dvh-4rem)] w-full flex-col-reverse sm:flex-row">
      <BuilderPanel
        sync={sync}
        onAdd={(date) => openAdd(date)}
        onEdit={openEdit}
        onPrompt={openPrompt}
        className="h-1/2 w-full shrink-0 border-t sm:h-full sm:w-[340px] sm:border-t-0 sm:border-r lg:w-[380px]"
      />

      <div className="relative h-1/2 flex-1 overflow-y-auto sm:h-full">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{ background: SURFACE }}
        />
        <div className="relative">
          {isEmpty && (
            <EmptyPromptsCard
              onPick={openPrompt}
              onPickDay={() => openAdd(toDateKey(new Date()))}
            />
          )}
          <CalendarGrid
            year={viewYear}
            monthIndex={viewMonth}
            events={doc.events}
            weekStartsOn={doc.weekStartsOn}
            title={doc.title}
            subtitle={doc.subtitle}
            partnerNames={doc.partnerNames}
            togetherSince={doc.togetherSince}
            resolvePhoto={photoUrl}
            interactive
            onPrevMonth={() => {
              const next = shiftMonth(viewYear, viewMonth, -1);
              setViewMonth(next.year, next.monthIndex);
            }}
            onNextMonth={() => {
              const next = shiftMonth(viewYear, viewMonth, 1);
              setViewMonth(next.year, next.monthIndex);
            }}
            onDayClick={(dateKey) => openAdd(dateKey)}
            onEventClick={openEdit}
          />
        </div>
      </div>

      {editing !== false && (
        <MemoryFormModal
          event={editing.event}
          prefillDate={editing.prefillDate}
          prefill={editing.prefill}
          canUpload={sync.enabled}
          onClose={() => setEditing(false)}
        />
      )}
    </div>
  );
}
