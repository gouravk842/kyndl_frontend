"use client";

import {
  BuilderShell,
  type BuilderTab,
} from "@/features/dashboard/components/builder-shell";
import type { FoldedNoteSync } from "@/hooks/use-folded-note-sync";

import { useBuilderStore } from "../../store/builder.store";

export function BuilderPanel({
  sync,
  className,
}: {
  sync: FoldedNoteSync;
  className?: string;
}) {
  const doc = useBuilderStore((s) => s.doc);
  const setMeta = useBuilderStore((s) => s.setMeta);
  const setReactions = useBuilderStore((s) => s.setReactions);

  const tabs: BuilderTab[] = [
    {
      key: "note",
      label: "Note",
      content: (
        <div className="space-y-7">
          <Section title="The note">
            <Field label="Title">
              <input
                className={inputCls}
                value={doc.title}
                onChange={(e) => setMeta({ title: e.target.value })}
              />
            </Field>
            <Field label="From">
              <input
                className={inputCls}
                value={doc.fromName}
                onChange={(e) => setMeta({ fromName: e.target.value })}
                maxLength={80}
              />
            </Field>
            <Field label="To">
              <input
                className={inputCls}
                value={doc.toName}
                onChange={(e) => setMeta({ toName: e.target.value })}
                maxLength={80}
              />
            </Field>
            <Field label="Question">
              <input
                className={inputCls}
                value={doc.question}
                onChange={(e) => setMeta({ question: e.target.value })}
              />
            </Field>
            <Field label="Inside the fold">
              <textarea
                className={`${inputCls} min-h-[90px] resize-y`}
                value={doc.body}
                onChange={(e) => setMeta({ body: e.target.value })}
              />
            </Field>
          </Section>
          <Section title="Reactions">
            <Field label="If Yes">
              <textarea
                className={`${inputCls} min-h-[60px] resize-y`}
                value={doc.reactions.yes}
                onChange={(e) => setReactions({ yes: e.target.value })}
              />
            </Field>
            <Field label="If No">
              <textarea
                className={`${inputCls} min-h-[60px] resize-y`}
                value={doc.reactions.no}
                onChange={(e) => setReactions({ no: e.target.value })}
              />
            </Field>
            <Field label="If Maybe">
              <textarea
                className={`${inputCls} min-h-[60px] resize-y`}
                value={doc.reactions.maybe}
                onChange={(e) => setReactions({ maybe: e.target.value })}
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
      title="Folded Note"
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
