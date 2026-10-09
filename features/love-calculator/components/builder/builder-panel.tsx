"use client";

import {
  BuilderShell,
  type BuilderTab,
} from "@/features/dashboard/components/builder-shell";
import type { LoveCalculatorSync } from "@/hooks/use-love-calculator-sync";

import { useBuilderStore } from "../../store/builder.store";

export function BuilderPanel({
  sync,
  className,
}: {
  sync: LoveCalculatorSync;
  className?: string;
}) {
  const doc = useBuilderStore((s) => s.doc);
  const setMeta = useBuilderStore((s) => s.setMeta);
  const setBands = useBuilderStore((s) => s.setBands);

  const tabs: BuilderTab[] = [
    {
      key: "setup",
      label: "Setup",
      content: (
        <div className="space-y-7">
          <Section title="Calculator">
            <Field label="Title">
              <input
                className={inputCls}
                value={doc.title}
                onChange={(e) => setMeta({ title: e.target.value })}
              />
            </Field>
            <Field label="Intro">
              <textarea
                className={`${inputCls} min-h-[70px] resize-y`}
                value={doc.intro}
                onChange={(e) => setMeta({ intro: e.target.value })}
              />
            </Field>
            <Field label="Default name A">
              <input
                className={inputCls}
                value={doc.nameA}
                onChange={(e) => setMeta({ nameA: e.target.value })}
                maxLength={80}
              />
            </Field>
            <Field label="Default name B">
              <input
                className={inputCls}
                value={doc.nameB}
                onChange={(e) => setMeta({ nameB: e.target.value })}
                maxLength={80}
              />
            </Field>
            <Field label="Note after result">
              <textarea
                className={`${inputCls} min-h-[70px] resize-y`}
                value={doc.note}
                onChange={(e) => setMeta({ note: e.target.value })}
              />
            </Field>
          </Section>
          <Section title="Band blurbs">
            <Field label="Low (&lt;60%)">
              <textarea
                className={`${inputCls} min-h-[60px] resize-y`}
                value={doc.bands.low}
                onChange={(e) => setBands({ low: e.target.value })}
              />
            </Field>
            <Field label="Mid (60–84%)">
              <textarea
                className={`${inputCls} min-h-[60px] resize-y`}
                value={doc.bands.mid}
                onChange={(e) => setBands({ mid: e.target.value })}
              />
            </Field>
            <Field label="High (85%+)">
              <textarea
                className={`${inputCls} min-h-[60px] resize-y`}
                value={doc.bands.high}
                onChange={(e) => setBands({ high: e.target.value })}
              />
            </Field>
          </Section>
        </div>
      ),
    },
  ];

  return (
    <BuilderShell
      sync={sync}
      tabs={tabs}
      className={className}
      title="Love Calculator"
    />
  );
}

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
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-3">
      <h2 className="text-sm font-semibold tracking-wide text-[#3a2a25] uppercase">
        {title}
      </h2>
      {children}
    </section>
  );
}
