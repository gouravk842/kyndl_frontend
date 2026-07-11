"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";

import { queryKeys } from "@/constants/query-keys";
import { notificationService } from "@/services/notifications/notification.service";
import type {
  NotificationCounts,
  NotificationEvent,
  NotificationList,
} from "@/types/notification";

import { useNotificationsSocket } from "./use-notifications-socket";

/**
 * Everything the bell needs: the notification list, live badge counts, and
 * read/seen mutations — with a WebSocket that folds pushed events into the same
 * query cache so the panel and badge update in place. A lightweight `counts`
 * query is the poll-only fallback used while the socket is disconnected.
 */
export function useNotifications({ enabled = true }: { enabled?: boolean } = {}) {
  const queryClient = useQueryClient();
  const listKey = queryKeys.notifications.list();
  const countsKey = queryKeys.notifications.counts();

  const listQuery = useQuery({
    queryKey: listKey,
    queryFn: () => notificationService.list({ limit: 20 }),
    enabled,
    staleTime: 30 * 1000,
  });

  // ── Fold a pushed event into the cache ──
  const applyEvent = useCallback(
    (event: NotificationEvent) => {
      if (event.event === "counter") {
        setCounts(queryClient, { unread_count: event.unread, unseen_count: event.unseen });
        return;
      }
      // A new / bumped notification: upsert into the list and bump the counts.
      queryClient.setQueryData<NotificationList>(listKey, (prev) => {
        const incoming = event.notification;
        if (!prev) return { results: [incoming], unread_count: 1, unseen_count: 1 };
        const without = prev.results.filter((n) => n.id !== incoming.id);
        const existed = prev.results.length !== without.length;
        return {
          results: [incoming, ...without].slice(0, 50),
          unread_count: prev.unread_count + (existed ? 0 : 1),
          unseen_count: prev.unseen_count + (existed ? 0 : 1),
        };
      });
    },
    [queryClient, listKey],
  );

  const { connected } = useNotificationsSocket({ enabled, onEvent: applyEvent });

  // Badge fallback: poll counts only while the socket is disconnected.
  const countsQuery = useQuery({
    queryKey: countsKey,
    queryFn: () => notificationService.counts(),
    enabled,
    refetchInterval: connected ? false : 60 * 1000,
  });

  // ── Mutations ──
  const markSeen = useMutation({
    mutationFn: () => notificationService.markSeen(),
    onSuccess: () => setCountsPatch(queryClient, { unseen_count: 0 }),
  });

  const markAllRead = useMutation({
    mutationFn: () => notificationService.markAllRead(),
    onSuccess: () => {
      queryClient.setQueryData<NotificationList>(listKey, (prev) =>
        prev
          ? {
              ...prev,
              results: prev.results.map((n) => ({ ...n, is_read: true, is_seen: true })),
              unread_count: 0,
              unseen_count: 0,
            }
          : prev,
      );
      setCounts(queryClient, { unread_count: 0, unseen_count: 0 });
    },
  });

  const markOneRead = useMutation({
    mutationFn: (id: string) => notificationService.markOneRead(id),
    onSuccess: (_data, id) => {
      queryClient.setQueryData<NotificationList>(listKey, (prev) => {
        if (!prev) return prev;
        const target = prev.results.find((n) => n.id === id);
        const wasUnread = target && !target.is_read;
        return {
          ...prev,
          results: prev.results.map((n) => (n.id === id ? { ...n, is_read: true, is_seen: true } : n)),
          unread_count: Math.max(0, prev.unread_count - (wasUnread ? 1 : 0)),
        };
      });
    },
  });

  const unread = listQuery.data?.unread_count ?? countsQuery.data?.unread_count ?? 0;
  const unseen = listQuery.data?.unseen_count ?? countsQuery.data?.unseen_count ?? 0;

  return {
    list: listQuery.data?.results ?? [],
    unread,
    unseen,
    isLoading: listQuery.isLoading,
    connected,
    markSeen,
    markAllRead,
    markOneRead,
    refetch: listQuery.refetch,
  };
}

function setCounts(queryClient: ReturnType<typeof useQueryClient>, counts: NotificationCounts) {
  queryClient.setQueryData(queryKeys.notifications.counts(), counts);
  queryClient.setQueryData<NotificationList>(queryKeys.notifications.list(), (prev) =>
    prev ? { ...prev, ...counts } : prev,
  );
}

function setCountsPatch(
  queryClient: ReturnType<typeof useQueryClient>,
  patch: Partial<NotificationCounts>,
) {
  queryClient.setQueryData<NotificationList>(queryKeys.notifications.list(), (prev) =>
    prev ? { ...prev, ...patch } : prev,
  );
  queryClient.setQueryData<NotificationCounts>(queryKeys.notifications.counts(), (prev) =>
    prev ? { ...prev, ...patch } : prev,
  );
}
