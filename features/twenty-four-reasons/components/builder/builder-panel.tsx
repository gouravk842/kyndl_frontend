"use client";

import { Lock, Pencil, Plus, Trash2, Unlock } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

import { ROUTES } from "@/constants/routes";
import { formatTarget } from "@/features/countdown/lib/time";
import {
  BuilderShell,
  type BuilderTab,
} from "@/features/dashboard/components/builder-shell";
import type { TwentyFourReasonsSync } from "@/hooks/use-twenty-four-reasons-sync";

import { INTERVAL_PRESETS, type Reason } from "../../config";
import { isReasonOpen } from "../../lib/unlock";
import { useBuilderStore } from "../../store/builder.store";
import { ReasonFormModal } from "./reason-form-modal";

function toLocalInput(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function fromLocalInput(local: string): string {
  const d = new Date(local);
  return Number.isNaN(d.getTime()) ? local : d.toISOString();
}

export function BuilderPanel({
  sync,
  className,
}: {
  sync: TwentyFourReasonsSync;
  className?: string;
}) {
  const doc = useBuilderStore((s) => s.doc);
  const setMeta = useBuilderStore((s) => s.setMeta);
  const setSchedule = useBuilderStore((s) => s.setSchedule);
  const applyScheduleNow = useBuilderStore((s) => s.applyScheduleNow);
  const setGirlfriendDay = useBuilderStore((s) => s.setGirlfriendDay);
  const loadStarterPack = useBuilderStore((s) => s.loadStarterPack);
  const moveReason = useBuilderStore((s) => s.moveReason);
  const removeReason = useBuilderStore((s) => s.removeReason);
  const selectReason = useBuilderStore((s) => s.selectReason);
  const previewOffsetMs = useBuilderStore((s) => s.previewOffsetMs);

  const [form, setForm] = useState<{ reason: Reason | null } | null>(null);

  const reasons = doc.reasons;
  const girlfriendDay = doc.occasion === "girlfriend-day";
  // eslint-disable-next-line react-hooks/purity -- preview clock includes the scrubber offset
  const now = Date.now() + previewOffsetMs;

  const openAdd = () => {
    if (reasons.length >= 24) {
      toast.error("24 reasons is the full day.");
      return;
    }
    setForm({ reason: null });
  };

  const tabs: BuilderTab[] = [
    {
      key: "reasons",
      label: "Reasons",
      badge: reasons.length || undefined,
      content: (
        <div className="space-y-7">
          {sync.creationId && (
            <p className="text-xs text-[#92786c]">
              Linked to your creation —{" "}
              <Link
                href={`${ROUTES.dashboard}?id=${sync.creationId}&edit=1`}
                className="font-semibold text-[#c75b39] hover:underline"
              >
                open in dashboard
              </Link>
              .
            </p>
          )}

          <Section title="The keepsake">
            <Field label="Their name">
              <input
                className={inputCls}
                value={doc.recipientName}
                onChange={(e) => setMeta({ recipientName: e.target.value })}
                placeholder="you"
              />
            </Field>
            <Field label="Your name">
              <input
                className={inputCls}
                value={doc.ownerName}
                onChange={(e) => setMeta({ ownerName: e.target.value })}
                placeholder="me"
              />
            </Field>
            <Field label="Title">
              <input
                className={inputCls}
                value={doc.title}
                onChange={(e) => setMeta({ title: e.target.value })}
                placeholder="24 Reasons"
              />
            </Field>
            <Field label="Intro">
              <textarea
                className={`${inputCls} min-h-[72px] resize-y`}
                value={doc.intro}
                onChange={(e) => setMeta({ intro: e.target.value })}
                placeholder="Shown above the sealed gallery…"
              />
            </Field>
            <label className="inline-flex cursor-pointer items-center gap-2 pt-1 text-sm text-[#5a433a]">
              <input
                type="checkbox"
                checked={girlfriendDay}
                onChange={(e) => setGirlfriendDay(e.target.checked)}
                className="size-4 rounded border-[#e3d2c5] accent-[#c75b39]"
              />
              Girlfriend Day
            </label>
            {girlfriendDay && (
              <p className="text-[0.7rem] text-[#b29a89]">
                Seal packaging · anchor set to Aug 1 midnight (your local time).
                Load the starter pack for 24 reasons.
              </p>
            )}
          </Section>

          <Section title="Schedule">
            <Field label="Anchor (first unlock)">
              <input
                type="datetime-local"
                className={inputCls}
                value={toLocalInput(doc.anchorAt)}
                onChange={(e) =>
                  setSchedule({
                    anchorAt: e.target.value
                      ? fromLocalInput(e.target.value)
                      : doc.anchorAt,
                  })
                }
              />
            </Field>
            <Field label="Interval">
              <div className="flex flex-wrap gap-1.5">
                {INTERVAL_PRESETS.map((h) => {
                  const active = doc.intervalHours === h;
                  const label = h < 1 ? `${h * 60}m` : `${h}h`;
                  return (
                    <button
                      key={h}
                      type="button"
                      onClick={() => setSchedule({ intervalHours: h })}
                      className={[
                        "rounded-full border px-2.5 py-1 text-xs font-semibold transition-colors",
                        active
                          ? "border-[#c75b39] bg-[#c75b39] text-white"
                          : "border-[#e3d2c5] bg-white text-[#7a6258] hover:border-[#c75b39]/50",
                      ].join(" ")}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </Field>
            <Field label="Timezone label (display only)">
              <input
                className={inputCls}
                value={doc.timezoneLabel}
                onChange={(e) => setMeta({ timezoneLabel: e.target.value })}
                placeholder="IST"
              />
            </Field>
            <button
              type="button"
              onClick={() => {
                applyScheduleNow();
                toast.success("Schedule applied to all reasons.");
              }}
              className="w-full rounded-full border border-[#d4a373]/60 bg-[#fff6ec] px-3 py-2 text-sm font-semibold text-[#8a5a32] transition-colors hover:bg-[#f8ead8]"
            >
              Apply schedule
            </button>
          </Section>

          <Section
            title={`Timeline (${reasons.length}/24)`}
            action={
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    loadStarterPack();
                    toast.success("Starter pack loaded.");
                  }}
                  className="rounded-full border border-[#d4a373]/50 px-2.5 py-1.5 text-[0.7rem] font-semibold text-[#c75b39] transition-colors hover:bg-[#fff6ec]"
                >
                  Starter pack
                </button>
                <button
                  type="button"
                  onClick={openAdd}
                  className="inline-flex items-center gap-1 rounded-full bg-[#c75b39] px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-[#B11226]"
                >
                  <Plus className="size-3.5" /> Add
                </button>
              </div>
            }
          >
            <ul className="space-y-1.5">
              {reasons.map((r, i) => (
                <li key={r.id}>
                  <ReasonRow
                    reason={r}
                    open={isReasonOpen(r, now)}
                    isFirst={i === 0}
                    isLast={i === reasons.length - 1}
                    onEdit={() => {
                      selectReason(r.id);
                      setForm({ reason: r });
                    }}
                    onUp={() => moveReason(r.id, -1)}
                    onDown={() => moveReason(r.id, 1)}
                    onRemove={() => removeReason(r.id)}
                  />
                </li>
              ))}
              {reasons.length === 0 && (
                <li className="rounded-lg border border-dashed border-[#e3d2c5] px-3 py-8 text-center text-sm text-[#92786c]">
                  Load the{" "}
                  <button
                    type="button"
                    onClick={() => loadStarterPack()}
                    className="font-semibold text-[#c75b39] hover:underline"
                  >
                    starter pack
                  </button>{" "}
                  or tap Add to begin.
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
        title="Build 24 Reasons"
        sync={sync}
        tabs={tabs}
        className={className}
      />
      {form && (
        <ReasonFormModal
          reason={form.reason}
          canUpload={sync.enabled}
          onClose={() => setForm(null)}
        />
      )}
    </>
  );
}

function ReasonRow({
  reason,
  open,
  isFirst,
  isLast,
  onEdit,
  onUp,
  onDown,
  onRemove,
}: {
  reason: Reason;
  open: boolean;
  isFirst: boolean;
  isLast: boolean;
  onEdit: () => void;
  onUp: () => void;
  onDown: () => void;
  onRemove: () => void;
}) {
  const preview =
    reason.message.trim() ||
    (reason.image ? "Photo" : "") ||
    (reason.audio ? "Voice" : "") ||
    "Empty";

  return (
    <div className="rounded-lg border border-[#f2dace] bg-white px-2.5 py-2 transition-colors hover:border-[#c75b39]/35">
      <div className="flex items-center gap-2">
        <span className="font-hand w-6 shrink-0 text-center text-sm text-[#c75b39]">
          {String(reason.n).padStart(2, "0")}
        </span>
        <button
          type="button"
          onClick={onEdit}
          className="min-w-0 flex-1 text-left"
        >
          <span className="block truncate text-sm font-medium text-[#3a2a25]">
            {preview}
          </span>
          <span className="mt-0.5 flex items-center gap-1.5 text-[0.65rem] text-[#92786c]">
            {open ? (
              <Unlock className="size-3 text-[#c75b39]" aria-hidden />
            ) : (
              <Lock className="size-3" aria-hidden />
            )}
            <span>{open ? "Open" : "Locked"}</span>
            <span aria-hidden>·</span>
            <span>{formatTarget(reason.unlockAt)}</span>
          </span>
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
            aria-label="Edit reason"
            onClick={onEdit}
            className="grid size-7 place-items-center rounded-md text-[#92786c] hover:bg-[#fbeee6] hover:text-[#c75b39]"
          >
            <Pencil className="size-3.5" />
          </button>
          <button
            type="button"
            aria-label="Delete reason"
            onClick={onRemove}
            className="grid size-7 place-items-center rounded-md text-[#b29a89] hover:bg-[#fbe1d8] hover:text-[#c75b39]"
          >
            <Trash2 className="size-3.5" />
          </button>
        </div>
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

const inputCls =
  "w-full rounded-lg border border-[#e3d2c5] bg-white px-3 py-2 text-sm text-[#3a2a25] outline-none transition-colors focus:border-[#c75b39] focus:ring-2 focus:ring-[#c75b39]/20";

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
