import type { ContentItem } from "@/lib/types";

import { mockYoutubeItems } from "@/data/mock/youtube";

/**
 * Two ways to get videos, in order of preference:
 *
 *   1. RSS  — https://www.youtube.com/feeds/videos.xml?channel_id=UC...
 *      No API key, no quota, no Google Cloud project. Every channel has one and
 *      it carries title, description, thumbnail and view count. This is the
 *      default and is why the site works out of the box.
 *
 *   2. Data API v3 — set YOUTUBE_API_KEY and YOUTUBE_CHANNEL_ID.
 *      Costs quota (100 units per `search` call) and is only worth it once you
 *      need durations, like counts, or more than the 15 entries RSS returns.
 *
 * Playlist support is built in already: set YOUTUBE_PLAYLIST_ID and the feed is
 * read from that playlist instead of the channel's uploads.
 */

const RSS_REVALIDATE_SECONDS = 900;
const API_REVALIDATE_SECONDS = 300;

/** Channel id discovery changes about once a year at most. */
const CHANNEL_ID_REVALIDATE_SECONDS = 86_400;

const MAX_RESULTS = 24;

const API = "https://www.googleapis.com/youtube/v3";

const FEED = "https://www.youtube.com/feeds/videos.xml";

/** Plain UA — YouTube serves the RSS feed to anything, but be explicit. */
const UA = "Mozilla/5.0 (compatible; portfolio-rss-reader)";

const CHANNEL_HANDLE = process.env.YOUTUBE_HANDLE ?? "@Sashwatjain";

export const youtubeRequiredEnv = [] as const;

/**
 * True when we have something to read without any credential.
 * The RSS path needs neither a key nor a manually pasted channel id — the id is
 * discovered from the handle and cached for a day.
 */
export const youtubeIsLive = () => Boolean(youtubeConfigured());

/** Env names worth reporting only when the user has explicitly asked for the API path. */
export const youtubeMissingEnv = () =>
  process.env.YOUTUBE_API_KEY && !process.env.YOUTUBE_CHANNEL_ID
    ? ["YOUTUBE_CHANNEL_ID"]
    : [];

const youtubeConfigured = () =>
  Boolean(process.env.YOUTUBE_CHANNEL_ID) || Boolean(CHANNEL_HANDLE);

const formatCount = (value?: string | number) => {
  const count = Number(value ?? 0);

  if (!count) return "0";
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  if (count >= 1000) return `${(count / 1000).toFixed(1).replace(/\.0$/, "")}K`;

  return `${count}`;
};

const relativeDate = (iso?: string) => {
  if (!iso) return undefined;

  const time = new Date(iso).getTime();

  if (Number.isNaN(time)) return undefined;

  const days = Math.floor((Date.now() - time) / 86_400_000);

  if (days <= 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 30) return `${days} days ago`;
  if (days < 365) return `${Math.floor(days / 30)} mo ago`;

  return `${Math.floor(days / 365)}y ago`;
};

const unescapeXml = (value: string) =>
  value
    .replace(/&#(\d+);/g, (_, code: string) => String.fromCharCode(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code: string) => String.fromCharCode(parseInt(code, 16)))
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, "&");

