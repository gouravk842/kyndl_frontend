"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { queryKeys } from "@/constants/query-keys";
import { collaborationService } from "@/services/collaboration/collaboration.service";
import type { ApiError } from "@/types/api";
import type {
  CollaborationRole,
  CollaborationRoster,
  CollaborationTargetType,
  InviteInput,
} from "@/types/collaboration";

function errorMessage(error: unknown, fallback: string): string {
  return (error as ApiError)?.message ?? fallback;
}

/** The roster + pending invites + viewer standing for a target (manage-only). */
export function useRoster(
  type: CollaborationTargetType,
  ref: string | null,
  enabled = true,
) {
  return useQuery({
    queryKey: queryKeys.collaboration.roster(type, ref ?? ""),
    queryFn: () => collaborationService.roster(type, ref as string),
    enabled: Boolean(ref) && enabled,
    staleTime: 30 * 1000,
    // A plain collaborator (no manage rights) gets a 403 — don't hammer retries.
    retry: false,
  });
}

/** Every mutation returns the refreshed roster, which we write straight to cache. */
function useRosterMutation<TVars>(
  type: CollaborationTargetType,
  ref: string | null,
  mutationFn: (vars: TVars) => Promise<CollaborationRoster>,
  messages: { success?: string; error: string },
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: (roster) => {
      if (ref) {
        queryClient.setQueryData(queryKeys.collaboration.roster(type, ref), roster);
      }
      if (messages.success) toast.success(messages.success);
    },
    onError: (error) => {
      toast.error(errorMessage(error, messages.error));
    },
  });
}

export function useInvite(type: CollaborationTargetType, ref: string | null) {
  return useRosterMutation<InviteInput>(
    type,
    ref,
    (input) => collaborationService.invite(type, ref as string, input),
    { success: "Invitation sent.", error: "Could not send the invitation." },
  );
}

export function useChangeRole(type: CollaborationTargetType, ref: string | null) {
  return useRosterMutation<{ seatId: string; role: CollaborationRole }>(
    type,
    ref,
    ({ seatId, role }) => collaborationService.changeRole(type, ref as string, seatId, role),
    { success: "Role updated.", error: "Could not update the role." },
  );
}

export function useRemoveCollaborator(type: CollaborationTargetType, ref: string | null) {
  return useRosterMutation<string>(
    type,
    ref,
    (seatId) => collaborationService.remove(type, ref as string, seatId),
    { success: "Collaborator removed.", error: "Could not remove the collaborator." },
  );
}

export function useRevokeInvite(type: CollaborationTargetType, ref: string | null) {
  return useRosterMutation<string>(
    type,
    ref,
    (inviteId) => collaborationService.revokeInvite(type, ref as string, inviteId),
    { success: "Invitation withdrawn.", error: "Could not withdraw the invitation." },
  );
}

/** Accept an invitation by token — used by the standalone accept page. */
export function useAcceptInvite() {
  return useMutation({
    mutationFn: (token: string) => collaborationService.accept(token),
  });
}
