import { clientTimezone } from "@/features/memory-bank/lib/hearth";
import { apiRequest } from "@/services/api/client";
import type {
  BankMemory,
  ConvertFeature,
  ConvertPreview,
  ConvertRequest,
  ConvertResult,
  MemoryCircle,
  MemoryExport,
  MemoryInput,
  MemorySearchResult,
  MemoryStreak,
  MemoryTrash,
  StreakLeaderboard,
} from "@/types/memory-bank";

const circles = "/memory-bank/circles";

export const memoryBankService = {
  listCircles() {
    return apiRequest<MemoryCircle[]>({ method: "GET", url: circles });
  },

  createCircle(input: { name: string; cover_file_id?: string | null }) {
    return apiRequest<MemoryCircle>({
      method: "POST",
      url: circles,
      data: input,
    });
  },

  getCircle(id: string) {
    return apiRequest<MemoryCircle>({ method: "GET", url: `${circles}/${id}` });
  },

  updateCircle(
    id: string,
    input: { name?: string; cover_file_id?: string | null },
  ) {
    return apiRequest<MemoryCircle>({
      method: "PATCH",
      url: `${circles}/${id}`,
      data: input,
    });
  },

  deleteCircle(id: string, live?: "snapshot" | "delete") {
    const query = live ? `?live=${live}` : "";
    return apiRequest<void>({
      method: "DELETE",
      url: `${circles}/${id}${query}`,
    });
  },

  listMemories(circleId: string) {
    return apiRequest<BankMemory[]>({
      method: "GET",
      url: `${circles}/${circleId}/memories`,
    });
  },

  createMemory(circleId: string, input: MemoryInput) {
    return apiRequest<BankMemory>({
      method: "POST",
      url: `${circles}/${circleId}/memories`,
      data: input,
      headers: { "X-Timezone": clientTimezone() },
    });
  },

  updateMemory(circleId: string, memoryId: string, input: MemoryInput) {
    return apiRequest<BankMemory>({
      method: "PATCH",
      url: `${circles}/${circleId}/memories/${memoryId}`,
      data: input,
    });
  },

  deleteMemory(circleId: string, memoryId: string) {
    return apiRequest<void>({
      method: "DELETE",
      url: `${circles}/${circleId}/memories/${memoryId}`,
    });
  },

  moveMemory(circleId: string, memoryId: string, destinationId: string) {
    return apiRequest<BankMemory>({
      method: "POST",
      url: `${circles}/${circleId}/memories/${memoryId}/move`,
      data: { circle_id: destinationId },
    });
  },

  copyMemory(circleId: string, memoryId: string, destinationId: string) {
    return apiRequest<BankMemory>({
      method: "POST",
      url: `${circles}/${circleId}/memories/${memoryId}/copy`,
      data: { circle_id: destinationId },
    });
  },

  search(query: string) {
    return apiRequest<MemorySearchResult>({
      method: "GET",
      url: `/memory-bank/search?q=${encodeURIComponent(query)}`,
    });
  },

  trash() {
    return apiRequest<MemoryTrash>({
      method: "GET",
      url: "/memory-bank/trash",
    });
  },

  restoreCircle(id: string) {
    return apiRequest<MemoryCircle>({
      method: "POST",
      url: `/memory-bank/trash/circles/${id}/restore`,
    });
  },

  restoreMemory(id: string) {
    return apiRequest<BankMemory>({
      method: "POST",
      url: `/memory-bank/trash/memories/${id}/restore`,
    });
  },

  export(circleId?: string) {
    const query = circleId ? `?circle_id=${encodeURIComponent(circleId)}` : "";
    return apiRequest<MemoryExport>({
      method: "GET",
      url: `/memory-bank/export${query}`,
    });
  },

  convertFeatures(circleId: string, memoryId?: string) {
    const query = memoryId ? `?memory_id=${encodeURIComponent(memoryId)}` : "";
    return apiRequest<ConvertFeature[]>({
      method: "GET",
      url: `${circles}/${circleId}/convert/features${query}`,
    });
  },

  previewConversion(
    circleId: string,
    body: ConvertRequest & { sample_offset?: number },
  ) {
    return apiRequest<ConvertPreview>({
      method: "POST",
      url: `${circles}/${circleId}/convert/preview`,
      data: body,
    });
  },

  convert(circleId: string, body: ConvertRequest) {
    return apiRequest<ConvertResult>({
      method: "POST",
      url: `${circles}/${circleId}/convert`,
      data: body,
    });
  },

  undoConversion(id: string) {
    return apiRequest<void>({
      method: "POST",
      url: `/memory-bank/conversions/${id}/undo`,
    });
  },

  detachConversion(id: string) {
    return apiRequest<ConvertResult>({
      method: "POST",
      url: `/memory-bank/conversions/${id}/detach`,
    });
  },

  streak() {
    return apiRequest<MemoryStreak>({
      method: "GET",
      url: "/memory-bank/streak",
    });
  },

  updateStreak(input: {
    public?: boolean;
    public_name?: string;
    timezone?: string;
  }) {
    return apiRequest<MemoryStreak>({
      method: "PATCH",
      url: "/memory-bank/streak",
      data: { ...input, timezone: input.timezone || clientTimezone() },
    });
  },

  leaderboard(board: StreakLeaderboard["board"]) {
    return apiRequest<StreakLeaderboard>({
      method: "GET",
      url: `/memory-bank/leaderboard?board=${board}`,
    });
  },
};