/** Atom CDATA content, or a plain element body. */
const tagValue = (xml: string, tag: string) => {
  const cdata = new RegExp(`<${tag}[^>]*>\\s*<!\\[CDATA\\[([\\s\\S]*?)\\]\\]>\\s*</${tag}>`).exec(xml);
  const plain = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`).exec(xml);

  const raw = cdata?.[1] ?? plain?.[1];

  return raw === undefined ? undefined : unescapeXml(raw).trim();
};

const truncate = (value: string, length: number) =>
  value.length <= length ? value : `${value.slice(0, length).trimEnd()}…`;

/**
 * Resolves the UC… id behind a @handle by reading it out of the channel page's
 * own `rssUrl` field. Cached for a day, so this costs one request per build
 * window rather than one per request.
 */
let channelIdCache: { id: string | null; expires: number } | null = null;

async function resolveChannelId(): Promise<string | null> {
  if (process.env.YOUTUBE_CHANNEL_ID) return process.env.YOUTUBE_CHANNEL_ID;
  if (!CHANNEL_HANDLE) return null;

  if (channelIdCache && channelIdCache.expires > Date.now()) return channelIdCache.id;

  try {
    const response = await fetch(`https://www.youtube.com/${CHANNEL_HANDLE.replace(/^@/, "")}`, {
      headers: { "user-agent": UA },
      next: { revalidate: CHANNEL_ID_REVALIDATE_SECONDS },
    });

    if (!response.ok) throw new Error(`channel page responded ${response.status}`);

    const html = await response.text();

    // The page embeds its own feed URL, which is the most reliable marker.
    const fromFeed =
      /"rssUrl"\s*:\s*"https:\/\/www\.youtube\.com\/feeds\/videos\.xml\?channel_id=(UC[A-Za-z0-9_-]{22})"/.exec(
        html,
      )?.[1];

    const id =
      fromFeed ??
      /"externalId"\s*:\s*"(UC[A-Za-z0-9_-]{22})"/.exec(html)?.[1] ??
      null;

    channelIdCache = { id, expires: Date.now() + CHANNEL_ID_REVALIDATE_SECONDS * 1000 };

    return id;
  } catch (error) {
    console.warn("[youtube] could not resolve channel id:", (error as Error).message);

    channelIdCache = { id: null, expires: Date.now() + 3_600_000 };

    return null;
  }
}

/** Parses the Atom feed into ContentItems. */
function parseFeed(xml: string): ContentItem[] {
  const entries = xml.match(/<entry>[\s\S]*?<\/entry>/g) ?? [];

  return entries.map((entry) => {
    const videoId = tagValue(entry, "yt:videoId") ?? /yt:video:([\w-]{6,})/.exec(entry)?.[1];
    const title = tagValue(entry, "media:title") ?? tagValue(entry, "title") ?? "Untitled";
    const description = tagValue(entry, "media:description") ?? "";
    const published = tagValue(entry, "published");
    const views = /media:statistics[^>]*\bviews="(\d+)"/.exec(entry)?.[1];

    return {
      id: `yt-${videoId ?? title}`,
      title,
      description: truncate(description, 180),
      url: videoId ? `https://www.youtube.com/watch?v=${videoId}` : undefined,
      // maxresdefault is 16:9 and matches the card; the card falls back if absent.
      thumbnail: videoId ? `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg` : undefined,
      tags: [],
      date: relativeDate(published),
      stats: views ? [{ label: "views", value: formatCount(views) }] : undefined,
    } satisfies ContentItem;
  });
}

/** RSS path — the default. */
async function getFromFeed(): Promise<ContentItem[] | "empty"> {
  const playlistId = process.env.YOUTUBE_PLAYLIST_ID;
  const channelId = playlistId ? null : await resolveChannelId();

  const query = playlistId
    ? `playlist_id=${encodeURIComponent(playlistId)}`
    : channelId
      ? `channel_id=${channelId}`
      : null;

  if (!query) throw new Error("no channel id or playlist id available");

  const response = await fetch(`${FEED}?${query}`, {
    headers: { "user-agent": UA },
    next: { revalidate: RSS_REVALIDATE_SECONDS },
  });

  // A channel with no public uploads has no feed at all. That is a legitimate
  // empty state, so it is reported rather than thrown.
  if (response.status === 404) return "empty";

  if (!response.ok) throw new Error(`feed responded ${response.status}`);

  const xml = await response.text();
  const items = parseFeed(xml);

  if (items.length === 0) {
    // 200 but nothing parseable. Treating this as a genuine empty channel would
    // be a silent false negative — an unparseable body and an empty channel look
    // identical on the page, so say so loudly here.
    console.warn(
      `[youtube] feed returned ${xml.length} bytes but no <entry> elements parsed for ${query}; ` +
        "treating the channel as empty",
    );

    return "empty";
  }

  return items;
}

