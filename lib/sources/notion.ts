import type { ContentItem } from "@/lib/types";

import { mockNotionItems } from "@/data/mock/notion";

/**
 * Notion splits databases into a *container* and one or more *data sources*, and
 * as of API version 2025-09-03 you must query by `data_source_id` — the
 * `database_id` from your URL is not accepted there.
 *
 * You only ever paste the database id. We resolve the data source id ourselves
 * and cache that lookup for a day, so no extra configuration is required.
 */
const NOTION_API = "https://api.notion.com/v1";
const NOTION_VERSION = () => process.env.NOTION_API_VERSION?.trim() || "2025-09-03";

/** Project pages change rarely; 60s is well inside the free quota. */
const QUERY_REVALIDATE_SECONDS = 60;
const DATA_SOURCE_REVALIDATE_SECONDS = 86_400;
const PAGE_SIZE = 100;
const MAX_PAGES = 10;

/**
 * The thing you paste into the URL bar is not always a database.
 *
 * `https://app.notion.com/p/AI-Powered-Video-Editing-Course-3edc...85` is an
 * ordinary PAGE — the trailing 32-hex group is a *page* id, and posting it to
 * `/data_sources/{id}/query` returns a 404 rather than your rows. Requiring
 * people to notice that difference themselves is a pointless trap, so we accept
 * either variable and detect the kind at runtime via `GET /databases/{id}`.
 */
export const notionContainerId = () =>
  process.env.NOTION_DATABASE_ID?.trim() || process.env.NOTION_PAGE_ID?.trim() || "";

/**
 * Which set of pages to show.
 *
 * `all` (default) lists every page the integration has been given access to via
 * `/v1/search`. This is what "show all my Notion pages" actually means: the
 * token is the selector, and a workspace can easily hold several databases plus
 * loose pages, none of which are children of one particular page.
 *
 * `database` and `page` pin to one container instead, for when you deliberately
 * want a single database's rows or a single page's child pages.
 */
export const notionScope = () => (process.env.NOTION_SCOPE?.trim() || "all").toLowerCase();

export const notionIsLive = () =>
  Boolean(process.env.NOTION_API_KEY) &&
  (notionScope() === "all" || Boolean(notionContainerId()));

/** Real, greppable variable names for the health probe. */
export const notionMissingEnv = (): string[] => {
  const missing: string[] = [];

  if (!process.env.NOTION_API_KEY) missing.push("NOTION_API_KEY");

  if (notionScope() !== "all" && !notionContainerId()) {
    missing.push(notionScope() === "page" ? "NOTION_PAGE_ID" : "NOTION_DATABASE_ID");
  }

  return missing;
};

export const notionSource = () => (notionIsLive() ? ("live" as const) : ("mock" as const));

type NotionRichText = { plain_text?: string; text?: { content?: string } };

type NotionProperty = {
  id?: string;
  type?: string;
  title?: NotionRichText[];
  rich_text?: NotionRichText[];
  select?: { name?: string } | null;
  status?: { name?: string } | null;
  multi_select?: Array<{ name?: string }>;
  date?: { start?: string } | null;
  url?: string | null;
  number?: number | null;
  checkbox?: boolean;
};

type NotionFileish = {
  type?: string;
  emoji?: string;
  external?: { url?: string } | null;
  file?: { url?: string } | null;
};

type NotionPage = {
  object?: string;
  id: string;
  created_time?: string;
  last_edited_time?: string;
  archived?: boolean;
  in_trash?: boolean;
  url?: string;
  cover?: NotionFileish | null;
  icon?: NotionFileish | null;
  properties?: Record<string, NotionProperty>;
};

const headers = () => ({
  Authorization: `Bearer ${process.env.NOTION_API_KEY}`,
  "Notion-Version": NOTION_VERSION(),
  "Content-Type": "application/json",
});

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Notion documents that 429 and 529 must be retried with the server-supplied
 * `Retry-After`. We retry only those two — retrying a 400 never helps.
 */
