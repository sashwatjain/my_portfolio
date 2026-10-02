"use client";

import * as React from "react";
import { motion, useInView } from "framer-motion";
import { Icon } from "@iconify/react";

import { cn } from "@/lib/utils";

export type SectionProps = {
  /** MUST match an `id` registered in SECTIONS (data/site.ts) or nav will drift. */
  id: string;

  eyebrow?: string;
  icon?: string;
  title: string;
  description?: string;

  /** Right-aligned slot in the heading row — a "View profile" link, usually. */
  action?: React.ReactNode;

  className?: string;
  contentClassName?: string;

  children: React.ReactNode;
};

/**
 * The anchor, heading layout, scroll-margin for the sticky top bar, the
 * scroll-reveal animation and the vertical rhythm — all in one place, so no
 * section component has to repeat them. See AGENTS.md section 4.
 */
export const Section = ({
  id,
  eyebrow,
  icon,
  title,
  description,
  action,
  className,
  contentClassName,
  children,
}: SectionProps) => {
  const ref = React.useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-12% 0px -12% 0px" });

  return (
    <section
      ref={ref}
      className={cn("scroll-mt-top w-full py-20 md:py-28", className)}
      id={id}
    >
      <div className="mx-auto w-full max-w-6xl px-6">
        <motion.div
          animate={inView ? { opacity: 1, y: 0 } : {}}
          initial={{ opacity: 0, y: 14 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-2xl">
              {eyebrow ? (
                <p className="eyebrow">
                  {icon ? <Icon aria-hidden className="text-sm" icon={icon} /> : null}
                  {eyebrow}
                </p>
              ) : null}

              <h2 className="mt-4 text-balance text-3xl font-semibold tracking-tight text-ink-strong md:text-4xl">
                {title}
              </h2>

              {description ? (
                <p className="mt-4 max-w-2xl text-pretty text-base leading-relaxed text-ink-body md:text-lg">
                  {description}
                </p>
              ) : null}
            </div>

            {action ? <div className="shrink-0">{action}</div> : null}
          </div>
        </motion.div>

        <motion.div
          animate={inView ? { opacity: 1, y: 0 } : {}}
          className={cn("mt-12", contentClassName)}
          initial={{ opacity: 0, y: 18 }}
          transition={{ duration: 0.6, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
        >
          {children}
        </motion.div>
      </div>
    </section>
  );
};