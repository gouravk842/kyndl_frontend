"use client";

import { useId, useState } from "react";

import { CalmPopup } from "@/components/ui/calm-popup";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  KyndButton,
  KyndTextButton,
} from "@/features/kynd/components/kynd-button";
import { RELATIONSHIP_TYPES } from "@/features/kynd/lib/catalog";
import { trapTab } from "@/features/kynd/lib/focus";
import { cn } from "@/lib/utils";
import type { KyndPerson, RelationshipType } from "@/types/kynd";

export function PersonSheet({
  open,
  person,
  busy,
  onClose,
  onSave,
  onDelete,
}: {
  open: boolean;
  person?: KyndPerson | null;
  busy?: boolean;
  onClose: () => void;
  onSave: (input: {
    name: string;
    relationship_type: RelationshipType;
  }) => void | Promise<void>;
  onDelete?: () => void;
}) {
  const titleId = useId();
  const editing = Boolean(person);

  return (
    <CalmPopup
      open={open}
      onClose={onClose}
      labelledBy={titleId}
      className="border-[#eadfd4] bg-[#fbf7f2] dark:border-white/10 dark:bg-[#221c1a]"
    >
      {open ? (
        <PersonForm
          key={person?.id ?? "new"}
          titleId={titleId}
          person={person}
          editing={editing}
          busy={busy}
          onClose={onClose}
          onSave={onSave}
          onDelete={onDelete}
        />
      ) : null}
    </CalmPopup>
  );
}

function PersonForm({
  titleId,
  person,
  editing,
  busy,
  onClose,
  onSave,
  onDelete,
}: {
  titleId: string;
  person?: KyndPerson | null;
  editing: boolean;
  busy?: boolean;
  onClose: () => void;
  onSave: (input: {
    name: string;
    relationship_type: RelationshipType;
  }) => void | Promise<void>;
  onDelete?: () => void;
}) {
  const nameId = useId();
  const [name, setName] = useState(person?.name ?? "");
  const [relationship, setRelationship] = useState<RelationshipType | "">(
    person?.relationship_type ?? "",
  );
  const [error, setError] = useState("");
  const [confirming, setConfirming] = useState(false);

  async function submit() {
    const trimmed = name.trim();
    if (!trimmed) {
      setError("Give them a name.");
      return;
    }
    if (!relationship) {
      setError("How do you know them?");
      return;
    }
    setError("");
    try {
      await onSave({ name: trimmed, relationship_type: relationship });
    } catch {
      // The caller surfaces the failure.
    }
  }

  return (
    <form
      className="flex max-h-[90dvh] flex-col"
      onSubmit={(event) => {
        event.preventDefault();
        submit();
      }}
      onKeyDown={trapTab}
    >
      <div className="min-h-0 flex-1 overflow-y-auto px-6 pt-6 pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:px-8">
        <div className="flex items-start justify-between gap-4">
          <h2 id={titleId} className="font-serif text-3xl leading-tight">
            {editing ? "About them" : "Who are you thinking about?"}
          </h2>
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

        <label htmlFor={nameId} className="mt-8 block">
          <span className="sr-only">Their name</span>
          <input
            id={nameId}
            autoFocus
            value={name}
            maxLength={80}
            autoComplete="off"
            enterKeyHint="done"
            placeholder="Their name"
            onChange={(event) => {
              setName(event.target.value);
              if (error) setError("");
            }}
            className="h-14 w-full border-b border-[#eadfd4] bg-transparent font-serif text-3xl text-inherit placeholder:text-[#b5a297] focus:border-[#8e1020] focus:outline-none dark:border-white/15 dark:placeholder:text-[#8d796e]"
          />
        </label>

        <fieldset className="mt-8">
          <legend className="text-sm text-[#6b564c] dark:text-[#cbb8ad]">
            How do you know them?
          </legend>
          <div className="mt-3 flex flex-wrap gap-2">
            {RELATIONSHIP_TYPES.map((option) => {
              const selected = relationship === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => {
                    setRelationship(option.value);
                    if (error) setError("");
                  }}
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

        {error ? (
          <p className="mt-4 text-sm text-[#8e1020]" role="alert">
            {error}
          </p>
        ) : null}

        <div className="mt-8 flex flex-wrap items-center gap-2">
          <KyndButton type="submit" disabled={busy}>
            {editing ? "Save" : "Add someone"}
          </KyndButton>
          {editing && onDelete ? (
            <KyndTextButton
              type="button"
              disabled={busy}
              onClick={() => setConfirming(true)}
            >
              Remove them
            </KyndTextButton>
          ) : null}
        </div>
      </div>

      {editing && onDelete ? (
        <ConfirmDialog
          open={confirming}
          onOpenChange={setConfirming}
          title={`Remove ${person?.name ?? "them"}?`}
          description="The little things you kept about them will go too. This cannot be undone."
          confirmLabel="Remove them"
          destructive
          busy={busy}
          onConfirm={() => {
            setConfirming(false);
            onDelete();
          }}
        />
      ) : null}
    </form>
  );
}
