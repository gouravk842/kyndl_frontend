"use client";

import { useEffect, useRef, useState } from "react";

import { commentService } from "@/services/comments/comment.service";
import type { ConversationSurface, ThreadEvent } from "@/types/comment";

/** WebSocket origin. Explicit env wins; otherwise derive it from the API URL
 * (http→ws, drop the /api/v1 path) so a single backend host serves both. */
function wsBase(): string {
  const explicit = process.env.NEXT_PUBLIC_WS_URL;
  if (explicit) return explicit.replace(/\/$/, "");
  const api = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";
  try {
    const u = new URL(api);
    return `${u.protocol === "https:" ? "wss:" : "ws:"}//${u.host}`;
  } catch {
    return "ws://localhost:8000";
  }
}

interface Options {
  surface: ConversationSurface;
  ref: string;
  scope?: string;
  enabled: boolean;
  onEvent: (event: ThreadEvent) => void;
}

/**
 * Live conversation transport. The read path is this socket; writes still go
 * over REST (the server broadcasts the echo back here), so a dropped socket
 * never loses a message and permission rules live in one place.
 *
 * Auth: the httpOnly access cookie can't be read by client JS and the socket is
 * cross-origin, so we fetch a short-lived signed ticket from the BFF and pass it
 * as `?ticket=`. On drop we reconnect with capped backoff, re-minting the ticket
 * each time (they expire fast).
 */
export function useConversationSocket({ surface, ref, scope, enabled, onEvent }: Options) {
  const [connected, setConnected] = useState(false);
  // Keep the latest handler without forcing a reconnect when it changes.
  const onEventRef = useRef(onEvent);
  useEffect(() => {
    onEventRef.current = onEvent;
  }, [onEvent]);

  useEffect(() => {
    if (!enabled || !ref) return;

    let socket: WebSocket | null = null;
    let retry = 0;
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
    let closed = false; // set on cleanup so a pending reconnect is abandoned

    async function connect() {
      if (closed) return;
      let ticket: string;
      try {
        ({ ticket } = await commentService.wsTicket());
      } catch {
        scheduleReconnect();
        return;
      }
      if (closed) return;

      const scopeQs = scope ? `&scope=${encodeURIComponent(scope)}` : "";
      const url = `${wsBase()}/ws/conversations/${surface}/${encodeURIComponent(ref)}/?ticket=${ticket}${scopeQs}`;
      socket = new WebSocket(url);

      socket.onopen = () => {
        retry = 0;
        setConnected(true);
      };
      socket.onmessage = (raw) => {
        try {
          onEventRef.current(JSON.parse(raw.data) as ThreadEvent);
        } catch {
          /* ignore malformed frames */
        }
      };
      socket.onclose = () => {
        setConnected(false);
        if (!closed) scheduleReconnect();
      };
      socket.onerror = () => socket?.close();
    }

    function scheduleReconnect() {
      if (closed) return;
      // 1s, 2s, 4s … capped at 15s.
      const delay = Math.min(1000 * 2 ** retry, 15000);
      retry += 1;
      reconnectTimer = setTimeout(connect, delay);
    }

    connect();

    return () => {
      closed = true;
      if (reconnectTimer) clearTimeout(reconnectTimer);
      socket?.close();
      setConnected(false);
    };
  }, [surface, ref, scope, enabled]);

  return { connected };
}
