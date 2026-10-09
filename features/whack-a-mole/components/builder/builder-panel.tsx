"use client";

import { Loader2, Trash2, X } from "lucide-react";
import { type ChangeEvent, useRef, useState } from "react";
import { toast } from "sonner";

import { SignInLink } from "@/components/auth/sign-in-link";
import {
  BuilderShell,
  type BuilderTab,
} from "@/features/dashboard/components/builder-shell";
import {
  DIFFICULTY_LABELS,
  DIFFICULTY_ORDER,
} from "@/features/whack-a-mole/config";
import { DEFAULT_FACE_SRC } from "@/features/whack-a-mole/lib/face";
import type { WhackAMoleSync } from "@/hooks/use-whack-a-mole-sync";
import { fileService } from "@/services/files/file.service";

import { useBuilderStore } from "../../store/builder.store";

export function BuilderPanel({
  sync,
  onPreview,
  className,
}: {
  sync: WhackAMoleSync;
  onPreview?: () => void;
  className?: string;
}) {
  const doc = useBuilderStore((s) => s.doc);
  const setMeta = useBuilderStore((s) => s.setMeta);
  const setDifficulty = useBuilderStore((s) => s.setDifficulty);
  const setApology = useBuilderStore((s) => s.setApology);
  const setHitQuips = useBuilderStore((s) => s.setHitQuips);

  const tabs: BuilderTab[] = [
    {
      key: "arcade",
      label: "Arcade",
      content: (
        <div className="space-y-7">
          {onPreview && (
            <button
              type="button"
              onClick={onPreview}
              className="inline-flex items-center gap-1.5 rounded-full border border-[#e3d2c5] px-3 py-1.5 text-sm font-medium text-[#7a6258] transition-colors hover:bg-[#fbeee6]"
            >
              Play a preview
            </button>
          )}

          <Section title="The arcade">
            <Field label="Title">
              <input
                className={inputCls}
                value={doc.title}
                onChange={(e) => setMeta({ title: e.target.value })}
                placeholder="Whack my dumb face"
              />
            </Field>
            <Field label="Intro (before they play)">
              <textarea
                className={`${inputCls} min-h-[70px] resize-y`}
                value={doc.intro}
                onChange={(e) => setMeta({ intro: e.target.value })}
                placeholder="I messed up. Take it out on me…"
              />
            </Field>
            <Field label="Their nickname (HUD)">
              <input
                className={inputCls}
                value={doc.playerName}
                onChange={(e) => setMeta({ playerName: e.target.value })}
                placeholder="You"
                maxLength={40}
              />
            </Field>
            <Field label="Difficulty">
              <div className="flex flex-wrap gap-2">
                {DIFFICULTY_ORDER.map((key) => {
                  const meta = DIFFICULTY_LABELS[key];
                  const active = doc.difficulty === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setDifficulty(key)}
                      className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${
                        active
                          ? "border-transparent bg-gradient-to-r from-[#ff7a59] to-[#f2596f] font-medium text-white"
                          : "border-[#f2dace] bg-white text-[#7a6258] hover:border-[#ff7a59]/50"
                      }`}
                      title={meta.hint}
                    >
                      {meta.label}
                    </button>
                  );
                })}
              </div>
            </Field>
          </Section>

          <Section title="Your face">
            <p className="-mt-1 text-xs text-[#92786c]">
              A front-facing selfie becomes the head in the holes. Until you
              upload one, a real stand-in face plays.
            </p>
            <FacePicker canUpload={sync.enabled} />
            {!doc.face && (
              <p className="text-xs text-[#C75B39]">
                Add a face before you share — drafts can save without one.
              </p>
            )}
          </Section>

          <Section title="Hit quips">
            <p className="-mt-1 text-xs text-[#92786c]">
              Short lines when they bonk your face (one per line).
            </p>
            <textarea
              className={`${inputCls} min-h-[100px] resize-y`}
              value={doc.hitQuips.join("\n")}
              onChange={(e) => setHitQuips(e.target.value.split("\n"))}
              placeholder={"Ow — deserved!\nOkay okay I'm sorry!"}
            />
          </Section>

          <Section title="Don't-hit decoy">
            <Field label="Label for the heart mole">
              <input
                className={inputCls}
                value={doc.sacredLabel}
                onChange={(e) => setMeta({ sacredLabel: e.target.value })}
                placeholder="Don't bonk the heart"
                maxLength={80}
              />
            </Field>
          </Section>
        </div>
      ),
    },
    {
      key: "apology",
      label: "Apology",
      content: (
        <div className="space-y-7">
          <Section title="The letter (end screen)">
            <p className="-mt-1 text-xs text-[#92786c]">
              Revealed when the round ends — the real reason they played.
            </p>
            <Field label="Heading">
              <input
                className={inputCls}
                value={doc.apology.heading}
                onChange={(e) => setApology({ heading: e.target.value })}
                placeholder="I'm sorry"
              />
            </Field>
            <Field label="Letter">
              <textarea
                className={`${inputCls} min-h-[140px] resize-y`}
                value={doc.apology.body}
                onChange={(e) => setApology({ body: e.target.value })}
                placeholder="I was wrong. Thank you for playing this with me…"
              />
            </Field>
            <Field label="Make-up ask (optional)">
              <input
                className={inputCls}
                value={doc.apology.ask}
                onChange={(e) => setApology({ ask: e.target.value })}
                placeholder="Hug? Coffee? Your call."
              />
            </Field>
          </Section>
        </div>
      ),
    },
  ];

  return (
    <BuilderShell
      title="Build Whack My Face"
      sync={sync}
      tabs={tabs}
      className={className}
    />
  );
}

function FacePicker({ canUpload }: { canUpload: boolean }) {
  const face = useBuilderStore((s) => s.doc.face);
  const setFace = useBuilderStore((s) => s.setFace);
  const removeFace = useBuilderStore((s) => s.removeFace);
  const urlFor = useBuilderStore((s) => s.urlFor);
  const [uploading, setUploading] = useState(false);
  const ref = useRef<HTMLInputElement>(null);
  const preview = urlFor(face);

  const onPick = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploading(true);
    try {
      const fileId = await fileService.upload(file, "whack-a-mole");
      setFace(fileId, URL.createObjectURL(file));
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Could not upload that photo.",
      );
    } finally {
      setUploading(false);
    }
  };

  if (!canUpload) {
    return (
      <p className="rounded-xl border border-dashed border-[#e3d2c5] bg-[#fffdfb] px-3 py-4 text-sm text-[#92786c]">
        <SignInLink className="font-medium text-[#C75B39]">Sign in</SignInLink>{" "}
        to upload your face.
      </p>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={() => ref.current?.click()}
        disabled={uploading}
        className="relative flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-full border border-[#e3d2c5] bg-[#fff7f1] text-[#C75B39] transition-colors hover:border-[#ff7a59]/50"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={preview ?? DEFAULT_FACE_SRC}
          alt=""
          className="size-full object-cover object-[center_18%]"
        />
        {uploading && (
          <span className="absolute inset-0 grid place-items-center bg-white/70">
            <Loader2 className="size-5 animate-spin" />
          </span>
        )}
      </button>
      <div className="min-w-0 flex-1 space-y-2">
        <button
          type="button"
          onClick={() => ref.current?.click()}
          disabled={uploading}
          className="text-sm font-medium text-[#C75B39]"
        >
          {face ? "Replace photo" : "Upload selfie"}
        </button>
        {face && (
          <button
            type="button"
            onClick={removeFace}
            className="flex items-center gap-1 text-xs text-[#92786c] hover:text-[#C75B39]"
          >
            <Trash2 className="size-3" /> Remove
          </button>
        )}
      </div>
      <input
        ref={ref}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={onPick}
      />
      {preview && (
        <button
          type="button"
          aria-label="Clear face"
          onClick={removeFace}
          className="grid size-8 place-items-center rounded-full text-[#92786c] hover:bg-[#fbeee6]"
        >
          <X className="size-4" />
        </button>
      )}
    </div>
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
