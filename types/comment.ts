/**
 * Conversation shapes, mirrored from the Django `conversations` app. One
 * threaded-message system serves comments and 1:1 chat, keyed by a surface:
 *   - "experience"      — comments on a published creation, referenced by share token
 *   - "experience-chat" — private owner↔guest chat on a creation (token)
 *   - "dm"              — direct message between two users, referenced by user id
 */

export type ConversationSurface = "experience" | "experience-chat" | "dm";

export type ThreadMode = "comments" | "chat";

export type MessageStatus = "visible" | "hidden" | "deleted";

export interface Message {
  id: string;
  author_id: string;
  author_name: string;
  is_mine: boolean;
  parent_id: string | null;
  body: string;
  status: MessageStatus;
  is_removed: boolean;
  created_at: string;
  edited_at: string | null;
}

/** The thread's own state — stable whether or not it exists yet. */
export interface ThreadMeta {
  id: string | null;
  mode: ThreadMode;
  scope: string;
  is_locked: boolean;
  message_count: number;
  last_activity_at: string | null;
}

/** Whether/why the viewer may post, plus their unread count. */
export interface ViewerContext {
  can_post: boolean;
  can_moderate: boolean;
  reason: string;
  unread: number;
}

/** Small label block describing the conversation's target. */
export interface ConversationTarget {
  type: ConversationSurface;
  name: string;
  token?: string;
  user_id?: string;
  experience_type?: string;
}

/** The bundle `GET /comments/<surface>/<ref>/` returns. */
export interface ConversationBundle {
  target: ConversationTarget;
  thread: ThreadMeta;
  messages: Message[];
  viewer: ViewerContext;
}

export interface MessageInput {
  body: string;
  parent_id?: string | null;
}

export type FlagReason = "spam" | "abuse" | "other";

export interface InboxEntry {
  thread: ThreadMeta;
  surface: ConversationSurface;
  unread: number;
  last_message: Message | null;
}

/** Shape of a live event pushed over the WebSocket. */
export interface ThreadEvent {
  event:
    | "message.created"
    | "message.updated"
    | "message.removed"
    | "thread.locked"
    | "typing"
    | "error";
  thread_id?: string;
  message?: Message | null;
  user_id?: string;
  detail?: string;
}
