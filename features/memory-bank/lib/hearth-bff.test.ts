import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/services/api/client", () => ({
  apiRequest: vi.fn(),
}));

import { HEARTH_BOARDS } from "@/features/memory-bank/lib/hearth";
import { apiRequest } from "@/services/api/client";
import { memoryBankService } from "@/services/memory-bank/memory-bank.service";

describe("streak routes", () => {
  beforeEach(() => {
    vi.mocked(apiRequest).mockReset();
    vi.mocked(apiRequest).mockResolvedValue({});
  });

  it("saves opt-in through the streak route", async () => {
    await memoryBankService.updateStreak({
      public: true,
      public_name: "Ada",
    });

    expect(apiRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        method: "PATCH",
        url: "/memory-bank/streak",
        data: expect.objectContaining({
          public: true,
          public_name: "Ada",
        }),
      }),
    );
    const payload = vi.mocked(apiRequest).mock.calls[0][0].data as {
      timezone?: string;
    };
    expect(payload.timezone).toBeTruthy();
  });

  it("loads each board from the leaderboard route", async () => {
    for (const board of HEARTH_BOARDS) {
      await memoryBankService.leaderboard(board.id);
    }

    expect(vi.mocked(apiRequest).mock.calls.map((call) => call[0].url)).toEqual(
      [
        "/memory-bank/leaderboard?board=current",
        "/memory-bank/leaderboard?board=longest",
        "/memory-bank/leaderboard?board=week",
      ],
    );
  });
});
