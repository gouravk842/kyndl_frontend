"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { queryKeys } from "@/constants/query-keys";
import { creationService } from "@/services/creations/creation.service";
import { paymentService } from "@/services/payments/payment.service";
import { openRazorpayCheckout } from "@/services/payments/razorpay";
import { useAuthStore } from "@/store/auth.store";
import type { ApiError } from "@/types/api";
import type { AccessPayload, Creation } from "@/types/creation";
import type { PaymentProduct } from "@/types/payment";

// Thrown when the buyer closes the Razorpay modal — a normal cancel, not a
// failure to surface as an error toast.
const PAYMENT_CANCELLED = "payment_cancelled";

/**
 * Lists the signed-in user's creations for the dashboard workspace.
 *
 * Mirrors `useAuth`'s gating: the query only runs once the auth store has
 * hydrated and the user is signed in, so we never fire an authenticated request
 * during the unauthenticated first paint.
 */
export function useCreations(type?: string) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isHydrated = useAuthStore((s) => s.isHydrated);

  return useQuery({
    queryKey: queryKeys.creations.list(type),
    queryFn: () => creationService.list(type),
    enabled: isAuthenticated && isHydrated,
    staleTime: 60 * 1000,
  });
}

/** Deletes a creation and refreshes the list. */
export function useDeleteCreation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id }: { id: string; title: string }) =>
      creationService.remove(id),
    onSuccess: (_data, { title }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.creations.all });
      toast.success(`Deleted "${title}".`);
    },
    onError: (error: unknown) => {
      toast.error((error as ApiError)?.message ?? "Could not delete that.");
    },
  });
}

/**
 * Publishes a creation, handling payment for paid types end-to-end:
 * publish → (402) open checkout for the product → verify → publish again.
 * Free types just publish. A cancelled checkout resolves quietly.
 */
export function usePublishCreation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (creation: Pick<Creation, "id" | "title">) => {
      try {
        return await creationService.publish(creation.id);
      } catch (error) {
        const apiError = error as ApiError;
        const product = apiError.details?.product as PaymentProduct | undefined;
        if (apiError.code !== "payment_required" || !product) throw error;

        // Paid type: collect payment for this exact creation, then retry.
        // A stable idempotency key keyed on the creation means a double-click or
        // a dismissed-then-reopened checkout reuses the same provider order
        // instead of spawning orphan CREATED payments.
        const checkout = await paymentService.create({
          product_code: product.code,
          reference_id: creation.id,
          idempotency_key: `publish:${creation.id}`,
        });
        const success = await openRazorpayCheckout({
          checkout,
          name: product.name,
          description: `Publish "${creation.title || "your creation"}"`,
        });
        if (!success) throw new Error(PAYMENT_CANCELLED);

        await paymentService.verify(success);
        return await creationService.publish(creation.id);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.creations.all });
      toast.success("Published — your share link is ready.");
    },
    onError: (error: unknown) => {
      if (error instanceof Error && error.message === PAYMENT_CANCELLED) return;
      toast.error((error as ApiError)?.message ?? "Could not publish that.");
    },
  });
}

/** Takes a published creation back offline. */
export function useUnpublishCreation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => creationService.unpublish(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.creations.all });
      toast.success("Unpublished. The share link is now private.");
    },
    onError: (error: unknown) => {
      toast.error((error as ApiError)?.message ?? "Could not unpublish that.");
    },
  });
}

/** Updates who can view a creation (public / invite-by-email). */
export function useSetCreationAccess() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, access }: { id: string; access: AccessPayload }) =>
      creationService.setAccess(id, access),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.creations.all });
      queryClient.invalidateQueries({
        queryKey: queryKeys.creations.detail(updated.id),
      });
      toast.success("Access updated.");
    },
    onError: (error: unknown) => {
      toast.error((error as ApiError)?.message ?? "Could not update access.");
    },
  });
}

/** Renames a creation (title only — the document is left untouched). */
export function useRenameCreation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, title }: { id: string; title: string }) =>
      creationService.update(id, { title }),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.creations.all });
      queryClient.invalidateQueries({
        queryKey: queryKeys.creations.detail(updated.id),
      });
      toast.success("Renamed.");
    },
    onError: (error: unknown) => {
      toast.error((error as ApiError)?.message ?? "Could not rename that.");
    },
  });
}

/** Clones a creation into a fresh draft the user can edit independently. */
export function useDuplicateCreation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (creation: Pick<Creation, "id" | "type" | "title">) => {
      // Re-fetch to copy the full document (the list omits heavy content).
      const full = await creationService.get(creation.id);
      return creationService.create({
        type: full.type,
        title: `${full.title || "Untitled"} (copy)`,
        content: full.content,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.creations.all });
      toast.success("Duplicated — a new draft is ready to edit.");
    },
    onError: (error: unknown) => {
      toast.error((error as ApiError)?.message ?? "Could not duplicate that.");
    },
  });
}

/** Counts a creation list into the headline stats the dashboard shows. */
export function summarizeCreations(creations: Creation[] | undefined) {
  const list = creations ?? [];
  return {
    total: list.length,
    published: list.filter((c) => c.status === "published").length,
    drafts: list.filter((c) => c.status === "draft").length,
  };
}
