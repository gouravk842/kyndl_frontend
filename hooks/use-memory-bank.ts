"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { queryKeys } from "@/constants/query-keys";
import { memoryBankService } from "@/services/memory-bank/memory-bank.service";
import { useAuthStore } from "@/store/auth.store";
import type { ApiError } from "@/types/api";
import type { MemoryInput, StreakLeaderboard } from "@/types/memory-bank";

function message(error: unknown, fallback: string) {
  return (error as ApiError)?.message || fallback;
}

function useMemoryBankEnabled() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isHydrated = useAuthStore((s) => s.isHydrated);
  return isAuthenticated && isHydrated;
}

export function useMemoryCircles() {
  const enabled = useMemoryBankEnabled();
  return useQuery({
    queryKey: queryKeys.memoryBank.circles(),
    queryFn: () => memoryBankService.listCircles(),
    enabled,
  });
}

export function useMemoryCircle(id: string) {
  const enabled = useMemoryBankEnabled();
  return useQuery({
    queryKey: queryKeys.memoryBank.circle(id),
    queryFn: () => memoryBankService.getCircle(id),
    enabled: enabled && Boolean(id),
  });
}

export function useCircleMemories(circleId: string) {
  const enabled = useMemoryBankEnabled();
  return useQuery({
    queryKey: queryKeys.memoryBank.memories(circleId),
    queryFn: () => memoryBankService.listMemories(circleId),
    enabled: enabled && Boolean(circleId),
  });
}

export function useMemorySearch(query: string) {
  const enabled = useMemoryBankEnabled();
  const q = query.trim();
  return useQuery({
    queryKey: queryKeys.memoryBank.search(q),
    queryFn: () => memoryBankService.search(q),
    enabled: enabled && q.length >= 2,
  });
}

export function useCreateCircle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { name: string; cover_file_id?: string | null }) =>
      memoryBankService.createCircle(input),
    onSuccess: (circle) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.memoryBank.circles(),
      });
      toast.success(`${circle.name} is ready.`);
    },
    onError: (error: unknown) =>
      toast.error(message(error, "Could not create that circle.")),
  });
}

export function useRenameCircle(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { name?: string; cover_file_id?: string | null }) =>
      memoryBankService.updateCircle(id, input),
    onSuccess: (circle) => {
      queryClient.setQueryData(queryKeys.memoryBank.circle(id), circle);
      queryClient.invalidateQueries({
        queryKey: queryKeys.memoryBank.circles(),
      });
      toast.success("Bank saved.");
    },
    onError: (error: unknown) =>
      toast.error(message(error, "Could not save this bank.")),
  });
}

export function useMemoryTrash() {
  const enabled = useMemoryBankEnabled();
  return useQuery({
    queryKey: queryKeys.memoryBank.trash(),
    queryFn: () => memoryBankService.trash(),
    enabled,
  });
}

export function useRestoreCircle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => memoryBankService.restoreCircle(id),
    onSuccess: (circle) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.memoryBank.all });
      toast.success(`${circle.name} is back on your shelf.`);
    },
    onError: (error: unknown) =>
      toast.error(message(error, "Could not restore that circle.")),
  });
}

export function useRestoreMemory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => memoryBankService.restoreMemory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.memoryBank.all });
      toast.success("Memory restored.");
    },
    onError: (error: unknown) =>
      toast.error(message(error, "Could not restore that memory.")),
  });
}

export function useDeleteCircle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (
      input: string | { id: string; live?: "snapshot" | "delete" },
    ) => {
      if (typeof input === "string")
        return memoryBankService.deleteCircle(input);
      return memoryBankService.deleteCircle(input.id, input.live);
    },
    onSuccess: (_result, input) => {
      const id = typeof input === "string" ? input : input.id;
      queryClient.invalidateQueries({ queryKey: queryKeys.memoryBank.all });
      // Nothing is destroyed yet, so the toast is where the way back lives.
      toast.success("Circle moved to the trash.", {
        action: {
          label: "Undo",
          onClick: () => {
            memoryBankService
              .restoreCircle(id)
              .then((circle) => {
                queryClient.invalidateQueries({
                  queryKey: queryKeys.memoryBank.all,
                });
                toast.success(`${circle.name} is back on your shelf.`);
              })
              .catch((error: unknown) =>
                toast.error(message(error, "Could not restore that circle.")),
              );
          },
        },
      });
    },
    onError: (error: unknown) =>
      toast.error(message(error, "Could not delete this circle.")),
  });
}

export function useCreateMemory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      circleId,
      input,
    }: {
      circleId: string;
      input: MemoryInput;
    }) => memoryBankService.createMemory(circleId, input),
    onSuccess: (_memory, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.memoryBank.memories(variables.circleId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.memoryBank.circles(),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.memoryBank.circle(variables.circleId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.memoryBank.streak(),
      });
      queryClient.invalidateQueries({
        queryKey: [...queryKeys.memoryBank.all, "leaderboard"],
      });
      toast.success("Kept.");
    },
    onError: (error: unknown) =>
      toast.error(message(error, "Could not save that memory.")),
  });
}

