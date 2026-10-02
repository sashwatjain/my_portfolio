/**
 * The single normalised shape every external source produces. `<ProjectCard>`
 * and `<Carousel>` render `ContentItem` and nothing else, which is why adding a
 * new source never requires touching a component.
 */
export type ContentStat = {
  label: string;
  value: string;
};

export type ContentItem = {
  id: string;
  title: string;

  /** Plain text only — sources are responsible for stripping HTML/markdown. */
  description: string;

  /** Primary outbound link. Card becomes clickable when present. */
  url?: string;

  /** Optional secondary link, e.g. a live demo for a GitHub repo. */
  secondaryUrl?: string;

  thumbnail?: string;

  /** Filter chips. Rendered as a compact tag row. */
  tags: string[];

  /** Single status value, e.g. "In Progress". Rendered as a chip. */
  status?: string;

  /** ISO-ish date string, pre-formatted for display. */
  date?: string;

  /** Small label/value pairs, e.g. stars, forks, view count. */
  stats?: ContentStat[];

  /**
   * Small glyph rendered over the thumbnail. Either an Iconify id
   * (`"lucide:rocket"`) or a literal character (a Notion page emoji).
   */
  icon?: string;
};