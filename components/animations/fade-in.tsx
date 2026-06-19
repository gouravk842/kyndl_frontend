"use client";

import { type HTMLMotionProps, motion } from "framer-motion";

import { fadeInUp } from "@/lib/animations";

type FadeInProps = HTMLMotionProps<"div"> & {
  delay?: number;
};

export function FadeIn({ children, delay = 0, ...props }: FadeInProps) {
  return (
    <motion.div
      variants={fadeInUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-48px" }}
      transition={{ delay }}
      {...props}
    >
      {children}
    </motion.div>
  );
}
