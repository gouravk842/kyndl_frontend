"use client";

import { MoreHorizontal } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useDeleteMemory } from "@/hooks/use-memory-bank";
import { cn } from "@/lib/utils";
import type { BankMemory } from "@/types/memory-bank";

import { MemoryTransfer } from "./memory-transfer";

export function MemoryActions({
  circleId,
  circleName,
  memory,
  onEdit,
  onConvert,
  light = false,
}: {
  circleId: string;
  circleName: string;
  memory: BankMemory;
  onEdit: () => void;
  onConvert?: () => void;
  light?: boolean;
}) {
  const remove = useDeleteMemory(circleId);
  const [confirming, setConfirming] = useState(false);
  const [transfer, setTransfer] = useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              size="icon-sm"
              variant="ghost"
              aria-label="Memory actions"
              className={cn(light && "text-[#FFF7F1] hover:bg-white/10")}
            >
              <MoreHorizontal />
            </Button>
          }
        />
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={onEdit}>Edit</DropdownMenuItem>
          <DropdownMenuItem onClick={() => setTransfer(true)}>
            Move or copy
          </DropdownMenuItem>
          {onConvert ? (
            <DropdownMenuItem onClick={onConvert}>
              Convert to feature
            </DropdownMenuItem>
          ) : null}
          <DropdownMenuItem
            variant="destructive"
            onClick={() => setConfirming(true)}
          >
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <ConfirmDialog
        open={confirming}
        onOpenChange={setConfirming}
        title={memory.title ? `Delete ${memory.title}?` : "Delete this memory?"}
        description={`It leaves ${circleName} and waits in the trash, where you can put it back.`}
        confirmLabel="Move to trash"
        destructive
        busy={remove.isPending}
        onConfirm={() => {
          setConfirming(false);
          remove.mutate(memory.id);
        }}
      />
      {transfer ? (
        <div
          className={cn(
            light
              ? "fixed inset-x-0 bottom-0 z-[60] border-t border-[#F2DACE] bg-[#FFF7F1] p-4 text-[#3A2A25]"
              : "mt-3",
          )}
        >
          <MemoryTransfer
            circleId={circleId}
            memoryId={memory.id}
            onDone={() => setTransfer(false)}
          />
          {light ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="mt-2"
              onClick={() => setTransfer(false)}
            >
              Close
            </Button>
          ) : null}
        </div>
      ) : null}
    </>
  );
}
