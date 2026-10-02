import type { ContentItem } from "@/lib/types";

/**
 * Fallback shown only when the GitHub API request fails (rate limit, network,
 * or an unexpected response shape). The live path uses the real `sashwatjain`
 * repositories — see lib/sources/github.ts.
 */
export const mockGithubItems: ContentItem[] = [
  {
    id: "mock-gh-1",
    title: "Habit Arena",
    description:
      "A gamified habit tracker where completing real-life habits earns coins, builds streaks and pushes you up a leaderboard. Self-improvement turned into an RPG loop.",
    url: "https://github.com/sashwatjain",
    thumbnail:
      "https://raw.githubusercontent.com/sashwatjain/habit_arena/main/preview.gif",
    tags: ["FastAPI", "Python", "SQLite", "JavaScript"],
    date: "1 week ago",
    stats: [
      { label: "stars", value: "18" },
      { label: "forks", value: "4" },
    ],
  },
  {
    id: "mock-gh-2",
    title: "MCP History Bot",
    description:
      "A modular multi-agent question-answering system inspired by the Model Context Protocol — clients, servers, tools and routing over HTTP, production-stable and MCP-compatible.",
    url: "https://github.com/sashwatjain",
    thumbnail:
      "https://raw.githubusercontent.com/sashwatjain/mcp_history_bot/main/preview.gif",
    tags: ["Python", "FastAPI", "PostgreSQL", "LLM"],
    date: "3 weeks ago",
    stats: [
      { label: "stars", value: "26" },
      { label: "forks", value: "7" },
    ],
  },
  {
    id: "mock-gh-3",
    title: "Cat Learns To Run",
    description:
      "A quadruped agent learning to walk using reinforcement learning and PyBullet physics simulation — built with Python, TensorFlow and OpenAI Gym.",
    url: "https://github.com/sashwatjain",
    thumbnail:
      "https://raw.githubusercontent.com/sashwatjain/cat_learns_2_run/main/preview.gif",
    tags: ["Python", "PyTorch", "Reinforcement Learning"],
    date: "2 months ago",
    stats: [
      { label: "stars", value: "41" },
      { label: "forks", value: "9" },
    ],
  },
  {
    id: "mock-gh-4",
    title: "OCR Document Pipeline",
    description:
      "An image-to-text service that takes scanned documents and returns structured, queryable data — built for production rather than a demo.",
    url: "https://github.com/sashwatjain",
    tags: ["Python", "Tesseract", "FastAPI", "Docker"],
    date: "4 months ago",
    stats: [
      { label: "stars", value: "12" },
      { label: "forks", value: "3" },
    ],
  },
  {
    id: "mock-gh-5",
    title: "Portfolio",
    description:
      "This site. Two pages, two themes, with GitHub and Notion content pulled in dynamically.",
    url: "https://github.com/sashwatjain/my_portfolio",
    tags: ["Next.js", "TypeScript", "Tailwind CSS"],
    date: "today",
    stats: [
      { label: "stars", value: "9" },
      { label: "forks", value: "2" },
    ],
  },
];