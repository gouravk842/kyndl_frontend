"use client";

import { SendHorizontal, X } from "lucide-react";
import { useState } from "react";

import { cn } from "@/lib/utils";
import type { Message } from "@/types/comment";

interface ComposerProps {
  onSend: (body: string) => void;
  sending: boolean;
  placeholder?: string;
  replyingTo?: Message | null;
  onCancelReply?: () => void;
  /** Enter sends (chat); Shift+Enter for newline. Comments send via the button. */
  sendOnEnter?: boolean;
}

export function Composer({
  onSend,
  sending,
  placeholder = "Write a message…",
  replyingTo,
  onCancelReply,
  sendOnEnter = false,
}: ComposerProps) {
  const [body, setBody] = useState("");

  function submit() {
    const next = body.trim();
    if (!next || sending) return;
    onSend(next);
    setBody("");
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-2">
      {replyingTo && (
        <div className="mb-1 flex items-center justify-between rounded-lg bg-muted px-3 py-1.5 text-xs text-muted-foreground">
          <span className="truncate">
            Replying to <span className="font-medium">{replyingTo.author_name}</span>
          </span>
          <button type="button" onClick={onCancelReply} aria-label="Cancel reply">
            <X className="size-3.5" />
          </button>
        </div>
      )}
      <div className="flex items-end gap-2">
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          onKeyDown={(e) => {
            if (sendOnEnter && e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              submit();
            }
          }}
          rows={1}
          placeholder={placeholder}
          className="max-h-40 min-h-9 flex-1 resize-none bg-transparent px-2 py-1.5 text-sm outline-none placeholder:text-muted-foreground"
        />
        <button
          type="button"
          onClick={submit}
          disabled={sending || !body.trim()}
          aria-label="Send"
          className={cn(
            "flex size-9 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground transition-opacity",
            "disabled:pointer-events-none disabled:opacity-40",
          )}
        >
          <SendHorizontal className="size-4" />
        </button>
      </div>
    </div>
  );
}
