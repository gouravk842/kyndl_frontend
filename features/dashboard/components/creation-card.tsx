"use client";

import {
  Copy,
  ExternalLink,
  MoreHorizontal,
  Pencil,
  Rocket,
  Share2,
  Trash2,
  Undo2,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { ExperienceCardMedia } from "@/components/shared/experience-card-media";
import { ExperienceIcon } from "@/components/shared/experience-icon";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  useDeleteCreation,
  useDuplicateCreation,
  usePublishCreation,
  useUnpublishCreation,
} from "@/hooks/use-creations";
import {
  creationDetailHref,
  creationMeta,
  formatRelativeTime,
} from "@/lib/creations";
import { cn } from "@/lib/utils";
import type { Creation } from "@/types/creation";

import { AccessSheet } from "./access-sheet";

export function CreationCard({ creation }: { creation: Creation }) {
  const meta = creationMeta(creation.type);
  const href = creationDetailHref(creation);
  const published = creation.status === "published";
  const shareHref = `/v/${creation.public_token}`;

  // A legacy read without `my_role` is treated as owned (old behaviour). Owners
  // and admins run the page; only the owner may delete/duplicate it.
  const role = creation.my_role ?? "owner";
  const isShared = role !== "owner";
  const canManage = role === "owner" || role === "admin";
  const canDelete = role === "owner";

  const deleteCreation = useDeleteCreation();
  const publish = usePublishCreation();
  const unpublish = useUnpublishCreation();
  const duplicate = useDuplicateCreation();
  const [accessOpen, setAccessOpen] = useState(false);

  const busy = publish.isPending || unpublish.isPending || duplicate.isPending;

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
    <div className="group/card relative flex flex-col overflow-hidden rounded-2xl bg-card ring-1 ring-foreground/10 transition-all duration-300 hover:-translate-y-0.5 hover:ring-foreground/20">
      {/* Cover — same preview image as every other experience card. */}
      <Link
        href={href}
        className="relative block w-full"
        aria-label={`Open ${creation.title}`}
      >
        <ExperienceCardMedia
          slug={creation.type}
          media={meta}
          className="h-28 rounded-none aspect-auto"
        >
          <span className="absolute left-4 top-4 flex size-10 items-center justify-center rounded-xl border border-white/60 bg-white/80 text-[#FF7A59] backdrop-blur-sm">
            <ExperienceIcon name={meta.icon} className="size-5" />
          </span>
          <span
            className={cn(
              "absolute right-4 top-4 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium tracking-wide backdrop-blur-sm",
              published
                ? "border border-[#2fb672]/30 bg-white/85 text-[#1f8a55]"
                : "border border-foreground/10 bg-white/80 text-[#92786C]",
            )}
          >
            <span
              className={cn(
                "size-1.5 rounded-full",
                published ? "bg-[#2fb672]" : "bg-[#d4a373]",
              )}
            />
            {published ? "Published" : "Draft"}
          </span>
        </ExperienceCardMedia>
      </Link>

      <div className="flex flex-1 flex-col gap-1 p-4">
        <p className="flex items-center gap-1.5 text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
          {meta.name}
          {isShared && (
            <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary normal-case">
              Shared · {role}
            </span>
          )}
        </p>
        <Link
          href={href}
          className="font-heading text-base leading-snug font-medium text-foreground hover:text-primary"
        >
          {creation.title || "Untitled"}
        </Link>
        <p className="mt-1 text-xs text-muted-foreground">
          Edited {formatRelativeTime(creation.updated_at)}
        </p>

        <div className="mt-4 flex items-center gap-2">
          <Button render={<Link href={href} />} size="sm" variant="secondary">
            <Pencil className="size-3.5" />
            Open
          </Button>

          {published ? (
            <Button
              render={
                <Link href={shareHref} target="_blank" rel="noreferrer" />
              }
              size="sm"
              variant="ghost"
            >
              <ExternalLink className="size-3.5" />
              View
            </Button>
          ) : canManage ? (
            <Button
              size="sm"
              onClick={() =>
                publish.mutate({
                  id: creation.id,
                  title: creation.title || "Untitled",
                })
              }
              disabled={busy}
            >
              <Rocket className="size-3.5" />
              {publish.isPending ? "Publishing…" : "Publish"}
            </Button>
          ) : null}

          {(canManage || canDelete) && (
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    size="icon-sm"
                    variant="ghost"
                    aria-label="More actions"
                    className="ml-auto"
                  >
                    <MoreHorizontal />
                  </Button>
                }
              />
              <DropdownMenuContent align="end">
                {canManage && (
                  <>
                    <DropdownMenuItem onClick={() => setAccessOpen(true)}>
                      <Share2 className="size-3.5" />
                      Share &amp; access
                    </DropdownMenuItem>
                    {published && (
                      <DropdownMenuItem
                        onClick={() => unpublish.mutate(creation.id)}
                        disabled={busy}
                      >
                        <Undo2 className="size-3.5" />
                        Unpublish
                      </DropdownMenuItem>
                    )}
                  </>
                )}
                {canDelete && (
                  <>
                    <DropdownMenuItem
                      onClick={() =>
                        duplicate.mutate({
                          id: creation.id,
                          type: creation.type,
                          title: creation.title || "Untitled",
                        })
                      }
                      disabled={busy}
                    >
                      <Copy className="size-3.5" />
                      Duplicate
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={handleDelete}
                      className="text-destructive"
                    >
                      <Trash2 className="size-3.5" />
                      Delete
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      <AccessSheet
        creation={creation}
        open={accessOpen}
        onOpenChange={setAccessOpen}
      />
    </div>
  );
}
