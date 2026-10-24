"use client";

import { Check, Copy, MessageCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { copyToClipboard, whatsappShareHref } from "@/lib/share-link";

/**
 * WhatsApp + copy for a published keepsake. Callers pass `onBeforeSend` to
 * persist access (or block invite-only with no emails) before anything is
 * copied or opened.
 */
export function ShareSendActions({
  url,
  title,
  copiedMessage = "Link copied — anyone with it can open it.",
  onBeforeSend,
}: {
  url: string;
  title?: string;
  copiedMessage?: string;
  onBeforeSend?: () => boolean | Promise<boolean>;
}) {
  const [copied, setCopied] = useState(false);
  const [busy, setBusy] = useState(false);

  async function prepare(): Promise<boolean> {
    if (!onBeforeSend) return true;
    return onBeforeSend();
  }

  async function handleCopy() {
    if (busy) return;
    setBusy(true);
    try {
      if (!(await prepare())) return;
      const ok = await copyToClipboard(url);
      if (!ok) {
        toast.error("Could not copy the link.");
        return;
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
      toast.success(copiedMessage);
    } finally {
      setBusy(false);
    }
  }

  async function handleWhatsApp() {
    if (busy) return;
    setBusy(true);
    try {
      if (!(await prepare())) return;
      window.open(
        whatsappShareHref(url, title),
        "_blank",
        "noopener,noreferrer",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        type="button"
        onClick={() => void handleWhatsApp()}
        disabled={busy}
      >
        <MessageCircle className="size-4" />
        Send on WhatsApp
      </Button>
      <Button
        type="button"
        variant="secondary"
        onClick={() => void handleCopy()}
        disabled={busy}
      >
        {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
        {copied ? "Copied" : "Copy link"}
      </Button>
    </div>
  );
}
