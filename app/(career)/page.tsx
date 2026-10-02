import type { Metadata } from "next";

import { EducationSection } from "@/components/career/education-section";
import { ExperienceSection } from "@/components/career/experience-section";
import { GithubSection } from "@/components/career/github-section";
import { HeroSection } from "@/components/career/hero-section";
import { ResumeSection } from "@/components/career/resume-section";
import { SkillsSection } from "@/components/career/skills-section";
import { CAREER } from "@/data/career";
import { getGithubProjects, githubUsername } from "@/lib/sources/github";

export const metadata: Metadata = {
  title: CAREER.hero.role,
  description: CAREER.hero.tagline,
};

/**
 * Server component: it fetches, the sections only format. Revalidate every 60s
 * so a new commit or a new Notion page shows up without a deploy.
 */
export const revalidate = 60;

export default async function CareerPage() {
  const [projects, username] = await Promise.all([getGithubProjects(), githubUsername()]);

  return (
    <>
      <HeroSection />
      <GithubSection projects={projects} username={username} />
      <EducationSection />
      <ExperienceSection />
      <SkillsSection />
      <ResumeSection />
    </>
  );
}