export function useUpdateMemory(circleId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      memoryId,
      input,
    }: {
      memoryId: string;
      input: MemoryInput;
    }) => memoryBankService.updateMemory(circleId, memoryId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.memoryBank.memories(circleId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.memoryBank.circles(),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.memoryBank.circle(circleId),
      });
      toast.success("Memory updated.");
    },
    onError: (error: unknown) =>
      toast.error(message(error, "Could not update that memory.")),
  });
}

export function useDeleteMemory(circleId: string) {
  const queryClient = useQueryClient();

  function refresh() {
    queryClient.invalidateQueries({
      queryKey: queryKeys.memoryBank.memories(circleId),
    });
    queryClient.invalidateQueries({ queryKey: queryKeys.memoryBank.circles() });
    queryClient.invalidateQueries({
      queryKey: queryKeys.memoryBank.circle(circleId),
    });
    queryClient.invalidateQueries({ queryKey: queryKeys.memoryBank.trash() });
    queryClient.invalidateQueries({ queryKey: queryKeys.memoryBank.streak() });
    queryClient.invalidateQueries({
      queryKey: [...queryKeys.memoryBank.all, "leaderboard"],
    });
  }

  return useMutation({
    mutationFn: (memoryId: string) =>
      memoryBankService.deleteMemory(circleId, memoryId),
    onSuccess: (_result, memoryId) => {
      refresh();
      toast.success("Memory moved to the trash.", {
        action: {
          label: "Undo",
          onClick: () => {
            memoryBankService
              .restoreMemory(memoryId)
              .then(() => {
                refresh();
                toast.success("Memory restored.");
              })
              .catch((error: unknown) =>
                toast.error(message(error, "Could not restore that memory.")),
              );
          },
        },
      });
    },
    onError: (error: unknown) =>
      toast.error(message(error, "Could not remove that memory.")),
  });
}

function invalidateAfterTransfer(
  queryClient: ReturnType<typeof useQueryClient>,
  fromId: string,
  toId: string,
) {
  queryClient.invalidateQueries({ queryKey: queryKeys.memoryBank.circles() });
  queryClient.invalidateQueries({
    queryKey: queryKeys.memoryBank.memories(fromId),
  });
  queryClient.invalidateQueries({
    queryKey: queryKeys.memoryBank.memories(toId),
  });
  queryClient.invalidateQueries({
    queryKey: queryKeys.memoryBank.circle(fromId),
  });
  queryClient.invalidateQueries({
    queryKey: queryKeys.memoryBank.circle(toId),
  });
}

export function useMoveMemory(circleId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      memoryId,
      destinationId,
    }: {
      memoryId: string;
      destinationId: string;
    }) => memoryBankService.moveMemory(circleId, memoryId, destinationId),
    onSuccess: (_memory, variables) => {
      invalidateAfterTransfer(queryClient, circleId, variables.destinationId);
      toast.success("Memory moved.");
    },
    onError: (error: unknown) =>
      toast.error(message(error, "Could not move that memory.")),
  });
}

export function useCopyMemory(circleId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      memoryId,
      destinationId,
    }: {
      memoryId: string;
      destinationId: string;
    }) => memoryBankService.copyMemory(circleId, memoryId, destinationId),
    onSuccess: (_memory, variables) => {
      invalidateAfterTransfer(queryClient, circleId, variables.destinationId);
      toast.success("Memory copied.");
    },
    onError: (error: unknown) =>
      toast.error(message(error, "Could not copy that memory.")),
  });
}

export function useMemoryStreak() {
  const enabled = useMemoryBankEnabled();
  return useQuery({
    queryKey: queryKeys.memoryBank.streak(),
    queryFn: () => memoryBankService.streak(),
    enabled,
  });
}

export function useStreakLeaderboard(
  board: StreakLeaderboard["board"],
  open: boolean,
) {
  const enabled = useMemoryBankEnabled();
  return useQuery({
    queryKey: queryKeys.memoryBank.leaderboard(board),
    queryFn: () => memoryBankService.leaderboard(board),
    enabled: enabled && open,
  });
}

export function useUpdateStreak() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { public: boolean; public_name: string }) =>
      memoryBankService.updateStreak(input),
    onSuccess: (streak) => {
      queryClient.setQueryData(queryKeys.memoryBank.streak(), streak);
      queryClient.invalidateQueries({
        queryKey: [...queryKeys.memoryBank.all, "leaderboard"],
      });
    },
    onError: (error: unknown) =>
      toast.error(message(error, "Could not update the hearth.")),
  });
}
