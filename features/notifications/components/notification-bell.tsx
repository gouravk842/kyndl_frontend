"use client";

import { Bell, CheckCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import type { AppNotification } from "@/types/notification";

import { useNotifications } from "../hooks/use-notifications";
import { NotificationIcon } from "./notification-icon";

/** Relative "2h ago" without pulling in a date library. */
function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d`;
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

/**
 * The signed-in user's notification bell: an icon with an unseen-count badge and
 * a dropdown panel of recent notifications. Opening the panel clears the badge
 * (marks all seen); clicking an item marks it read and deep-links to its target.
 * Live updates arrive over the notifications WebSocket (see `useNotifications`).
 */
export function NotificationBell() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const { list, unread, unseen, markSeen, markAllRead, markOneRead } = useNotifications();

  const onOpenChange = (next: boolean) => {
    setOpen(next);
    if (next && unseen > 0) markSeen.mutate();
  };

  const onItemClick = (n: AppNotification) => {
    if (!n.is_read) markOneRead.mutate(n.id);
    setOpen(false);
    const url = n.payload.url;
    if (typeof url === "string" && url) {
      // Internal links stay client-side; absolute app URLs open directly.
      try {
        const parsed = new URL(url, window.location.origin);
        if (parsed.origin === window.location.origin) router.push(parsed.pathname + parsed.search);
        else window.location.assign(url);
      } catch {
        router.push(url);
      }
    }
  };

  return (
    <DropdownMenu open={open} onOpenChange={onOpenChange}>
      <DropdownMenuTrigger
        render={
          <button
            type="button"
            aria-label={unseen > 0 ? `Notifications, ${unseen} new` : "Notifications"}
            className="relative inline-flex size-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground aria-expanded:bg-muted"
          />
        }
      >
        <Bell className="size-5" />
        {unseen > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold leading-4 text-white">
            {unseen > 9 ? "9+" : unseen}
          </span>
        )}
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-[22rem] p-0">
        <div className="flex items-center justify-between border-b px-4 py-2.5">
          <p className="text-sm font-semibold">Notifications</p>
          {unread > 0 && (
            <button
              type="button"
              onClick={() => markAllRead.mutate()}
              className="inline-flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              <CheckCheck className="size-3.5" />
              Mark all read
            </button>
          )}
        </div>

        <div className="max-h-[26rem] overflow-y-auto">
          {list.length === 0 ? (
            <div className="px-4 py-10 text-center text-sm text-muted-foreground">
              You&apos;re all caught up.
            </div>
          ) : (
            list.map((n) => (
              <button
                key={n.id}
                type="button"
                onClick={() => onItemClick(n)}
                className={cn(
                  "flex w-full items-start gap-3 border-b px-4 py-3 text-left transition-colors last:border-b-0 hover:bg-muted/60",
                  !n.is_read && "bg-primary/5",
                )}
              >
                <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
                  <NotificationIcon name={typeof n.payload.icon === "string" ? n.payload.icon : undefined} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-start justify-between gap-2">
                    <span className="text-sm font-medium leading-snug text-foreground">
                      {n.payload.title}
                      {n.count > 1 && (
                        <span className="ml-1 text-xs text-muted-foreground">×{n.count}</span>
                      )}
                    </span>
                    <span className="shrink-0 text-[11px] text-muted-foreground">
                      {timeAgo(n.created_at)}
                    </span>
                  </span>
                  {n.payload.body ? (
                    <span className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                      {n.payload.body}
                    </span>
                  ) : null}
                </span>
                {!n.is_read && (
                  <span className="mt-1.5 size-2 shrink-0 rounded-full bg-primary" aria-hidden />
                )}
              </button>
            ))
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
