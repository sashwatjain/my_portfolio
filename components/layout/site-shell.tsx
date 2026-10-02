import { PAGES, type PageKey } from "@/data/site";
import { PageBackground } from "@/components/layout/page-background";
import { PageFooter } from "@/components/layout/page-footer";
import { PageTheme } from "@/components/layout/page-theme";
import { TopBar } from "@/components/layout/top-bar";
import { ScrollProgress } from "@/components/ui/scroll-progress";
import { ChatWidget } from "@/components/chat/ChatWidget";

/**
 * The shared shell: background, top bar, content, footer, chat.
 *
 * `data-theme` lives on THIS element rather than on <html>, which is what lets
 * each route group render the correct palette in the server HTML. Putting it on
 * <html> instead would mean resolving the theme in app/layout.tsx, which cannot
 * see the pathname without going dynamic and losing ISR.
 *
 * HeroUI's selectors are `[data-theme="..."]` on any element, and the CSS
 * variables cascade, so a wrapper works exactly as well as the <html> variant.
 */
export const SiteShell = ({
  children,
  theme,
}: {
  children: React.ReactNode;
  theme: PageKey;
}) => (
  <div
    className="flex min-h-screen flex-col overflow-x-clip bg-background"
    data-theme={PAGES[theme].theme}
  >
    {/* Keeps @heroui/use-theme (and therefore HeroUI's own dark: handling) in
        sync with the wrapper above. No visual effect — the wrapper already won. */}
    <PageTheme theme={theme} />

    <PageBackground theme={theme} />

    <ScrollProgress />

    <div className="relative flex min-h-screen flex-col">
      <TopBar />

      <main className="flex-1">{children}</main>

      <PageFooter />
    </div>

    <ChatWidget />
  </div>
);
