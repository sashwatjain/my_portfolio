import { NextResponse } from "next/server";
import Groq from "groq-sdk";

import {
  getGithubProjects,
  githubIsLive,
  githubUsername,
} from "@/lib/sources/github";
import {
  getNotionProjects,
  notionDiagnostics,
  notionIsLive,
  notionMissingEnv,
  notionScope,
} from "@/lib/sources/notion";
import {
  getYoutubeVideos,
  youtubeIsLive,
  youtubeMissingEnv,
} from "@/lib/sources/youtube";

export const dynamic = "force-dynamic";

/** Must match MODELS in app/api/chat/route.ts. */
const PREFERRED_MODELS = [
  "openai/gpt-oss-120b",
  "openai/gpt-oss-20b",
  "qwen/qwen3.8-27b",
] as const;

const missingEnv = (names: readonly string[]) => names.filter((name) => !process.env[name]);

type IntegrationReport = {
  live: boolean;
  detail?: string;
  count?: number;
  missing?: string[];

  /** Which retrieval path a source is using, e.g. "rss" vs "data-api". */
  mode?: string;

  /** For sources that can read either a whole channel or one playlist. */
  channel?: string;

  playlist?: boolean;

  /** Notion only: whether a publish-ish status property was found and applied. */
  publishedFilter?: "status";
};

type ChatReport = IntegrationReport & {
  preferredModels?: string[];
  /** The subset of `preferredModels` the provider is still serving. */
  availableModels?: string[];
};

/**
 * Public diagnostic endpoint. Reports *whether* things work and *which*
 * variables are absent — never a secret value.
 */
export async function GET() {
  const integrations: Record<string, IntegrationReport | ChatReport> = {};
  const degraded: string[] = [];

  // --- Chat -------------------------------------------------------------
  const hasGroqKey = Boolean(process.env.GROQ_API_KEY);

  if (!hasGroqKey) {
    integrations.chat = { live: false, missing: ["GROQ_API_KEY"] };
    degraded.push("chat");
  } else {
    try {
      const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
      const { data } = await groq.models.list();

      const available = new Set(data.map((model) => model.id));

      // The exact failure that broke this site: a provider retires a model id
      // with no warning and the whole fallback chain returns 500.
      const retired = PREFERRED_MODELS.filter((model) => !available.has(model));

      integrations.chat = {
        live: retired.length < PREFERRED_MODELS.length,
        detail: retired.length > 0 ? `retired: ${retired.join(", ")}` : "all models available",
        preferredModels: [...PREFERRED_MODELS],
        availableModels: [...available].filter((id) => PREFERRED_MODELS.includes(id as never)),
      };

      if (retired.length >= PREFERRED_MODELS.length) degraded.push("chat");
    } catch (error) {
      integrations.chat = { live: false, detail: (error as Error).message };
      degraded.push("chat");
    }
  }

  // --- GitHub -----------------------------------------------------------
  try {
    const projects = await getGithubProjects();

    integrations.github = {
      live: githubIsLive() && projects.length > 0,
      detail: `username: ${githubUsername()}`,
      count: projects.length,
    };
  } catch (error) {
    integrations.github = { live: false, detail: (error as Error).message };
    degraded.push("github");
  }

  // --- YouTube ----------------------------------------------------------
  // RSS needs no credentials, so YouTube is "live" out of the box. `count` is the
  // important field here: it separates "channel has nothing public" (0, which is
  // legitimate) from "the feed broke" (also 0, which is not).
  const youtubeMode = process.env.YOUTUBE_API_KEY ? "data-api" : "rss";
  const usingPlaylist = Boolean(process.env.YOUTUBE_PLAYLIST_ID);

  integrations.youtube = {
    live: youtubeIsLive(),
    mode: youtubeMode,
    channel: usingPlaylist ? "playlist" : "channel",
    playlist: usingPlaylist,
    missing: missingEnv(youtubeMissingEnv()),
    detail: usingPlaylist
      ? `playlist: ${process.env.YOUTUBE_PLAYLIST_ID}`
      : `handle: ${process.env.YOUTUBE_HANDLE ?? "@Sashwatjain"}`,
  };

  if (!youtubeIsLive()) {
    degraded.push("youtube");
  } else {
    // Same Next fetch cache the page uses, so this costs nothing extra.
    try {
      integrations.youtube.count = (await getYoutubeVideos()).length;
    } catch (error) {
      integrations.youtube.detail = (error as Error).message;
    }
  }

  // --- Notion -----------------------------------------------------------
  integrations.notion = {
    live: notionIsLive(),
    missing: notionMissingEnv(),
  };

  if (notionIsLive()) {
    try {
      const items = await getNotionProjects();
      const report = notionDiagnostics();

      if (report.error) {
        integrations.notion.detail = report.error;
        degraded.push("notion");
      } else {
        integrations.notion.count = items.length;
        integrations.notion.mode =
          notionScope() === "all"
            ? "search-all"
            : report.containerKind === "page"
              ? "child-pages"
              : "data-source";
        integrations.notion.publishedFilter =
          report.publishedFilter === "status" ? "status" : undefined;
        integrations.notion.detail = `read ${report.pages ?? 0} page(s), showing ${items.length}`;

        if (items.length === 0) degraded.push("notion-empty");
      }
    } catch (error) {
      integrations.notion.detail = (error as Error).message;
    }
  } else {
    degraded.push("notion");
  }

  return NextResponse.json(
    {
      status: degraded.length === 0 ? "ok" : "degraded",
      degraded,
      integrations,
    },
    { headers: { "cache-control": "no-store" } },
  );
}
