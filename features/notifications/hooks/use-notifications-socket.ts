"use client";

import { useEffect, useRef, useState } from "react";

import { notificationService } from "@/services/notifications/notification.service";
import type { NotificationEvent } from "@/types/notification";

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
  enabled: boolean;
  onEvent: (event: NotificationEvent) => void;
}

/**
 * The signed-in user's single notification socket. The read path is this socket
 * (new notifications + counter updates are pushed); everything else is REST, so
 * a dropped socket only delays a badge, never loses a notification.
 *
 * Auth mirrors the conversations socket: the httpOnly access cookie can't be
 * read by client JS and the socket is cross-origin, so we fetch a short-lived
 * signed ticket from the BFF and pass it as `?ticket=`, re-minting on reconnect.
 */
export function useNotificationsSocket({ enabled, onEvent }: Options) {
  const [connected, setConnected] = useState(false);
  const onEventRef = useRef(onEvent);
  useEffect(() => {
    onEventRef.current = onEvent;
  }, [onEvent]);

  useEffect(() => {
    if (!enabled) return;

    let socket: WebSocket | null = null;
    let retry = 0;
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
    let closed = false;

    async function connect() {
      if (closed) return;
      let ticket: string;
      try {
        ({ ticket } = await notificationService.wsTicket());
      } catch {
        scheduleReconnect();
        return;
      }
      if (closed) return;

      socket = new WebSocket(`${wsBase()}/ws/notifications/?ticket=${ticket}`);
      socket.onopen = () => {
        retry = 0;
        setConnected(true);
      };
      socket.onmessage = (raw) => {
        try {
          onEventRef.current(JSON.parse(raw.data) as NotificationEvent);
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
      const delay = Math.min(1000 * 2 ** retry, 15000); // 1s,2s,4s… capped 15s
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
  }, [enabled]);

  return { connected };
}
