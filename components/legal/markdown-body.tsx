import type { ReactNode } from "react";

/**
 * Lightweight Markdown → React for legal pages. Supports headings, paragraphs,
 * unordered lists, bold/italic, and links — enough for policy docs without a
 * new dependency.
 */
export function MarkdownBody({ source }: { source: string }) {
  const blocks = splitBlocks(source.trim());
  return (
    <div className="legal-prose space-y-4 text-[15px] leading-relaxed text-[#5C463C] md:text-base">
      {blocks.map((block, i) => (
        <Block key={i} block={block} />
      ))}
    </div>
  );
}

type Block =
  | { type: "h1" | "h2" | "h3"; text: string }
  | { type: "p"; text: string }
  | { type: "ul"; items: string[] };

function splitBlocks(source: string): Block[] {
  const lines = source.replace(/\r\n/g, "\n").split("\n");
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
      const text = heading[2]!.trim();
      blocks.push({
        type: level === 1 ? "h1" : level === 2 ? "h2" : "h3",
        text,
      });
      i += 1;
      continue;
    }

    if (/^[-*]\s+/.test(line.trim())) {
      const items: string[] = [];
      while (i < lines.length && /^[-*]\s+/.test((lines[i] ?? "").trim())) {
        items.push((lines[i] ?? "").trim().replace(/^[-*]\s+/, ""));
        i += 1;
      }
      blocks.push({ type: "ul", items });
      continue;
    }

    const para: string[] = [];
    while (
      i < lines.length &&
      (lines[i] ?? "").trim() &&
      !/^(#{1,3})\s+/.test((lines[i] ?? "").trim()) &&
      !/^[-*]\s+/.test((lines[i] ?? "").trim())
    ) {
      para.push((lines[i] ?? "").trim());
      i += 1;
    }
    blocks.push({ type: "p", text: para.join(" ") });
  }

  return blocks;
}

function Block({ block }: { block: Block }) {
  if (block.type === "h1") {
    // Document title is already in PageHeader; skip duplicate H1 from markdown.
    return null;
  }
  if (block.type === "h2") {
    return (
      <h2 className="mt-10 font-display text-2xl text-[#3A2A25] first:mt-0">
        {renderInline(block.text)}
      </h2>
    );
  }
  if (block.type === "h3") {
    return (
      <h3 className="mt-6 font-display text-xl text-[#3A2A25]">
        {renderInline(block.text)}
      </h3>
    );
  }
  if (block.type === "ul") {
    return (
      <ul className="list-disc space-y-2 pl-5">
        {block.items.map((item, idx) => (
          <li key={idx}>{renderInline(item)}</li>
        ))}
      </ul>
    );
  }
  return <p>{renderInline(block.text)}</p>;
}

function renderInline(text: string): ReactNode[] {
  // Order: links, then bold, then italic.
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
