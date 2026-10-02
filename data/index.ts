import { CAREER } from "./career";
import { STUDIO } from "./studio";
import { PAGES, PAGES as PAGES_REGISTRY, SITE, SECTIONS } from "./site";

/**
 * Single entry point for content. Prefer importing the specific module
 * (`@/data/site`, `@/data/career`) when you only need one slice.
 */
export const DATA = {
  site: SITE,
  pages: PAGES_REGISTRY,
  sections: SECTIONS,
  career: CAREER,
  studio: STUDIO,
} as const;

export { PAGES, SECTIONS, SITE, CAREER, STUDIO };
export type { PageKey, SectionId, SectionPage } from "./site";