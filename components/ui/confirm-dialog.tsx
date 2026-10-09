"use client";

import { AlertDialog as AlertDialogPrimitive } from "@base-ui/react/alert-dialog";
import type * as React from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * A modal the user has to read before something irreversible happens.
 *
 * `window.confirm` is easy to dismiss by reflex and cannot say what is about
 * to be lost, which is the whole point when the thing at stake is someone's
 * only copy of a memory.
 */
export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  destructive = false,
  busy = false,
  onConfirm,
  secondaryLabel,
  onSecondary,
  secondaryDestructive = false,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  busy?: boolean;
  onConfirm: () => void;
  secondaryLabel?: string;
  onSecondary?: () => void;
  secondaryDestructive?: boolean;
}) {
  return (
    <AlertDialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <AlertDialogPrimitive.Portal>
        <AlertDialogPrimitive.Backdrop className="fixed inset-0 z-50 bg-black/20 transition-opacity duration-150 data-ending-style:opacity-0 data-starting-style:opacity-0 supports-backdrop-filter:backdrop-blur-xs" />
        <AlertDialogPrimitive.Popup className="fixed top-1/2 left-1/2 z-50 w-[calc(100vw-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-3xl border border-[#F2DACE] bg-[#FFF7F1] p-6 transition duration-150 data-ending-style:scale-95 data-ending-style:opacity-0 data-starting-style:scale-95 data-starting-style:opacity-0">
          <AlertDialogPrimitive.Title className="font-display text-2xl text-[#3A2A25]">
            {title}
          </AlertDialogPrimitive.Title>
          <AlertDialogPrimitive.Description
            render={<div />}
            className="mt-2 text-sm leading-relaxed text-[#7A6258]"
          >
            {description}
          </AlertDialogPrimitive.Description>
          <div className="mt-6 flex flex-wrap justify-end gap-2">
            <AlertDialogPrimitive.Close
              render={<Button variant="ghost" disabled={busy} />}
            >
              {cancelLabel}
            </AlertDialogPrimitive.Close>
            {secondaryLabel && onSecondary ? (
              <Button
                type="button"
                onClick={onSecondary}
                disabled={busy}
                className={cn(
                  secondaryDestructive &&
                    "bg-[#B11226] text-white hover:bg-[#8E0E1E]",
                )}
              >
                {secondaryLabel}
              </Button>
            ) : null}
            <Button
              type="button"
              onClick={onConfirm}
              disabled={busy}
              className={cn(
                destructive && "bg-[#B11226] text-white hover:bg-[#8E0E1E]",
              )}
            >
              {confirmLabel}
            </Button>
          </div>
        </AlertDialogPrimitive.Popup>
      </AlertDialogPrimitive.Portal>
    </AlertDialogPrimitive.Root>
  );
}
