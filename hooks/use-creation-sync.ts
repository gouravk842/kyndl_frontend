"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

import { queryKeys } from "@/constants/query-keys";
import {
  minAssetExpiresIn,
  usePresignedAssetRefresh,
} from "@/hooks/use-presigned-asset-refresh";
import { creationService } from "@/services/creations/creation.service";
import { useAuthStore } from "@/store/auth.store";
import type { CreationAsset } from "@/types/creation";

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
   * Share token for `/v/<public_token>`, available after the first cloud save.
   * Null while signed out or before the creation record exists.
   */
  publicToken: string | null;
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

/** Zustand persist hydration helpers used to wipe a draft after rehydrate. */
export type DraftPersistApi = {
  hasHydrated: () => boolean;
  onFinishHydration: (fn: () => void) => () => void;
};

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
  /**
   * Clears the local builder draft. Required with `draftPersist` so a fresh
   * `/dashboard?new=<type>` does not reopen the last localStorage document.
   */
  resetDraft?: () => void;
  /** Persist hydration API for the feature store (Zustand `persist`). */
  draftPersist?: DraftPersistApi;
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
  const { type, doc, load, makeTitle, resetDraft, draftPersist } = config;

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

  // A fresh `?new=<type>` must not reopen the last persisted draft. Wait for
  // Zustand rehydrate so a late localStorage merge cannot undo the wipe.
  // Sync hooks pass inline helpers — keep latest via effect-updated refs.
  const resetDraftRef = useRef(resetDraft);
  const draftPersistRef = useRef(draftPersist);
  useEffect(() => {
    resetDraftRef.current = resetDraft;
    draftPersistRef.current = draftPersist;
  }, [resetDraft, draftPersist]);

  const wipedDraft = useRef(false);
  useEffect(() => {
    const reset = resetDraftRef.current;
    const persistApi = draftPersistRef.current;
    if (!reset || !persistApi) return;
    if (searchParams.get("new") !== type || searchParams.get("id")) return;
    const wipe = () => {
      if (wipedDraft.current) return;
      wipedDraft.current = true;
      reset();
      setSavedDoc(null);
    };
    if (persistApi.hasHydrated()) wipe();
    return persistApi.onFinishHydration(wipe);
  }, [type, searchParams]);

  // ----------------------------------------------------- load existing record
  const detailQueryKey = queryKeys.creations.detail(creationId ?? undefined);
  const detailQuery = useQuery({
    queryKey: detailQueryKey,
    queryFn: () => creationService.get<TContent>(creationId as string),
    enabled: enabled && !!creationId,
    // Document edits are local until Save; still allow asset-URL refreshes.
    staleTime: 60 * 1000,
    refetchOnMount: false,
    refetchOnWindowFocus: true,
  });

  usePresignedAssetRefresh(
    detailQueryKey,
    minAssetExpiresIn(
      detailQuery.data?.assets as Record<string, CreationAsset> | undefined,
    ),
    enabled && !!creationId && detailQuery.isSuccess,
  );

  // Keep latest doc/baseline in refs so asset-only refetches can avoid clobbering
  // unsaved edits without re-running this effect on every keystroke.
  const docRef = useRef(doc);
  const savedDocRef = useRef(savedDoc);
  useEffect(() => {
    docRef.current = doc;
    savedDocRef.current = savedDoc;
  }, [doc, savedDoc]);

  useEffect(() => {
    if (!detailQuery.data) return;
    const { content, assets } = detailQuery.data;
    const urls = assetUrlMap(
      assets as Record<string, CreationAsset> | undefined,
    );
    const baseline = savedDocRef.current;
    const currentDoc = docRef.current;
    const isDirty = baseline !== null && currentDoc !== baseline;

    if (isDirty) {
      // Refresh presigned URLs only — keep the in-progress local document.
      load(currentDoc, urls);
      return;
    }

    setSavedDoc(content);
    load(content, urls);
    // dataUpdatedAt: re-run when a background asset refresh lands, not on identity churn.
    // detailQuery.data is read when dataUpdatedAt changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional: refresh on dataUpdatedAt only
  }, [detailQuery.dataUpdatedAt, load]);

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
  const publicToken =
    detailQuery.data?.public_token ?? createMutation.data?.public_token ?? null;

  return { status, enabled, creationId, publicToken, myRole, dirty, save };
}

function assetUrlMap(
  assets: Record<string, CreationAsset> | undefined,
): Record<string, string> {
  const urls: Record<string, string> = {};
  for (const [fileId, asset] of Object.entries(assets ?? {})) {
    // Builders preview at full fidelity; prefer original here. Public viewers
    // use pickAssetUrl / variants via `assetUrls()` instead.
    urls[fileId] = asset.url;
  }
  return urls;
}
