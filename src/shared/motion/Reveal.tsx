"use client";

import { motion } from "framer-motion";

import { rise } from "./variants";

/**
 * Reveal — entrée d'écran/section discrète (« rise », CHARTE §2.3).
 * Joue à l'apparition dans le viewport, une seule fois. `MotionConfig
 * reducedMotion="user"` (app-providers) neutralise l'animation au besoin.
 */
export function Reveal({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      className={className}
      variants={rise}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.42, ease: [0.2, 0.7, 0.2, 1], delay }}
    >
      {children}
    </motion.div>
  );
}
