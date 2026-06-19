import type { Transition } from "framer-motion";

export const springTransition: Transition = {
  type: "spring",
  stiffness: 380,
  damping: 30,
};

export const smoothTransition: Transition = {
  duration: 0.35,
  ease: [0.22, 1, 0.36, 1],
};

export const pageTransition: Transition = {
  duration: 0.3,
  ease: "easeInOut",
};

export const microInteraction: Transition = {
  duration: 0.15,
  ease: "easeOut",
};
