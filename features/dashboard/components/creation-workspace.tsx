"use client";

import {
  ArrowLeft,
  Check,
  Copy,
  ExternalLink,
  Eye,
  Pencil,
  Rocket,
  Trash2,
  Undo2,
  X,
} from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { type ReactNode, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useDeleteCreation,
  useDuplicateCreation,
  usePublishCreation,
  useRenameCreation,
  useUnpublishCreation,
} from "@/hooks/use-creations";
import { cn } from "@/lib/utils";
import type { Creation } from "@/types/creation";

import { hasEmbeddedBuilder, renderBuilder } from "../lib/builder-registry";
import { useLibrary } from "../lib/use-library";
import { resolveWorkspaceTab } from "../lib/workspace-tabs";
import { AccessForm } from "./access-sheet";

/**
 * The unified workspace for a single creation. One tabbed surface replacing the
 * old split between the detail hub (a vertical list of actions) and the builder:
 * the header tab bar (see `CreationWorkspaceHeader`) drives `?tab=`, and this pane
 * renders the matching panel. "Design" is the full-bleed builder; Share, Publish
 * and Manage are the lifecycle actions, each one tab-click away from editing.
 */
export function CreationWorkspace({ id }: { id: string }) {
  const params = useSearchParams();
  const tab = resolveWorkspaceTab(
    params.get("tab"),
    params.get("edit") === "1",
  );

  const { creations, isLoading } = useLibrary();
  const creation = creations.find((c) => c.id === id);

  // We need the creation resolved to know its type (Design) or its state (the
  // rest), so wait on the library rather than flashing blank.
  if (!creation) {
    if (isLoading) {
      return tab === "design" ? (
        <div className="-m-6 flex h-[calc(100dvh-4rem)] items-center justify-center">
          <p className="animate-pulse text-muted-foreground">Loading editor…</p>
        </div>
      ) : (
        <div className="mx-auto max-w-2xl space-y-4">
          <Skeleton className="h-10 w-48 rounded-lg" />
          <Skeleton className="h-64 rounded-2xl" />
        </div>
      );
    }
    return <NotFound />;
  }

  if (tab === "design") return <DesignPanel creation={creation} />;

  return (
    <div className="mx-auto max-w-2xl">
      {tab === "share" && <SharePanel creation={creation} />}
      {tab === "publish" && <PublishPanel creation={creation} />}
      {tab === "manage" && <ManagePanel creation={creation} />}
    </div>
  );
}

// ── Design (the builder) ────────────────────────────────────────────
function DesignPanel({ creation }: { creation: Creation }) {
  if (!hasEmbeddedBuilder(creation.type)) {
    return (
      <div className="mx-auto max-w-md space-y-4 py-16 text-center">
        <h1 className="font-heading text-xl">This can&apos;t be edited here</h1>
        <p className="text-muted-foreground">
          This experience doesn&apos;t have an in-app editor yet.
        </p>
        <BackToLibrary />
      </div>
    );
  }
  // Full-bleed: cancel `main`'s padding so the builder fills the pane, matching
  // the old edit host. The builder reads `?id=` itself, so it needs no props.
  // Interaction (comments/reviews/chat) now lives inside every builder's own
  // sidebar as a shared BuilderShell tab, so nothing extra is layered here.
  return <div className="-m-6">{renderBuilder(creation.type)}</div>;
}

// ── Share & access ──────────────────────────────────────────────────
function SharePanel({ creation }: { creation: Creation }) {
  return (
    <PanelShell
      title="Share & access"
      subtitle="Choose who can view this keepsake and copy its share link."
    >
      <div className="overflow-hidden rounded-2xl bg-card ring-1 ring-foreground/10">
        <AccessForm
          creation={creation}
          onSaved={() => toast.success("Access updated.")}
        />
      </div>
    </PanelShell>
  );
}

// ── Publish ─────────────────────────────────────────────────────────
function PublishPanel({ creation }: { creation: Creation }) {
  const publish = usePublishCreation();
  const unpublish = useUnpublishCreation();
  const published = creation.status === "published";
  // In-app navigation uses a relative href; the copyable link is the canonical
  // one the backend builds (falls back to a relative path for older payloads).
  const shareHref = `/v/${creation.public_token}`;
  const shareUrl = creation.share_url || shareHref;
  const [copied, setCopied] = useState(false);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error("Could not copy the link.");
    }
  }

  return (
    <PanelShell
      title="Publish"
      subtitle={
        published
          ? "This keepsake is live. Anyone with access can open its link."
          : "Take it live and get a shareable link."
      }
    >
      <div className="space-y-4 rounded-2xl bg-card p-5 ring-1 ring-foreground/10">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "size-2 rounded-full",
              published ? "bg-[#2fb672]" : "bg-[#d4a373]",
            )}
          />
          <span className="text-sm font-medium">
            {published ? "Published" : "Draft — not yet live"}
          </span>
        </div>

        {published ? (
          <div className="flex flex-wrap gap-2">
            <Button
              render={<Link href={shareHref} target="_blank" rel="noreferrer" />}
              variant="secondary"
            >
              <ExternalLink className="size-4" />
              View published
            </Button>
            <Button
              variant="ghost"
              onClick={() => unpublish.mutate(creation.id)}
              disabled={unpublish.isPending}
            >
              <Undo2 className="size-4" />
              {unpublish.isPending ? "Unpublishing…" : "Unpublish"}
            </Button>
          </div>
        ) : (
          // In draft, offer both: publish for real, or open the share link as a
          // private preview. Only the owner can open a draft's link, so this is a
          // safe dry-run of exactly what the audience will see.
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={() =>
                publish.mutate({
                  id: creation.id,
                  title: creation.title || "Untitled",
                })
              }
              disabled={publish.isPending}
            >
              <Rocket className="size-4" />
              {publish.isPending ? "Publishing…" : "Publish"}
            </Button>
            <Button
              render={<Link href={shareHref} target="_blank" rel="noreferrer" />}
              variant="secondary"
            >
              <Eye className="size-4" />
              Preview
            </Button>
          </div>
        )}

        <div className="space-y-1.5 border-t pt-4">
          <span className="text-xs font-medium tracking-wide text-muted-foreground">
            Share link
          </span>
          <div className="flex gap-2">
            <Input readOnly value={shareUrl} className="text-xs" />
            <Button type="button" variant="secondary" onClick={copyLink}>
              {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
            </Button>
          </div>
          {!published && (
            <p className="text-xs text-muted-foreground">
              Only you can open this link until you publish — use{" "}
              <span className="font-medium">Preview</span> to see it as your
              audience will. Publishing lets everyone you&apos;ve allowed in.
            </p>
          )}
        </div>
      </div>
    </PanelShell>
  );
}

