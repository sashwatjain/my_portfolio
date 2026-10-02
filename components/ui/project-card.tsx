"use client";

import type { ContentItem } from "@/lib/types";

import * as React from "react";
import Image from "next/image";
import { Icon } from "@iconify/react";

import { Glyph } from "@/components/ui/glyph";
import { cn } from "@/lib/utils";

export type ContentBadge = {
  label: string;
  icon: string;
};

export type ProjectCardProps = {
  item: ContentItem;

  /** Small identity marker, e.g. the Notion badge on an external page link. */
  badge?: ContentBadge;

  /** Hide tags entirely — useful when the source already groups by tag. */
  hideTags?: boolean;

  /**
   * Degrees of rotation, inlined as a transform. Studio uses alternating small
   * tilts so the grid looks laid out by hand; Career passes nothing and stays
   * perfectly square, which is the whole difference in character between the two.
   */
  tilt?: number;

  className?: string;
};

/**
 * Renders a normalised `ContentItem`. Deliberately data-free: the same card
 * serves GitHub repositories, YouTube videos and Notion pages without knowing
 * where any of them came from.
 */
export const ProjectCard = ({
  item,
  badge,
  hideTags,
  tilt = 0,
  className,
}: ProjectCardProps) => {
  const [thumbnailFailed, setThumbnailFailed] = React.useState(false);

  const showThumbnail = Boolean(item.thumbnail) && !thumbnailFailed;

  const body = (
    <>
      <div className="relative aspect-video w-full overflow-hidden rounded-large bg-content2">
        {showThumbnail ? (
          <Image
            fill
            unoptimized
            alt=""
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            sizes="(max-width: 640px) 19rem, 21rem"
            src={item.thumbnail as string}
            onError={() => setThumbnailFailed(true)}
          />
        ) : (
          <div className="flex size-full items-center justify-center bg-gradient-to-br from-content2 via-content2 to-content3">
            <Glyph
              className="text-4xl opacity-60"
              icon={item.icon ?? "lucide:layers"}
            />
          </div>
        )}

        {/* Scrim so overlaid chips stay legible over any thumbnail. */}
        <div className="absolute inset-0 bg-gradient-to-t from-background/85 via-background/10 to-transparent" />

        <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-2 p-3">
          {item.status ? <StatusChip status={item.status} /> : <span />}

          {badge ? <SourceBadge badge={badge} /> : null}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-balance text-base font-semibold leading-snug text-ink-strong">
          {item.title}
        </h3>

        {item.description ? (
          <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-ink-body">
            {item.description}
          </p>
        ) : null}

        {!hideTags && item.tags.length > 0 ? (
          <ul className="mt-4 flex flex-wrap gap-1.5">
            {item.tags.slice(0, 4).map((tag) => (
              <li
                key={tag}
                className="rounded-small bg-content2 px-2 py-1 text-xs font-medium text-ink-muted"
              >
                {tag}
              </li>
            ))}
          </ul>
        ) : null}

        <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-2 pt-5 text-xs text-ink-muted">
          {item.stats?.map((stat) => (
            <span key={stat.label} className="inline-flex items-center gap-1.5">
              <Icon aria-hidden className="size-3.5" icon={`lucide:${statIcon(stat.label)}`} />
              {stat.value}
              <span className="sr-only">{stat.label}</span>
            </span>
          ))}

          {item.date ? <span className="inline-flex items-center gap-1.5">{item.date}</span> : null}
        </div>
      </div>
    </>
  );

  const classNames = cn(
    "group flex h-full flex-col overflow-hidden rounded-large border border-divider bg-content1",
    "transition-[transform,border-color,box-shadow] duration-300 hover:border-primary/60",
    tilt === 0 && "hover:-translate-y-1",
    tilt !== 0 && "shadow-[0_8px_30px_-26px_rgba(25,21,18,0.5)]",
    item.url && "cursor-pointer",
    className,
  );

  const style = tilt === 0 ? undefined : { transform: `rotate(${tilt}deg)` };

  if (!item.url) {
    return (
      <article className={classNames} style={style}>
        {body}
      </article>
    );
  }

  return (
    <a
      className={cn(classNames, "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary")}
      href={item.url}
      rel="noopener noreferrer"
      style={style}
      target="_blank"
    >
      {body}
    </a>
  );
};

/** Maps our stat labels onto lucide glyphs, one literal map — never dynamic classes. */
const STAT_ICONS = {
  stars: "star",
  forks: "git-fork",
  views: "eye",
  likes: "heart",
  duration: "clock",
} as const;

const statIcon = (label: string) =>
  STAT_ICONS[label as keyof typeof STAT_ICONS] ?? "chevron-right";

const StatusChip = ({ status }: { status: string }) => {
  const tone = /done|shipped|live|complete/i.test(status)
    ? "bg-success/15 text-success"
    : /planning|idea|next|queued/i.test(status)
      ? "bg-content3 text-ink-muted"
      : "bg-primary/15 text-primary";

  return (
    <span className={cn("rounded-full px-2.5 py-1 text-xs font-medium", tone)}>{status}</span>
  );
};

const SourceBadge = ({ badge }: { badge: ContentBadge }) => (
  <span className="inline-flex items-center gap-1.5 rounded-full bg-background/80 px-2.5 py-1 text-xs font-medium text-ink-body backdrop-blur-sm">
    <Icon aria-hidden className="size-3.5" icon={badge.icon} />
    {badge.label}
  </span>
);
