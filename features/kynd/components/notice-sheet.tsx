"use client";

import { useId, useState } from "react";

import { CalmPopup } from "@/components/ui/calm-popup";
import {
  KyndButton,
  KyndTextButton,
} from "@/features/kynd/components/kynd-button";
import {
  KYND_CATEGORIES,
  type KyndCategoryValue,
} from "@/features/kynd/lib/catalog";
import { trapTab } from "@/features/kynd/lib/focus";
import { cn } from "@/lib/utils";
import type { KyndCategory, KyndItem } from "@/types/kynd";

export function NoticeSheet({
  open,
  personName,
  item,
  busy,
  onClose,
  onKeep,
  onDelete,
}: {
  open: boolean;
  personName: string;
  item?: KyndItem | null;
  busy?: boolean;
  onClose: () => void;
  onKeep: (input: {
    body: string;
    title: string;
    category: KyndCategory;
  }) => void | Promise<void>;
  onDelete?: () => void;
}) {
  const titleId = useId();
  const fieldId = useId();
  const editing = Boolean(item);

  return (
    <CalmPopup
      open={open}
      onClose={onClose}
      labelledBy={titleId}
      className="border-[#eadfd4] bg-[#fbf7f2] dark:border-white/10 dark:bg-[#221c1a]"
    >
      {open ? (
        <NoticeForm
          key={item?.id ?? "new"}
          titleId={titleId}
          fieldId={fieldId}
          personName={personName}
          item={item}
          editing={editing}
          busy={busy}
          onClose={onClose}
          onKeep={onKeep}
          onDelete={onDelete}
        />
      ) : null}
    </CalmPopup>
  );
}

function NoticeForm({
  titleId,
  fieldId,
  personName,
  item,
  editing,
  busy,
  onClose,
  onKeep,
  onDelete,
}: {
  titleId: string;
  fieldId: string;
  personName: string;
  item?: KyndItem | null;
  editing: boolean;
  busy?: boolean;
  onClose: () => void;
  onKeep: (input: {
    body: string;
    title: string;
    category: KyndCategory;
  }) => void | Promise<void>;
  onDelete?: () => void;
}) {
  const [body, setBody] = useState(item?.body ?? "");
  const [title, setTitle] = useState(item?.title ?? "");
  const [category, setCategory] = useState<KyndCategory>(item?.category ?? "");
  const [error, setError] = useState("");
  const remaining = 4000 - body.length;

  async function submit(nextCategory: KyndCategory) {
    const text = body.trim();
    const shortName = title.trim();
    if (!text && !shortName) {
      setError("Tell Kynd something you've noticed.");
      return;
    }
    if (!text && !editing) {
      setError("Tell Kynd something you've noticed.");
      return;
    }
    setError("");
    try {
      await onKeep({ body: text, title: shortName, category: nextCategory });
    } catch {
      // The caller surfaces the failure.
    }
  }

  return (
    <form
      className="flex max-h-[90dvh] flex-col"
      onSubmit={(event) => {
        event.preventDefault();
        submit(category);
      }}
      onKeyDown={trapTab}
    >
      <div className="min-h-0 flex-1 overflow-y-auto px-6 pt-6 pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:px-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id={titleId} className="font-serif text-3xl leading-tight">
              {editing ? "A little thing" : "I noticed something"}
            </h2>
            <p className="mt-1 text-sm text-[#6b564c] dark:text-[#cbb8ad]">
              About {personName}. Only you can see this.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex size-11 shrink-0 items-center justify-center rounded-full text-[#6b564c] hover:bg-black/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8e1020] dark:hover:bg-white/10"
          >
            <span className="sr-only">Close</span>
            <span aria-hidden className="text-xl leading-none">
              ×
            </span>
          </button>
        </div>

        <label htmlFor={fieldId} className="sr-only">
          Tell Kynd about them
        </label>
        <textarea
          id={fieldId}
          autoFocus
          value={body}
          maxLength={4000}
          placeholder="Tell Kynd about them..."
          onChange={(event) => {
            setBody(event.target.value);
            if (error) setError("");
          }}
          className="mt-6 min-h-36 w-full resize-none bg-transparent font-serif text-2xl leading-snug text-inherit placeholder:text-[#b5a297] focus:outline-none dark:placeholder:text-[#8d796e]"
        />
        {remaining < 400 ? (
          <p className="text-xs text-[#8a7064]" aria-live="polite">
            {remaining} characters left
          </p>
        ) : null}
        {error ? (
          <p className="mt-2 text-sm text-[#8e1020]" role="alert">
            {error}
          </p>
        ) : null}

        {editing ? (
          <label className="mt-6 block">
            <span className="text-sm text-[#6b564c] dark:text-[#cbb8ad]">
              A short name, if you want one
            </span>
            <input
              value={title}
              maxLength={140}
              onChange={(event) => setTitle(event.target.value)}
              className="mt-2 h-12 w-full border-b border-[#eadfd4] bg-transparent text-base focus:border-[#8e1020] focus:outline-none dark:border-white/15"
            />
          </label>
        ) : null}

        <fieldset className="mt-8">
          <legend className="text-sm text-[#6b564c] dark:text-[#cbb8ad]">
            What kind of little thing is this?
          </legend>
          <div className="mt-3 flex flex-wrap gap-2">
            {KYND_CATEGORIES.map((option) => {
              const selected = category === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  aria-pressed={selected}
                  onClick={() =>
                    setCategory(
                      selected ? "" : (option.value as KyndCategoryValue),
                    )
                  }
                  className={cn(
                    "min-h-11 rounded-full px-3.5 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8e1020]",
                    selected
                      ? "bg-[#2c2420] text-[#f6f0e9] dark:bg-[#f6efe9] dark:text-[#2c2420]"
                      : "text-[#5c4a43] ring-1 ring-[#e4d5c8] hover:ring-[#2c2420] dark:text-[#e6d7cf] dark:ring-white/15",
                  )}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </fieldset>

        <div className="mt-8 flex flex-wrap items-center gap-2">
          <KyndButton type="submit" disabled={busy}>
            {editing ? "Save" : "Keep this"}
          </KyndButton>
          {!editing && !category ? (
            <KyndTextButton
              type="button"
              disabled={busy}
              onClick={() => submit("")}
            >
              Skip
            </KyndTextButton>
          ) : null}
          {editing && onDelete ? (
            <KyndTextButton type="button" disabled={busy} onClick={onDelete}>
              Remove
            </KyndTextButton>
          ) : null}
        </div>
      </div>
    </form>
  );
}
