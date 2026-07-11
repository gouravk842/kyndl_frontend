"use client";

import { useMemo } from "react";

import type { Message, ThreadMode } from "@/types/comment";

import { MessageItem } from "./message-item";

interface MessageListProps {
  messages: Message[];
  mode: ThreadMode;
  canModerate: boolean;
  onReply?: (message: Message) => void;
  onEdit?: (message: Message, body: string) => void;
  onDelete?: (id: string) => void;
  onReport?: (id: string) => void;
}

/** Groups one level of replies under their parent, then orders top-level
 * messages: chat reads oldest→newest (chronological), comments newest→oldest. */
export function MessageList({ messages, mode, canModerate, ...handlers }: MessageListProps) {
  const tree = useMemo(() => {
    const roots = messages.filter((m) => !m.parent_id);
    const repliesByParent = new Map<string, Message[]>();
    for (const m of messages) {
      if (m.parent_id) {
        const list = repliesByParent.get(m.parent_id) ?? [];
        list.push(m);
        repliesByParent.set(m.parent_id, list);
      }
    }
    const ordered = mode === "chat" ? roots : [...roots].reverse();
    return ordered.map((root) => ({
      root,
      replies: (repliesByParent.get(root.id) ?? []).sort(
        (a, b) => +new Date(a.created_at) - +new Date(b.created_at),
      ),
    }));
  }, [messages, mode]);

  return (
    <ul className="divide-y divide-border/60">
      {tree.map(({ root, replies }) => (
        <li key={root.id} className="first:pt-0">
          <MessageItem message={root} canModerate={canModerate} {...handlers} />
          {replies.map((reply) => (
            <MessageItem
              key={reply.id}
              message={reply}
              canModerate={canModerate}
              isReply
              onEdit={handlers.onEdit}
              onDelete={handlers.onDelete}
              onReport={handlers.onReport}
            />
          ))}
        </li>
      ))}
    </ul>
  );
}
