"use client";

import type { ContentItem } from "@/lib/types";

import * as React from "react";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { Icon } from "@iconify/react";

import { FilmStrip } from "@/components/ui/film-strip";
import { Section } from "@/components/ui/section";
import { STUDIO } from "@/data/studio";

type YoutubeSectionProps = {
  /** Fetched by the server page — components never call a source directly. */
  videos: ContentItem[];
};

const BADGE = { label: "YouTube", icon: "mdi:youtube" };

/**
 * Studio's film reel.
 *
 * Videos can be browsed horizontally without changing the page's normal
 * vertical scroll, so visitors can continue directly to the projects below.
 */
export const YoutubeSection = ({ videos }: YoutubeSectionProps) => {
  const { channelUrl, channelHandle } = STUDIO.youtube;

  const reduced = useReducedMotion();

  return (
    <Section
      action={
        <a
          className="inline-flex items-center gap-2 text-sm font-medium text-ink-body transition-colors hover:text-primary"
          href={channelUrl}
          rel="noopener noreferrer"
          target="_blank"
        >
          {channelHandle}
          <Icon aria-hidden className="size-4" icon="lucide:arrow-up-right" />
        </a>
      }
      contentClassName="mt-7"
      description={STUDIO.youtube.description}
      eyebrow={STUDIO.youtube.eyebrow}
      icon="mdi:youtube"
      id="youtube"
      title={STUDIO.youtube.title}
    >
      {videos.length > 0 ? (
        <FilmStrip>
          {videos.map((video, index) => (
            <ReelCard key={video.id} index={index} item={video} />
          ))}

          {/* Terminal card: a way out of a row that scrolls sideways forever. */}
          <a
            className="flex w-[16rem] shrink-0 snap-start flex-col justify-between rounded-large border border-dashed border-divider bg-content1 p-6 transition-colors hover:border-primary hover:bg-content2 sm:w-[18rem]"
            href={channelUrl}
            rel="noopener noreferrer"
            target="_blank"
          >
            <Icon aria-hidden className="size-7 text-primary" icon="mdi:youtube" />
            <div>
              <p className="text-sm font-semibold text-ink-strong">Everything else</p>
              <p className="mt-1 text-sm text-ink-body">
                {videos.length} recent{" "}
                {videos.length === 1 ? "film" : "films"} on {channelHandle}
              </p>
            </div>
          </a>
        </FilmStrip>
      ) : (
        <div className="flex flex-col items-center gap-5 rounded-large border border-dashed border-divider bg-content1 px-6 py-16 text-center">
          <span className="flex size-14 items-center justify-center rounded-full bg-primary/12 text-primary">
            <Icon aria-hidden className="size-6" icon="mdi:youtube" />
          </span>

          <div className="max-w-md">
            <p className="text-base font-medium text-ink-strong">
              Nothing published on the channel yet
            </p>
            <p className="mt-2 text-pretty text-sm leading-relaxed text-ink-body">
              This section reads your channel directly, so it is empty until the
              first video goes public. Publish one, or add a playlist and point
              <code className="mx-1 rounded-small bg-content2 px-1.5 py-0.5 text-xs text-ink-strong">
                YOUTUBE_PLAYLIST_ID
              </code>
              at it — the films appear here on their own.
            </p>
          </div>

          <a
            className="inline-flex h-11 items-center gap-2 rounded-medium bg-primary px-5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
            href={channelUrl}
            rel="noopener noreferrer"
            target="_blank"
          >
            Open {channelHandle}
            <Icon aria-hidden className="size-4" icon="lucide:arrow-up-right" />
          </a>
        </div>
      )}
    </Section>
  );
};

/**
 * One frame of the reel. Landscape 16:9, film-labelled, and tilted a degree or
 * two in alternating directions so the row looks hand-laid rather than gridded.
 */
const ReelCard = ({ item, index }: { item: ContentItem; index: number }) => {
  const reduced = useReducedMotion();
  const [thumbFailed, setThumbFailed] = React.useState(false);

  const tilt = reduced ? 0 : index % 2 === 0 ? -1.6 : 1.6;

  // maxresdefault is absent for older/low-resolution uploads, so fall back to
  // the frame that exists for every video.
  const thumbnail =
    item.thumbnail && !thumbFailed
      ? item.thumbnail.replace("/maxresdefault.", "/hqdefault.")
      : undefined;

  return (
    <motion.a
      className="group relative block w-[78vw] shrink-0 snap-start sm:w-[26rem]"
      href={item.url ?? "#"}
      rel="noopener noreferrer"
      target="_blank"
      whileHover={reduced ? undefined : { y: -6, rotate: 0, scale: 1.015 }}
    >
      <article
        className="overflow-hidden rounded-large border border-divider bg-content1 shadow-[0_10px_40px_-24px_rgba(25,21,18,0.45)]"
        style={{ transform: `rotate(${tilt}deg)` }}
      >
        <div className="relative aspect-video w-full overflow-hidden bg-content3">
          {thumbnail ? (
            <Image
              fill
              alt=""
              className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
              sizes="(max-width: 640px) 78vw, 26rem"
              src={thumbnail}
              onError={() => setThumbFailed(true)}
            />
          ) : (
            <div className="flex size-full items-center justify-center bg-gradient-to-br from-content2 via-content2 to-content3">
              <Icon aria-hidden className="size-10 text-ink-muted" icon="mdi:youtube" />
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

          <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-black/55 px-2.5 py-1 text-[0.7rem] font-medium text-white backdrop-blur-sm">
            <Icon aria-hidden className="size-3.5" icon={BADGE.icon} />
            {BADGE.label}
          </span>

          {/* Play affordance that stays put until hover. */}
          <span className="absolute inset-0 flex items-center justify-center">
            <span className="flex size-12 scale-90 items-center justify-center rounded-full bg-white/90 text-black opacity-0 transition-all duration-300 group-hover:scale-100 group-hover:opacity-100">
              <Icon aria-hidden className="size-5" icon="lucide:play" />
            </span>
          </span>
        </div>

        <div className="p-5">
          <h3 className="text-balance font-semibold leading-snug text-ink-strong">
            {item.title}
          </h3>

          {item.description ? (
            <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-ink-body">
              {item.description}
            </p>
          ) : null}
        </div>
      </article>
    </motion.a>
  );
};