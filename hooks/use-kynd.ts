"use client";

import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";

import { queryKeys } from "@/constants/query-keys";
import { kyndService } from "@/services/kynd/kynd.service";
import { useAuthStore } from "@/store/auth.store";
import type { ApiError } from "@/types/api";
import type {
  KyndChatHistory,
  KyndItemInput,
  KyndPersonInput,
} from "@/types/kynd";

function message(error: unknown, fallback: string) {
  return (error as ApiError)?.message || fallback;
}

function retryKynd(failureCount: number, error: unknown) {
  const status = (error as ApiError)?.status;
  if (status === 401 || status === 403 || status === 404) return false;
  return failureCount < 2;
}

function useKyndReady() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isHydrated = useAuthStore((s) => s.isHydrated);
  return isAuthenticated && isHydrated;
}

export function useKyndPeople() {
  const enabled = useKyndReady();
  return useQuery({
    queryKey: queryKeys.kynd.people(),
    queryFn: () => kyndService.listPeople(),
    enabled,
    retry: retryKynd,
  });
}

export function useKyndPerson(id: string) {
  const enabled = useKyndReady();
  return useQuery({
    queryKey: queryKeys.kynd.person(id),
    queryFn: () => kyndService.getPerson(id),
    enabled: enabled && Boolean(id),
    retry: retryKynd,
  });
}

export function useKyndItems(
  personId: string,
  filter: { q?: string; category?: string },
) {
  const enabled = useKyndReady();
  const q = filter.q?.trim() ?? "";
  const category = filter.category ?? "";
  return useInfiniteQuery({
    queryKey: queryKeys.kynd.items(personId, { q, category }),
    queryFn: ({ pageParam }) =>
      kyndService.listItems(personId, {
        q,
        category,
        cursor: pageParam || undefined,
      }),
    initialPageParam: "",
    getNextPageParam: (last) => last.next_cursor ?? undefined,
    enabled: enabled && Boolean(personId),
    retry: retryKynd,
  });
}

export function useKyndChat(personId: string | null, active = true) {
  const enabled = useKyndReady();
  const queryClient = useQueryClient();
  const key = personId
    ? queryKeys.kynd.chatPerson(personId)
    : queryKeys.kynd.chat();
  const history = useQuery({
    queryKey: key,
    queryFn: () =>
      personId ? kyndService.chatPerson(personId) : kyndService.chat(),
    enabled: active && enabled && (personId === null || Boolean(personId)),
    retry: retryKynd,
  });
  const ask = useMutation({
    mutationFn: (message: string) =>
      personId
        ? kyndService.askPerson(personId, message)
        : kyndService.ask(message),
    onSuccess: (turn) => {
      queryClient.setQueryData<KyndChatHistory>(key, (old) => ({
        messages: [...(old?.messages ?? []), turn.user, turn.kynd],
      }));
    },
  });
  return { history, ask };
}

export function useCreateKyndPerson() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: {
      name: string;
      relationship_type: KyndPersonInput["relationship_type"];
    }) =>
      kyndService.createPerson({
        name: input.name,
        relationship_type: input.relationship_type!,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.kynd.people() });
    },
    onError: (error: unknown) =>
      toast.error(message(error, "Couldn't add them.")),
  });
}

export function useUpdateKyndPerson(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: KyndPersonInput) => kyndService.updatePerson(id, input),
    onSuccess: (person) => {
      queryClient.setQueryData(queryKeys.kynd.person(id), person);
      queryClient.invalidateQueries({ queryKey: queryKeys.kynd.people() });
    },
    onError: (error: unknown) => {
      if ((error as ApiError)?.status === 409) {
        queryClient.invalidateQueries({ queryKey: queryKeys.kynd.person(id) });
      }
      toast.error(message(error, "Couldn't save that."));
    },
  });
}

export function useDeleteKyndPerson() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => kyndService.deletePerson(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.kynd.people() });
    },
    onError: (error: unknown) =>
      toast.error(message(error, "Couldn't remove them.")),
  });
}

export function useCreateKyndItem(personId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: KyndItemInput) =>
      kyndService.createItem(personId, input),
    onSuccess: () => {
      toast.success("Kept.");
      queryClient.invalidateQueries({
        queryKey: queryKeys.kynd.itemsRoot(personId),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.kynd.people() });
      queryClient.invalidateQueries({
        queryKey: queryKeys.kynd.person(personId),
      });
    },
    onError: (error: unknown) =>
      toast.error(message(error, "Couldn't keep that.")),
  });
}

export function useUpdateKyndItem(personId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: KyndItemInput & { id: string }) =>
      kyndService.updateItem(personId, input.id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.kynd.itemsRoot(personId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.kynd.person(personId),
      });
    },
    onError: (error: unknown) => {
      if ((error as ApiError)?.status === 409) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.kynd.itemsRoot(personId),
        });
      }
      toast.error(message(error, "Couldn't save that."));
    },
  });
}

export function useDeleteKyndItem(personId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (itemId: string) => kyndService.deleteItem(personId, itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.kynd.itemsRoot(personId),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.kynd.people() });
      queryClient.invalidateQueries({
        queryKey: queryKeys.kynd.person(personId),
      });
    },
    onError: (error: unknown) =>
      toast.error(message(error, "Couldn't remove that.")),
  });
}
