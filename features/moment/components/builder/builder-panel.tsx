"use client";

import { ArrowDown, ArrowUp, Plus, Sparkles, Trash2 } from "lucide-react";

import {
  BuilderShell,
  type BuilderTab,
} from "@/features/dashboard/components/builder-shell";
import type { MomentSync } from "@/hooks/use-proposal-sync";
import { cn } from "@/lib/utils";

import type { MomentBuilderStore } from "../../store/create-builder-store";
import type { MomentBeat, MomentTheme } from "../../types";

const THEME_OPTIONS: { value: MomentTheme; label: string; swatch: string }[] = [
  { value: "midnight", label: "Midnight", swatch: "linear-gradient(135deg,#2a2350,#0a0820)" },
  { value: "blush", label: "Blush", swatch: "linear-gradient(135deg,#ffe1e6,#f7c5cf)" },
];

export function MomentBuilderPanel({
  store,
  sync,
  kind,
  onPreview,
  className,
}: {
  store: MomentBuilderStore;
  sync: MomentSync;
  kind: "proposal" | "date-ask";
  onPreview: () => void;
  className?: string;
}) {
  const doc = store((s) => s.doc);
  const setTheme = store((s) => s.setTheme);
  const setSealLabel = store((s) => s.setSealLabel);
  const setQuestion = store((s) => s.setQuestion);
  const setCelebration = store((s) => s.setCelebration);
  const setPlan = store((s) => s.setPlan);
  const addBeat = store((s) => s.addBeat);
  const updateBeat = store((s) => s.updateBeat);
  const removeBeat = store((s) => s.removeBeat);
  const moveBeat = store((s) => s.moveBeat);

  const noun = kind === "proposal" ? "proposal" : "date ask";

  const tabs: BuilderTab[] = [
    {
      key: "moment",
      label: "Design",
      content: (
        <div className="space-y-7">
          <button
            type="button"
            onClick={onPreview}
            className="inline-flex w-full items-center justify-center gap-1.5 rounded-full border border-[#33406b] px-4 py-2 text-sm font-medium text-[#cdd6f4] transition-colors hover:border-[#6f7bb0] hover:bg-white/5"
          >
            <Sparkles className="size-4" /> Preview the moment
          </button>

          {/* Theme */}
          <Section title="The world">
          <div className="grid grid-cols-2 gap-2">
            {THEME_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setTheme(opt.value)}
                className={cn(
                  "flex flex-col items-center gap-2 rounded-xl border p-3 text-sm transition-colors",
                  doc.theme === opt.value
                    ? "border-[#f0c869] bg-white/5"
                    : "border-[#2a3458] hover:border-[#6f7bb0]",
                )}
              >
                <span
                  className="h-10 w-full rounded-md"
                  style={{ background: opt.swatch }}
                />
                {opt.label}
              </button>
            ))}
          </div>
        </Section>

        {/* Opening */}
        <Section title="The opening">
          <Field label="Words on the sealed envelope">
            <input
              className={inputCls}
              value={doc.sealLabel}
              onChange={(e) => setSealLabel(e.target.value)}
              placeholder="For you, my love"
            />
          </Field>
        </Section>

        {/* Approach beats */}
        <Section
          title="The approach"
          action={
            <div className="flex gap-1.5">
              <AddButton onClick={() => addBeat("line")} label="Line" />
              <AddButton onClick={() => addBeat("counter")} label="Counter" />
            </div>
          }
        >
          {doc.approach.length === 0 && (
            <p className="text-xs text-[#8b93b8]">
              Add a beat or two to build the moment up. Each one needs a deliberate
              tap, so they&apos;re felt one at a time.
            </p>
          )}
          <div className="space-y-3">
            {doc.approach.map((beat, i) => (
              <BeatEditor
                key={beat.id}
                beat={beat}
                index={i}
                count={doc.approach.length}
                onChange={(patch) => updateBeat(beat.id, patch)}
                onMove={(dir) => moveBeat(beat.id, dir)}
                onRemove={() => removeBeat(beat.id)}
              />
            ))}
          </div>
        </Section>

        {/* Question */}
        <Section title="The question">
          <Field label="What you're asking">
            <textarea
              className={cn(inputCls, "min-h-16 resize-none")}
              value={doc.question.text}
              onChange={(e) => setQuestion({ text: e.target.value })}
              placeholder="Will you marry me?"
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="“Yes” button">
              <input
                className={inputCls}
                value={doc.question.yesLabel}
                onChange={(e) => setQuestion({ yesLabel: e.target.value })}
              />
            </Field>
            <Field label="“No” button">
              <input
                className={inputCls}
                value={doc.question.noLabel}
                onChange={(e) => setQuestion({ noLabel: e.target.value })}
              />
            </Field>
          </div>
          <label className="flex items-center gap-2.5 text-sm text-[#cdd6f4]">
            <input
              type="checkbox"
              checked={doc.question.playfulNo}
              onChange={(e) => setQuestion({ playfulNo: e.target.checked })}
              className="size-4 accent-[#f0c869]"
            />
            Let “No” playfully slip away (they can&apos;t quite catch it)
          </label>
        </Section>

        {/* Celebration */}
        <Section title="If they say yes">
          <Field label="The big line">
            <input
              className={inputCls}
              value={doc.celebration.headline}
              onChange={(e) => setCelebration({ headline: e.target.value })}
              placeholder="Forever starts now"
            />
          </Field>
          <Field label="A little more (optional)">
            <textarea
              className={cn(inputCls, "min-h-14 resize-none")}
              value={doc.celebration.subtext ?? ""}
              onChange={(e) => setCelebration({ subtext: e.target.value })}
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Your name (optional)">
              <input
                className={inputCls}
                value={doc.celebration.askerName ?? ""}
                onChange={(e) => setCelebration({ askerName: e.target.value })}
              />
            </Field>
            <Field label="Their name (optional)">
              <input
                className={inputCls}
                value={doc.celebration.recipientName ?? ""}
                onChange={(e) => setCelebration({ recipientName: e.target.value })}
              />
            </Field>
          </div>
        </Section>

        {/* Plan — date-ask only */}
        {kind === "date-ask" && (
          <Section title="The plan (optional)">
            <Field label="When">
              <input
                className={inputCls}
                value={doc.plan?.when ?? ""}
                onChange={(e) => setPlan({ when: e.target.value })}
                placeholder="Friday, 7:00 PM"
              />
            </Field>
            <Field label="Where">
              <input
                className={inputCls}
                value={doc.plan?.where ?? ""}
                onChange={(e) => setPlan({ where: e.target.value })}
                placeholder="that little place by the river"
              />
            </Field>
          </Section>
        )}
        </div>
      ),
    },
  ];

  return (
    <BuilderShell title={`Build your ${noun}`} sync={sync} tabs={tabs} className={className} />
  );
}

