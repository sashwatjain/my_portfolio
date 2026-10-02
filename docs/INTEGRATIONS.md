# Integrations

Click-by-click setup for the two integrations that need credentials. Both are
**optional** — with no keys the site renders curated mock data and `/api/health`
reports `degraded` rather than failing.

At any point, check what is actually live:

```
http://localhost:3000/api/health
```

It never returns secret values — only booleans, counts, and the *names* of
missing variables.

---

## Notion — ongoing projects on `/studio`

This is the one worth configuring first. The point of it is that you add a page
to Notion and it appears on the site within 60 seconds, with no code change and
no deploy.

### 1. Create the database

Any Notion database works — the site does not care what you call the columns.
A useful starting shape:

| Property | Type | Notes |
| --- | --- | --- |
| Name | Title | Required — this becomes the card title |
| Description | Text | Optional — the longest text field is used |
| Status | Status *or* Select | Optional — becomes a chip and a filter |
| Tags | Multi-select | Optional |
| Link | URL | Optional — a real link beats the fallback to Notion |
| Cover | — | Page cover, used as the card image |
| Icon | — | Page emoji, shown if there is no cover |

**It resolves properties by type, never by name.** Rename a column, add a column,
or add a page with no custom properties at all — it keeps working. That is
deliberate, so you never have to come back here after a rename.

### 2. Create the internal integration

1. <https://www.notion.so/my-integrations> → **New integration**
2. Name it (e.g. `portfolio`), pick your workspace.
3. Copy the **Internal Integration Secret** — this is `NOTION_API_KEY`.

### 3. Share the database with the integration — this is the step everyone misses

The integration has no access to anything until you share a page explicitly.

1. Open the database → `•••` (top right) → **Connections**
2. Find your integration → toggle it **on**
3. Confirm

If you skip this, every query returns `object_not_found` and the site quietly
falls back to mock data.

### 4. Choose a scope

There are three modes, set with `NOTION_SCOPE`:

| `NOTION_SCOPE` | Reads | Needs |
| --- | --- | --- |
| `all` *(default)* | **Every page shared with the integration**, across all databases and loose pages | `NOTION_API_KEY` only |
| `database` | The rows of one database | `NOTION_DATABASE_ID` |
| `page` | The child pages of one page | `NOTION_PAGE_ID` |

`all` is the default because a real workspace is rarely one database. Content
spread over a course page, a lessons database and a projects database is the
normal case, and `all` picks all of it up without you having to point at any
particular id — the token itself is the selector.

For a portfolio section that should show only one projects database, use
`database` scope and set `NOTION_DATABASE_ID` to the 32-character id before
`?v=` in the database view URL. The `?v=` value is the view id, not the database
id. If the URL points to a page rather than a database, the source detects that
and reads its child pages instead.

The id in a Notion URL is **not** the same thing depending on what you opened.
Both a database url and a page url end in 32 hex characters, but they are
different objects:

```
https://www.notion.so/workspace/8f2a1b3c4d5e6f708192a3b4c5d6e7f8   ← database
https://app.notion.com/p/My-Page-3edc563978b6808f9624fbe4918c8b85  ← page
```

In `page` and `database` mode the site detects which it was given via
`GET /databases/{id}` rather than making you work it out, and falls back to
reading child pages if it is not a database.

> Notion split databases into a *container* and one or more *data sources* in
> API version `2025-09-03`, and the query endpoint now takes the data source id
> rather than the database id. The site handles this for you: it looks the
> mapping up once and caches it for 24 hours. You do not need to find it, and
> you should not paste it manually. `NOTION_DATA_SOURCE_ID` exists only as an
> escape hatch.

### 5. Add the env vars and restart

```bash
NOTION_API_KEY=ntn_...
NOTION_SCOPE=database
NOTION_DATABASE_ID=your-database-id
```

```bash
npm run dev
```

Then confirm:

```bash
curl -s http://localhost:3000/api/health | grep -o '"notion":{[^}]*}'
```

### Only showing "published" pages

There is no *published* flag in Notion's API — that belongs to Notion Sites. In
practice people track it with a Status or Select option, so the site:

1. looks for a status matching `published`, `publish`, `live`, `public` or
   `released` across the pages it read;
2. if it finds one, shows only those pages;
3. if it finds none, **shows everything** — silently returning zero pages would
   be indistinguishable from a broken integration.

If your statuses are named something else — e.g. `Done`, `Shipped`,
`Complete` — name them explicitly:

```bash
NOTION_PUBLISHED_STATUS=Done,Shipped
```

### Behaviour

- **Refresh:** every 60 seconds (ISR), so a new Notion page shows up in about a minute.
- **Sorting:** by `last_edited_time`, newest first.
- **Rate limits:** 429 and 529 are retried with the server's `Retry-After`, three attempts. Any other failure falls back to mock data and logs the reason.
- **Links:** a `url` property wins; otherwise the card links to the Notion page and gets a **Notion** badge to say so.
- **Cost:** free. Internal integration ids and tokens don't consume paid quota, and the page is refreshed once a minute.

