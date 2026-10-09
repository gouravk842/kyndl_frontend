"use client";

import {
  BuilderShell,
  type BuilderTab,
} from "@/features/dashboard/components/builder-shell";
import type { FlamesSync } from "@/hooks/use-flames-sync";

import { useBuilderStore } from "../../store/builder.store";

export function BuilderPanel({
  sync,
  className,
}: {
  sync: FlamesSync;
  className?: string;
}) {
  const doc = useBuilderStore((s) => s.doc);
  const setMeta = useBuilderStore((s) => s.setMeta);

  const tabs: BuilderTab[] = [
    {
      key: "setup",
      label: "Setup",
      content: (
        <div className="space-y-7">
          <Section title="The game">
            <Field label="Title">
              <input
                className={inputCls}
                value={doc.title}
                onChange={(e) => setMeta({ title: e.target.value })}
                placeholder="FLAMES"
              />
            </Field>
            <Field label="Intro">
              <textarea
                className={`${inputCls} min-h-[70px] resize-y`}
                value={doc.intro}
                onChange={(e) => setMeta({ intro: e.target.value })}
              />
            </Field>
            <Field label="Default name A (optional)">
              <input
                className={inputCls}
                value={doc.nameA}
                onChange={(e) => setMeta({ nameA: e.target.value })}
                maxLength={80}
              />
            </Field>
            <Field label="Default name B (optional)">
              <input
                className={inputCls}
                value={doc.nameB}
                onChange={(e) => setMeta({ nameB: e.target.value })}
                maxLength={80}
              />
            </Field>
            <Field label="Note after reveal">
              <textarea
                className={`${inputCls} min-h-[80px] resize-y`}
                value={doc.note}
                onChange={(e) => setMeta({ note: e.target.value })}
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
      title="FLAMES"
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
