import { Icon } from "@iconify/react";

import { Section } from "@/components/ui/section";
import { CAREER } from "@/data/career";

/**
 * The institute is the headline. `featured` renders large; everything else is
 * deliberately compact so the visual hierarchy matches the actual importance.
 */
export const EducationSection = () => {
  const { featured, earlier } = CAREER.education;

  return (
    <Section
      description="Where the engineering habit came from."
      eyebrow="Education"
      icon="lucide:graduation-cap"
      id="education"
      title="Education"
    >
      <div className="grid gap-5">
        <article className="relative overflow-hidden rounded-large border border-divider bg-content1 p-8 md:p-10">
          {/* Faint primary wash, anchored top-left. */}
          <div
            aria-hidden
            className="pointer-events-none absolute -left-20 -top-24 size-72 rounded-full bg-primary/10 blur-3xl"
          />

          <div className="relative">
            <div className="flex flex-wrap items-center gap-3">
              <span className="flex size-11 items-center justify-center rounded-medium bg-primary/12 text-primary">
                <Icon aria-hidden className="size-5" icon={featured.emblem} />
              </span>

              <span className="rounded-full border border-divider px-3 py-1 text-xs font-medium text-ink-muted">
                {featured.honour}
              </span>
            </div>

            <h3 className="mt-6 max-w-2xl text-balance text-2xl font-semibold tracking-tight text-ink-strong md:text-3xl">
              {featured.institution}
            </h3>

            {/* Muted metadata — the degree supports the institute, not the reverse. */}
            <p className="mt-3 text-sm text-ink-muted">
              {featured.degree} · {featured.period}
            </p>

            <p className="mt-6 max-w-2xl text-pretty leading-relaxed text-ink-body">
              {featured.summary}
            </p>

            <ul className="mt-6 grid gap-2 sm:grid-cols-2">
              {featured.highlights.map((highlight) => (
                <li
                  key={highlight}
                  className="flex items-start gap-2.5 text-sm text-ink-muted"
                >
                  <Icon
                    aria-hidden
                    className="mt-0.5 size-4 shrink-0 text-primary"
                    icon="lucide:check"
                  />
                  {highlight}
                </li>
              ))}
            </ul>
          </div>
        </article>

        <ul className="grid gap-5 sm:grid-cols-2">
          {earlier.map((entry) => (
            <li
              key={entry.shortName}
              className="rounded-large border border-divider bg-content1 p-6"
            >
              <div className="flex items-baseline justify-between gap-4">
                <h3 className="text-sm font-semibold text-ink-strong">{entry.institution}</h3>
                <span className="shrink-0 text-xs text-ink-muted">{entry.period}</span>
              </div>

              <p className="mt-2 text-sm leading-relaxed text-ink-muted">{entry.detail}</p>
            </li>
          ))}
        </ul>
      </div>
    </Section>
  );
};
