"use client";

import * as React from "react";

/**
 * Horizontally scrollable video row. It never captures vertical page scrolling,
 * so visitors can move straight past it to the next section.
 */
export const FilmStrip = ({ children }: { children: React.ReactNode }) => {
  return (
    <div
      aria-label="Videos"
      className="overflow-x-auto overscroll-x-contain pb-4 [scroll-snap-type:x_mandatory]"
      role="region"
    >
      <div className="flex w-max gap-5 px-1">{children}</div>
    </div>
  );
};

/**
 * Perforated sprocket edge, so the row reads as film rather than a slider.
 */
export const Sprockets = ({ side = "left" }: { side?: "left" | "right" }) => (
  <div
    aria-hidden
    className="pointer-events-none absolute inset-y-0 w-3 opacity-60"
    style={{
      [side]: 0,
      backgroundImage:
        "repeating-linear-gradient(to bottom, currentColor 0 6px, transparent 6px 16px)",
      maskImage:
        "linear-gradient(to right, transparent, black 35%, black 65%, transparent)",
      WebkitMaskImage:
        "linear-gradient(to right, transparent, black 35%, black 65%, transparent)",
    }}
  />
);