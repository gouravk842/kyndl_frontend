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
  compact = false,
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
  /**
   * Tighter padding + type scale. Use on catalog/listing pages where the header
   * is a lead-in to a grid rather than a landing-page hero, so the main content
   * sits higher on the page.
   */
  compact?: boolean;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "relative",
        compact ? "pt-8 md:pt-12" : "pt-14 md:pt-20",
        className,
      )}
    >
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
            <h1
              className={cn(
                "font-display leading-[1.06] text-[#3A2A25]",
                compact
                  ? "text-3xl sm:text-4xl"
                  : "text-3xl sm:text-4xl lg:text-5xl",
              )}
            >
              {title}
            </h1>
            {subtitle && (
              <p
                className={cn(
                  "max-w-xl leading-relaxed text-[#7A6258]",
                  compact ? "mt-3 text-base" : "mt-4 text-lg",
                )}
              >
                {subtitle}
              </p>
            )}
          </div>
          {actions && (
            <div className="flex flex-wrap items-center gap-3">{actions}</div>
          )}
        </div>
        {children && (
          <div className={compact ? "mt-5" : "mt-8"}>{children}</div>
        )}
      </PageContainer>
    </section>
  );
}
