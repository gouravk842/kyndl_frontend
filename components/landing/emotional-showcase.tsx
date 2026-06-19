"use client";

import { motion } from "framer-motion";
import { Gift, Heart, Lock, Sparkles } from "lucide-react";

export function EmotionalShowcase() {
  return (
    <div
      className="relative aspect-[4/5] w-full max-w-md mx-auto lg:max-w-none"
      style={{ perspective: "1400px" }}
    >
      <div
        className="absolute inset-0 rounded-3xl opacity-60"
        style={{
          background:
            "radial-gradient(ellipse at center, #8E1020 0%, transparent 65%)",
        }}
      />
      <motion.div
        className="relative h-full rounded-3xl border border-white/[0.06] bg-[#111111]/80 p-6 backdrop-blur-xl"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
        style={{ transformStyle: "preserve-3d" }}
      >
        <motion.div
          className="absolute left-5 top-6 rounded-full border border-white/[0.1] bg-[#0E0E0E]/90 px-3 py-1 text-[11px] text-[#F5E9E2]"
          style={{ transform: "translateZ(30px)" }}
          animate={{ y: [0, -4, 0] }}
          transition={{ duration: 4.6, repeat: Infinity, ease: "easeInOut" }}
        >
          3D gifting preview
        </motion.div>

        <motion.div
          className="absolute -right-4 top-8 w-[72%] rounded-2xl border border-[#C21830]/20 bg-gradient-to-br from-[#151515] to-[#111111] p-5 shadow-2xl"
          style={{
            transform: "translateZ(96px) rotateY(-12deg) rotateX(7deg)",
          }}
          animate={{ y: [0, -8, 0], rotateZ: [0, -0.8, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        >
          <div className="mb-3 flex items-center gap-2 text-[#D4A373]">
            <Sparkles className="size-3.5" />
            <span className="text-xs font-medium tracking-wide uppercase">
              Love card
            </span>
          </div>
          <p className="font-display text-lg leading-snug text-[#F5E9E2]">
            For the moment words
            <br />
            <span className="text-[#C21830]">couldn&apos;t hold.</span>
          </p>
          <div className="mt-4 h-px bg-gradient-to-r from-[#B11226]/50 to-transparent" />
          <p className="mt-3 text-xs text-[#B3B3B3]">Opens at midnight</p>
        </motion.div>

        <motion.div
          className="absolute bottom-12 left-0 w-[65%] rounded-2xl border border-white/[0.04] bg-[#151515]/90 p-4 backdrop-blur-md"
          style={{ transform: "translateZ(56px) rotateY(10deg)" }}
          animate={{ y: [0, 9, 0] }}
          transition={{
            duration: 7,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
        >
          <div className="flex items-center gap-2 text-[#B3B3B3]">
            <Lock className="size-3" />
            <span className="text-xs">Hidden message</span>
          </div>
          <p className="mt-2 blur-[3px] text-sm text-[#F5E9E2]/80 select-none">
            I still think about that night...
          </p>
        </motion.div>

        <motion.div
          className="absolute left-[28%] top-[46%] w-[48%] rounded-2xl border border-[#D4A373]/25 bg-[#0F0F0F]/95 p-4"
          style={{
            transform: "translateZ(132px) rotateX(-3deg) rotateY(-8deg)",
          }}
          animate={{ y: [0, -6, 0] }}
          transition={{
            duration: 6.5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.5,
          }}
        >
          <p className="flex items-center gap-2 text-[11px] tracking-wider text-[#D4A373] uppercase">
            <Gift className="size-3.5" />
            Custom surprise box
          </p>
          <p className="mt-2 text-xs text-[#F5E9E2]">
            Card + game + secret note for your partner.
          </p>
        </motion.div>

        <motion.div
          className="absolute bottom-4 right-8 flex size-12 items-center justify-center rounded-full bg-[#B11226]/20"
          style={{ transform: "translateZ(142px)" }}
          animate={{ scale: [1, 1.08, 1], y: [0, -2, 0] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
        >
          <Heart className="size-5 fill-[#B11226] text-[#C21830]" aria-hidden />
        </motion.div>

        <motion.div
          className="absolute left-6 top-1/2 size-2 rounded-full bg-[#D7263D]"
          animate={{ opacity: [0.3, 0.8, 0.3], scale: [1, 1.2, 1] }}
          transition={{ duration: 3, repeat: Infinity }}
        />
        <motion.div
          className="absolute right-12 top-1/4 size-1.5 rounded-full bg-[#D4A373]"
          animate={{ opacity: [0.2, 0.6, 0.2] }}
          transition={{ duration: 4, repeat: Infinity, delay: 0.5 }}
        />
      </motion.div>
    </div>
  );
}
