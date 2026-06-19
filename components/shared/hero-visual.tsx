"use client";

import { motion } from "framer-motion";

import { scaleIn } from "@/lib/animations";

export function HeroVisual() {
  return (
    <motion.div
      variants={scaleIn}
      initial="hidden"
      animate="visible"
      className="relative aspect-video overflow-hidden rounded-2xl border bg-gradient-to-br from-primary/10 via-background to-accent p-8 shadow-xl"
    >
      <div className="grid h-full grid-cols-3 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <motion.div
            key={i}
            className="rounded-lg bg-muted/80"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * i, duration: 0.4 }}
          />
        ))}
      </div>
      <p className="absolute bottom-4 left-4 text-xs text-muted-foreground">
        Dashboard preview
      </p>
    </motion.div>
  );
}
