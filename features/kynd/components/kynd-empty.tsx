import { KyndButton } from "@/features/kynd/components/kynd-button";

export function KyndEmpty({
  title,
  body,
  action,
  level = "h2",
}: {
  title: string;
  body?: string;
  action?: { label: string; onClick: () => void };
  level?: "h1" | "h2";
}) {
  const Heading = level;
  return (
    <div className="py-16 sm:py-24">
      <Heading className="max-w-md font-serif text-4xl leading-tight text-balance sm:text-5xl">
        {title}
      </Heading>
      {body ? (
        <p className="mt-4 max-w-sm text-base leading-relaxed text-[#5c4a43] dark:text-[#cbb8ad]">
          {body}
        </p>
      ) : null}
      {action ? (
        <KyndButton className="mt-8" onClick={action.onClick}>
          {action.label}
        </KyndButton>
      ) : null}
    </div>
  );
}
