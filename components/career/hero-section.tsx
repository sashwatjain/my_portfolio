"use client";

import Link from "next/link";
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion";
import { Icon } from "@iconify/react";

import { CAREER } from "@/data/career";
import { SITE } from "@/data/site";
import { Counter } from "@/components/ui/counter";
import { Portrait } from "@/components/ui/portrait";

const EASE = [0.16, 1, 0.3, 1] as const;

const rise = {
  hidden: { opacity: 0, y: 20 },
  shown: { opacity: 1, y: 0 },
};

/**
 * Career hero parallax — tuning notes.
 *
 * Two constraints fight here, and understanding them is the whole trick:
 *
 *  1. Parallax is only visible as DIFFERENTIAL motion between two things that
 *     are both on screen at once. It is impossible to see while your eye is
 *     tracking a 400px page scroll. Below roughly 30px of separation it simply
 *     does not register — which is why a long gentle range ends up invisible
 *     for its entire first half, then suddenly visible near the end.
 *
 *  2. The hero is only ~1030px tall, so it leaves the viewport after ~650px of
 *     scroll. Any drift range longer than that spends most of its motion
 *     off-screen, where it cannot be seen at all.
 *
 * So the range is deliberately SHORT (finishes while the hero is still on
 * screen) with HIGH travel (large enough to actually register), and the hero
 * below is padded taller to buy more room for both.
 *
 * HOLD is a lead-in: the drift does not move on the very first pixel of scroll,
 * so it never begins before you have started reading.
 *
 * The two layers move in OPPOSITE directions so the gap between them widens.
 * The spring is critically damped (ζ ≈ 1.0): it absorbs the quantised steps of a
 * mouse wheel without lagging behind them.
 */

/** px of scroll before the drift begins. */
const HOLD = 200;

/** px of scroll over which the drift completes. */
const RANGE = 1000;

/** px travelled. Total separation is COPY + PORTRAIT = 110px. */
const COPY_TRAVEL = -46;
const PORTRAIT_TRAVEL = 64;

const START = HOLD;
const END = HOLD + RANGE;

export const HeroSection = () => {
  const { hero } = CAREER;

  const reduced = useReducedMotion();

  const { scrollY } = useScroll();

  const smooth = useSpring(scrollY, {
    stiffness: 220,
    damping: 30,
    mass: 1,
    restDelta: 0.5,
  });

  const copyY = useTransform(smooth, [START, END], reduced ? [0, 0] : [0, COPY_TRAVEL]);
  const portraitY = useTransform(
    smooth,
    [START, END],
    reduced ? [0, 0] : [0, PORTRAIT_TRAVEL],
  );
  const fade = useTransform(smooth, [END - RANGE * 0.4, END], [1, 0.8]);

  return (
    <section className="scroll-mt-top w-full pt-24 pb-28 md:pt-32 md:pb-36" id="hero">
      <div className="mx-auto flex min-h-[calc(100vh-7rem)] w-full max-w-6xl flex-col justify-center px-6">
        <div className="flex flex-col items-start gap-14 lg:flex-row lg:items-center lg:gap-16">
          {/* Copy column */}
          <motion.div
            animate="shown"
            className="min-w-0 flex-1"
            initial="hidden"
            style={{ y: copyY }}
            variants={{ hidden: {}, shown: { transition: { staggerChildren: 0.1 } } }}
          >
            <motion.p className="eyebrow" transition={{ duration: 0.7, ease: EASE }} variants={rise}>
              {hero.eyebrow}
            </motion.p>

            <motion.h1
              className="mt-6 text-balance text-5xl font-semibold leading-[1.02] tracking-tight text-ink-strong sm:text-6xl md:text-7xl"
              transition={{ duration: 0.8, ease: EASE }}
              variants={rise}
            >
              {hero.name}
            </motion.h1>

            {/* Role as a letter-spaced lockup — reads as a title plate rather than
                another line of body copy. */}
            <motion.p
              className="mt-5 flex items-center gap-3 text-xs font-medium uppercase tracking-[0.22em] text-primary sm:text-sm"
              transition={{ duration: 0.7, ease: EASE }}
              variants={rise}
            >
              <span className="h-px w-8 bg-primary/60" />
              {hero.role}
            </motion.p>

            <motion.p
              className="mt-8 max-w-2xl text-pretty text-lg leading-relaxed text-ink-strong md:text-xl"
              transition={{ duration: 0.7, ease: EASE }}
              variants={rise}
            >
              {hero.tagline}
            </motion.p>

            <motion.p
              className="mt-5 max-w-2xl text-pretty text-base leading-relaxed text-ink-body md:text-lg"
              transition={{ duration: 0.7, ease: EASE }}
              variants={rise}
            >
              {hero.summary}
            </motion.p>

            <motion.div
              className="mt-10 flex flex-col gap-3 sm:flex-row"
              transition={{ duration: 0.7, ease: EASE }}
              variants={rise}
            >
              <Link
                className="inline-flex h-12 items-center justify-center gap-2 rounded-medium bg-primary px-6 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                href={hero.primaryCta.href}
              >
                {hero.primaryCta.label}
                <Icon aria-hidden className="size-4" icon="lucide:arrow-down" />
              </Link>

              <Link
                className="inline-flex h-12 items-center justify-center gap-2 rounded-medium border border-divider px-6 text-sm font-medium text-ink-strong transition-colors hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                href={hero.secondaryCta.href}
              >
                {hero.secondaryCta.label}
                <Icon aria-hidden className="size-4" icon="lucide:download" />
              </Link>
            </motion.div>
          </motion.div>

          {/* Portrait column — the "empty right side" is now the focal point. */}
          <motion.div
            className="w-full shrink-0 self-center lg:w-auto"
            style={{ y: portraitY, opacity: fade }}
          >
            <Portrait
              priority
              alt={`${SITE.name} — portrait`}
              className="flex flex-col items-center lg:items-end"
              size={264}
              src={SITE.profile.careerImage}
              tone="career"
            />
          </motion.div>
        </div>

        <dl className="mt-32 grid grid-cols-1 gap-px overflow-hidden rounded-large border border-divider bg-divider sm:grid-cols-3">
          {hero.stats.map((stat) => (
            <div key={stat.label} className="bg-content1 px-6 py-6">
              <dt className="text-xs uppercase tracking-[0.16em] text-ink-muted">
                {stat.label}
              </dt>
              <dd className="mt-2 text-3xl font-semibold tracking-tight text-ink-strong">
                <Counter value={stat.value} />
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
};