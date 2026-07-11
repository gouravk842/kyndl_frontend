"use client";

import { motion } from "framer-motion";

const motes = Array.from({ length: 8 }, (_, i) => ({
  id: i,
  left: `${(i * 23 + 9) % 96}%`,
  top: `${(i * 31 + 13) % 90}%`,
  size: 4 + (i % 3) * 2,
  delay: i * 0.6,
  duration: 9 + (i % 4) * 2,
}));

export function AmbientBackground({ className }: { className?: string }) {
  return (
    <div
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className ?? ""}`}
      aria-hidden
    >
      {/* Soft warm light blooms — like sunlight through a wrapped gift */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 70% 55% at 78% 20%, rgba(255,160,120,0.45) 0%, transparent 60%), radial-gradient(ellipse 60% 50% at 12% 78%, rgba(242,89,111,0.28) 0%, transparent 58%), radial-gradient(ellipse 55% 45% at 50% 110%, rgba(240,161,61,0.22) 0%, transparent 60%)",
          animation: "kyndl-ambient-drift 22s ease-in-out infinite",
        }}
      />
      {/* Floating heart-warm motes */}
      {motes.map((p) => (
        <motion.span
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: p.left,
            top: p.top,
            width: p.size,
            height: p.size,
            background:
              "radial-gradient(circle, rgba(255,122,89,0.7) 0%, rgba(242,89,111,0) 75%)",
          }}
          animate={{
            y: [0, -26, 0],
            x: [0, 10, 0],
            opacity: [0.15, 0.5, 0.15],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            ease: "easeInOut",
            delay: p.delay,
          }}
        />
      ))}
    </div>
  );
}
