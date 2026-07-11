/**
 * Notification shapes, mirrored from the Django `notifications` app. One system
 * records a per-recipient notification for every meaningful event and pushes it
 * live over a WebSocket to the bell; email (and later push/SMS) are delivery
 * channels behind the same records.
 */

export type NotificationCategory =
  | "message"
  | "social"
  | "commerce"
  | "collaboration"
  | "system";

/** Denormalised render data — self-contained so it survives target deletion. */
export interface NotificationPayload {
  title: string;
  body?: string;
  url?: string;
  icon?: string;
  [key: string]: unknown;
}

export interface AppNotification {
  id: string;
  type: string;
  category: NotificationCategory;
  payload: NotificationPayload;
  count: number;
  is_read: boolean;
  is_seen: boolean;
  read_at: string | null;
  seen_at: string | null;
  created_at: string;
}

/** The list endpoint's envelope: a page plus the viewer's badge counts. */
export interface NotificationList {
  results: AppNotification[];
  unread_count: number;
  unseen_count: number;
}

export interface NotificationCounts {
  unread_count: number;
  unseen_count: number;
}

export type NotificationChannel = "in_app" | "email";

export interface NotificationPreference {
  category: string;
  channel: NotificationChannel;
  enabled: boolean;
}

/** Frames the notifications WebSocket pushes to the client. */
export type NotificationEvent =
  | { event: "notification"; notification: AppNotification }
  | { event: "counter"; unread: number; unseen: number };
