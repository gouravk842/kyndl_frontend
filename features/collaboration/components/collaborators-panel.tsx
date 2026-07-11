"use client";

import { Loader2, Mail, Trash2, UserPlus } from "lucide-react";
import { useState } from "react";

import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type {
  CollaborationRole,
  CollaborationTargetType,
  Collaborator,
  PendingInvite,
} from "@/types/collaboration";

import {
  useChangeRole,
  useInvite,
  useRemoveCollaborator,
  useRevokeInvite,
  useRoster,
} from "../hooks/use-collaboration";

const ROLE_OPTIONS: { value: CollaborationRole; label: string }[] = [
  { value: "contributor", label: "Contributor" },
  { value: "admin", label: "Admin" },
];

const ROLE_HINT: Record<CollaborationRole, string> = {
  contributor: "Can add their own memories.",
  admin: "Full access, including inviting others.",
};

interface CollaboratorsPanelProps {
  targetType: CollaborationTargetType;
  /** Public handle of the target (a creation id). Null before the first save. */
  refId: string | null;
  className?: string;
}

/**
 * Drop-in collaborators panel for any collaboratable target. Lists the seats and
 * pending invites, and lets an owner/admin invite by email, change roles and
 * revoke access. Self-contained — give it a `targetType` + `refId` and it manages
 * its own data. The roster endpoint is manage-only, so a non-manager just sees a
 * short note rather than the controls.
 */
export function CollaboratorsPanel({ targetType, refId, className }: CollaboratorsPanelProps) {
  const roster = useRoster(targetType, refId);

  if (!refId) {
    return (
      <p className={cn("text-xs text-muted-foreground", className)}>
        Save first to invite people to help.
      </p>
    );
  }

  if (roster.isLoading) {
    return (
      <div className={cn("space-y-2", className)}>
        <Skeleton className="h-10 w-full rounded-xl" />
        <Skeleton className="h-10 w-full rounded-xl" />
      </div>
    );
  }

  if (roster.isError || !roster.data) {
    return (
      <p className={cn("text-xs text-muted-foreground", className)}>
        Only the owner or an admin can manage who helps with this.
      </p>
    );
  }

  const { collaborators, pending_invites: invites, viewer } = roster.data;
  const canManage = viewer.can_manage;

  return (
    <div className={cn("space-y-4", className)}>
      {canManage && <InviteForm targetType={targetType} refId={refId} />}

      <ul className="space-y-2">
        {collaborators.map((c) => (
          <CollaboratorRow
            key={c.id}
            targetType={targetType}
            refId={refId}
            collaborator={c}
            canManage={canManage}
          />
        ))}
        {invites.map((i) => (
          <InviteRow
            key={i.id}
            targetType={targetType}
            refId={refId}
            invite={i}
            canManage={canManage}
          />
        ))}
      </ul>

      {collaborators.length === 0 && invites.length === 0 && (
        <p className="text-xs text-muted-foreground">
          No collaborators yet. Invite someone to add their memories.
        </p>
      )}
    </div>
  );
}

// ── Invite form ───────────────────────────────────────────────────────────────
function InviteForm({
  targetType,
  refId,
}: {
  targetType: CollaborationTargetType;
  refId: string;
}) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<CollaborationRole>("contributor");
  const invite = useInvite(targetType, refId);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed) return;
    invite.mutate(
      { email: trimmed, role },
      { onSuccess: () => setEmail("") },
    );
  };

  return (
    <form onSubmit={onSubmit} className="space-y-2 rounded-xl border border-border bg-card p-3">
      <div className="flex items-center gap-2">
        <Mail className="size-4 shrink-0 text-muted-foreground" />
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="friend@email.com"
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
      </div>
      <div className="flex items-center gap-2">
        <RoleSelect value={role} onChange={setRole} />
        <button
          type="submit"
          disabled={invite.isPending || !email.trim()}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {invite.isPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <UserPlus className="size-4" />
          )}
          Invite
        </button>
      </div>
      <p className="text-xs text-muted-foreground">{ROLE_HINT[role]}</p>
    </form>
  );
}

// ── Rows ──────────────────────────────────────────────────────────────────────
function CollaboratorRow({
  targetType,
  refId,
  collaborator,
  canManage,
}: {
  targetType: CollaborationTargetType;
  refId: string;
  collaborator: Collaborator;
  canManage: boolean;
}) {
  const changeRole = useChangeRole(targetType, refId);
  const remove = useRemoveCollaborator(targetType, refId);
  const busy = changeRole.isPending || remove.isPending;

  return (
    <li className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card p-3">
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-foreground">
          {collaborator.user_name}
          {collaborator.is_me && (
            <span className="ml-1.5 text-xs text-muted-foreground">(you)</span>
          )}
        </p>
        <p className="truncate text-xs text-muted-foreground">{collaborator.user_email}</p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {canManage && !collaborator.is_me ? (
          <>
            <RoleSelect
              value={collaborator.role}
              disabled={busy}
              onChange={(role) => changeRole.mutate({ seatId: collaborator.id, role })}
            />
            <IconButton
              label="Remove collaborator"
              disabled={busy}
              onClick={() => remove.mutate(collaborator.id)}
            />
          </>
        ) : (
          <RoleBadge role={collaborator.role} />
        )}
      </div>
    </li>
  );
}

function InviteRow({
  targetType,
  refId,
  invite,
  canManage,
}: {
  targetType: CollaborationTargetType;
  refId: string;
  invite: PendingInvite;
  canManage: boolean;
}) {
  const revoke = useRevokeInvite(targetType, refId);

  return (
    <li className="flex items-center justify-between gap-3 rounded-xl border border-dashed border-border bg-card/60 p-3">
      <div className="min-w-0">
        <p className="truncate text-sm text-foreground">{invite.email}</p>
        <p className="text-xs text-muted-foreground">Invited · pending</p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <RoleBadge role={invite.role} />
        {canManage && (
          <IconButton
            label="Withdraw invitation"
            disabled={revoke.isPending}
            onClick={() => revoke.mutate(invite.id)}
          />
        )}
      </div>
    </li>
  );
}

// ── Small building blocks ───────────────────────────────────────────────────────
function RoleSelect({
  value,
  onChange,
  disabled,
}: {
  value: CollaborationRole;
  onChange: (role: CollaborationRole) => void;
  disabled?: boolean;
}) {
  return (
    <select
      value={value}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value as CollaborationRole)}
      aria-label="Role"
      className="rounded-lg border border-border bg-background px-2 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
    >
      {ROLE_OPTIONS.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

function RoleBadge({ role }: { role: CollaborationRole }) {
  return (
    <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground capitalize">
      {role}
    </span>
  );
}

function IconButton({
  label,
  onClick,
  disabled,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      disabled={disabled}
      className="grid size-8 shrink-0 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
    >
      <Trash2 className="size-4" />
    </button>
  );
}
