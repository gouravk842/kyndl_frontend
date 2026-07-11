"use client";

import { Lock, LockOpen, Radio } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { Skeleton } from "@/components/ui/skeleton";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth.store";
import type { ConversationSurface, Message } from "@/types/comment";

import { useConversation } from "../hooks/use-conversation";
import { Composer } from "./composer";
import { MessageList } from "./message-list";

interface ConversationProps {
  surface: ConversationSurface;
  /** Public handle of the target (experience share token, or user id for a DM). */
  refId: string;
  /** Explicit thread scope (a chat moderator opening one guest conversation). */
  scope?: string;
  title?: string;
  className?: string;
}

/**
 * Drop-in conversation panel for any surface. Fetches the thread bundle, gates
 * posting behind sign-in and server-side permission, and renders comments or
 * chat from the same code — the server's `mode` decides ordering, and chat gets
 * a live WebSocket. Reused as-is by experiences (comments & chat) and DMs.
 */
export function Conversation({ surface, refId, scope, title, className }: ConversationProps) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isHydrated = useAuthStore((s) => s.isHydrated);
  const pathname = usePathname();
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);

  const { data, isLoading, isError, connected, post, edit, remove, report, setLocked } = useConversation({
    surface,
    ref: refId,
    scope,
    // Only chat needs the socket; comments stay pull-only (with cache updates on write).
    live: data_is_chat(surface),
  });

  const mode = data?.thread.mode ?? "comments";
  const heading = title ?? (mode === "chat" ? "Chat" : "Comments");

  return (
    <section className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-foreground">
          {heading}
          {data && data.thread.message_count > 0 && (
            <span className="ml-2 text-base font-normal text-muted-foreground">
              {data.thread.message_count}
            </span>
          )}
        </h2>
        <div className="flex items-center gap-3">
          {mode === "chat" && connected && (
            <span className="inline-flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
              <Radio className="size-3" /> Live
            </span>
          )}
          {data?.viewer.can_moderate && data.thread.id && (
            <button
              type="button"
              onClick={() => setLocked.mutate(!data.thread.is_locked)}
              className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
            >
              {data.thread.is_locked ? (
                <>
                  <LockOpen className="size-3.5" /> Unlock
                </>
              ) : (
                <>
                  <Lock className="size-3.5" /> Lock
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-16 w-full rounded-2xl" />
          <Skeleton className="h-16 w-full rounded-2xl" />
        </div>
      ) : isError || !data ? (
        // The request failed (e.g. the experience isn't published yet) — say so
        // instead of spinning forever on a skeleton that never resolves.
        <div className="rounded-2xl border border-border bg-card p-5 text-sm text-muted-foreground">
          {mode === "chat" ? "Chat" : "Comments"} aren&apos;t available here yet.
        </div>
      ) : (
        <>
          {/* ── Write surface ─────────────────────────────────────────── */}
          {isHydrated && !isAuthenticated && (
            <div className="rounded-2xl border border-border bg-card p-5 text-sm text-muted-foreground">
              <Link
                href={`${ROUTES.login}?callbackUrl=${encodeURIComponent(pathname)}`}
                className="font-medium text-primary underline-offset-4 hover:underline"
              >
                Sign in
              </Link>{" "}
              to join the conversation.
            </div>
          )}

          {isAuthenticated && data.thread.is_locked && (
            <div className="rounded-2xl border border-border bg-card px-4 py-3 text-sm text-muted-foreground">
              <Lock className="mr-1.5 inline size-3.5" /> This conversation is locked.
            </div>
          )}

          {isAuthenticated && data.viewer.can_post && !data.thread.is_locked && (
            <Composer
              sending={post.isPending}
              sendOnEnter={mode === "chat"}
              placeholder={mode === "chat" ? "Message…" : "Add a comment…"}
              replyingTo={replyingTo}
              onCancelReply={() => setReplyingTo(null)}
              onSend={(body) => {
                post.mutate({ body, parent_id: replyingTo?.id ?? null });
                setReplyingTo(null);
              }}
            />
          )}

          {isAuthenticated && !data.viewer.can_post && data.viewer.reason && (
            <div className="rounded-2xl border border-border bg-card p-5 text-sm text-muted-foreground">
              {data.viewer.reason}
            </div>
          )}

          {/* ── Messages ──────────────────────────────────────────────── */}
          {data.messages.length > 0 ? (
            <MessageList
              messages={data.messages}
              mode={mode}
              canModerate={data.viewer.can_moderate}
              onReply={mode === "comments" ? setReplyingTo : undefined}
              onEdit={(m, body) => edit.mutate({ id: m.id, body })}
              onDelete={(id) => remove.mutate(id)}
              onReport={(id) => report.mutate({ id, reason: "abuse" })}
            />
          ) : (
            <p className="py-6 text-center text-sm text-muted-foreground">
              {mode === "chat" ? "No messages yet — say hello." : "No comments yet. Be the first."}
            </p>
          )}
        </>
      )}
    </section>
  );
}

/** Chat surfaces want the live socket; the comment surface doesn't. */
function data_is_chat(surface: ConversationSurface): boolean {
  return surface === "experience-chat" || surface === "dm";
}
