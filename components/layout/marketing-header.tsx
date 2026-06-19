"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { KyndlButton } from "@/components/landing/kyndl-button";
import { PageContainer } from "@/components/layout/page-container";
import { Logo } from "@/components/shared/logo";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "#experiences", label: "Experiences" },
  { href: ROUTES.games, label: "Games" },
  { href: "#gift-catalog", label: "Digital Gifts" },
  { href: "#showcase", label: "Interactive Demo" },
  { href: "#how-it-works", label: "How it works" },
] as const;

export function MarketingHeader() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 transition-all duration-500",
        scrolled
          ? "border-b border-white/[0.06] bg-[#090909]/70 backdrop-blur-xl"
          : "border-b border-transparent bg-transparent",
      )}
    >
      <PageContainer
        size="xl"
        className="flex h-16 items-center justify-between"
      >
        <Logo className="text-[#F5E9E2]" />
        <nav className="hidden items-center gap-8 lg:flex" aria-label="Main">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-sm text-[#B3B3B3] transition-colors duration-300 hover:text-[#F5E9E2]"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <Link
            href={ROUTES.login}
            className="hidden text-sm text-[#B3B3B3] transition-colors hover:text-[#F5E9E2] sm:inline"
          >
            Log in
          </Link>
          <KyndlButton href={ROUTES.register} size="default">
            Get Started
          </KyndlButton>
        </div>
      </PageContainer>
    </header>
  );
}
