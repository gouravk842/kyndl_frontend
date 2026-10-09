"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  useCopyMemory,
  useMemoryCircles,
  useMoveMemory,
} from "@/hooks/use-memory-bank";
import type { MemoryCircle } from "@/types/memory-bank";

export function MemoryTransfer({
  circleId,
  memoryId,
  onDone,
}: {
  circleId: string;
  memoryId: string;
  onDone?: () => void;
}) {
  const circles = useMemoryCircles();
  const move = useMoveMemory(circleId);
  const copy = useCopyMemory(circleId);
  const [mode, setMode] = useState<"move" | "copy" | null>(null);
  const [destinationId, setDestinationId] = useState("");

  const destinations = (circles.data ?? []).filter(
    (circle: MemoryCircle) => circle.id !== circleId,
  );
  const busy = move.isPending || copy.isPending;

  function close() {
    setMode(null);
    setDestinationId("");
  }

  function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!mode || !destinationId || busy) return;
    const payload = { memoryId, destinationId };
    if (mode === "move") {
      move.mutate(payload, {
        onSuccess: () => {
          close();
          onDone?.();
        },
      });
    } else {
      copy.mutate(payload, {
        onSuccess: () => {
          close();
          onDone?.();
        },
      });
    }
  }

  if (!mode) {
    return (
      <div className="mt-3 flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setMode("move")}
          disabled={!destinations.length}
        >
          Move
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setMode("copy")}
          disabled={!destinations.length}
        >
          Copy
        </Button>
      </div>
    );
  }

  return (
    <form
      onSubmit={submit}
      className="mt-3 space-y-2 rounded-2xl border border-[#F2DACE] bg-[#FFF7F1]/70 p-3"
    >
      <p className="text-sm text-[#3A2A25]">
        {mode === "move"
          ? "Move this memory into another circle. It leaves this one."
          : "Copy this memory into another circle. Edits stay separate."}
      </p>
      <select
        value={destinationId}
        onChange={(event) => setDestinationId(event.target.value)}
        aria-label={mode === "move" ? "Move to circle" : "Copy to circle"}
        className="h-9 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        <option value="">Choose a circle</option>
        {destinations.map((circle) => (
          <option key={circle.id} value={circle.id}>
            {circle.is_loose ? `${circle.name} (unfiled)` : circle.name}
          </option>
        ))}
      </select>
      <div className="flex flex-wrap gap-2">
        <Button type="submit" size="sm" disabled={!destinationId || busy}>
          {mode === "move" ? "Move here" : "Copy here"}
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={close}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
