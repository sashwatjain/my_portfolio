import type { ContentItem } from "@/lib/types";

/**
 * Fallback shown when YOUTUBE_API_KEY / YOUTUBE_CHANNEL_ID are absent.
 * Shaped exactly like the real normaliser's output so the swap is invisible.
 */
export const mockYoutubeItems: ContentItem[] = [
  {
    id: "mock-yt-1",
    title: "I Taught a Robot to Walk (and it fell over 400 times first)",
    description:
      "Reinforcement learning from scratch — the reward function that almost broke me, and why the agent learned to flip before it learned to run.",
    url: "https://youtube.com/@sashwatjain",
    thumbnail: "https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg",
    tags: ["Reinforcement Learning", "Python", "Simulation"],
    stats: [
      { label: "views", value: "24K" },
      { label: "duration", value: "18:42" },
    ],
    date: "2 months ago",
  },
  {
    id: "mock-yt-2",
    title: "Why Your RAG System Keeps Hallucinating",
    description:
      "Chunking strategies, retrieval failures and the boring fixes that matter more than the fancy ones.",
    url: "https://youtube.com/@sashwatjain",
    thumbnail: "https://img.youtube.com/vi/aqz-KE-bpKQ/maxresdefault.jpg",
    tags: ["RAG", "LLM", "Vector Search"],
    stats: [
      { label: "views", value: "11K" },
      { label: "duration", value: "22:05" },
    ],
    date: "5 months ago",
  },
  {
    id: "mock-yt-3",
    title: "Building a Cinematic Frame From Scratch",
    description:
      "Lighting a room with one practical light — where to put it, why the negative fill matters, and what the camera actually sees.",
    url: "https://youtube.com/@sashwatjain",
    thumbnail: "https://img.youtube.com/vi/ScMzIvxBSi4/maxresdefault.jpg",
    tags: ["Cinematography", "Lighting", "Process"],
    stats: [
      { label: "views", value: "8.9K" },
      { label: "duration", value: "14:18" },
    ],
    date: "8 months ago",
  },
  {
    id: "mock-yt-4",
    title: "The 30-Second Shot That Took Six Hours",
    description:
      "A breakdown of one continuous take — the blocking, the failed attempts, and the one decision that saved it.",
    url: "https://youtube.com/@sashwatjain",
    thumbnail: "https://img.youtube.com/vi/kJQP7kiw5Fk/maxresdefault.jpg",
    tags: ["Behind the Scenes", "Editing"],
    stats: [
      { label: "views", value: "6.2K" },
      { label: "duration", value: "11:47" },
    ],
    date: "10 months ago",
  },
  {
    id: "mock-yt-5",
    title: "Mechanical Engineering Was the Best Thing That Happened to Me",
    description:
      "NIT Nagpur taught me systems thinking long before I wrote a line of code. Here's what carried over.",
    url: "https://youtube.com/@sashwatjain",
    thumbnail: "https://img.youtube.com/vi/9bZkp7q19f0/maxresdefault.jpg",
    tags: ["Personal", "NIT Nagpur"],
    stats: [
      { label: "views", value: "15K" },
      { label: "duration", value: "16:30" },
    ],
    date: "1 year ago",
  },
  {
    id: "mock-yt-6",
    title: "Colour Grading for People Who Don't Know What They're Doing",
    description:
      "A practical starting point — three adjustments, in order, that will fix most amateur footage.",
    url: "https://youtube.com/@sashwatjain",
    thumbnail: "https://img.youtube.com/vi/9b6ZsMmlndU/maxresdefault.jpg",
    tags: ["Colour Grading", "DaVinci Resolve"],
    stats: [
      { label: "views", value: "4.4K" },
      { label: "duration", value: "19:03" },
    ],
    date: "1 year ago",
  },
];