async function notionFetch<T>(url: string, init: RequestInit = {}, attempt = 0): Promise<T> {
  const response = await fetch(url, { ...init, headers: { ...headers(), ...(init.headers ?? {}) } });

  if ((response.status === 429 || response.status === 529) && attempt < 3) {
    const retryAfter = Number(response.headers.get("retry-after"));
    const waitSeconds = Number.isFinite(retryAfter) && retryAfter > 0 ? retryAfter : 2 ** attempt;

    await sleep(Math.min(waitSeconds, 30) * 1000);

    return notionFetch<T>(url, init, attempt + 1);
  }

  if (!response.ok) {
    const body = await response.text().catch(() => "");

    throw new Error(`Notion responded ${response.status}${body ? `: ${body.slice(0, 200)}` : ""}`);
  }

  return (await response.json()) as T;
}

/**
 * Resolve `database_id` → `data_source_id`. Set NOTION_DATA_SOURCE_ID to skip
 * this entirely if you ever want to pin it.
 */
async function resolveDataSourceId(databaseId: string): Promise<string | null> {
  const pinned = process.env.NOTION_DATA_SOURCE_ID?.trim();

  if (pinned) return pinned;

  try {
    const database = await notionFetch<{
      data_sources?: Array<{ id: string; name?: string }>;
    }>(
      `${NOTION_API}/databases/${databaseId}`,
      // The mapping is effectively static, so cache it hard. A GET has no body
      // to revalidate on, but Next caches the response by URL either way.
      { method: "GET", next: { revalidate: DATA_SOURCE_REVALIDATE_SECONDS } },
    );

    return database.data_sources?.[0]?.id ?? null;
  } catch (error) {
    console.warn("[notion] data source discovery failed:", (error as Error).message);

    return null;
  }
}

const fileUrl = (file?: NotionFileish | null) => {
  if (!file) return undefined;

  return file.type === "external" ? file.external?.url : file.file?.url;
};

/**
 * Notion page icons are usually emoji rather than Iconify names. Both are
 * accepted by `ContentItem.icon`: a value containing ":" is treated as an
 * Iconify id, anything else is rendered as a literal glyph.
 */
const pageIcon = (icon?: NotionFileish | null) => {
  if (!icon) return undefined;

  if (icon.type === "emoji") return icon.emoji;

  return fileUrl(icon);
};

const plainText = (rich?: NotionRichText[]) =>
  (rich ?? [])
    .map((chunk) => chunk.plain_text ?? chunk.text?.content ?? "")
    .join("")
    .trim();

const relativeDate = (iso?: string) => {
  if (!iso) return undefined;

  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);

  if (days <= 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 30) return `${days} days ago`;
  if (days < 365) return `${Math.floor(days / 30)} mo ago`;

  return `${Math.floor(days / 365)}y ago`;
};

const formatDate = (iso?: string) => {
  if (!iso) return undefined;

  const date = new Date(iso);

  if (Number.isNaN(date.getTime())) return undefined;

  return date.toLocaleDateString("en-GB", { month: "short", year: "numeric" });
};

/**
 * Resolve properties by TYPE, never by name. That is what lets you rename
 * columns, add columns, or add a page with no custom properties at all and have
 * it render correctly with no code change.
 */
function normalisePage(page: NotionPage): ContentItem {
  const properties = Object.values(page.properties ?? {});

  const titleProperty = properties.find((property) => property.type === "title");
  const title = plainText(titleProperty?.title) || "Untitled";

  // The longest non-title rich text is the most useful summary we can infer.
  const description = properties
    .filter((property) => property.type === "rich_text" && property.id !== titleProperty?.id)
    .map((property) => plainText(property.rich_text))
    .filter(Boolean)
    .sort((a, b) => b.length - a.length)[0];

  const statusProperty =
    properties.find((property) => property.type === "status") ??
    properties.find((property) => property.type === "select");

  const status = statusProperty?.status?.name ?? statusProperty?.select?.name ?? undefined;

  const multiSelect = properties.find((property) => property.type === "multi_select");
  const tags = (multiSelect?.multi_select ?? [])
    .map((option) => option.name)
    .filter((name): name is string => Boolean(name));

  const dateProperty = properties.find((property) => property.type === "date");
  const date = dateProperty?.date?.start ?? page.created_time;

  const urlProperty = properties.find((property) => property.type === "url");
  const url = urlProperty?.url ?? page.url;

  const cover = fileUrl(page.cover);
  const icon = pageIcon(page.icon);

  return {
    id: `notion-${page.id}`,
    title,
    description: description ?? "",
    url: url ?? undefined,
    thumbnail: cover,
    icon,
    tags,
    status,
    date: date ? (formatDate(date) ?? relativeDate(date)) : undefined,
  };
}

