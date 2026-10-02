"use client";

import * as React from "react";
import { motion, useInView } from "framer-motion";

type RevealProps = {
  children: React.ReactNode;

  className?: string;

  /** Seconds. */
  delay?: number;

  /** px travelled. Keep small — this is texture, not a slide show. */
  y?: number;
};

/**
 * Fades content up once, when it enters the viewport.
 *
 * The whole motion budget for this site is "responsive, not animated": things
 * move because you scrolled to them, then they hold still. Nothing loops, and
 * nothing animates twice.
 */
export const Reveal = ({
  children,
  className,
  delay = 0,
  y = 18,
}: RevealProps) => {
  const ref = React.useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-12% 0px -10% 0px" });

  return (
    <motion.div
      ref={ref}
      animate={inView ? "shown" : "hidden"}
      className={className}
      initial="hidden"
      transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }}
      variants={{ hidden: { opacity: 0, y }, shown: { opacity: 1, y: 0 } }}
    >
      {children}
    </motion.div>
  );
};

/**
 * Staggers direct children on entry. Use when a group should arrive as a
 * sequence — e.g. hero eyebrow -> title -> role -> copy -> actions.
 */
export const RevealGroup = ({
  children,
  className,
  step = 0.09,
  y = 18,
}: {
  children: React.ReactNode;
  className?: string;
  step?: number;
  y?: number;
}) => {
  const ref = React.useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });

  return (
    <motion.div
      ref={ref}
      animate={inView ? "shown" : "hidden"}
      className={className}
      initial="hidden"
      variants={{
        hidden: {},
        shown: { transition: { staggerChildren: step, delayChildren: 0.05 } },
      }}
    >
      {React.Children.map(children, (child) =>
        React.isValidElement(child) ? (
          <motion.div variants={{ hidden: { opacity: 0, y }, shown: { opacity: 1, y: 0 } }}>
            {child}
          </motion.div>
        ) : (
          child
        ),
      )}
    </motion.div>
  );
};