import { apiRequest } from "@/services/api/client";
import type {
  AcceptResult,
  CollaborationRole,
  CollaborationRoster,
  CollaborationTargetType,
  InviteInput,
} from "@/types/collaboration";

// Same-origin Next BFF, which forwards to Django with the httpOnly access cookie
// as a bearer token. One generic surface serves any collaboratable target —
// `type` + `ref` name it.
const BASE = "/collaboration";

export const collaborationService = {
  // The roster + pending invites + the viewer's own standing. Manage-only on the
  // server, so this 403s for a plain collaborator.
  roster(type: CollaborationTargetType, ref: string) {
    return apiRequest<CollaborationRoster>({
      method: "GET",
      url: `${BASE}/${type}/${encodeURIComponent(ref)}/collaborators`,
    });
  },

  // Invite someone by email at a role. Returns the refreshed roster.
  invite(type: CollaborationTargetType, ref: string, input: InviteInput) {
    return apiRequest<CollaborationRoster>({
      method: "POST",
      url: `${BASE}/${type}/${encodeURIComponent(ref)}/collaborators`,
      data: input,
    });
  },

  // Change an existing collaborator's role.
  changeRole(
    type: CollaborationTargetType,
    ref: string,
    seatId: string,
    role: CollaborationRole,
  ) {
    return apiRequest<CollaborationRoster>({
      method: "PATCH",
      url: `${BASE}/${type}/${encodeURIComponent(ref)}/collaborators/${seatId}`,
      data: { role },
    });
  },

  // Remove a collaborator's seat.
  remove(type: CollaborationTargetType, ref: string, seatId: string) {
    return apiRequest<CollaborationRoster>({
      method: "DELETE",
      url: `${BASE}/${type}/${encodeURIComponent(ref)}/collaborators/${seatId}`,
    });
  },

  // Withdraw a still-pending invitation.
  revokeInvite(type: CollaborationTargetType, ref: string, inviteId: string) {
    return apiRequest<CollaborationRoster>({
      method: "DELETE",
      url: `${BASE}/${type}/${encodeURIComponent(ref)}/invites/${inviteId}`,
    });
  },

  // Accept an invitation as the signed-in (invited) user.
  accept(token: string) {
    return apiRequest<AcceptResult>({
      method: "POST",
      url: `${BASE}/invites/${encodeURIComponent(token)}/accept`,
    });
  },
};
