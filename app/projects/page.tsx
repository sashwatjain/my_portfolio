import { getGithubProjects } from "@/src/lib/github";
import  ProjectsClient  from "@/components/projects/ProjectsClient";


const ProjectsPage = async () => {
  const githubProjects = await getGithubProjects("sashwatjain");

    const sortedProjects = githubProjects.sort(
      (a: any, b: any) =>
        new Date(b.pushed_at).getTime() -
        new Date(a.pushed_at).getTime()
    );

    function formatTitle(name: string) {
      return name
        .replace(/[-_]/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase());
    }
    function inferCategoryFromTopics(topics: string[] = []) {
      const CATEGORY_MAP: Record<string, string[]> = {
        "AI/ML": ["ai", "ml", "llm", "langchain", "openai", "ollama"],
        "Web Development": ["react", "nextjs", "frontend", "web", "tailwind"],
        "Backend": ["node", "api", "server", "backend", "database"],
        "Mobile Apps": ["android", "flutter", "react-native"],
        "Dev Tools": ["cli", "automation", "script", "tool"],
      };

      const scores: Record<string, number> = {};

      for (const [category, keywords] of Object.entries(CATEGORY_MAP)) {
        scores[category] = 0;

        for (const topic of topics) {
          if (keywords.includes(topic.toLowerCase())) {
            scores[category]++;
          }
        }
      }

      // 🧠 Pick highest scoring category
      const best = Object.entries(scores).sort((a, b) => b[1] - a[1])[0];

      return best && best[1] > 0 ? best[0] : null;
    }


    const getAutoIcon = (tech: string) => {
      const name = tech.toLowerCase();

      return `simple-icons:${name}`;
    };

    // 🔄 Transform to match your UI
    const allProjects = sortedProjects.map((p: any, index: number) => {
    // 🎯 CATEGORY (priority order)
    const categoryTopic = p.topics?.find((t: string) =>
      t.startsWith("category:")
    );

    const category =
      categoryTopic?.replace("category:", "") ||
      inferCategoryFromTopics(p.topics) ||
      "General";

    // 🎬 IMAGE (fallback chain)
    const image =
    p.thumbnail ||
    `https://raw.githubusercontent.com/${p.full_name}/main/preview.gif` ;

    return {
      id: p.id ?? `project-${index}`,

      title: formatTitle(p.name),

      description:
        p.customIntro ||
        p.description ||
        "A project built as part of my development journey.",

      details: p.customIntro || p.description || "",

      image,

      category,

      github: p.html_url,
      live: p.homepage || "",

      stars: p.stargazers_count ?? 0,
      forks: p.forks_count ?? 0,

      gallery: [],

      tech: (p.topics || []).map((t: string) => ({
        name: t,
        icon: getAutoIcon(t),
      })),
      };
  });

  const categories = ["All", ...new Set(allProjects.map((p) => p.category))];
  console.log("RAW GITHUB:", githubProjects);
  // console.log("MAPPED PROJECTS:", allProjects);

  return (
    <ProjectsClient allProjects={allProjects} categories={categories} />
  );
};

export default ProjectsPage;

