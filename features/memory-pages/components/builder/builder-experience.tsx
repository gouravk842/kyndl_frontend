"use client";

import { useEffect, useState } from "react";

import { useMemoryPagesSync } from "@/hooks/use-memory-pages-sync";
import { useAuthStore } from "@/store/auth.store";

import { useBuilderStore } from "../../store/builder.store";
import { BuilderPreview, FullscreenPreview } from "./builder-preview";
import { BuilderSidebar } from "./builder-sidebar";
import { MemoryDialog } from "./memory-dialog";

/**
 * The Memory Pages builder, laid out like a standard admin panel: a settings
 * side panel on the left holds every album-level control and the memory list,
 * while the main stage renders the real, page-turning book with all its
 * effects. Adding a memory is a popup; the store packs memories onto album
 * leaves automatically, and the live book turns to whatever was just added.
 */
export function BuilderExperience() {
  const sync = useMemoryPagesSync();
  // Server stamps authorId as the stringified user id; match that shape.
  const userId = useAuthStore((s) => (s.user ? String(s.user.id) : null));
  const setViewer = useBuilderStore((s) => s.setViewer);
  const [dialog, setDialog] = useState<{ open: boolean; id: string | null }>({
    open: false,
    id: null,
  });
  const [focusId, setFocusId] = useState<string | null>(null);
  const [fullscreen, setFullscreen] = useState(false);

  // Teach the store who's editing, so it can attribute new memories and gate a
  // contributor to editing only their own.
  useEffect(() => {
    setViewer(userId, sync.myRole);
  }, [userId, sync.myRole, setViewer]);

  const openAdd = () => setDialog({ open: true, id: null });
  const openEdit = (id: string) => setDialog({ open: true, id });

  return (
    <div className="flex h-[calc(100dvh-4rem)] w-full flex-col lg:flex-row">
      <div className="h-1/2 w-full shrink-0 border-b border-[#f2dace] lg:h-full lg:w-[360px] lg:border-r lg:border-b-0">
        <BuilderSidebar
          sync={sync}
          onAdd={openAdd}
          onEdit={openEdit}
          activeId={focusId}
        />
      </div>

      <BuilderPreview
        focusId={focusId}
        onFullscreen={() => setFullscreen(true)}
      />

      <MemoryDialog
        open={dialog.open}
        onOpenChange={(open) => setDialog((d) => ({ ...d, open }))}
        memoryId={dialog.id}
        canUpload={sync.enabled}
        onSaved={setFocusId}
      />

      {fullscreen && <FullscreenPreview onClose={() => setFullscreen(false)} />}
    </div>
  );
}