async function queryEndpoint(endpoint: string): Promise<NotionPage[]> {
  const pages: NotionPage[] = [];
  let cursor: string | undefined;

  for (let pageIndex = 0; pageIndex < MAX_PAGES; pageIndex += 1) {
    const body: Record<string, unknown> = {
      page_size: PAGE_SIZE,
      sorts: [{ timestamp: "last_edited_time", direction: "descending" }],
    };

    if (cursor) body.start_cursor = cursor;

    const response = await notionFetch<{
      results?: NotionPage[];
      has_more?: boolean;
      next_cursor?: string;
    }>(endpoint, {
      method: "POST",
      body: JSON.stringify(body),
      next: { revalidate: QUERY_REVALIDATE_SECONDS },
    });

    pages.push(...(response.results ?? []));

    if (!response.has_more || !response.next_cursor) break;

    cursor = response.next_cursor;
  }

  return pages;
}

/**
 * "Published" is not a concept the Notion API exposes — it belongs to Notion
 * Sites. In practice it is tracked with a Status or Select option, and the
 * normaliser above already reads whichever of those it finds.
 *
 * So: filter to a publish-ish option when the pages actually carry one, and
 * otherwise return everything. Returning nothing because no property matched
 * would be strictly worse than occasionally showing a draft, and the former is
 * indistinguishable from a broken integration.
 */
const PUBLISHED_PATTERN = /^(published|publish|live|public|released)$/i;

const isPublished = (item: ContentItem) => {
  const configured = process.env.NOTION_PUBLISHED_STATUS?.trim();

  if (configured) {
    const allowed = configured
      .split(",")
      .map((value) => value.trim().toLowerCase())
      .filter(Boolean);

    return Boolean(item.status && allowed.includes(item.status.toLowerCase()));
  }

  return Boolean(item.status && PUBLISHED_PATTERN.test(item.status.trim()));
};

/** Diagnostic state for /api/health. Diagnostic only — never affects rendering. */
export type NotionDiagnostics = {
  containerKind?: "database" | "page";
  /** Whether a publish-ish status was found and applied. */
  publishedFilter?: "status" | "off";
  pages?: number;
  shown?: number;
  error?: string;
};

let diagnostics: NotionDiagnostics = {};

export const notionDiagnostics = (): NotionDiagnostics => diagnostics;

/**
 * A plain page has no queryable rows — its content is its *child pages*, which
 * are exposed as `child_page` blocks. Listing them gives ids only, so each one is
 * then read individually to recover its title, cover, icon and properties, and
 * so it flows through exactly the same `normalisePage` as a database row.
 */
async function getChildPages(pageId: string): Promise<NotionPage[]> {
  const ids: string[] = [];
  let cursor: string | undefined;

  for (let pageIndex = 0; pageIndex < MAX_PAGES; pageIndex += 1) {
    const url = new URL(`${NOTION_API}/blocks/${pageId}/children`);

    url.searchParams.set("page_size", String(PAGE_SIZE));
    if (cursor) url.searchParams.set("start_cursor", cursor);

    const response = await notionFetch<{
      results?: Array<{ id?: string; type?: string }>;
      has_more?: boolean;
      next_cursor?: string;
    }>(url.toString(), { next: { revalidate: QUERY_REVALIDATE_SECONDS } });

    for (const block of response.results ?? []) {
      if (block.type === "child_page" && block.id) ids.push(block.id);
    }

    if (!response.has_more || !response.next_cursor) break;

    cursor = response.next_cursor;
  }

  const pages = await Promise.all(
    ids.map((id) =>
      notionFetch<NotionPage>(`${NOTION_API}/pages/${id}`, {
        next: { revalidate: QUERY_REVALIDATE_SECONDS },
      }),
    ),
  );

  return pages;
}

