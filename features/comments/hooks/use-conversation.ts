"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect } from "react";
import { toast } from "sonner";

import { queryKeys } from "@/constants/query-keys";
import { commentService } from "@/services/comments/comment.service";
import type { ApiError } from "@/types/api";
import type {
  ConversationBundle,
  ConversationSurface,
  FlagReason,
  Message,
  MessageInput,
  ThreadEvent,
} from "@/types/comment";

import { useConversationSocket } from "./use-conversation-socket";

function errorMessage(error: unknown, fallback: string): string {
  return (error as ApiError)?.message ?? fallback;
}

interface UseConversationArgs {
  surface: ConversationSurface;
  ref: string;
  scope?: string;
  /** Live updates over WebSocket (chat). Comments can stay pull-only. */
  live?: boolean;
}

/**
 * Everything a conversation panel needs: the thread bundle, write mutations, and
 * — when `live` — a WebSocket that folds server events into the same query cache
 * so the on-screen list updates in place. Writes always go over REST; the socket
 * echo is de-duped by message id, so a message is never shown twice.
 */
export function useConversation({ surface, ref, scope, live = false }: UseConversationArgs) {
  const queryClient = useQueryClient();
  const key = queryKeys.conversations.thread(surface, ref, scope);

  const query = useQuery({
    queryKey: key,
    queryFn: () => commentService.getThread(surface, ref, scope ? { scope } : undefined),
    enabled: Boolean(ref),
    staleTime: 15 * 1000,
  });

  // ── Merge a single message into the cached bundle (insert or replace) ──
  const upsertMessage = useCallback(
    (message: Message) => {
      queryClient.setQueryData<ConversationBundle>(key, (prev) => {
        if (!prev) return prev;
        const idx = prev.messages.findIndex((m) => m.id === message.id);
        const messages =
          idx === -1
            ? [...prev.messages, message]
            : prev.messages.map((m) => (m.id === message.id ? message : m));
        const visible = messages.filter((m) => !m.is_removed).length;
        return {
          ...prev,
          messages,
          thread: {
            ...prev.thread,
            message_count: visible,
            last_activity_at: message.created_at,
          },
        };
      });
    },
    [queryClient, key],
  );

  // ── Live events → cache ──
  const onEvent = useCallback(
    (event: ThreadEvent) => {
      switch (event.event) {
        case "message.created":
        case "message.updated":
        case "message.removed":
          if (event.message) upsertMessage(event.message);
          break;
        case "thread.locked":
          // The event doesn't carry the new lock state; refetch to be exact.
          queryClient.invalidateQueries({ queryKey: key });
          break;
        default:
          break; // typing / error — surfaced elsewhere if needed
      }
    },
    [upsertMessage, queryClient, key],
  );

  const { connected } = useConversationSocket({
    surface,
    ref,
    scope,
    enabled: live && Boolean(query.data),
    onEvent,
  });

  // ── Mutations ──
  const post = useMutation({
    mutationFn: (input: MessageInput) => commentService.post(surface, ref, input, scope),
    onSuccess: (message) => {
      // Reflect our own message immediately; the socket echo de-dupes by id.
      upsertMessage(message);
    },
    onError: (error) => toast.error(errorMessage(error, "Couldn't send that.")),
  });

  const edit = useMutation({
    mutationFn: ({ id, body }: { id: string; body: string }) => commentService.edit(id, body),
    onSuccess: (message) => upsertMessage(message),
    onError: (error) => toast.error(errorMessage(error, "Couldn't edit that.")),
  });

  const remove = useMutation({
    mutationFn: (id: string) => commentService.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: key }),
    onError: (error) => toast.error(errorMessage(error, "Couldn't remove that.")),
  });

  const report = useMutation({
    mutationFn: ({ id, reason, detail }: { id: string; reason: FlagReason; detail?: string }) =>
      commentService.report(id, reason, detail),
    onSuccess: () => toast.success("Reported. Thanks for flagging."),
    onError: (error) => toast.error(errorMessage(error, "Couldn't report that.")),
  });

  const setLocked = useMutation({
    mutationFn: (locked: boolean) => commentService.setLocked(surface, ref, locked, scope),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: key }),
    onError: (error) => toast.error(errorMessage(error, "Couldn't update the lock.")),
  });

  // ── Mark chat read once we have an unread count ──
  const unread = query.data?.viewer.unread ?? 0;
  useEffect(() => {
    if (query.data?.thread.mode === "chat" && unread > 0) {
      commentService.markRead(surface, ref, scope).then(() => {
        queryClient.setQueryData<ConversationBundle>(key, (prev) =>
          prev ? { ...prev, viewer: { ...prev.viewer, unread: 0 } } : prev,
        );
      });
    }
    // Only re-run when the unread count changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unread]);

  return {
    data: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    connected,
    post,
    edit,
    remove,
    report,
    setLocked,
  };
}
