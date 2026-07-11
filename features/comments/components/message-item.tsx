"use client";

import { Flag, Pencil, Reply, Trash2 } from "lucide-react";
import { useState } from "react";

import { cn } from "@/lib/utils";
import type { Message } from "@/types/comment";

function formatTime(iso: string): string {
  try {
    return new Intl.DateTimeFormat(undefined, {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }).format(new Date(iso));
  } catch {
    return "";
  }
}

function initials(name: string): string {
  return name
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

interface MessageItemProps {
  message: Message;
  canModerate: boolean;
  isReply?: boolean;
  onReply?: (message: Message) => void;
  onEdit?: (message: Message, body: string) => void;
  onDelete?: (id: string) => void;
  onReport?: (id: string) => void;
}

export function MessageItem({
  message,
  canModerate,
  isReply = false,
  onReply,
  onEdit,
  onDelete,
  onReport,
}: MessageItemProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(message.body);

  // A removed message (deleted by author or hidden by a moderator) leaves a
  // tombstone so its replies keep an anchor.
  if (message.is_removed) {
    return (
      <div className={cn("py-3", isReply && "ml-11")}>
        <p className="text-sm italic text-muted-foreground">Message removed</p>
      </div>
    );
  }

  return (
    <div className={cn("group flex items-start gap-3 py-3", isReply && "ml-11")}>
      <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium text-muted-foreground">
        {initials(message.author_name)}
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2">
          <span className="text-sm font-medium text-foreground">{message.author_name}</span>
          {message.is_mine && (
            <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">You</span>
          )}
          <span className="text-xs text-muted-foreground">{formatTime(message.created_at)}</span>
          {message.edited_at && <span className="text-xs text-muted-foreground">· edited</span>}
        </div>

        {editing ? (
          <div className="mt-2 space-y-2">
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              rows={2}
              className="w-full resize-y rounded-lg border border-border bg-background p-2 text-sm outline-none focus:border-primary"
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  const next = draft.trim();
                  if (next && next !== message.body) onEdit?.(message, next);
                  setEditing(false);
                }}
                className="rounded-md bg-primary px-3 py-1 text-xs font-medium text-primary-foreground"
              >
                Save
              </button>
              <button
                type="button"
                onClick={() => {
                  setDraft(message.body);
                  setEditing(false);
                }}
                className="rounded-md px-3 py-1 text-xs text-muted-foreground hover:bg-muted"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <p className="mt-1 text-sm leading-relaxed whitespace-pre-line break-words text-foreground">
            {message.body}
          </p>
        )}

        {!editing && (
          <div className="mt-1 flex items-center gap-3 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100">
            {!isReply && onReply && (
              <button
                type="button"
                onClick={() => onReply(message)}
                className="inline-flex items-center gap-1 text-xs hover:text-foreground"
              >
                <Reply className="size-3" /> Reply
              </button>
            )}
            {message.is_mine && onEdit && (
              <button
                type="button"
                onClick={() => setEditing(true)}
                className="inline-flex items-center gap-1 text-xs hover:text-foreground"
              >
                <Pencil className="size-3" /> Edit
              </button>
            )}
            {(message.is_mine || canModerate) && onDelete && (
              <button
                type="button"
                onClick={() => onDelete(message.id)}
                className="inline-flex items-center gap-1 text-xs hover:text-destructive"
              >
                <Trash2 className="size-3" /> Delete
              </button>
            )}
            {!message.is_mine && onReport && (
              <button
                type="button"
                onClick={() => onReport(message.id)}
                className="inline-flex items-center gap-1 text-xs hover:text-foreground"
              >
                <Flag className="size-3" /> Report
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
