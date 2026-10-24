import { MarkdownBody as SharedMarkdownBody } from "@/components/shared/markdown-body";

export function MarkdownBody({ source }: { source: string }) {
  return (
    <SharedMarkdownBody
      source={source}
      skipH1
      className="legal-prose space-y-4 text-[15px] leading-relaxed text-[#5C463C] md:text-base"
    />
  );
}
