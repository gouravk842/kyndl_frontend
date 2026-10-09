"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { ROUTES } from "@/constants/routes";

/**
 * Persistent home-page shortcut. Replaces the old bottom Final CTA — always
 * one tap away once the visitor has scrolled past the hero's own buttons.
 */
export function CreateKeepsakeFab() {
  const reduceMotion = useReducedMotion();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      // Past the hero primary CTA band so we don't stack two identical buttons.
      setVisible(window.scrollY > 320);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.div
      className="pointer-events-none fixed right-4 bottom-[max(1.25rem,env(safe-area-inset-bottom))] z-50 sm:right-6"
      initial={false}
      animate={{
        opacity: visible ? 1 : 0,
        y: visible ? 0 : reduceMotion ? 0 : 12,
      }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      aria-hidden={!visible}
    >
      <Link
        href={ROUTES.memories}
        tabIndex={visible ? 0 : -1}
        className="pointer-events-auto group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#FF7A59] to-[#F2596F] px-5 py-3 text-sm font-medium text-white shadow-[0_16px_40px_-10px_rgba(242,89,111,0.55)] outline-none transition-transform duration-300 hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-[#F2596F]/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#FFF7F1]"
      >
        Keep a moment
        <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5" />
      </Link>
    </motion.div>
  );
}
