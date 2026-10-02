"use client";

import * as React from "react";
import { Icon } from "@iconify/react";

import { cn } from "@/lib/utils";

export type CarouselProps = {
  /** Called with the new scroll index when the user picks an arrow. */
  onActiveChange?: (index: number) => void;

  className?: string;
  itemClassName?: string;
  children: React.ReactNode;
};

const STEP = 0.8;

/**
 * Horizontal scroller built on native CSS scroll-snap — no slider dependency.
 * Arrows are progressive enhancement: the track scrolls by touch, wheel and
 * keyboard regardless.
 */
export const Carousel = ({
  onActiveChange,
  className,
  itemClassName,
  children,
}: CarouselProps) => {
  const trackRef = React.useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = React.useState(false);
  const [canScrollRight, setCanScrollRight] = React.useState(false);

  const items = React.Children.toArray(children);

  const syncEdges = React.useCallback(() => {
    const track = trackRef.current;

    if (!track) return;

    const maxScroll = track.scrollWidth - track.clientWidth;

    setCanScrollLeft(track.scrollLeft > 8);
    setCanScrollRight(track.scrollLeft < maxScroll - 8);
  }, []);

  React.useEffect(() => {
    const track = trackRef.current;

    if (!track) return;

    syncEdges();

    track.addEventListener("scroll", syncEdges, { passive: true });
    window.addEventListener("resize", syncEdges);

    return () => {
      track.removeEventListener("scroll", syncEdges);
      window.removeEventListener("resize", syncEdges);
    };
  }, [syncEdges]);

  const scrollBy = (direction: 1 | -1) => {
    const track = trackRef.current;

    if (!track) return;

    const cardWidth = items.length > 0 ? track.clientWidth / Math.min(items.length, 4) : track.clientWidth;

    track.scrollBy({
      left: cardWidth * STEP * direction,
      behavior: "smooth",
    });

    if (onActiveChange) {
      onActiveChange(
        Math.max(0, Math.min(items.length - 1, Math.round(track.scrollLeft / cardWidth))),
      );
    }
  };

  return (
    <div className={cn("relative", className)}>
      <div
        ref={trackRef}
        className={cn(
          "flex snap-x snap-mandatory gap-5 overflow-x-auto pb-4",
          // Hide the scrollbar; the arrows are the affordance.
          "[scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
        )}
      >
        {React.Children.map(children, (child) => (
          <div
            key={React.isValidElement(child) ? child.key : undefined}
            className={cn("w-[19rem] shrink-0 snap-start sm:w-[21rem]", itemClassName)}
          >
            {child}
          </div>
        ))}
      </div>

      {items.length > 2 ? (
        <div className="mt-6 flex items-center justify-end gap-2">
          <CarouselArrow
            direction="left"
            disabled={!canScrollLeft}
            onClick={() => scrollBy(-1)}
          />
          <CarouselArrow
            direction="right"
            disabled={!canScrollRight}
            onClick={() => scrollBy(1)}
          />
        </div>
      ) : null}
    </div>
  );
};

const CarouselArrow = ({
  direction,
  disabled,
  onClick,
}: {
  direction: "left" | "right";
  disabled: boolean;
  onClick: () => void;
}) => (
  <button
    aria-label={direction === "left" ? "Scroll left" : "Scroll right"}
    className={cn(
      "flex size-10 items-center justify-center rounded-full border border-divider text-ink-body",
      "transition-colors hover:border-primary hover:text-primary",
      "disabled:cursor-default disabled:opacity-35 disabled:hover:border-divider disabled:hover:text-ink-body",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
    )}
    disabled={disabled}
    type="button"
    onClick={onClick}
  >
    <Icon aria-hidden className="size-4" icon={`lucide:chevron-${direction}`} />
  </button>
);