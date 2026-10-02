import { Icon } from "@iconify/react";

import { Section } from "@/components/ui/section";
import { CAREER } from "@/data/career";

export const ResumeSection = () => {
  const { file, filename, summary, highlights } = CAREER.resume;

  return (
    <Section
      description={summary}
      eyebrow="Resume"
      icon="lucide:file-text"
      id="resume"
      title="One page, if you'd rather not scroll"
    >
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
        <ul className="grid gap-3">
          {highlights.map((highlight) => (
            <li
              key={highlight}
              className="flex items-start gap-2.5 rounded-medium border border-divider bg-content1 px-5 py-4 text-sm text-ink-body"
            >
              <Icon
                aria-hidden
                className="mt-0.5 size-4 shrink-0 text-primary"
                icon="lucide:check"
              />
              <span className="text-pretty">{highlight}</span>
            </li>
          ))}
        </ul>

        <a
          className="inline-flex h-12 items-center justify-center gap-2 rounded-medium bg-primary px-6 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          download={filename}
          href={file}
        >
          <Icon aria-hidden className="size-4" icon="lucide:download" />
          Download PDF
        </a>
      </div>
    </Section>
  );
};
