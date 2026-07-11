"use client";

import { X } from "lucide-react";
import { useState } from "react";

import { useChocolateBouquetSync } from "@/hooks/use-chocolate-bouquet-sync";

import { kindOf } from "../../lib/chocolate-kinds";
import { bouquetLayout } from "../../lib/layout";
import { useBuilderStore } from "../../store/builder.store";
import { ChocolateBouquetExperience } from "../chocolate-bouquet-experience";
import { BuilderPanel } from "./builder-panel";
import { ChocolateFormModal } from "./chocolate-form-modal";

/** Project a 3D head position onto the 2D board (a front view of the fan). */
function project(head: [number, number, number]): { left: string; top: string } {
  return {
    left: `${50 + (head[0] / 2.6) * 34}%`,
    top: `${52 - (head[1] / 2.6) * 34}%`,
  };
}

/**
 * The Chocolate Bouquet customization panel: an editor rail beside a flat board
 * that lays the chocolates out in the same self-arranging fan as the 3D bouquet.
 * Click a chocolate to write it; "Preview the bouquet" mounts the real 3D
 * experience full-screen from the live draft. Both drive one builder store.
 */
export function ChocolateBouquetBuilder() {
  const sync = useChocolateBouquetSync();
  const doc = useBuilderStore((s) => s.doc);
  const selectedId = useBuilderStore((s) => s.selectedId);
  const selectChocolate = useBuilderStore((s) => s.selectChocolate);

  const [previewing, setPreviewing] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const placements = bouquetLayout(doc.chocolates.map((c) => c.id));
  const byId = new Map(doc.chocolates.map((c) => [c.id, c]));

  return (
    <div className="flex h-[calc(100dvh-4rem)] w-full flex-col-reverse sm:flex-row">
      <BuilderPanel
        sync={sync}
        onPreview={() => setPreviewing(true)}
        className="h-1/2 w-full shrink-0 border-t sm:h-full sm:w-[380px] sm:border-t-0 sm:border-r"
      />

      {/* Bouquet board */}
      <div
        className="relative h-1/2 flex-1 overflow-hidden sm:h-full"
        style={{
          background:
            "radial-gradient(ellipse 90% 80% at 50% 35%, #3a1622 0%, #240d16 55%, #150810 100%)",
        }}
      >
        {/* paper cone */}
        <div
          aria-hidden
          className="absolute left-1/2 bottom-0 -translate-x-1/2"
          style={{
            width: 0,
            height: 0,
            borderLeft: "90px solid transparent",
            borderRight: "90px solid transparent",
            borderBottom: `240px solid ${doc.wrapColor || "#cdd7e6"}`,
            opacity: 0.9,
          }}
        />
        {/* bow */}
        <div
          aria-hidden
          className="absolute left-1/2 -translate-x-1/2"
          style={{ bottom: 108 }}
        >
          <span
            className="block size-6 rounded-full"
            style={{ background: doc.bowColor || "#d6465a" }}
          />
        </div>

        {placements.map((p) => {
          const c = byId.get(p.id);
          if (!c) return null;
          const kind = kindOf(c.type);
          const pos = project(p.head);
          const active = c.id === selectedId;
          return (
            <button
              key={c.id}
              type="button"
              aria-label={`Edit ${c.label || "chocolate"}`}
              onClick={() => {
                selectChocolate(c.id);
                setEditingId(c.id);
              }}
              className="absolute -translate-x-1/2 -translate-y-1/2 rounded-md outline-none transition-transform hover:scale-110"
              style={{
                left: pos.left,
                top: pos.top,
                width: kind.mesh === "truffle" ? 22 : 18,
                height: kind.mesh === "truffle" ? 22 : 34,
                borderRadius: kind.mesh === "truffle" ? "9999px" : 6,
                background: `linear-gradient(135deg, ${kind.wrapperHi}, ${kind.wrapper})`,
                boxShadow: active
                  ? `0 0 0 3px ${kind.accent}, 0 4px 14px rgba(0,0,0,0.5)`
                  : "0 4px 12px rgba(0,0,0,0.45)",
              }}
            >
              <span className="pointer-events-none absolute left-1/2 top-full mt-1 -translate-x-1/2 whitespace-nowrap text-[10px] text-[#e6c8c0]">
                {c.label}
              </span>
            </button>
          );
        })}

        {doc.chocolates.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="font-serif text-lg text-[#e6b9ae]">
              Add a chocolate to start your bouquet.
            </p>
          </div>
        )}
      </div>

      {editingId != null && (
        <ChocolateFormModal id={editingId} onClose={() => setEditingId(null)} />
      )}

      {/* Full-screen live preview of the real 3D experience. */}
      {previewing && (
        <div className="fixed inset-0 z-[80] bg-black">
          <ChocolateBouquetExperience key="preview" config={doc} preview />
          <button
            type="button"
            onClick={() => setPreviewing(false)}
            aria-label="Close preview"
            className="absolute right-4 top-4 z-[81] inline-flex items-center gap-1.5 rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur transition-colors hover:bg-white/20"
          >
            <X className="size-4" /> Close preview
          </button>
        </div>
      )}
    </div>
  );
}