/** `GET /databases/{id}` succeeds only for a real database, so it doubles as a type test. */
async function isDatabase(id: string): Promise<boolean> {
  try {
    await notionFetch(`${NOTION_API}/databases/${id}`, {
      method: "GET",
      next: { revalidate: DATA_SOURCE_REVALIDATE_SECONDS },
    });

    return true;
  } catch (error) {
    if (error instanceof Error && /Notion responded 404\b/.test(error.message)) return false;

    throw error;
  }
}

async function queryDatabase(databaseId: string): Promise<NotionPage[]> {
  const dataSourceId = await resolveDataSourceId(databaseId);

  if (!dataSourceId) return queryEndpoint(`${NOTION_API}/databases/${databaseId}/query`);

  try {
    return await queryEndpoint(`${NOTION_API}/data_sources/${dataSourceId}/query`);
  } catch (error) {
    console.warn("[notion] data source query failed, trying legacy endpoint:", (error as Error).message);

    return queryEndpoint(`${NOTION_API}/databases/${databaseId}/query`);
  }
}

/**
 * Every page shared with the integration, newest edit first. This is the only
 * mode that surfaces content spread across several databases *and* loose pages,
 * which is the normal shape of a real workspace.
 */
async function searchAllPages(): Promise<NotionPage[]> {
  const pages: NotionPage[] = [];
  let cursor: string | undefined;

  for (let pageIndex = 0; pageIndex < MAX_PAGES; pageIndex += 1) {
    const url = new URL(`${NOTION_API}/search`);

    if (cursor) url.searchParams.set("start_cursor", cursor);

    const response = await notionFetch<{
      results?: NotionPage[];
      has_more?: boolean;
      next_cursor?: string;
    }>(url.toString(), {
      method: "POST",
      body: JSON.stringify({
        page_size: PAGE_SIZE,
        filter: { property: "object", value: "page" },
        sort: { direction: "descending", timestamp: "last_edited_time" },
      }),
      next: { revalidate: QUERY_REVALIDATE_SECONDS },
    });

    pages.push(...(response.results ?? []));

    if (!response.has_more || !response.next_cursor) break;

    cursor = response.next_cursor;
  }

  return pages;
}

export async function getNotionProjects(): Promise<ContentItem[]> {
  if (!notionIsLive()) return mockNotionItems;

  const scope = notionScope();
  const containerId = notionContainerId();

  try {
    let raw: NotionPage[];

    if (scope === "all") {
      diagnostics = { containerKind: "database" };

      raw = await searchAllPages();
    } else {
      const database = await isDatabase(containerId);

      diagnostics = { containerKind: database ? "database" : "page" };

      if (!database) {
        console.warn(`[notion] ${containerId} is not a database — reading its child pages instead.`);
      }

      raw = database ? await queryDatabase(containerId) : await getChildPages(containerId);
    }

    const items = raw
      .filter((page) => !page.archived && !page.in_trash)
      .map(normalisePage);

    const hasPublishFlag = items.some((item) => item.status && PUBLISHED_PATTERN.test(item.status));

    const shown = items.filter((item) => (hasPublishFlag ? isPublished(item) : true));

    diagnostics = {
      ...diagnostics,
      pages: items.length,
      shown: shown.length,
      publishedFilter: hasPublishFlag ? "status" : "off",
    };

    // An empty container should look empty, not like a broken integration.
    return shown;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);

    console.warn("[notion] falling back to mock data:", message);

    diagnostics = { error: message };

    return mockNotionItems;
  }
}

/** Every status actually present in the data, for the filter chips. */
export function statusesOf(items: ContentItem[]): string[] {
  return [...new Set(items.map((item) => item.status).filter(Boolean))] as string[];
}