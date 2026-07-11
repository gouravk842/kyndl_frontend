"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { MessageSquare, MessagesSquare, Star } from "lucide-react";
import { toast } from "sonner";

import { queryKeys } from "@/constants/query-keys";
import { cn } from "@/lib/utils";
import { creationService } from "@/services/creations/creation.service";
import type { ApiError } from "@/types/api";
import type { UpdateCreationPayload } from "@/types/creation";

interface InteractionSettingsProps {
  /** The saved creation to configure. Null before the first save. */
  creationId: string | null;
  className?: string;
}

/**
 * Owner control for the three audience-interaction surfaces on any creation:
 * comments, ratings & reviews, and private 1:1 chat. All three are plain
 * Creation model flags, orthogonal to each builder's content document, so this
 * persists them straight through a partial creation PATCH — nothing touches a
 * builder store. Drop it into any builder or the workspace's Share tab; it's
 * inert until the creation has been saved once.
 */
export function InteractionSettings({ creationId, className }: InteractionSettingsProps) {
  const queryClient = useQueryClient();
  const key = queryKeys.creations.detail(creationId ?? undefined);

  const query = useQuery({
    queryKey: key,
    queryFn: () => creationService.get(creationId as string),
    enabled: Boolean(creationId),
    staleTime: Infinity,
  });

  const mutation = useMutation({
    mutationFn: (patch: UpdateCreationPayload) =>
      creationService.update(creationId as string, patch),
    onSuccess: (updated) => {
      queryClient.setQueryData(key, updated);
    },
    onError: (error) => {
      toast.error(
        (error as unknown as ApiError)?.message ??
          "Couldn't update interaction settings.",
      );
    },
  });

  if (!creationId) {
    return (
      <p className="px-1 text-xs text-muted-foreground">
        Save this keepsake first to let people react to it.
      </p>
    );
  }

  const commentsOn = query.data?.comments_enabled ?? true;
  const reviewsOn = query.data?.reviews_enabled ?? true;
  const chatOn = query.data?.chat_enabled ?? false;
  const busy = mutation.isPending || query.isLoading;

  return (
    <div className={cn("space-y-2", className)}>
      <ToggleRow
        icon={<MessageSquare className="size-4" />}
        label="Comments"
        hint="Let people you share this with leave comments."
        checked={commentsOn}
        disabled={busy}
        onChange={(v) => mutation.mutate({ comments_enabled: v })}
      />
      <ToggleRow
        icon={<Star className="size-4" />}
        label="Ratings & reviews"
        hint="Let viewers rate this keepsake and leave a review."
        checked={reviewsOn}
        disabled={busy}
        onChange={(v) => mutation.mutate({ reviews_enabled: v })}
      />
      <ToggleRow
        icon={<MessagesSquare className="size-4" />}
        label="Private chat"
        hint="Allow a private 1:1 chat between you and each guest."
        checked={chatOn}
        disabled={busy}
        onChange={(v) => mutation.mutate({ chat_enabled: v })}
      />
    </div>
  );
}

interface ToggleRowProps {
  icon: React.ReactNode;
  label: string;
  hint: string;
  checked: boolean;
  disabled?: boolean;
  onChange: (value: boolean) => void;
}

function ToggleRow({ icon, label, hint, checked, disabled, onChange }: ToggleRowProps) {
  return (
    <div className="flex items-start justify-between gap-3 rounded-xl border border-[#f2dace] bg-white/60 p-3">
      <div className="flex min-w-0 flex-1 items-start gap-2">
        <span className="mt-0.5 shrink-0 text-[#b9744f]">{icon}</span>
        <div className="min-w-0">
          <p className="text-sm font-medium text-[#5b3b2e]">{label}</p>
          <p className="text-xs text-[#9c7a68]">{hint}</p>
        </div>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative mt-0.5 h-6 w-11 shrink-0 rounded-full transition-colors",
          checked ? "bg-[#c67b53]" : "bg-[#e4d3c7]",
          disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer",
        )}
      >
        <span
          className="absolute top-0.5 size-5 rounded-full bg-white shadow-sm transition-[left] duration-200"
          style={{ left: checked ? "calc(100% - 1.375rem)" : "0.125rem" }}
        />
      </button>
    </div>
  );
}
