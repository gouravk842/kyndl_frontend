"use client";

import type { Editor } from "@tiptap/react";
import { useEffect, useReducer } from "react";

import { cn } from "@/lib/utils";

import { FONT_OPTIONS, INK_OPTIONS } from "../../editor/extensions";

/**
 * Formatting bar for the page writing surface. Reads/drives the active TipTap
 * editor; renders inert (but keeps its height) when no editor is mounted yet.
 */
export function EditorToolbar({ editor }: { editor: Editor | null }) {
  // TipTap mutates the editor in place, so subscribe to its events to re-render
  // active-state highlights.
  const [, rerender] = useReducer((n: number) => n + 1, 0);
  useEffect(() => {
    if (!editor) return;
    editor.on("transaction", rerender);
    editor.on("selectionUpdate", rerender);
    return () => {
      editor.off("transaction", rerender);
      editor.off("selectionUpdate", rerender);
    };
  }, [editor]);

  const disabled = !editor;
  const is = (name: string, attrs?: Record<string, unknown>) =>
    !!editor?.isActive(name, attrs);

  return (
    <div className="flex flex-wrap items-center gap-1 border-b border-[#F2DACE] bg-white/70 px-3 py-2">
      <Btn
        label="H1"
        active={is("heading", { level: 1 })}
        disabled={disabled}
        onClick={() =>
          editor?.chain().focus().toggleHeading({ level: 1 }).run()
        }
      />
      <Btn
        label="H2"
        active={is("heading", { level: 2 })}
        disabled={disabled}
        onClick={() =>
          editor?.chain().focus().toggleHeading({ level: 2 }).run()
        }
      />
      <Divider />
      <Btn
        label="B"
        className="font-bold"
        active={is("bold")}
        disabled={disabled}
        onClick={() => editor?.chain().focus().toggleBold().run()}
      />
      <Btn
        label="I"
        className="italic"
        active={is("italic")}
        disabled={disabled}
        onClick={() => editor?.chain().focus().toggleItalic().run()}
      />
      <Btn
        label="U"
        className="underline"
        active={is("underline")}
        disabled={disabled}
        onClick={() => editor?.chain().focus().toggleUnderline().run()}
      />
      <Btn
        label="S"
        className="line-through"
        active={is("strike")}
        disabled={disabled}
        onClick={() => editor?.chain().focus().toggleStrike().run()}
      />
      <Divider />
      <Btn
        label="• List"
        active={is("bulletList")}
        disabled={disabled}
        onClick={() => editor?.chain().focus().toggleBulletList().run()}
      />
      <Btn
        label="1. List"
        active={is("orderedList")}
        disabled={disabled}
        onClick={() => editor?.chain().focus().toggleOrderedList().run()}
      />
      <Divider />
      <select
        aria-label="Handwriting"
        disabled={disabled}
        className="h-8 rounded-md border border-[#F2DACE] bg-white px-2 text-xs text-[#3A2A25] outline-none disabled:opacity-50"
        value=""
        onChange={(e) => {
          const v = e.target.value;
          if (!v) editor?.chain().focus().unsetFontFamily().run();
          else editor?.chain().focus().setFontFamily(v).run();
        }}
      >
        <option value="">Font…</option>
        {FONT_OPTIONS.map((f) => (
          <option key={f.label} value={f.value}>
            {f.label}
          </option>
        ))}
      </select>
      <div className="ml-1 flex items-center gap-1">
        {INK_OPTIONS.map((ink) => (
          <button
            key={ink.value}
            type="button"
            aria-label={`Ink ${ink.label}`}
            title={ink.label}
            disabled={disabled}
            onClick={() => editor?.chain().focus().setColor(ink.value).run()}
            className="h-5 w-5 rounded-full border border-black/10 transition-transform hover:scale-110 disabled:opacity-50"
            style={{ backgroundColor: ink.value }}
          />
        ))}
      </div>
    </div>
  );
}

function Btn({
  label,
  onClick,
  active,
  disabled,
  className,
}: {
  label: string;
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "inline-flex h-8 min-w-8 items-center justify-center rounded-md px-2 text-sm text-[#3A2A25] transition-colors",
        "hover:bg-[#FFF1E9] disabled:opacity-40 disabled:hover:bg-transparent",
        active && "bg-[#FFE3D6] text-[#C75B39]",
        className,
      )}
    >
      {label}
    </button>
  );
}

function Divider() {
  return <span className="mx-1 h-5 w-px bg-[#F2DACE]" />;
}
