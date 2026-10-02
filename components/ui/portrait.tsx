"use client";

import Image from "next/image";
import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";

type PortraitProps = {
  src: string;

  alt: string;

  /** Rendered size in px for the square-ish frame. */
  size?: number;

  /**
   * career = circular, red glow, restrained.
   * studio = irregular rounded card, amber glow, slight tilt + float.
   */
  tone?: "career" | "studio";

  priority?: boolean;

  className?: string;

  /** Floating caption under the frame, e.g. "that's me :)". */
  caption?: string;
};

const TONE = {
  career: {
    frame: "rounded-full",
    inner: "scale-100",
    tilt: "0deg",
    float: false,
  },
  studio: {
    frame: "rounded-[2rem] lg:rounded-[2.75rem]",
    inner: "scale-[1.04]",
    tilt: "-3deg",
    float: true,
  },
} as const;

/**
 * The one place a portrait is rendered.
 *
 * Same photo on both pages, deliberately: the point of the Career/Studio split
 * is two moods of one person, not two different people. Presentation changes,
 * the face does not.
 */
export const Portrait = ({
  src,
  alt,
  size = 208,
  tone = "career",
  priority = false,
  className,
  caption,
}: PortraitProps) => {
  const reduced = useReducedMotion();
  const t = TONE[tone];

  const tilt = reduced ? 0 : parseFloat(t.tilt);

  return (
    <div className={className}>
      <div
      className={t.float && !reduced ? "animate-float-slow" : undefined}
      style={{
        width: size,
        height: size,
        "--tilt": `${tilt}deg`,
      } as React.CSSProperties}
      >
      <motion.div
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className={`portrait-glow relative size-full overflow-hidden border border-divider bg-content2 ${t.frame}`}
        initial={{ opacity: 0, scale: 0.94, y: 14 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
      >
        <Image
          fill
          alt={alt}
            className={`object-cover ${t.inner}`}
            priority={priority}
            sizes={`${size}px`}
            src={src}
          />

          {/* Studio gets a warm inner wash so the photo sits in the cream palette. */}
          {tone === "studio" ? (
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-accent-2/20 via-transparent to-transparent" />
          ) : null}
        </motion.div>
      </div>

      {caption ? (
        <p
          className={`mt-4 text-sm text-ink-muted ${
            tone === "studio" ? "rotate-[-2deg] font-medium" : ""
          }`}
        >
          {caption}
        </p>
      ) : null}
    </div>
  );
};