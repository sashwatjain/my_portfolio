"use client";
import { PageHeader } from "@/components/page-header";
import { ProjectsTabs } from "@/components/projects/projects-tabs";
import { ProjectsGrid } from "@/components/projects/projects-grid";
import { useState, useMemo } from "react";

const ProjectsClient = ({ allProjects, categories }: any) => {
  const [selectedCategory, setSelectedCategory] = useState("All");

  const filteredProjects = useMemo(
    () =>
      selectedCategory === "All"
        ? allProjects
        : allProjects.filter(
            (project: any) => project.category === selectedCategory
          ),
    [selectedCategory, allProjects]
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <PageHeader texts={["Projects"]} />

      <ProjectsTabs
        categories={categories}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
      />

      <ProjectsGrid projects={filteredProjects} />
    </div>
  );
};

export default ProjectsClient; 