"use client";

import type { JSONContent } from "@tiptap/core";
import type { Editor } from "@tiptap/react";
import { EditorContent, useEditor } from "@tiptap/react";
import { useEffect } from "react";

import { scrapbookExtensions } from "../../editor/extensions";

type PageEditorProps = {
  /** Initial document (read once on mount — the editor is uncontrolled after). */
  body?: JSONContent;
  placeholder?: string;
  /** Focus the end of the document on mount (used when pagination follows the
   *  caret onto a freshly-created page). */
  autoFocusEnd?: boolean;
  onChange: (body: JSONContent) => void;
  /** Hands the live editor instance up so the toolbar can drive it. */
  onEditorReady: (editor: Editor | null) => void;
  /** Called after every change (and on mount) so the host can paginate. */
  onContentResize?: (editor: Editor) => void;
};

/**
 * The notebook writing surface for one page. Mount it keyed by page id so each
 * page gets a fresh editor seeded with its own body — no cross-page cursor or
 * echo-back juggling.
 */
export function PageEditor({
  body,
  placeholder = "Start writing your story…",
  autoFocusEnd,
  onChange,
  onEditorReady,
  onContentResize,
}: PageEditorProps) {
  const editor = useEditor({
    // Next.js SSR — defer first render to the client to avoid hydration drift.
    immediatelyRender: false,
    extensions: scrapbookExtensions({ placeholder }),
    content: body ?? "",
    editorProps: {
      attributes: { class: "kyndl-page-prose focus:outline-none" },
    },
    onCreate: ({ editor }) => {
      if (autoFocusEnd) editor.commands.focus("end");
      onContentResize?.(editor);
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getJSON());
      onContentResize?.(editor);
    },
  });

  useEffect(() => {
    onEditorReady(editor);
    return () => onEditorReady(null);
  }, [editor, onEditorReady]);

  return <EditorContent editor={editor} className="h-full w-full" />;
}
