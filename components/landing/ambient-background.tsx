"use client";

import { motion } from "framer-motion";

const particles = Array.from({ length: 18 }, (_, i) => ({
  id: i,
  left: `${(i * 17 + 7) % 100}%`,
  top: `${(i * 23 + 11) % 100}%`,
  size: 2 + (i % 3),
  delay: i * 0.4,
  duration: 8 + (i % 5) * 2,
}));

export function AmbientBackground({ className }: { className?: string }) {
  return (
    <div
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className ?? ""}`}
      aria-hidden
    >
      <div
        className="absolute inset-0 opacity-60"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 70% 40%, #8E1020 0%, transparent 55%), radial-gradient(ellipse 60% 40% at 20% 80%, #B11226 0%, transparent 50%), radial-gradient(ellipse 50% 30% at 50% 0%, #151515 0%, transparent 70%)",
          animation: "kyndl-ambient-drift 20s ease-in-out infinite",
        }}
      />
      <div className="absolute inset-0 kyndl-grain opacity-30 mix-blend-overlay" />
      {particles.map((p) => (
        <motion.span
          key={p.id}
          className="absolute rounded-full bg-[#C21830]"
          style={{
            left: p.left,
            top: p.top,
            width: p.size,
            height: p.size,
            filter: "blur(1px)",
            opacity: 0.25 + (p.id % 3) * 0.1,
          }}
          animate={{
            y: [0, -20, 0],
            x: [0, 8, 0],
            opacity: [0.2, 0.5, 0.2],
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
