"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { queryKeys } from "@/constants/query-keys";
import { cn } from "@/lib/utils";
import { notificationService } from "@/services/notifications/notification.service";
import type { NotificationChannel, NotificationPreference } from "@/types/notification";

// The categories a user can tune, and the channels each can travel over. In-app
// is always on (it's the bell itself), so only email is toggleable for now;
// adding push/SMS later is one more entry here + a backend channel.
const CATEGORIES: { key: string; label: string; hint: string }[] = [
  { key: "message", label: "Messages & comments", hint: "New chat messages and comments" },
  { key: "social", label: "Social", hint: "Responses to your Moments, new reviews" },
  { key: "commerce", label: "Orders", hint: "Order confirmations, shipping, receipts" },
  { key: "collaboration", label: "Collaboration", hint: "Invites accepted, contributor activity" },
];

const CHANNELS: { key: NotificationChannel; label: string }[] = [{ key: "email", label: "Email" }];

/** Is (category, channel) enabled? Absence of an override means on. */
function isEnabled(prefs: NotificationPreference[], category: string, channel: NotificationChannel) {
  const row = prefs.find(
    (p) => (p.category === category || p.category === "all") && p.channel === channel,
  );
  return row ? row.enabled : true;
}

/**
 * Per-category email opt-outs. Drop-in panel for the account/settings area.
 * Reads and writes the same preferences the backend enforces at send time.
 */
export function NotificationSettings() {
  const queryClient = useQueryClient();
  const key = queryKeys.notifications.preferences();

  const query = useQuery({
    queryKey: key,
    queryFn: () => notificationService.getPreferences(),
    staleTime: 60 * 1000,
  });

  const setPref = useMutation({
    mutationFn: (pref: NotificationPreference) => notificationService.setPreference(pref),
    onSuccess: (prefs) => queryClient.setQueryData(key, prefs),
    onError: () => toast.error("Couldn't update that. Try again."),
  });

  const prefs = query.data ?? [];

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold">Notification preferences</h3>
        <p className="text-xs text-muted-foreground">
          In-app notifications always appear in your bell. Choose what also reaches you by email.
        </p>
      </div>

      <div className="divide-y rounded-lg border">
        {CATEGORIES.map((cat) => (
          <div key={cat.key} className="flex items-center justify-between gap-4 px-4 py-3">
            <div className="min-w-0">
              <p className="text-sm font-medium">{cat.label}</p>
              <p className="text-xs text-muted-foreground">{cat.hint}</p>
            </div>
            <div className="flex shrink-0 items-center gap-3">
              {CHANNELS.map((ch) => {
                const enabled = isEnabled(prefs, cat.key, ch.key);
                return (
                  <button
                    key={ch.key}
                    type="button"
                    role="switch"
                    aria-checked={enabled}
                    aria-label={`${ch.label} for ${cat.label}`}
                    disabled={setPref.isPending}
                    onClick={() =>
                      setPref.mutate({ category: cat.key, channel: ch.key, enabled: !enabled })
                    }
                    className={cn(
                      "relative h-6 w-11 rounded-full transition-colors",
                      enabled ? "bg-primary" : "bg-muted-foreground/30",
                    )}
                  >
                    <span
                      className={cn(
                        "absolute top-0.5 size-5 rounded-full bg-white shadow transition-transform",
                        enabled ? "translate-x-5" : "translate-x-0.5",
                      )}
                    />
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
