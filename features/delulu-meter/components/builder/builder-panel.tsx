"use client";

import { useState } from "react";

import { ActivityBankPicker } from "@/features/activity-bank/components/activity-bank-picker";
import {
  BuilderShell,
  type BuilderTab,
} from "@/features/dashboard/components/builder-shell";
import type { DeluluMeterSync } from "@/hooks/use-delulu-meter-sync";

import { useBuilderStore } from "../../store/builder.store";

export function BuilderPanel({
  sync,
  className,
}: {
  sync: DeluluMeterSync;
  className?: string;
}) {
  const doc = useBuilderStore((s) => s.doc);
  const setMeta = useBuilderStore((s) => s.setMeta);
  const setQuestions = useBuilderStore((s) => s.setQuestions);
  const setBands = useBuilderStore((s) => s.setBands);
  const [bankOpen, setBankOpen] = useState(false);

  const tabs: BuilderTab[] = [
    {
      key: "setup",
      label: "Setup",
      content: (
        <div className="space-y-7">
          <Section title="Meter">
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
          </Section>
          <Section title="Questions (one per line)">
            <button
              type="button"
              onClick={() => setBankOpen(true)}
              className="rounded-full border border-[#f2dace] bg-white px-3 py-1.5 text-xs font-semibold text-[#7a6258] hover:border-[#ff7a59]/50"
            >
              Add from the bank
            </button>
            <textarea
              className={`${inputCls} min-h-[160px] resize-y`}
              value={doc.questions.map((q) => q.prompt).join("\n")}
              onChange={(e) => {
                const lines = e.target.value.split("\n").map((l) => l.trim());
                const questions = lines.filter(Boolean).map((prompt, i) => ({
                  id: doc.questions[i]?.id ?? `q${i + 1}`,
                  prompt,
                  weight: doc.questions[i]?.weight ?? 2,
                }));
                if (questions.length) setQuestions(questions);
              }}
            />
          </Section>
          <Section title="Band copy">
            <Field label="Grounded">
              <textarea
                className={`${inputCls} min-h-[56px] resize-y`}
                value={doc.bands.grounded}
                onChange={(e) => setBands({ grounded: e.target.value })}
              />
            </Field>
            <Field label="Hopeful">
              <textarea
                className={`${inputCls} min-h-[56px] resize-y`}
                value={doc.bands.hopeful}
                onChange={(e) => setBands({ hopeful: e.target.value })}
              />
            </Field>
            <Field label="Delulu">
              <textarea
                className={`${inputCls} min-h-[56px] resize-y`}
                value={doc.bands.delulu}
                onChange={(e) => setBands({ delulu: e.target.value })}
              />
            </Field>
          </Section>
        </div>
      ),
    },
  ];

  return (
    <>
      <BuilderShell
        sync={sync}
        tabs={tabs}
        className={className}
        title="Delulu Meter"
      />
      <ActivityBankPicker
        open={bankOpen}
        initialKind="truth"
        openOnly
        onClose={() => setBankOpen(false)}
        onPick={(picked) => {
          const extra = picked
            .filter((item) => item.choices.length === 0)
            .map((item, index) => ({
              id: `q${doc.questions.length + index + 1}`,
              prompt: item.text,
              weight: 2,
            }));
          if (extra.length) setQuestions([...doc.questions, ...extra]);
        }}
      />
    </>
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
