import { Icon } from "@iconify/react";

import { Section } from "@/components/ui/section";
import { CAREER } from "@/data/career";

export const SkillsSection = () => (
  <Section
    description="What I reach for, and why."
    eyebrow="Toolkit"
    icon="lucide:sparkles"
    id="skills"
    title="Skills & technologies"
  >
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {CAREER.technologies.map((group) => (
        <article
          key={group.id}
          className="flex flex-col rounded-large border border-divider bg-content1 p-6"
        >
          <div className="flex items-center gap-3">
            <span className="flex size-9 items-center justify-center rounded-medium bg-primary/12 text-primary">
              <Icon aria-hidden className="size-4" icon={group.icon} />
            </span>

            <h3 className="text-base font-semibold tracking-tight text-ink-strong">
              {group.title}
            </h3>
          </div>

          <p className="mt-4 text-sm leading-relaxed text-ink-muted">{group.description}</p>

          <ul className="mt-6 flex flex-wrap gap-2">
            {group.tools.map((tool) => (
              <li
                key={tool.name}
                className="inline-flex items-center gap-2 rounded-full border border-divider bg-content2 px-3 py-1.5 text-sm text-ink-body"
              >
                <Icon aria-hidden className="size-3.5 text-ink-muted" icon={tool.icon} />
                {tool.name}
              </li>
            ))}
          </ul>
        </article>
      ))}
    </div>
  </Section>
);
