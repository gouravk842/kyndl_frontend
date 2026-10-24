"use client";

import { Eye, Globe, Lock, Plus, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useSetCreationAccess } from "@/hooks/use-creations";
import { canonicalShareUrl, guestCanOpen } from "@/lib/share-link";
import { cn } from "@/lib/utils";
import type { Creation, CreationVisibility } from "@/types/creation";

import { usePublishToShareGate } from "./publish-to-share-dialog";
import { ShareSendActions } from "./share-send-actions";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function AccessSheet({
  creation,
  open,
  onOpenChange,
}: {
  creation: Creation;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-full flex-col gap-0 sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Share &amp; access</SheetTitle>
          <SheetDescription>
            {creation.status === "published"
              ? "Anyone with the link can open this, unless you switch to invite-only."
              : "Publish so anyone with the link can open it. Invite-only is optional."}
          </SheetDescription>
        </SheetHeader>
        {/* `open` re-mounts the form so it re-seeds from the latest saved access. */}
        {open && (
          <AccessForm
            key={creation.id}
            creation={creation}
            onSaved={() => onOpenChange(false)}
            className="flex-1 overflow-y-auto"
          />
        )}
      </SheetContent>
    </Sheet>
  );
}

/**
 * The share-and-access editor, chrome-free so it works both inside the slide-over
 * `AccessSheet` (from a creation card) and inline as the workspace's "Share &
 * access" tab. Owns its own draft state, seeded once on mount — callers re-mount
 * (via `key`) when they need it re-seeded from freshly saved data.
 */
export function AccessForm({
  creation,
  onSaved,
  className,
}: {
  creation: Creation;
  onSaved?: () => void;
  className?: string;
}) {
  const setAccess = useSetCreationAccess();
  const { requirePublished, dialog, isDraft } = usePublishToShareGate(creation);

  const [visibility, setVisibility] = useState<CreationVisibility>(
    creation.visibility,
  );
  const [invites, setInvites] = useState<string[]>(creation.invites ?? []);
  const [email, setEmail] = useState("");

  const shareUrl = canonicalShareUrl(creation);

  function addEmail() {
    const next = email.trim().toLowerCase();
    if (!EMAIL_RE.test(next)) {
      toast.error("Enter a valid email address.");
      return;
    }
    if (!invites.includes(next)) setInvites((prev) => [...prev, next]);
    setEmail("");
  }

  function removeEmail(target: string) {
    setInvites((prev) => prev.filter((e) => e !== target));
  }

  function openShareLink() {
    window.open(shareUrl, "_blank", "noopener,noreferrer");
  }

  function handleSave() {
    if (!guestCanOpen(visibility, invites)) {
      toast.error("Add their email, or switch to anyone with the link.");
      return;
    }
    requirePublished(() => {
      setAccess.mutate(
        { id: creation.id, access: { visibility, invites } },
        { onSuccess: () => onSaved?.() },
      );
    });
  }

  async function ensureShareable(): Promise<boolean> {
    if (!guestCanOpen(visibility, invites)) {
      toast.error("Add their email, or switch to anyone with the link.");
      return false;
    }
    const saved = creation.invites ?? [];
    const dirty =
      visibility !== creation.visibility || !sameEmails(invites, saved);
    if (!dirty) return true;
    return new Promise((resolve) => {
      setAccess.mutate(
        { id: creation.id, access: { visibility, invites }, silent: true },
        {
          onSuccess: () => resolve(true),
          onError: () => resolve(false),
        },
      );
    });
  }

  return (
    <div className={cn("flex flex-col gap-0", className)}>
      {dialog}
      <div className="space-y-6 px-4 py-2">
        {isDraft && (
          <div className="rounded-xl border border-[#f2dace] bg-[#fff7f1] px-3 py-2.5 text-xs leading-relaxed text-[#7a6258]">
            Still a draft — publish before sharing the link or changing who can
            view it. Recipients get a blank page until you do.
          </div>
        )}
        {/* Visibility choice */}
        <div className="space-y-2">
          <Label>Who can view</Label>
          <div className="grid grid-cols-2 gap-2">
            <VisibilityOption
              active={visibility === "public"}
              onClick={() => setVisibility("public")}
              icon={<Globe className="size-4" />}
              title="Anyone with the link"
              subtitle="Public"
            />
            <VisibilityOption
              active={visibility === "invite"}
              onClick={() => setVisibility("invite")}
              icon={<Lock className="size-4" />}
              title="Only invited people"
              subtitle="Private"
            />
          </div>
        </div>

        {/* Invite list — only relevant for invite-only */}
        {visibility === "invite" && (
          <div className="space-y-2">
            <Label htmlFor="invite-email">Invited emails</Label>
            <div className="flex gap-2">
              <Input
                id="invite-email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addEmail();
                  }
                }}
              />
              <Button type="button" variant="secondary" onClick={addEmail}>
                <Plus className="size-4" />
                Add
              </Button>
            </div>
            {invites.length === 0 ? (
              <p className="text-xs text-muted-foreground">
                No one invited yet. They&apos;ll need to sign in with the
                invited email to view.
              </p>
            ) : (
              <ul className="space-y-1.5">
                {invites.map((e) => (
                  <li
                    key={e}
                    className="flex items-center justify-between rounded-lg bg-muted/60 px-3 py-1.5 text-sm"
                  >
                    <span className="truncate">{e}</span>
                    <button
                      type="button"
                      onClick={() => removeEmail(e)}
                      className="text-muted-foreground hover:text-destructive"
                      aria-label={`Remove ${e}`}
                    >
                      <X className="size-3.5" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* Share link */}
        <div className="space-y-2">
          <Label>Share link</Label>
          <div className="flex gap-2">
            <Input readOnly value={shareUrl} className="text-xs" />
            <Button
              type="button"
              variant="secondary"
              onClick={openShareLink}
              aria-label="Open share link"
            >
              <Eye className="size-4" />
            </Button>
          </div>
          {isDraft ? (
            <p className="text-xs text-muted-foreground">
              Recipients see an empty page until you publish. Preview opens it
              for you only.
            </p>
          ) : (
            <ShareSendActions
              url={shareUrl}
              title={creation.title}
              copiedMessage={
                visibility === "public"
                  ? "Link copied — anyone with it can open it."
                  : "Link copied — they need to sign in with the invited email."
              }
              onBeforeSend={ensureShareable}
            />
          )}
        </div>
      </div>

      <div className="mt-auto border-t px-4 py-3">
        <Button
          onClick={handleSave}
          disabled={setAccess.isPending}
          className="w-full sm:w-auto"
        >
          {setAccess.isPending
            ? "Saving…"
            : isDraft
              ? "Publish & save access"
              : "Save access"}
        </Button>
      </div>
    </div>
  );
}

function sameEmails(a: string[], b: string[]) {
  if (a.length !== b.length) return false;
  const set = new Set(a.map((email) => email.toLowerCase()));
  return b.every((email) => set.has(email.toLowerCase()));
}

function VisibilityOption({
  active,
  onClick,
  icon,
  title,
  subtitle,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex flex-col items-start gap-1 rounded-xl border p-3 text-left transition-colors",
        active
          ? "border-primary bg-primary/5 ring-1 ring-primary/30"
          : "border-foreground/10 hover:border-foreground/20",
      )}
    >
      <span className="flex items-center gap-1.5 text-foreground">{icon}</span>
      <span className="text-sm font-medium leading-tight">{title}</span>
      <span className="text-[11px] tracking-wide text-muted-foreground uppercase">
        {subtitle}
      </span>
    </button>
  );
}