function BeatEditor({
  beat,
  index,
  count,
  onChange,
  onMove,
  onRemove,
}: {
  beat: MomentBeat;
  index: number;
  count: number;
  onChange: (patch: Partial<Omit<MomentBeat, "id" | "kind">>) => void;
  onMove: (dir: -1 | 1) => void;
  onRemove: () => void;
}) {
  return (
    <div className="rounded-xl border border-[#2a3458] bg-[#101a36] p-3">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-semibold tracking-wide text-[#c8b88a] uppercase">
          {beat.kind === "line" ? "Typed line" : beat.kind === "counter" ? "Day counter" : "Photo"}
        </span>
        <div className="flex items-center gap-1">
          <IconBtn onClick={() => onMove(-1)} disabled={index === 0} label="Move up">
            <ArrowUp className="size-3.5" />
          </IconBtn>
          <IconBtn onClick={() => onMove(1)} disabled={index === count - 1} label="Move down">
            <ArrowDown className="size-3.5" />
          </IconBtn>
          <IconBtn onClick={onRemove} label="Remove">
            <Trash2 className="size-3.5" />
          </IconBtn>
        </div>
      </div>

      {beat.kind === "line" && (
        <textarea
          className={cn(inputCls, "min-h-14 resize-none")}
          value={beat.text}
          onChange={(e) => onChange({ text: e.target.value })}
          placeholder="A line that types itself out…"
        />
      )}

      {beat.kind === "counter" && (
        <div className="grid grid-cols-2 gap-2">
          <input
            className={inputCls}
            value={beat.label}
            onChange={(e) => onChange({ label: e.target.value })}
            placeholder="days since we met"
          />
          <input
            type="date"
            className={inputCls}
            value={beat.sinceDate}
            onChange={(e) => onChange({ sinceDate: e.target.value })}
          />
        </div>
      )}

      {beat.kind === "photo" && (
        <p className="text-xs text-[#8b93b8]">
          A photo beat. Image uploads land here soon.
        </p>
      )}
    </div>
  );
}

function AddButton({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1 rounded-full border border-[#33406b] px-2.5 py-1 text-xs font-medium text-[#cdd6f4] transition-colors hover:border-[#6f7bb0] hover:bg-white/5"
    >
      <Plus className="size-3" /> {label}
    </button>
  );
}

function IconBtn({
  onClick,
  disabled,
  label,
  children,
}: {
  onClick: () => void;
  disabled?: boolean;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="rounded-md p-1 text-[#8b93b8] transition-colors hover:bg-white/5 hover:text-[#cdd6f4] disabled:cursor-not-allowed disabled:opacity-30"
    >
      {children}
    </button>
  );
}

const inputCls =
  "w-full rounded-lg border border-[#2a3458] bg-[#101a36] px-3 py-2 text-sm text-[#e7e3f3] outline-none transition-colors placeholder:text-[#5d678f] focus:border-[#f0c869] focus:ring-2 focus:ring-[#f0c869]/20";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
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
