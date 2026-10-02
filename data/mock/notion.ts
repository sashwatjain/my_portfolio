import type { ContentItem } from "@/lib/types";

/**
 * Fallback shown when NOTION_API_KEY / NOTION_DATABASE_ID are absent.
 * Shaped exactly like the real normaliser's output so the swap is invisible.
 */
export const mockNotionItems: ContentItem[] = [
  {
    id: "mock-notion-1",
    title: "Merchant OS",
    description:
      "An operating system for small merchants — inventory, pricing and daily reconciliation in one place instead of four spreadsheets.",
    url: "https://notion.so",
    tags: ["Product", "React", "Payments"],
    status: "In Progress",
    date: "Updated today",
    icon: "lucide:store",
  },
  {
    id: "mock-notion-2",
    title: "FrameKit",
    description:
      "A browser tool that turns a still frame into an animated shot — motion presets, parallax and grain, no timeline required.",
    url: "https://notion.so",
    tags: ["Film", "Tooling", "Web"],
    status: "In Progress",
    date: "Updated 3 days ago",
    icon: "lucide:film",
  },
  {
    id: "mock-notion-3",
    title: "Notion Sync",
    description:
      "The plumbing behind this page — keeps a Notion database mapped onto a static site without a deploy step.",
    url: "https://notion.so",
    tags: ["Infrastructure", "Next.js", "Notion"],
    status: "Done",
    date: "Updated 1 week ago",
    icon: "lucide:refresh-cw",
  },
  {
    id: "mock-notion-4",
    title: "Thumbstop",
    description:
      "A short-form editing workflow for vertical video. Three cuts, one hook, no timeline fatigue.",
    url: "https://notion.so",
    tags: ["Video", "Editing"],
    status: "Planning",
    date: "Updated 2 weeks ago",
    icon: "lucide:scissors",
  },
  {
    id: "mock-notion-5",
    title: "Grade Book",
    description:
      "Shot-by-shot colour grade tracker for short productions — keeps a look consistent across multiple cameras.",
    url: "https://notion.so",
    tags: ["Post", "DaVinci Resolve"],
    status: "Planning",
    date: "Updated 3 weeks ago",
    icon: "lucide:palette",
  },
  {
    id: "mock-notion-6",
    title: "Cutroom",
    description:
      "A personal asset library for footage, music and LUTs, searchable by project instead of by folder.",
    url: "https://notion.so",
    tags: ["Tooling", "Filmmaking"],
    status: "Idea",
    date: "Updated 1 month ago",
    icon: "lucide:library",
  },
];