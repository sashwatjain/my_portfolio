import type { Metadata } from "next";

import { HeroSection } from "@/components/studio/hero-section";
import { NotionSection } from "@/components/studio/notion-section";
import { YoutubeSection } from "@/components/studio/youtube-section";
import { STUDIO } from "@/data/studio";
import { getNotionProjects } from "@/lib/sources/notion";
import { getYoutubeVideos } from "@/lib/sources/youtube";

export const metadata: Metadata = {
  title: "Studio",
  description: STUDIO.hero.taglineLines.map((line) => line.text).join(" "),
};

/** Matches the 60s ISR of the Notion source so both sections update together. */
export const revalidate = 60;

export default async function StudioPage() {
  const [videos, projects] = await Promise.all([getYoutubeVideos(), getNotionProjects()]);

  return (
    <>
      <HeroSection />
      <YoutubeSection videos={videos} />
      <NotionSection projects={projects} />
    </>
  );
}
