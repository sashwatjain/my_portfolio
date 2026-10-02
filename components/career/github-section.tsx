import type { ContentItem } from "@/lib/types";

import { Icon } from "@iconify/react";

import { Carousel } from "@/components/ui/carousel";
import { ProjectCard } from "@/components/ui/project-card";
import { Section } from "@/components/ui/section";

type GithubSectionProps = {
  /** Fetched by the server page — components never call a source directly. */
  projects: ContentItem[];

  /** Resolved by the page so the component stays free of source imports. */
  username: string;
};

/**
 * Newest activity first, in a horizontal scroll-snap track. No slider library:
 * see components/ui/carousel.tsx.
 */
export const GithubSection = ({ projects, username }: GithubSectionProps) => {
  const profileUrl = `https://github.com/${username}`;

  return (
    <Section
      action={
        <a
          className="inline-flex items-center gap-2 text-sm font-medium text-ink-body transition-colors hover:text-primary"
          href={profileUrl}
          rel="noopener noreferrer"
          target="_blank"
        >
          {username}
          <Icon aria-hidden className="size-4" icon="lucide:arrow-up-right" />
        </a>
      }
      description="Things I've built and shipped. Scroll sideways for the full list."
      eyebrow="Code"
      icon="mdi:github"
      id="github"
      title="Projects"
    >
      {projects.length > 0 ? (
        <Carousel>
          {projects.map((project) => (
            <ProjectCard key={project.id} item={project} />
          ))}
        </Carousel>
      ) : (
        <p className="text-sm text-ink-muted">No public repositories yet.</p>
      )}
    </Section>
  );
};
