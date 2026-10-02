import { Icon } from "@iconify/react";

import { Section } from "@/components/ui/section";
import { CAREER } from "@/data/career";

export const ExperienceSection = () => (
  <Section
    description="Roles that taught me what production actually demands."
    eyebrow="Experience"
    icon="lucide:briefcase"
    id="experience"
    title="Where I've worked"
  >
    <ol className="relative grid gap-8 border-l border-divider pl-6 md:pl-8">
      {CAREER.experience.map((role) => (
        <li key={`${role.company}-${role.period}`} className="relative">
          {/* Node on the timeline rail. */}
          <span
            aria-hidden
            className="absolute top-2 -left-[1.6875rem] size-3 rounded-full border-2 border-background bg-primary md:-left-[2.1875rem]"
          />

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <h3 className="text-lg font-semibold tracking-tight text-ink-strong">
              {role.role}
            </h3>

            <span className="text-ink-muted">·</span>

            <span className="text-sm font-medium text-primary">{role.company}</span>
          </div>

          <p className="mt-1.5 inline-flex items-center gap-1.5 text-sm text-ink-muted">
            <Icon aria-hidden className="size-3.5" icon="lucide:calendar" />
            {role.period}
          </p>

          <p className="mt-4 text-pretty leading-relaxed text-ink-body">{role.summary}</p>

          <ul className="mt-4 grid gap-2">
            {role.points.map((point) => (
              <li key={point} className="flex items-start gap-2.5 text-sm text-ink-muted">
                <Icon
                  aria-hidden
                  className="mt-1 size-3.5 shrink-0 text-primary/70"
                  icon="lucide:dot"
                />
                <span className="text-pretty">{point}</span>
              </li>
            ))}
          </ul>
        </li>
      ))}
    </ol>
  </Section>
);
