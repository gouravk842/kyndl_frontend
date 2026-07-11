import { apiRequest } from "@/services/api/client";
import type {
  NotificationCounts,
  NotificationList,
  NotificationPreference,
} from "@/types/notification";

// Same-origin Next BFF, which forwards to Django with the httpOnly access cookie
// as a bearer token.
const BASE = "/notifications";

type ListParams = { limit?: number; offset?: number; unread?: 1; category?: string };

export const notificationService = {
  // A page of notifications plus the viewer's badge counts.
  list(params?: ListParams) {
    return apiRequest<NotificationList>({ method: "GET", url: BASE, params });
  },

  // Lightweight badge poll (fallback when the socket is down).
  counts() {
    return apiRequest<NotificationCounts>({ method: "GET", url: `${BASE}/unread-count` });
  },

  // Clear the badge (mark everything seen, not read).
  markSeen() {
    return apiRequest<void>({ method: "POST", url: `${BASE}/seen` });
  },

  // Mark specific notifications read, or all of them.
  markRead(ids: string[]) {
    return apiRequest<{ unread_count: number }>({ method: "POST", url: `${BASE}/read`, data: { ids } });
  },
  markAllRead() {
    return apiRequest<{ unread_count: number }>({ method: "POST", url: `${BASE}/read`, data: { all: true } });
  },
  markOneRead(id: string) {
    return apiRequest<void>({ method: "POST", url: `${BASE}/${id}/read` });
  },

  // Per-(category, channel) opt-out preferences.
  getPreferences() {
    return apiRequest<NotificationPreference[]>({ method: "GET", url: `${BASE}/preferences` });
  },
  setPreference(pref: NotificationPreference) {
    return apiRequest<NotificationPreference[]>({
      method: "PATCH",
      url: `${BASE}/preferences`,
      data: pref,
    });
  },

  // Short-lived signed ticket used to authenticate the WebSocket.
  wsTicket() {
    return apiRequest<{ ticket: string; expires_in: number }>({
      method: "POST",
      url: `${BASE}/ws-ticket`,
    });
  },
};
