import { apiRequest } from "@/services/api/client";
import type {
  ConversationBundle,
  ConversationSurface,
  FlagReason,
  InboxEntry,
  Message,
  MessageInput,
} from "@/types/comment";

// Same-origin Next BFF, which forwards to Django with the httpOnly access
// cookie as a bearer token. One generic surface serves experience comments,
// experience chat and direct messages — `surface` + `ref` name the thread.
const BASE = "/comments";

// Optional explicit thread scope (a chat moderator opening one guest thread).
type ThreadParams = { limit?: number; offset?: number; scope?: string };

function path(surface: ConversationSurface, ref: string, suffix = "") {
  return `${BASE}/${surface}/${encodeURIComponent(ref)}${suffix}`;
}

export const commentService = {
  // The thread bundle: meta + a page of messages + the viewer's context.
  getThread(surface: ConversationSurface, ref: string, params?: ThreadParams) {
    return apiRequest<ConversationBundle>({
      method: "GET",
      url: path(surface, ref),
      params,
    });
  },

  // Post a message (optionally a reply).
  post(surface: ConversationSurface, ref: string, input: MessageInput, scope?: string) {
    return apiRequest<Message>({
      method: "POST",
      url: path(surface, ref),
      params: scope ? { scope } : undefined,
      data: input,
    });
  },

  // Edit your own message.
  edit(messageId: string, body: string) {
    return apiRequest<Message>({
      method: "PATCH",
      url: `${BASE}/message/${messageId}`,
      data: { body },
    });
  },

  // Soft-delete your own message (or hide it, if you moderate).
  remove(messageId: string) {
    return apiRequest<void>({ method: "DELETE", url: `${BASE}/message/${messageId}` });
  },

  // Report a message for moderator review.
  report(messageId: string, reason: FlagReason, detail?: string) {
    return apiRequest<{ detail: string }>({
      method: "POST",
      url: `${BASE}/message/${messageId}/report`,
      data: { reason, detail },
    });
  },

  // Mark the thread caught-up (clears the viewer's unread count).
  markRead(surface: ConversationSurface, ref: string, scope?: string) {
    return apiRequest<void>({
      method: "POST",
      url: path(surface, ref, "/read"),
      params: scope ? { scope } : undefined,
    });
  },

  // Lock/unlock the thread (moderator only).
  setLocked(surface: ConversationSurface, ref: string, locked: boolean, scope?: string) {
    return apiRequest<{ is_locked: boolean }>({
      method: "POST",
      url: path(surface, ref, "/lock"),
      params: scope ? { scope } : undefined,
      data: { locked },
    });
  },

  // The signed-in user's chat inbox with unread counts.
  inbox() {
    return apiRequest<InboxEntry[]>({ method: "GET", url: `${BASE}/inbox` });
  },

  // Short-lived signed ticket used to authenticate the WebSocket.
  wsTicket() {
    return apiRequest<{ ticket: string; expires_in: number }>({
      method: "POST",
      url: `${BASE}/ws-ticket`,
    });
  },
};
