"use client";

import * as React from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { Icon } from "@iconify/react";

import { STUDIO } from "@/data/studio";
import { SITE } from "@/data/site";
import { Portrait } from "@/components/ui/portrait";

const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * Studio hero.
 *
 * The headline arrives one *line* at a time — never letter by letter. Letter
 * animation is the single most reliable way to make a personal site feel like a
 * template; line-level timing reads as editing, not as a typewriter effect.
 *
 * Line breaks live in data/studio.ts as `taglineLines`, so the phrasing and the
 * pacing stay in the same place.
 */
export const HeroSection = () => {
  const { hero } = STUDIO;

  const reduced = useReducedMotion();

  return (
    <section className="scroll-mt-top w-full pt-16 pb-20 md:pt-24 md:pb-28" id="hero">
      <div className="mx-auto w-full max-w-6xl px-6">
        <div className="flex flex-col items-start gap-12 lg:flex-row lg:items-center lg:gap-14">
          <motion.div
            animate="shown"
            className="min-w-0 flex-1"
            initial="hidden"
            variants={{
              hidden: {},
              shown: { transition: { staggerChildren: reduced ? 0 : 0.14 } },
            }}
          >
            <motion.p
              className="eyebrow"
              transition={{ duration: 0.6, ease: EASE }}
              variants={{ hidden: { opacity: 0, y: 14 }, shown: { opacity: 1, y: 0 } }}
            >
              {hero.eyebrow}
            </motion.p>

            <h1 className="mt-6 max-w-2xl text-balance text-4xl font-semibold leading-[1.08] tracking-tight sm:text-5xl md:text-6xl">
              {hero.taglineLines.map((line, index) => (
                <motion.span
                  key={line.text}
                  className={`block ${line.accent ? "text-accent-2" : "text-ink-strong"}`}
                  transition={{ duration: 0.75, ease: EASE }}
                  variants={{
                    hidden: { opacity: 0, y: 22 },
                    shown: { opacity: 1, y: 0 },
                  }}
                >
                  {line.text}
                </motion.span>
              ))}
            </h1>

            <motion.p
              className="mt-7 flex items-center gap-3 text-xs font-medium uppercase tracking-[0.22em] text-accent-2 sm:text-sm"
              transition={{ duration: 0.7, ease: EASE }}
              variants={{ hidden: { opacity: 0, y: 18 }, shown: { opacity: 1, y: 0 } }}
            >
              <span className="h-px w-8 bg-accent-2/60" />
              {hero.role}
            </motion.p>

            <motion.p
              className="mt-7 max-w-xl text-pretty text-base leading-relaxed text-ink-body md:text-lg"
              transition={{ duration: 0.7, ease: EASE }}
              variants={{ hidden: { opacity: 0, y: 18 }, shown: { opacity: 1, y: 0 } }}
            >
              {hero.summary}
            </motion.p>

            <motion.div
              className="mt-10 flex flex-col gap-3 sm:flex-row"
              transition={{ duration: 0.7, ease: EASE }}
              variants={{ hidden: { opacity: 0, y: 18 }, shown: { opacity: 1, y: 0 } }}
            >
              <a
                className="inline-flex h-12 items-center justify-center gap-2 rounded-medium bg-primary px-6 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                href={hero.primaryCta.href}
              >
                <Icon aria-hidden className="size-4" icon="mdi:youtube" />
                {hero.primaryCta.label}
              </a>

              <a
                className="inline-flex h-12 items-center justify-center gap-2 rounded-medium border border-divider bg-content1 px-6 text-sm font-medium text-ink-strong transition-colors hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                href={hero.secondaryCta.href}
              >
                {hero.secondaryCta.label}
                <Icon aria-hidden className="size-4" icon="lucide:arrow-down" />
              </a>
            </motion.div>

            <motion.p
              className="mt-14 text-sm text-ink-muted"
              transition={{ duration: 0.7, ease: EASE }}
              variants={{ hidden: { opacity: 0, y: 14 }, shown: { opacity: 1, y: 0 } }}
            >
              {SITE.name} — the same person as{" "}
              <Link className="text-primary underline-offset-4 hover:underline" href="/">
                the career page
              </Link>
              , different hours.
            </motion.p>
          </motion.div>

          {/* Playful treatment: tilted, floating, warm-washed, and captioned. */}
          <Portrait
            priority
            alt={`${SITE.name} — portrait`}
            caption="that's me :)"
            className="flex w-full shrink-0 flex-col items-center self-center lg:w-auto"
            size={272}
            src={SITE.profile.studioImage}
            tone="studio"
          />
        </div>
      </div>
    </section>
  );
};