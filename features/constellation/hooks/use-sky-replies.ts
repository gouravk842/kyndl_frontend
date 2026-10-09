"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useState } from "react";

import type { ReplyLine } from "@/features/constellation/lib/field";
import { useAuth } from "@/hooks/use-auth";
import { creationService } from "@/services/creations/creation.service";

function storageKey(key: string) {
  return `kyndl:constellation-replies:${key}`;
}

function readLocal(key: string | undefined): ReplyLine[] {
  if (!key || typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(storageKey(key));
    if (!raw) return [];
    const parsed = JSON.parse(raw) as ReplyLine[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/**
 * Lines left in the sky. The author reads every reply on the creation.
 * The person who wrote one also keeps it on this device, so their star
 * appears before the author has opened the sky.
 */
export function useSkyReplies(options: {
  creationId?: string;
  shareToken?: string;
  storageKey?: string;
  enabled: boolean;
}) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [local, setLocal] = useState<ReplyLine[]>([]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- hydrate replies saved on this device
    setLocal(readLocal(options.storageKey));
  }, [options.storageKey]);

  const query = useQuery({
    queryKey: ["constellation-replies", options.creationId],
    queryFn: () => creationService.responses(options.creationId as string),
    enabled: Boolean(options.enabled && options.creationId && user),
    retry: false,
  });

  const fromServer = useMemo<ReplyLine[]>(
    () =>
      (query.data ?? []).flatMap((response) => {
        const line = response.payload?.line?.trim();
        if (!line) return [];
        return [
          {
            id: response.id,
            line,
            name:
              response.payload?.responderName?.trim() ||
              response.responder_name ||
              "",
          },
        ];
      }),
    [query.data],
  );

  const lines = useMemo(() => {
    const seen = new Set(fromServer.map((line) => line.id));
    return [...fromServer, ...local.filter((line) => !seen.has(line.id))];
  }, [fromServer, local]);

  const leave = useCallback(
    async (line: string, name: string) => {
      const text = line.trim();
      if (!text || !options.shareToken) return;
      const saved = await creationService.leaveStar(options.shareToken, {
        line: text,
        responderName: name.trim(),
      });
      const next = [
        { id: saved.id, line: text, name: name.trim() },
        ...local.filter((item) => item.id !== saved.id),
      ];
      setLocal(next);
      if (options.storageKey) {
        window.localStorage.setItem(
          storageKey(options.storageKey),
          JSON.stringify(next),
        );
      }
      if (options.creationId) {
        void queryClient.invalidateQueries({
          queryKey: ["constellation-replies", options.creationId],
        });
      }
    },
    [
      local,
      options.creationId,
      options.shareToken,
      options.storageKey,
      queryClient,
    ],
  );

  return { lines, leave: options.shareToken ? leave : null };
}
