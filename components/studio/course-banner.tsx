import { Icon } from "@iconify/react";

const COURSE_PLAYLIST =
  "https://www.youtube.com/playlist?list=PLUMzoHftc-3U";

export const CourseBanner = () => (
  <section
    aria-labelledby="course-banner-title"
    className="scroll-mt-top w-full pb-8 md:pb-12"
    id="course"
  >
    <div className="mx-auto w-full max-w-6xl px-6">
      <div className="relative isolate overflow-hidden rounded-[2rem] border border-primary/25 bg-gradient-to-br from-content1 via-content2 to-primary/10 p-6 shadow-[0_24px_80px_-48px_rgba(255,159,28,0.65)] sm:p-8 md:p-10">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-12 -top-16 -z-10 size-56 rounded-full bg-primary/15 blur-3xl sm:size-72"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-20 left-1/3 -z-10 size-48 rounded-full bg-accent-2/10 blur-3xl"
        />

        <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:gap-12">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-primary">
              <Icon aria-hidden className="size-4" icon="lucide:party-popper" />
              New course · Module 1
            </p>

            <h2
              className="mt-5 max-w-3xl text-balance text-2xl font-semibold leading-tight tracking-tight text-ink-strong sm:text-3xl md:text-4xl"
              id="course-banner-title"
            >
              Make your video from footage to a{" "}
              <span className="text-primary">finished film.</span>
            </h2>

            <p className="mt-4 max-w-2xl text-pretty leading-relaxed text-ink-body md:text-lg">
              Join me for <span className="font-medium text-ink-strong">The AI Video Editing Workflow</span>
              {" "}— from raw footage to final video. Start with the first module, pick up a
              few new tricks, and let&apos;s make something great.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
            <a
              className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              href={COURSE_PLAYLIST}
              rel="noopener noreferrer"
              target="_blank"
            >
              <Icon aria-hidden className="size-4" icon="lucide:play" />
              Start this course
              <Icon aria-hidden className="size-4" icon="lucide:arrow-up-right" />
            </a>

            <a
              className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-divider bg-content1/80 px-6 text-sm font-medium text-ink-strong transition-colors hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              href="#contact"
            >
              <Icon aria-hidden className="size-4 text-primary" icon="lucide:message-circle-heart" />
              Connect for more
              <Icon aria-hidden className="size-4" icon="lucide:arrow-down" />
            </a>
          </div>
        </div>

        <div aria-hidden className="mt-8 flex items-center gap-2">
          <span className="size-2 rounded-full bg-primary" />
          <span className="h-0.5 w-10 rounded-full bg-primary/40" />
          <span className="size-2 rounded-full bg-primary/50" />
          <span className="h-0.5 w-10 rounded-full bg-primary/25" />
          <span className="size-2 rounded-full bg-primary/30" />
          <span className="ml-2 text-xs font-medium tracking-wide text-ink-muted">
            Your next creative rabbit hole starts here
          </span>
        </div>
      </div>
    </div>
  </section>
);
