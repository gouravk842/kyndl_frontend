"use client";

import { ArrowLeft, Library, Loader2, Undo2 } from "lucide-react";
import Link from "next/link";

import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import { previewLine } from "@/features/memory-bank/lib/preview";
import {
  useMemoryTrash,
  useRestoreCircle,
  useRestoreMemory,
} from "@/hooks/use-memory-bank";

function daysLeft(purgesOn: string): string {
  const ms = new Date(purgesOn).getTime() - Date.now();
  const days = Math.ceil(ms / (1000 * 60 * 60 * 24));
  if (days <= 0) return "Goes today";
  if (days === 1) return "1 day left";
  return `${days} days left`;
}

export function MemoryTrashView() {
  const trash = useMemoryTrash();
  const restoreCircle = useRestoreCircle();
  const restoreMemory = useRestoreMemory();

  const circles = trash.data?.circles ?? [];
  const memories = trash.data?.memories ?? [];
  const empty = !circles.length && !memories.length;

  return (
    <>
      <PageHeader
        compact
        eyebrow="Memory bank"
        title="Trash"
        subtitle={
          trash.data
            ? `Anything you delete waits here for ${trash.data.retention_days} days before it goes for good.`
            : "Anything you delete waits here before it goes for good."
        }
      />

      <PageContainer size="lg" className="space-y-8 py-8 md:py-10">
        <Link
          href={ROUTES.memories}
          className="inline-flex items-center gap-1 text-sm text-[#7A6258] hover:text-[#3A2A25]"
        >
          <ArrowLeft className="size-4" />
          All banks
        </Link>

        {trash.isPending ? (
          <div className="flex justify-center py-16 text-[#C75B39]">
            <Loader2 className="size-6 animate-spin" />
          </div>
        ) : trash.isError ? (
          <div className="py-16 text-center">
            <p className="text-[#7A6258]">We couldn&apos;t open the trash.</p>
            <Button
              type="button"
              variant="outline"
              className="mt-4"
              onClick={() => trash.refetch()}
            >
              Try again
            </Button>
          </div>
        ) : empty ? (
          <div className="rounded-3xl border border-dashed border-[#F2DACE] bg-white/60 py-16 text-center">
            <Library className="mx-auto size-10 text-[#E3A78C]" />
            <p className="mt-4 font-display text-xl text-[#3A2A25]">
              Nothing here
            </p>
            <p className="mx-auto mt-2 max-w-sm text-sm text-[#7A6258]">
              When you delete a circle or a memory it waits here, so a wrong tap
              is never the end of it.
            </p>
          </div>
        ) : (
          <div className="space-y-10">
            {circles.length ? (
              <section>
                <h2 className="font-display text-2xl text-[#3A2A25]">
                  Circles
                </h2>
                <ul className="mt-3 flex flex-col gap-2">
                  {circles.map((circle) => (
                    <li
                      key={circle.id}
                      className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#F2DACE] bg-white/80 px-4 py-3"
                    >
                      <div className="min-w-0">
                        <p className="font-display text-xl text-[#3A2A25]">
                          {circle.name}
                        </p>
                        <p className="text-sm text-[#7A6258]">
                          {circle.memory_count === 1
                            ? "1 memory"
                            : `${circle.memory_count} memories`}{" "}
                          · {daysLeft(circle.purges_on)}
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={restoreCircle.isPending}
                        onClick={() => restoreCircle.mutate(circle.id)}
                      >
                        <Undo2 className="size-4" />
                        Put back
                      </Button>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}

            {memories.length ? (
              <section>
                <h2 className="font-display text-2xl text-[#3A2A25]">
                  Memories
                </h2>
                <ul className="mt-3 flex flex-col gap-2">
                  {memories.map((memory) => (
                    <li
                      key={memory.id}
                      className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#F2DACE] bg-white/80 px-4 py-3"
                    >
                      <div className="min-w-0">
                        <p className="text-sm text-[#3A2A25]">
                          {previewLine(memory)}
                        </p>
                        <p className="text-sm text-[#7A6258]">
                          From {memory.circle.name} ·{" "}
                          {daysLeft(memory.purges_on)}
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={restoreMemory.isPending}
                        onClick={() => restoreMemory.mutate(memory.id)}
                      >
                        <Undo2 className="size-4" />
                        Put back
                      </Button>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}
          </div>
        )}
      </PageContainer>
    </>
  );
}
