"use client";

import * as React from "react";
import { animate, useInView } from "framer-motion";

type CounterProps = {
  /** e.g. "150K+", "3+", "20+". Only the numeric part is animated. */
  value: string;

  className?: string;

  /** Seconds. Keep it short — this is texture, not a feature. */
  duration?: number;
};

/**
 * Counts up once, when it scrolls into view.
 *
 * Deliberately small: it respects prefers-reduced-motion, and it never formats
 * differently from the literal it replaces (no "1,024" when the static copy
 * said "1K"). Anything that isn't a plain number passes straight through.
 */
export const Counter = ({ value, className, duration = 1.2 }: CounterProps) => {
  const ref = React.useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-15% 0px" });

  const match = /^(\D*)(\d[\d,]*)?(\D*)$/.exec(value);

  const prefix = match?.[1] ?? "";
  const digits = match?.[2] ?? "";
  const suffix = match?.[3] ?? "";

  const target = digits ? Number(digits.replace(/,/g, "")) : null;

  const [display, setDisplay] = React.useState(() =>
    target === null ? value : `${prefix}0${suffix}`,
  );

  React.useEffect(() => {
    if (target === null) return;

    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      setDisplay(value);

      return;
    }

    const controls = animate(0, target, {
      duration,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (latest) => setDisplay(`${prefix}${Math.round(latest)}${suffix}`),
    });

    return () => controls.stop();
    // Intentionally keyed on visibility + target only: re-running on every
    // `value` identity change would restart the count mid-scroll.
     
  }, [inView, target, prefix, suffix, duration]);

  React.useEffect(() => {
    if (inView && target !== null) setDisplay(`${prefix}0${suffix}`);
  }, [inView, prefix, suffix, target]);

  return (
    <span ref={ref} className={className}>
      {display}
    </span>
  );
};