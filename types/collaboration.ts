// Collaboration & roles — mirrors the Django `collaboration` app's REST shapes.
// One generic surface serves any collaboratable target; `targetType` + `refId`
// name it (today only "creation", a memory page).

export type CollaborationRole = "contributor" | "admin";

export type CollaborationCapability =
  | "view"
  | "contribute"
  | "edit"
  | "manage"
  | "manage_collaborators";

/** Registered collaboratable kinds. Widen as the backend registers more. */
export type CollaborationTargetType = "creation";

/** The viewer's effective role: an accepted seat, or the synthetic "owner". */
export type ViewerRole = "owner" | CollaborationRole | null;

export interface Collaborator {
  id: string;
  user_name: string;
  user_email: string;
  role: CollaborationRole;
  is_me: boolean;
  created_at: string;
}

export interface PendingInvite {
  id: string;
  email: string;
  role: CollaborationRole;
  status: "pending" | "accepted" | "revoked";
  created_at: string;
}

export interface CollaborationTarget {
  type: string;
  name: string;
  id?: string;
  experience_type?: string;
}

/** Everything the collaborators panel renders from a single call. */
export interface CollaborationRoster {
  target: CollaborationTarget;
  collaborators: Collaborator[];
  pending_invites: PendingInvite[];
  viewer: {
    role: ViewerRole;
    capabilities: CollaborationCapability[];
    can_manage: boolean;
  };
}

export interface InviteInput {
  email: string;
  role: CollaborationRole;
}

export interface AcceptResult {
  role: CollaborationRole;
  target: CollaborationTarget | null;
}
