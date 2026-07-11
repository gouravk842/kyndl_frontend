"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { queryKeys } from "@/constants/query-keys";
import { creationService } from "@/services/creations/creation.service";
import { useAuthStore } from "@/store/auth.store";

export type SyncStatus =
  | "disabled" // signed out — local draft only
  | "loading" // fetching an existing creation
  | "idle" // signed in, nothing to save yet
  | "saving"
  | "saved"
  | "error";

export interface CreationSync {
  status: SyncStatus;
  /** True once the user is signed in and cloud sync is active. */
  enabled: boolean;
  creationId: string | null;
  /**
   * The signed-in user's standing on the loaded creation: `owner`, `admin`,
   * `contributor`, or null. A not-yet-saved draft has no record yet, so its
   * creator is treated as `owner`.
   */
  myRole: "owner" | "admin" | "contributor" | null;
  /** True when the local document has edits not yet saved to the server. */
  dirty: boolean;
  /** Persist the current document (creates the record on first save). */
  save: () => void;
}

/** What a feature must provide to sync its builder store to the backend. */
export interface CreationSyncConfig<TContent> {
  /** Registered experience slug, e.g. "memory-jar". */
  type: string;
  /** The live builder document from the feature's store (new ref per edit). */
  doc: TContent;
  /**
   * Loads a server document back into the feature's store. The optional
   * `assets` map (fileId → presigned URL) is passed for media-bearing types;
   * stores that don't render media simply ignore it.
   */
  load: (content: TContent, assets?: Record<string, string>) => void;
  /** Derives the dashboard card title from the document. */
  makeTitle: (content: TContent) => string;
}

/**
 * The single backend-sync engine behind every experience builder. Each feature
 * wraps this with its own store selectors (see `hooks/use-*-sync.ts`); the
 * create/load/save/dirty/URL-stamping logic lives here, once.
 *
 * - Signed out: a no-op (`disabled`). The store's localStorage persistence keeps
 *   the on-device draft, so nothing regresses.
 * - Signed in: loads an existing creation when `?id=` is present and saves on
 *   demand. The first save creates the record and stamps its id into the URL so
 *   a refresh reopens the same creation. Edits are tracked by reference identity
 *   against the last-saved document, so the UI shows an explicit Save button.
 */
export function useCreationSync<TContent>(
  config: CreationSyncConfig<TContent>,
): CreationSync {
  const { type, doc, load, makeTitle } = config;

  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isHydrated = useAuthStore((s) => s.isHydrated);

  const enabled = isHydrated && isAuthenticated;

  const [creationId, setCreationId] = useState<string | null>(() =>
    searchParams.get("id"),
  );
  // The document reference last persisted (or loaded). The store produces a
  // fresh object on every edit, so an identity check tells us whether there are
  // unsaved changes without deep-comparing.
  const [savedDoc, setSavedDoc] = useState<TContent | null>(null);

  // ----------------------------------------------------- load existing record
  const detailQuery = useQuery({
    queryKey: queryKeys.creations.detail(creationId ?? undefined),
    queryFn: () => creationService.get<TContent>(creationId as string),
    enabled: enabled && !!creationId,
    staleTime: Infinity,
    refetchOnMount: false,
  });

  useEffect(() => {
    if (!detailQuery.data) return;
    const { content, assets } = detailQuery.data;
    const urls: Record<string, string> = {};
    for (const [fileId, asset] of Object.entries(assets ?? {})) {
      urls[fileId] = asset.url;
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect -- hydrate baseline from fetched data
    setSavedDoc(content);
    load(content, urls);
  }, [detailQuery.data, load]);

  // ------------------------------------------------------------- mutations
  const createMutation = useMutation({
    mutationFn: (content: TContent) =>
      creationService.create<TContent>({
        type,
        title: makeTitle(content),
        content,
      }),
    onSuccess: (creation) => {
      setCreationId(creation.id);
      // Reflect the id in the URL so a refresh reopens the same creation.
      const params = new URLSearchParams(searchParams.toString());
      params.set("id", creation.id);
      router.replace(`?${params.toString()}`, { scroll: false });
      queryClient.invalidateQueries({ queryKey: queryKeys.creations.all });
    },
    // Saving failed — drop the baseline so the change still reads as unsaved and
    // the Save button stays available for a retry.
    onError: () => setSavedDoc(null),
  });

  const updateMutation = useMutation({
    mutationFn: (content: TContent) =>
      creationService.update<TContent>(creationId as string, {
        title: makeTitle(content),
        content,
      }),
    onError: () => setSavedDoc(null),
  });

  const dirty = enabled && doc !== savedDoc;

  // Warn before leaving with unsaved edits, since saving is manual.
  useEffect(() => {
    if (!dirty) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [dirty]);

  const save = useCallback(() => {
    if (!enabled) return;
    if (createMutation.isPending || updateMutation.isPending) return;
    // Snapshot what we're saving and mark it the new baseline up front; edits
    // made while the request is in flight re-flag `dirty`.
    const snapshot = doc;
    setSavedDoc(snapshot);
    if (creationId) updateMutation.mutate(snapshot);
    else createMutation.mutate(snapshot);
  }, [enabled, creationId, doc, createMutation, updateMutation]);

  const isSaving = createMutation.isPending || updateMutation.isPending;
  const isError = createMutation.isError || updateMutation.isError;
  const hasSaved = createMutation.isSuccess || updateMutation.isSuccess;

  let status: SyncStatus;
  if (!enabled) status = "disabled";
  else if (creationId && detailQuery.isLoading) status = "loading";
  else if (isSaving) status = "saving";
  else if (isError) status = "error";
  else if (dirty) status = "idle";
  else if (hasSaved || detailQuery.isSuccess) status = "saved";
  else status = "idle";

  // A loaded creation reports the viewer's role; a brand-new draft (no record
  // yet) is being authored by its owner-to-be.
  const myRole = creationId ? (detailQuery.data?.my_role ?? null) : "owner";

  return { status, enabled, creationId, myRole, dirty, save };
}
