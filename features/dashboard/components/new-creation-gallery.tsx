"use client";

import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

import { ExperienceIcon } from "@/components/shared/experience-icon";
import { hasBuilder, newCreationHref } from "@/lib/creations";
import { featuredExperiences } from "@/lib/experiences";
import { cn } from "@/lib/utils";

/**
 * The "start something new" rail — one tile per live experience, drawn straight
 * from the shared experience registry so it stays in lockstep with the rest of
 * the site. Tiles whose builder has shipped read "Create"; the rest send the
 * user to the live experience to try it while their studio is on the way.
 */
export function NewCreationGallery() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      {featuredExperiences.map((exp) => {
        const buildable = hasBuilder(exp.slug);
        return (
          <Link
            key={exp.slug}
            href={newCreationHref(exp.slug)}
            className="group relative flex flex-col gap-3 overflow-hidden rounded-2xl bg-card p-4 ring-1 ring-foreground/10 transition-all duration-300 hover:-translate-y-0.5 hover:ring-[#FF7A59]/45"
          >
            <span
              className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
              style={{ background: exp.previewGradient }}
              aria-hidden
            />
            <span className="relative flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#FF7A59] to-[#F2596F] text-white shadow-sm">
              <ExperienceIcon name={exp.icon} className="size-5" />
            </span>
            <div className="relative">
              <p className="font-heading text-sm leading-snug font-medium text-foreground">
                {exp.name}
              </p>
              <p
                className={cn(
                  "mt-1 inline-flex items-center gap-0.5 text-xs",
                  buildable ? "text-primary" : "text-muted-foreground",
                )}
              >
                {buildable ? "Create" : "Try it"}
                <ArrowUpRight className="size-3" />
              </p>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
