/**
 * Content for the studio page at `/studio`.
 */

type TaglineLine = {
  text: string;

  /** Paints the line in the secondary accent instead of the main ink. */
  accent?: boolean;
};

export const STUDIO = {
  hero: {
    eyebrow: "Studio",
    name: "Sashwat Jain",
    role: "Curious Creator",

    /**
     * Authored as discrete lines rather than a single string, because the hero
     * reveals them one line at a time and the breaks are an editorial decision.
     * `accent: true` paints the line in the secondary accent.
     */
    taglineLines: [
      { text: "Always curious about" },
      { text: "the people, places, and ideas" },
      { text: "that make life interesting.", accent: true },
    ] as TaglineLine[],

    summary: "Exploring new perspectives, sharing what I find, and bringing good ideas to life.",
    primaryCta: { label: "Watch the channel", href: "#youtube" },
    secondaryCta: { label: "Ongoing projects", href: "#notion" },
  },

  youtube: {
    eyebrow: "On YouTube",
    title: "Stories in motion",
    description: "A few moments, places, and people I've captured along the way.",
    channelUrl: "https://youtube.com/@Sashwatjain",
    channelHandle: "@sashwatjain",
  },

  notion: {
    eyebrow: "In Progress",
    title: "Projects in progress",
    description: "A look at the ideas I'm exploring and the projects taking shape.",
    emptyMessage: "Nothing in progress just yet. Check back soon.",
  },

  /**
   * Placeholder business section. To enable it:
   *   1. fill in the entries below
   *   2. add a "business" entry to SECTIONS in data/site.ts
   *   3. render <BusinessSection /> in app/studio/page.tsx
   */
  business: {
    eyebrow: "Business",
    title: "What I'm building",
    description: "Things I'm turning into something that pays.",
    items: [
      {
        id: "placeholder-1",
        title: "Coming soon",
        description: "Replace this in data/studio.ts.",
        icon: "lucide:rocket",
      },
      {
        id: "placeholder-2",
        title: "Coming soon",
        description: "Replace this in data/studio.ts.",
        icon: "lucide:rocket",
      },
      {
        id: "placeholder-3",
        title: "Coming soon",
        description: "Replace this in data/studio.ts.",
        icon: "lucide:rocket",
      },
    ],
  },
} as const;