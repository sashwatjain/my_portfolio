import "@/app/globals.css";
import { clsx } from "clsx";
import { type Metadata } from "next";
import { Inter } from "next/font/google";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next";

import { Providers } from "@/app/providers";
import { PageTransitionProvider } from "@/components/layout/page-transition";
import { SITE } from "@/data/site";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  metadataBase: new URL("http://localhost:3000"),
  title: {
    default: `${SITE.name} — ${SITE.role}`,
    template: `%s | ${SITE.name}`,
  },
  description: SITE.tagline,
  openGraph: {
    title: {
      default: `${SITE.name} — ${SITE.role}`,
      template: `%s | ${SITE.name}`,
    },
    description: SITE.tagline,
    siteName: SITE.name,
    locale: "en_US",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  twitter: {
    title: {
      default: `${SITE.name} — ${SITE.role}`,
      template: `%s | ${SITE.name}`,
    },
    card: "summary_large_image",
  },
};

type RootLayoutProps = {
  children: React.ReactNode;
};

/**
 * Deliberately thin. The shell lives in the per-route-group layouts
 * (app/(career)/layout.tsx and app/(studio)/layout.tsx) because only they know
 * which page is being rendered — which is what makes the theme correct in the
 * server HTML instead of after hydration.
 */
export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html suppressHydrationWarning lang="en">
      <body
        className={clsx(
          "min-h-screen bg-background font-sans text-ink-strong antialiased",
          inter.variable,
        )}
      >
        <PageTransitionProvider>
          <Providers>{children}</Providers>
        </PageTransitionProvider>

        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  );
}
