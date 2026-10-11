"use client";

import { useRef, useState } from "react";

import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { usePublishCreation } from "@/hooks/use-creations";
import type { Creation } from "@/types/creation";

type GateCreation = Pick<Creation, "id" | "title" | "status">;

/**
 * Gates share-facing actions (copy link, open link, save access) behind a
 * publish confirmation when the creation is still a draft. After a successful
 * publish the pending action runs so the owner doesn't have to click twice.
 */
export function usePublishToShareGate(creation: GateCreation) {
  const [open, setOpen] = useState(false);
  // Survives until the parent query refetches `status: published`.
  const [justPublished, setJustPublished] = useState(false);
  const pendingRef = useRef<(() => void) | null>(null);
  const publish = usePublishCreation();

  const isDraft = !justPublished && creation.status !== "published";

  function requirePublished(action: () => void) {
    if (!isDraft) {
      action();
      return;
    }
    pendingRef.current = action;
    setOpen(true);
  }

  function handlePublish() {
    publish.mutate(
      { id: creation.id, title: creation.title || "Untitled" },
      {
        onSuccess: () => {
          setJustPublished(true);
          setOpen(false);
          const next = pendingRef.current;
          pendingRef.current = null;
          next?.();
        },
      },
    );
  }

  const dialog = (
    <ConfirmDialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) pendingRef.current = null;
      }}
      title="Publish to share"
      description={
        <>
          This keepsake is still a draft — only you can open the link. Publish
          it so the people you share with can see it. You can still set who has
          access after it goes live.
        </>
      }
      confirmLabel={publish.isPending ? "Publishing…" : "Publish"}
      cancelLabel="Not yet"
      busy={publish.isPending}
      onConfirm={handlePublish}
    />
  );

  return { requirePublished, dialog, isDraft, publishing: publish.isPending };
}

/** Standalone dialog for surfaces that already own open state (e.g. public /v/). */
export function PublishToShareDialog({
  open,
  onOpenChange,
  creation,
  onPublished,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  creation: GateCreation;
  onPublished?: () => void;
}) {
  const publish = usePublishCreation();

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Publish to share"
      description={
        <>
          Only you can see this right now. Publish so anyone you share the link
          with can open it.
        </>
      }
      confirmLabel={publish.isPending ? "Publishing…" : "Publish"}
      cancelLabel="Keep drafting"
      busy={publish.isPending}
      onConfirm={() => {
        publish.mutate(
          { id: creation.id, title: creation.title || "Untitled" },
          {
            onSuccess: () => {
              onOpenChange(false);
              onPublished?.();
            },
          },
        );
      }}
    />
  );
}
