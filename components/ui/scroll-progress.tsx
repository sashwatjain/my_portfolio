"use client";

import { motion, useScroll, useSpring } from "framer-motion";

/**
 * Hairline read-progress bar pinned to the top of the viewport.
 *
 * Colour comes from the active theme automatically (bg-primary), so it reads
 * red on / and amber on /studio with no props and no branching.
 */
export const ScrollProgress = () => {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 140,
    damping: 28,
    restDelta: 0.001,
  });

  return (
    <motion.div
      aria-hidden
      className="fixed inset-x-0 top-0 z-[60] h-[2px] origin-left bg-primary"
      style={{ scaleX }}
    />
  );
};