// ── Manage (rename / duplicate / delete) ────────────────────────────
function ManagePanel({ creation }: { creation: Creation }) {
  const rename = useRenameCreation();
  const duplicate = useDuplicateCreation();
  const deleteCreation = useDeleteCreation();

  const [renaming, setRenaming] = useState(false);
  const [draftTitle, setDraftTitle] = useState(creation.title || "");

  function saveRename() {
    const title = draftTitle.trim();
    if (!title || title === creation.title) {
      setRenaming(false);
      return;
    }
    rename.mutate(
      { id: creation.id, title },
      { onSuccess: () => setRenaming(false) },
    );
  }

  function handleDelete() {
    if (
      window.confirm(
        `Delete "${creation.title || "Untitled"}"? This can't be undone.`,
      )
    ) {
      deleteCreation.mutate({
        id: creation.id,
        title: creation.title || "Untitled",
      });
    }
  }

  return (
    <PanelShell
      title="Manage"
      subtitle="Rename, duplicate, or remove this keepsake."
    >
      <div className="divide-y divide-foreground/10 overflow-hidden rounded-2xl bg-card ring-1 ring-foreground/10">
        {/* Rename */}
        <div className="space-y-2 px-5 py-4">
          <span className="block text-sm font-medium">Name</span>
          {renaming ? (
            <div className="flex items-center gap-2">
              <Input
                autoFocus
                value={draftTitle}
                onChange={(e) => setDraftTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") saveRename();
                  if (e.key === "Escape") setRenaming(false);
                }}
                className="max-w-sm"
              />
              <Button size="icon-sm" onClick={saveRename} disabled={rename.isPending}>
                <Check className="size-4" />
              </Button>
              <Button
                size="icon-sm"
                variant="ghost"
                onClick={() => {
                  setDraftTitle(creation.title || "");
                  setRenaming(false);
                }}
              >
                <X className="size-4" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                {creation.title || "Untitled"}
              </span>
              <button
                type="button"
                onClick={() => {
                  setDraftTitle(creation.title || "");
                  setRenaming(true);
                }}
                className="text-muted-foreground transition-colors hover:text-foreground"
                aria-label="Rename"
              >
                <Pencil className="size-4" />
              </button>
            </div>
          )}
        </div>

        <ActionRow
          icon={<Copy className="size-4" />}
          title="Duplicate"
          subtitle="Make an editable copy as a fresh draft."
          onClick={() =>
            duplicate.mutate({
              id: creation.id,
              type: creation.type,
              title: creation.title || "Untitled",
            })
          }
          disabled={duplicate.isPending}
        />

        <ActionRow
          icon={<Trash2 className="size-4" />}
          title="Delete"
          subtitle="Permanently remove this keepsake."
          onClick={handleDelete}
          destructive
        />
      </div>
    </PanelShell>
  );
}

// ── Shared building blocks ──────────────────────────────────────────
function PanelShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-heading text-xl font-medium text-foreground">
          {title}
        </h1>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      </div>
      {children}
    </div>
  );
}

function ActionRow({
  icon,
  title,
  subtitle,
  onClick,
  disabled,
  destructive,
}: {
  icon: ReactNode;
  title: string;
  subtitle: string;
  onClick: () => void;
  disabled?: boolean;
  destructive?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="flex w-full items-center gap-4 px-5 py-4 text-left transition-colors hover:bg-muted/50 disabled:opacity-50"
    >
      <span
        className={cn(
          "flex size-9 shrink-0 items-center justify-center rounded-xl",
          destructive
            ? "bg-destructive/10 text-destructive"
            : "bg-muted text-foreground",
        )}
      >
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span
          className={cn(
            "block text-sm font-medium",
            destructive ? "text-destructive" : "text-foreground",
          )}
        >
          {title}
        </span>
        <span className="block text-xs text-muted-foreground">{subtitle}</span>
      </span>
    </button>
  );
}

function BackToLibrary() {
  return (
    <Button render={<Link href="/dashboard" />} variant="secondary">
      <ArrowLeft className="size-4" />
      Back to library
    </Button>
  );
}

function NotFound() {
  return (
    <div className="mx-auto max-w-md space-y-4 py-16 text-center">
      <h1 className="font-heading text-xl">Creation not found</h1>
      <p className="text-muted-foreground">
        It may have been deleted, or the link is wrong.
      </p>
      <BackToLibrary />
    </div>
  );
}
