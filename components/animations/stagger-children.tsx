"use client";

import { type HTMLMotionProps, motion } from "framer-motion";

import { staggerContainer, staggerItem } from "@/lib/animations";

type StaggerChildrenProps = HTMLMotionProps<"div">;

export function StaggerChildren({ children, ...props }: StaggerChildrenProps) {
  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-64px" }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children, ...props }: HTMLMotionProps<"div">) {
  return (
    <motion.div variants={staggerItem} {...props}>
      {children}
    </motion.div>
  );
}
