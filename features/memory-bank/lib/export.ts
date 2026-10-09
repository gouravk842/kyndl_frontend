import { memoryBankService } from "@/services/memory-bank/memory-bank.service";

function slug(value: string): string {
  return (
    value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "bank"
  );
}

/**
 * Pull a copy of the bank down as a file the owner keeps.
 *
 * The photo links inside are signed and short-lived, so the manifest is worth
 * fetching the images from soon after it is saved rather than treating it as
 * an archive on its own.
 */
export async function downloadMemoryExport(circle?: {
  id: string;
  name: string;
}): Promise<void> {
  const payload = await memoryBankService.export(circle?.id);
  const stamp = new Date().toISOString().slice(0, 10);
  const name = `kyndl-memories-${slug(circle?.name ?? "everything")}-${stamp}.json`;

  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
