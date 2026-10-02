import { SiteShell } from "@/components/layout/site-shell";

/**
 * The career page is `/`. The group name is invisible in the URL — it exists
 * only so this layout can pin the theme in the server HTML.
 */
export default function CareerLayout({ children }: { children: React.ReactNode }) {
  return <SiteShell theme="career">{children}</SiteShell>;
}
