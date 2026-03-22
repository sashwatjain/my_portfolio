'use client';

import { HeroSection } from "@/components/home/hero";
import { SkillsOverviewSection } from "@/components/home/skills-overview";
import { WorkSection } from "@/components/home/work";
// import { TestimonialsSection } from "@/components/home/testimonials";
import { MediumSection } from "@/components/home/medium";

import { useSearchParams } from "next/navigation";
import { useEffect } from "react";

export default function HomePage() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const scrollTo = searchParams.get("scroll");

    if (scrollTo === "skills") {
      const el = document.getElementById("skills-section");
      el?.scrollIntoView({ behavior: "smooth" });
    }
    else if (scrollTo === "articles") {
      const el = document.getElementById("articles-section");
      el?.scrollIntoView({ behavior: "smooth" });
    }
  }, [searchParams]);

  return (
    <>
      <HeroSection />

      <div id="skills-section">
        <SkillsOverviewSection />
      </div>

      <div id="projects-section">
        <WorkSection />
      </div>

      <div id="articles-section">
        <MediumSection />
      </div>


      <div id="contact-section"></div>
    </>
  );
}