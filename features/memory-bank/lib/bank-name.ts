import type { MemoryCircle } from "@/types/memory-bank";

export function bankNameTaken(
  name: string,
  banks: MemoryCircle[],
  excludeId?: string,
) {
  const needle = name.trim().toLowerCase();
  if (!needle) return false;
  return banks.some(
    (bank) =>
      bank.id !== excludeId && bank.name.trim().toLowerCase() === needle,
  );
}
