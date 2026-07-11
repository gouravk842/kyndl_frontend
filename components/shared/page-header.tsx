import { PageContainer } from "@/components/layout/page-container";
import { cn } from "@/lib/utils";

/**
 * The shared top-of-page header. Every marketing/section page used to hand-roll
 * its own heading block, so they drifted in size, spacing, and eyebrow style.
 * This centralizes the pattern — eyebrow · display title · subtitle · actions —
 * so section pages read as one system. Pure/server-safe (no client hooks).
 */
export function PageHeader({
  eyebrow,
  title,
  subtitle,
  actions,
  children,
  size = "xl",
  glow = true,
  className,
}: {
  eyebrow?: string;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  /** Right-aligned actions (buttons/links) on wider screens. */
  actions?: React.ReactNode;
  /** Rendered below the header block — e.g. a section sub-nav. */
  children?: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl" | "full";
  /** Soft warm radial wash behind the header. */
  glow?: boolean;
  className?: string;
}) {
  return (
    <section className={cn("relative pt-14 md:pt-20", className)}>
      {glow && (
        <div
          className="pointer-events-none absolute inset-0 opacity-70"
          style={{
            background:
              "radial-gradient(ellipse 44% 34% at 16% 10%, rgba(255,160,120,0.28) 0%, transparent 72%), radial-gradient(ellipse 40% 32% at 86% 80%, rgba(242,89,111,0.2) 0%, transparent 72%)",
          }}
          aria-hidden
        />
      )}
      <PageContainer size={size} className="relative">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-2xl">
            {eyebrow && (
              <p className="mb-2 text-sm font-medium tracking-[0.2em] text-[#C75B39] uppercase">
                {eyebrow}
              </p>
            )}
            <h1 className="font-display text-3xl leading-[1.06] text-[#3A2A25] sm:text-4xl lg:text-5xl">
              {title}
            </h1>
            {subtitle && (
              <p className="mt-4 max-w-xl text-lg leading-relaxed text-[#7A6258]">
                {subtitle}
              </p>
            )}
          </div>
          {actions && (
            <div className="flex flex-wrap items-center gap-3">{actions}</div>
          )}
        </div>
        {children && <div className="mt-8">{children}</div>}
      </PageContainer>
    </section>
  );
}
