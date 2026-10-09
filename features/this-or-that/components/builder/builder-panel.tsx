"use client";

import { useState } from "react";

import { ActivityBankPicker } from "@/features/activity-bank/components/activity-bank-picker";
import {
  BuilderShell,
  type BuilderTab,
} from "@/features/dashboard/components/builder-shell";
import type { ThisOrThatSync } from "@/hooks/use-this-or-that-sync";

import { useBuilderStore } from "../../store/builder.store";

export function BuilderPanel({
  sync,
  className,
}: {
  sync: ThisOrThatSync;
  className?: string;
}) {
  const doc = useBuilderStore((s) => s.doc);
  const setMeta = useBuilderStore((s) => s.setMeta);
  const setPairs = useBuilderStore((s) => s.setPairs);
  const [bankOpen, setBankOpen] = useState(false);

  const tabs: BuilderTab[] = [
    {
      key: "setup",
      label: "Setup",
      content: (
        <div className="space-y-7">
          <Section title="Game">
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
            <Field label="Result blurb">
              <textarea
                className={`${inputCls} min-h-[70px] resize-y`}
                value={doc.resultBlurb}
                onChange={(e) => setMeta({ resultBlurb: e.target.value })}
              />
            </Field>
          </Section>
          <Section title="Pairs (one per line: Left | Right)">
            <button
              type="button"
              onClick={() => setBankOpen(true)}
              className="rounded-full border border-[#f2dace] bg-white px-3 py-1.5 text-xs font-semibold text-[#7a6258] hover:border-[#ff7a59]/50"
            >
              Add from the bank
            </button>
            <textarea
              className={`${inputCls} min-h-[180px] resize-y font-mono text-xs`}
              value={doc.pairs.map((p) => `${p.left} | ${p.right}`).join("\n")}
              onChange={(e) => {
                const pairs = e.target.value
                  .split("\n")
                  .map((line, i) => {
                    const [left, right] = line.split("|").map((s) => s.trim());
                    if (!left || !right) return null;
                    return {
                      id: doc.pairs[i]?.id ?? `p${i + 1}`,
                      left,
                      right,
                    };
                  })
                  .filter(Boolean) as {
                  id: string;
                  left: string;
                  right: string;
                }[];
                if (pairs.length) setPairs(pairs);
              }}
            />
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
        title="This or That"
      />
      <ActivityBankPicker
        open={bankOpen}
        choiceCount={2}
        onClose={() => setBankOpen(false)}
        onPick={(picked) => {
          const extra = picked
            .filter((item) => item.choices.length >= 2)
            .map((item, index) => ({
              id: `p${doc.pairs.length + index + 1}`,
              left: item.choices[0] ?? "",
              right: item.choices[1] ?? "",
            }));
          if (extra.length) setPairs([...doc.pairs, ...extra]);
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