### Troubleshooting

| Symptom | Cause |
| --- | --- |
| `/api/health` says `notion.live: false` | `NOTION_API_KEY` missing, or a container id is needed for the scope you chose |
| `live: true` but mock cards show | Query failed — check the server log for `[notion]` |
| `Notion responded 401` | `NOTION_API_KEY` is invalid or revoked; create a fresh internal integration token |
| `object_not_found` in the log | The page/database was never shared with the integration (step 3) |
| Only a handful of pages show | Only those were shared — an integration sees nothing it was not given |
| Cards have no titles | The page has no `title` property — every Notion page must have one |

---

## YouTube — videos on `/studio`

**No setup required.** The default path is YouTube's public RSS feed, which needs
no API key, no Google Cloud project and no quota:

```
https://www.youtube.com/feeds/videos.xml?channel_id=UC...
```

The `UC…` id is discovered automatically from your `@handle`
(`YOUTUBE_HANDLE`, default `@Sashwatjain`) by reading it out of the channel
page's own feed URL, and cached for 24 hours. Set `YOUTUBE_CHANNEL_ID` to skip
discovery entirely.

RSS carries title, description, thumbnail, publish date and view count — enough
for the film strip. It returns the 15 most recent entries, which is all a
portfolio needs.

> **If the channel has never published a public video the feed returns 404.**
> That is a real, expected state — not an error — so the page shows an honest
> "nothing published yet" panel instead of inventing films. Publish one video and
> it appears on its own, no deploy needed.

### Showing a playlist instead of everything

Create the playlist in YouTube, then:

```bash
YOUTUBE_PLAYLIST_ID=PLxxxxxxxxxxxxxxxx
```

The feed is then read from that playlist rather than the channel's uploads. Feed
URL becomes `…/videos.xml?playlist_id=PL…`. This playlist selection is honored
both by RSS and by the Data API path, and playlist order is preserved.

### Optional: the Data API

Only worth setting up if you need like counts or more than 15 videos. Channel
uploads use 100 quota units per `search` call against a 10,000/day allowance;
playlists use the playlist-items endpoint instead.

1. <https://console.cloud.google.com> → create a project
2. Enable **YouTube Data API v3**
3. **Credentials** → **Create credentials** → **API key**
4. Restrict it to the YouTube Data API v3

```bash
YOUTUBE_API_KEY=AIza...
```

Setting this key switches the source to the API automatically. It takes priority
over RSS, and `YOUTUBE_CHANNEL_ID` becomes optional since discovery already
handles it.

### Behaviour

- **Refresh:** RSS every 900s; Data API every 300s. Both go through Next's fetch
  cache, so the ISR window never causes an upstream request.
- **Cards:** newest first, linking to the watch page.
- **Thumbnails:** `maxresdefault`, falling back to `hqdefault` for older or
  low-resolution uploads where the large frame doesn't exist.
- **Cost:** free at RSS tier.

### Troubleshooting

Check `/api/health` — `integrations.youtube` reports `mode`, `channel` and
`count`:

| Symptom | Cause |
| --- | --- |
| `count: 0`, page shows the empty panel | Channel has no public videos — publish one |
| `count: 0`, page shows the empty panel, but you have videos | Videos are unlisted/private. The feed only serves public uploads |
| `quotaExceeded` | You set `YOUTUBE_API_KEY`; the key lacks the API enabled or is out of quota. Unset it to return to RSS |
| Channel shows the wrong videos | `YOUTUBE_PLAYLIST_ID` is set — that's deliberate |
| `build log: "no <entry> elements parsed"` | Feed returned 200 with an unparseable body (transient). Rebuild; if it persists the channel id is wrong |

---

## GitHub

No setup. The career page reads public repositories for `sashwatjain` and sorts
them by most recent activity.

Override the account with `GITHUB_USERNAME` if you ever need to.

### Per-repository overrides

The source reads two optional files from a repository's `main` branch, if they
exist:

| File | Effect |
| --- | --- |
| `intro.txt` | Replaces the GitHub description as the card text |
| `tags.json` | A JSON array of strings; replaces the auto-detected topic tags |
| `preview.gif` | Used as the card image if present |

Absent files fall back to the GitHub API's own description, topics, and language.
This is how the mock data models the real shape.

---

## Contact form

EmailJS, three variables:

```bash
NEXT_PUBLIC_EMAILJS_SERVICE_ID=service_...
NEXT_PUBLIC_EMAILJS_TEMPLATE_ID=template_...
NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=yourPublicKey
```

Without them the form still renders and still validates; submitting shows a
"Form not configured" toast naming the missing variables. See
<https://www.emailjs.com>.

---

## Chat

One variable, `GROQ_API_KEY` from <https://console.groq.com/keys>.

If it is absent, the widget still opens and replies with a friendly message that
points the visitor at the contact section.

**Before changing the model list**, read section 9 of `AGENTS.md`. Groq retires
model ids silently, and a stale id breaks the whole chain.
