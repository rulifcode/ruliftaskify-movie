"use client";

import { motion } from "framer-motion";

const variants = {
  // Arah slide: login dari kiri, register dari kanan
  initial: (direction: number) => ({
    x: direction > 0 ? "100%" : "-100%",
    opacity: 0,
  }),
  animate: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction > 0 ? "-100%" : "100%",
    opacity: 0,
  }),
};

const transition = {
  type: "tween",
  ease: [0.25, 0.46, 0.45, 0.94], // ease-out-quart
  duration: 0.45,
};

interface PageTransitionProps {
  children: React.ReactNode;
  direction?: number; // +1 = slide kanan→kiri (login→register), -1 = kebalikannya
}

export default function PageTransition({ children, direction = 1 }: PageTransitionProps) {
  return (
    <motion.div
      custom={direction}
      variants={variants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={transition}
      style={{ position: "absolute", inset: 0, willChange: "transform" }}
    >
      {children}
    </motion.div>
  );
}