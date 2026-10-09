import { describe, expect, it } from "vitest";

import type { MemoryCircle } from "@/types/memory-bank";

import { bankNameTaken } from "./bank-name";

function bank(id: string, name: string, isLoose = false): MemoryCircle {
  return {
    id,
    name,
    is_loose: isLoose,
    memory_count: 0,
    latest_memory: null,
    cover: null,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  };
}

describe("bankNameTaken", () => {
  const banks = [bank("loose", "Loose pile", true), bank("asha", "Asha")];

  it("treats names as unique regardless of case or spaces", () => {
    expect(bankNameTaken("asha", banks)).toBe(true);
    expect(bankNameTaken("  ASHA  ", banks)).toBe(true);
    expect(bankNameTaken("Mum", banks)).toBe(false);
  });

  it("counts the loose pile name as taken", () => {
    expect(bankNameTaken("Loose pile", banks)).toBe(true);
  });

  it("allows renaming a bank to its own name", () => {
    expect(bankNameTaken("Asha", banks, "asha")).toBe(false);
  });
});
