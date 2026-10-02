import type { ContentItem } from "@/lib/types";

import { mockGithubItems } from "@/data/mock/github";

const DEFAULT_USERNAME = "sashwatjain";
const REVALIDATE_SECONDS = 60;

type GitHubRepo = {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  homepage: string | null;
  topics?: string[];
  fork: boolean;
  archived: boolean;
  stargazers_count: number;
  forks_count: number;
  pushed_at: string;
  language: string | null;
};

export const githubUsername = () =>
  process.env.GITHUB_USERNAME?.trim() || DEFAULT_USERNAME;

export const githubIsLive = () => true;

export const githubSource = () => "live" as const;

const formatTitle = (name: string) =>
  name.replace(/[-_]/g, " ").replace(/\b\w/g, (character) => character.toUpperCase());

const formatCount = (value: number) =>
  value >= 1000 ? `${(value / 1000).toFixed(1).replace(/\.0$/, "")}k` : `${value}`;

const relativeDate = (iso: string) => {
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);

  if (days <= 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 30) return `${days} days ago`;
  if (days < 365) return `${Math.floor(days / 30)} mo ago`;

  return `${Math.floor(days / 365)}y ago`;
};

/**
 * Per-repo presentation overrides, if the repo author committed them.
 * `intro.txt` and `tags.json` at the repo root take precedence over the
 * GitHub description/topics.
 */
const readRepoOverrides = async (username: string, repo: GitHubRepo) => {
  const base = `https://raw.githubusercontent.com/${username}/${repo.name}/main/`;

  const [intro, tags] = await Promise.all([
    fetch(`${base}intro.txt`, { next: { revalidate: REVALIDATE_SECONDS } })
      .then((response) => (response.ok ? response.text() : null))
      .catch(() => null),
    fetch(`${base}tags.json`, { next: { revalidate: REVALIDATE_SECONDS } })
      .then((response) => (response.ok ? response.json() : null))
      .catch(() => null),
  ]);

  return {
    intro: intro?.trim() || null,
    tags: Array.isArray(tags) ? (tags as string[]) : null,
    thumbnail: `${base}preview.gif`,
  };
};

const normalise = (
  repo: GitHubRepo,
  overrides: Awaited<ReturnType<typeof readRepoOverrides>>,
): ContentItem => {
  const topics = (repo.topics ?? []).filter((topic) => !topic.startsWith("category:"));
  const tags = overrides.tags ?? topics;

  return {
    id: `github-${repo.id}`,
    title: formatTitle(repo.name),
    description:
      overrides.intro || repo.description || "A project built as part of my development journey.",
    url: repo.html_url,
    secondaryUrl: repo.homepage || undefined,
    thumbnail: overrides.thumbnail,
    tags: repo.language && !tags.includes(repo.language) ? [repo.language, ...tags] : tags,
    date: relativeDate(repo.pushed_at),
    stats: [
      { label: "stars", value: formatCount(repo.stargazers_count) },
      { label: "forks", value: formatCount(repo.forks_count) },
    ],
  };
};

export async function getGithubProjects(): Promise<ContentItem[]> {
  const username = githubUsername();

  try {
    const response = await fetch(`https://api.github.com/users/${username}/repos?per_page=100&sort=pushed`, {
      headers: { Accept: "application/vnd.github+json" },
      next: { revalidate: REVALIDATE_SECONDS },
    });

    if (!response.ok) {
      throw new Error(`GitHub responded ${response.status}`);
    }

    const repos = (await response.json()) as GitHubRepo[];

    // Newest activity first, regardless of the order the API returned.
    const visible = repos
      .filter((repo) => !repo.fork && !repo.archived)
      .sort((a, b) => new Date(b.pushed_at).getTime() - new Date(a.pushed_at).getTime());

    return Promise.all(
      visible.map(async (repo) => normalise(repo, await readRepoOverrides(username, repo))),
    );
  } catch (error) {
    console.warn("[github] falling back to mock data:", (error as Error).message);

    return mockGithubItems;
  }
}