/** Data API path — only used when a key is present. */
async function getFromApi(): Promise<ContentItem[]> {
  const key = process.env.YOUTUBE_API_KEY;

  if (!key) throw new Error("YOUTUBE_API_KEY is required for the YouTube Data API");

  const playlistId = process.env.YOUTUBE_PLAYLIST_ID?.trim();
  let ids: string[];

  if (playlistId) {
    const playlistParams = new URLSearchParams({
      part: "snippet,contentDetails",
      playlistId,
      maxResults: `${MAX_RESULTS}`,
      key,
    });
    const playlistResponse = await fetch(`${API}/playlistItems?${playlistParams}`, {
      next: { revalidate: API_REVALIDATE_SECONDS },
    });

    if (!playlistResponse.ok) {
      throw new Error(`YouTube playlist items responded ${playlistResponse.status}`);
    }

    const playlist = (await playlistResponse.json()) as {
      items?: Array<{
        contentDetails?: { videoId?: string };
        snippet?: { resourceId?: { videoId?: string } };
      }>;
    };

    ids = (playlist.items ?? [])
      .map((item) => item.contentDetails?.videoId ?? item.snippet?.resourceId?.videoId)
      .filter((id): id is string => Boolean(id));
  } else {
    const channelId = await resolveChannelId();

    if (!channelId) throw new Error("could not resolve YouTube channel id");

    const searchParams = new URLSearchParams({
      part: "snippet",
      channelId,
      order: "date",
      type: "video",
      maxResults: `${MAX_RESULTS}`,
      key,
    });
    const searchResponse = await fetch(`${API}/search?${searchParams}`, {
      next: { revalidate: API_REVALIDATE_SECONDS },
    });

    if (!searchResponse.ok) throw new Error(`YouTube search responded ${searchResponse.status}`);

    const search = (await searchResponse.json()) as {
      items?: Array<{ id?: { videoId?: string } }>;
    };

    ids = (search.items ?? [])
      .map((item) => item.id?.videoId)
      .filter((id): id is string => Boolean(id));
  }

  if (ids.length === 0) return [];

  const detailParams = new URLSearchParams({
    part: "snippet,statistics",
    id: ids.join(","),
    key,
  });

  const detailResponse = await fetch(`${API}/videos?${detailParams}`, {
    next: { revalidate: API_REVALIDATE_SECONDS },
  });

  if (!detailResponse.ok) throw new Error(`YouTube videos responded ${detailResponse.status}`);

  const details = (await detailResponse.json()) as {
    items?: Array<{
      id?: string;
      snippet?: {
        title?: string;
        description?: string;
        publishedAt?: string;
        thumbnails?: Record<string, { url?: string }>;
      };
      statistics?: { viewCount?: string; likeCount?: string };
    }>;
  };

  const videosById = new Map<string, NonNullable<typeof details.items>[number]>();

  for (const video of details.items ?? []) {
    if (video.id) videosById.set(video.id, video);
  }

  return ids.flatMap((id) => {
    const video = videosById.get(id);

    if (!video) return [];

    const snippet = video.snippet ?? {};
    const preferred = ["maxres", "standard", "high", "medium", "default"];
    const best = preferred.find((keyName) => snippet.thumbnails?.[keyName]?.url);

    return {
      id: `yt-${id}`,
      title: unescapeXml(snippet.title ?? "Untitled"),
      description: truncate(unescapeXml(snippet.description ?? ""), 180),
      url: `https://www.youtube.com/watch?v=${id}`,
      thumbnail: best ? snippet.thumbnails?.[best]?.url : undefined,
      tags: [],
      date: relativeDate(snippet.publishedAt),
      stats: [
        { label: "views", value: formatCount(video.statistics?.viewCount) },
        { label: "likes", value: formatCount(video.statistics?.likeCount) },
      ],
    } satisfies ContentItem;
  });
}

export async function getYoutubeVideos(): Promise<ContentItem[]> {
  try {
    if (process.env.YOUTUBE_API_KEY) return await getFromApi();

    const items = await getFromFeed();

    // Live but genuinely empty: return nothing rather than inventing films.
    if (items === "empty") return [];

    return items;
  } catch (error) {
    console.warn("[youtube] falling back to mock data:", (error as Error).message);

    return mockYoutubeItems;
  }
}