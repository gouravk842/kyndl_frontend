import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * Lightweight Markdown → React. Supports headings, paragraphs, nested
 * unordered lists, bold/italic, and links — enough for legal copy and gift
 * product descriptions without a new dependency.
 *
 * HTML pasted into a textarea (common in vendor/admin catalogs) is reduced to
 * the same subset before parsing, so `<strong>` / `<ul>` render instead of
 * showing as raw tags.
 */
export function MarkdownBody({
  source,
  className,
  skipH1 = false,
}: {
  source: string;
  className?: string;
  skipH1?: boolean;
}) {
  const blocks = splitBlocks(normalizeMarkup(source).trim());
  return (
    <div className={cn("space-y-4 text-[15px] leading-relaxed", className)}>
      {blocks.map((block, i) => (
        <Block key={i} block={block} skipH1={skipH1} />
      ))}
    </div>
  );
}

/** Strip markup so descriptions can be used in meta tags / plain-text contexts. */
export function markdownToPlain(source: string): string {
  return normalizeMarkup(source)
    .replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+|\/[^\s)]*)\)/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/^#{1,3}\s+/gm, "")
    .replace(/^[-*]\s+/gm, "")
    .replace(/\s+/g, " ")
    .trim();
}

type ListItem = { text: string; children?: ListItem[] };

type Block =
  | { type: "h1" | "h2" | "h3"; text: string }
  | { type: "p"; text: string }
  | { type: "ul"; items: ListItem[] };

function normalizeMarkup(source: string): string {
  const text = source.replace(/\r\n/g, "\n");
  if (!/<\/?[a-z][\s\S]*>/i.test(text)) return text;

  return text
    .replace(/&nbsp;/gi, " ")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<p[^>]*>/gi, "")
    .replace(/<\/h([1-3])>/gi, "\n\n")
    .replace(
      /<h([1-3])[^>]*>/gi,
      (_, n: string) => `\n${"#".repeat(Number(n))} `,
    )
    .replace(/<\/(strong|b)>/gi, "**")
    .replace(/<(strong|b)(?:\s[^>]*)?>/gi, "**")
    .replace(/<\/(em|i)>/gi, "*")
    .replace(/<(em|i)(?:\s[^>]*)?>/gi, "*")
    .replace(/<\/li>/gi, "\n")
    .replace(/<li[^>]*>/gi, "- ")
    .replace(/<\/?(ul|ol)[^>]*>/gi, "\n")
    .replace(/<\/div>/gi, "\n")
    .replace(/<div[^>]*>/gi, "")
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function listMarker(line: string): { indent: number; text: string } | null {
  const match = /^( *)[-*]\s+(.*)$/.exec(line);
  if (!match) return null;
  return { indent: match[1]!.length, text: match[2]! };
}

function nestItems(rows: { indent: number; text: string }[]): ListItem[] {
  const root: ListItem[] = [];
  const stack: { indent: number; item: ListItem }[] = [];

  for (const row of rows) {
    const item: ListItem = { text: row.text };
    while (stack.length && stack[stack.length - 1]!.indent >= row.indent) {
      stack.pop();
    }
    const parent = stack[stack.length - 1];
    if (!parent) {
      root.push(item);
    } else {
      parent.item.children = parent.item.children ?? [];
      parent.item.children.push(item);
    }
    stack.push({ indent: row.indent, item });
  }

  return root;
}

function splitBlocks(source: string): Block[] {
  const lines = source.split("\n");
  const blocks: Block[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i] ?? "";
    if (!line.trim()) {
      i += 1;
      continue;
    }

    const heading = /^(#{1,3})\s+(.+)$/.exec(line.trim());
    if (heading) {
      const level = heading[1]!.length;
      blocks.push({
        type: level === 1 ? "h1" : level === 2 ? "h2" : "h3",
        text: heading[2]!.trim(),
      });
      i += 1;
      continue;
    }

    // A line that is only bold (`**Product Highlights**`) reads as a heading.
    const boldHeading = /^\*\*([^*]+)\*\*\s*$/.exec(line.trim());
    if (boldHeading) {
      blocks.push({ type: "h3", text: boldHeading[1]!.trim() });
      i += 1;
      continue;
    }

    if (listMarker(line)) {
      const rows: { indent: number; text: string }[] = [];
      while (i < lines.length) {
        const marker = listMarker(lines[i] ?? "");
        if (!marker) break;
        rows.push(marker);
        i += 1;
      }
      blocks.push({ type: "ul", items: nestItems(rows) });
      continue;
    }

    const para: string[] = [];
    while (
      i < lines.length &&
      (lines[i] ?? "").trim() &&
      !/^(#{1,3})\s+/.test((lines[i] ?? "").trim()) &&
      !listMarker(lines[i] ?? "") &&
      !/^\*\*[^*]+\*\*\s*$/.test((lines[i] ?? "").trim())
    ) {
      para.push((lines[i] ?? "").trim());
      i += 1;
    }
    blocks.push({ type: "p", text: para.join(" ") });
  }

  return blocks;
}

function Block({ block, skipH1 }: { block: Block; skipH1: boolean }) {
  if (block.type === "h1") {
    if (skipH1) return null;
    return (
      <h2 className="mt-8 font-display text-2xl text-[#3A2A25] first:mt-0">
        {renderInline(block.text)}
      </h2>
    );
  }
  if (block.type === "h2") {
    return (
      <h2 className="mt-8 font-display text-2xl text-[#3A2A25] first:mt-0">
        {renderInline(block.text)}
      </h2>
    );
  }
  if (block.type === "h3") {
    return (
      <h3 className="mt-6 font-display text-lg text-[#3A2A25] first:mt-0">
        {renderInline(block.text)}
      </h3>
    );
  }
  if (block.type === "ul") {
    return <Bullets items={block.items} />;
  }
  return <p>{renderInline(block.text)}</p>;
}

function Bullets({ items }: { items: ListItem[] }) {
  return (
    <ul className="list-disc space-y-2 pl-5 text-left">
      {items.map((item, idx) => (
        <li key={idx}>
          {renderInline(item.text)}
          {item.children?.length ? (
            <div className="mt-2">
              <Bullets items={item.children} />
            </div>
          ) : null}
        </li>
      ))}
    </ul>
  );
}

function renderInline(text: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  const pattern =
    /\[([^\]]+)\]\((https?:\/\/[^\s)]+|\/[^\s)]*)\)|\*\*([^*]+)\*\*|\*([^*]+)\*/g;
  let last = 0;
  let match: RegExpExecArray | null;
  let key = 0;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > last) {
      nodes.push(text.slice(last, match.index));
    }
    if (match[1] !== undefined && match[2] !== undefined) {
      const href = match[2];
      const external = href.startsWith("http");
      nodes.push(
        <a
          key={key++}
          href={href}
          className="text-[#C75B39] underline decoration-[#C75B39]/35 underline-offset-2 transition-colors hover:text-[#3A2A25]"
          {...(external
            ? { target: "_blank", rel: "noopener noreferrer" }
            : {})}
        >
          {match[1]}
        </a>,
      );
    } else if (match[3] !== undefined) {
      nodes.push(
        <strong key={key++} className="font-semibold text-[#3A2A25]">
          {match[3]}
        </strong>,
      );
    } else if (match[4] !== undefined) {
      nodes.push(<em key={key++}>{match[4]}</em>);
    }
    last = match.index + match[0].length;
  }

  if (last < text.length) {
    nodes.push(text.slice(last));
  }
  return nodes;
}
