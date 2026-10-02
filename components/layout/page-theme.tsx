"use client";

import { useEffect } from "react";

import { PAGES, type PageKey } from "@/data/site";

/**
 * Mirrors the route's palette onto <html>.
 *
 * The palette that actually renders is the `data-theme` wrapper that SiteShell
 * renders on the server, so first paint is already correct and this only keeps
 * <html> in agreement afterwards. That means:
 *
 *   - no flash of the wrong theme on /studio
 *   - no localStorage, so it cannot break prerendering
 *
 * Do not reintroduce next-themes here. Its `useTheme` reads localStorage in a
 * `useState` initializer with no `typeof window` guard, which throws during
 * prerender — and the template's original `dynamic(..., { ssr: false })`
 * workaround hid that by bailing the whole tree out to client-side rendering.
 */
export const PageTheme = ({ theme }: { theme: PageKey }) => {
  const resolved = PAGES[theme].theme;

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", resolved);
  }, [resolved]);

  return null;
};
