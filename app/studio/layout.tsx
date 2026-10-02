import { SiteShell } from "@/components/layout/site-shell";

/**
 * The studio page is `/studio`. This is a real segment rather than a route
 * group — only the root page needs a group, to give `/` its own layout.
 */
export default function StudioLayout({ children }: { children: React.ReactNode }) {
  return <SiteShell theme="studio">{children}</SiteShell>;
}
