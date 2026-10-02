"use client";

import type { ContentItem } from "@/lib/types";

import * as React from "react";
import { Icon } from "@iconify/react";

import { ProjectCard } from "@/components/ui/project-card";
import { Section } from "@/components/ui/section";
import { STUDIO } from "@/data/studio";
import { cn } from "@/lib/utils";

type NotionSectionProps = {
  /** Fetched by the server page — components never call a source directly. */
  projects: ContentItem[];
};

const NOTION_BADGE = { label: "Notion", icon: "simple-icons:notion" };

/**
 * A link that points at notion.so/notion.site means the page had no `url`
 * property, so it is a fallback to the source itself — badge it to say so.
 * Anything else is a real external link the author chose.
 */
const isNotionPageLink = (url?: string) => {
  if (!url) return false;

  try {
    const host = new URL(url).hostname;

    return host === "notion.so" || host === "notion.site" || host.endsWith(".notion.site");
  } catch {
    return false;
  }
};

export const NotionSection = ({ projects }: NotionSectionProps) => {
  const [filter, setFilter] = React.useState<string | null>(null);

  const statuses = React.useMemo(
    () => [...new Set(projects.map((item) => item.status).filter(Boolean))] as string[],
    [projects],
  );

  const visible = filter ? projects.filter((item) => item.status === filter) : projects;

  return (
    <Section
      contentClassName="mt-7"
      description={STUDIO.notion.description}
      eyebrow={STUDIO.notion.eyebrow}
      icon="lucide:rocket"
      id="notion"
      title={STUDIO.notion.title}
    >
      {statuses.length > 1 ? (
        <div className="mb-6 flex flex-wrap gap-2">
          <FilterChip active={filter === null} label="All" onClick={() => setFilter(null)} />

          {statuses.map((status) => (
            <FilterChip
              key={status}
              active={filter === status}
              label={status}
              onClick={() => setFilter(filter === status ? null : status)}
            />
          ))}
        </div>
      ) : null}

{visible.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {visible.map((project, index) => (
              <ProjectCard
                key={project.id}
                badge={isNotionPageLink(project.url) ? NOTION_BADGE : undefined}
                // Alternating tilt so the grid reads as laid out by hand.
                // Two degrees is below the threshold where text starts to blur.
                item={project}
                tilt={(index % 2 === 0 ? -1 : 1) * 0.9}
              />
            ))}
          </div>
        ) : (
        <div className="rounded-large border border-dashed border-divider bg-content1 px-6 py-16 text-center">
          <Icon aria-hidden className="mx-auto size-6 text-ink-muted" icon="lucide:inbox" />
          <p className="mt-4 text-sm text-ink-muted">{STUDIO.notion.emptyMessage}</p>
        </div>
      )}
    </Section>
  );
};

const FilterChip = ({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) => (
  <button
    aria-pressed={active}
    className={cn(
      "rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
      active
        ? "border-primary bg-primary/12 text-primary"
        : "border-divider text-ink-body hover:border-primary/60 hover:text-ink-strong",
    )}
    type="button"
    onClick={onClick}
  >
    {label}
  </button>
);
