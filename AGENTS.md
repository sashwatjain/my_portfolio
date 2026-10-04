# AGENTS.md

Operating manual for this repository. Read this before changing anything — it is
the shortest path to understanding what lives where and how to extend it safely.

---

## 1. What this project is

A personal site split into **two pages with two different moods**, sharing one
shell (top bar, footer, chat widget) and one component library.

| Page | Route | Theme | Content |
| --- | --- | --- | --- |
| **Career** | `/` | `career` — near-black + red | GitHub projects, education, experience, skills, resume |
| **Studio** | `/studio` | `studio` — warm cream + amber | YouTube, Notion ongoing projects |

The theme is **derived from the route**, never set by hand. There is no
light/dark toggle; navigating to `/studio` *is* the theme change.

---

## 2. The theming contract (most important rule in this repo)

### Never use raw `dark:` variants

```tsx
// WRONG — will not respond to the career/studio theme split
<div className="bg-white dark:bg-black/60" />

// RIGHT — resolves automatically on both themes
<div className="bg-background border border-divider" />
```

The site has two palettes, not two brightness levels. Tailwind's `dark:` variant
keys off the `prefers-color-scheme` media query and has no idea which page you are
on. HeroUI's semantic tokens read from CSS variables that *are* theme-aware.

**Semantic tokens to use:**

```
bg-background          page canvas
bg-content1/2/3        card surfaces, in ascending emphasis
text-foreground        primary text
text-foreground-600    secondary text
text-foreground-500    tertiary text / captions
border-divider         hairline borders
text-primary / bg-primary      accent (red on career, amber on studio)
text-primary-600 / bg-primary/10    subtle accent
text-success / text-danger / text-warning
```

Plain Tailwind classes (`rounded-large`, `text-3xl`, `gap-6`, `flex`) are always
fine. Only **colour** needs to be token-based.

### Never build Tailwind class names dynamically

```tsx
// WRONG — Tailwind cannot see these, so they are never generated
<div className={`bg-${color}-100 text-${color}-500`} />

// RIGHT — full literal strings
const TONE = {
  red: "bg-red-100 text-red-500",
  amber: "bg-amber-100 text-amber-500",
};
```

### The two themes

Defined in `tailwind.config.js` via `heroui({ themes: {...} })`. HeroUI emits
`.career` / `[data-theme="career"]` selectors, and those variables cascade, so
the attribute works on any element.

`data-theme` is set on the wrapper that `SiteShell` renders
(`components/layout/site-shell.tsx`), which is mounted by the two per-page
layouts:

```
app/
  layout.tsx              <html> + <body> + <Providers> only
  (career)/layout.tsx     <SiteShell theme="career">   →  /
  (career)/page.tsx       the career page
  studio/layout.tsx       <SiteShell theme="studio">   →  /studio
  studio/page.tsx         the studio page
```

`app/layout.tsx` deliberately knows nothing about the theme, because a root
layout cannot see the pathname without going dynamic and losing ISR. Each page's
own layout can, which is why the correct palette is present in the server HTML
rather than being applied after hydration.

To change the palettes, edit the `themes.career` / `themes.studio` colour blocks
in `tailwind.config.js`. Nothing else needs to change.

### Do not reintroduce next-themes

`next-themes` is **not** a dependency and must not come back. Its `useTheme`
(and HeroUI's own `@heroui/use-theme`) read `localStorage` inside a `useState`
initializer with no `typeof window` guard, which throws
`ReferenceError: localStorage is not defined` while prerendering.

The template hid this with `dynamic(..., { ssr: false })` around the provider,
which does not fix the error — it makes Next emit
`BAILOUT_TO_CLIENT_SIDE_RENDERING` and ship an **empty HTML shell**, so the whole
page is client-rendered. If a page's markup ever vanishes from the server
response and appears only after hydration, this is why.

HeroUI 2.7.8 resolves themes purely from `[data-theme]` CSS selectors and never
reads a theme context, so no provider is needed at all.

---

## 3. Adding or changing content

All editable copy lives in `data/`. No component contains hardcoded prose.

| File | Holds |
| --- | --- |
| `data/career.ts` | Hero, education, experience, skills/technologies, resume |
| `data/studio.ts` | Studio hero, YouTube copy, Notion copy, business placeholder |
| `data/site.ts` | Name, contact details, social links, `PAGES`, `SECTIONS` |
| `data/index.ts` | Assembles the three above into `DATA`. Do not edit directly. |

**To change any text:** find it in `data/`, edit, done. No component changes.

---

## 4. Adding a new section

Three steps. This is the recipe the architecture was designed around.

**Step 1 — register it** in `SECTIONS` (`data/site.ts`):

```ts
export const SECTIONS = [
  // ...
  { id: "awards", page: "career", label: "Awards", icon: "lucide:award" },
] as const;
```

The `id` **must** match the `id` prop you pass to `<Section>` in step 2.
Registering here is what makes the chat widget able to navigate to it.

**Step 2 — build it** in `components/career/` or `components/studio/`:

```tsx
import { Section } from "@/components/ui/section";

export const AwardsSection = () => (
  <Section
    id="awards"
    eyebrow="Recognition"
    icon="lucide:award"
    title="Awards & Mentions"
    description="A few things worth mentioning."
  >
    {/* anything you like — tokens only */}
  </Section>
);
```

`<Section>` handles the DOM anchor, heading layout, `scroll-margin-top` for the
sticky top bar, the scroll-reveal animation, and vertical rhythm. You do not
write any of that yourself.

**Step 3 — mount it** in the page, in the position you want it:

```tsx
// app/(career)/page.tsx
<AwardsSection />
```

That is the whole procedure. The registry entry is what makes the section
navigable by the chat widget; nothing else needs updating anywhere.

### Reordering sections

Just move the JSX. Order in the file is order on the page.

---

## 5. Data sources

Every external integration lives in `lib/sources/` and follows **one contract**:

```ts
// lib/sources/example.ts
export const exampleIsLive = () => Boolean(process.env.EXAMPLE_API_KEY);
export async function getExampleItems(): Promise<ContentItem[]> { ... }
```

Three rules, all three required:

1. **Never throw.** If the env var is missing, or the request fails, or the
   response is malformed — return the mock from `data/mock/` and
   `console.warn` the reason. The page must always render.
2. **Normalise to `ContentItem`** (`lib/types.ts`) so `<ProjectCard>` and
   `<Carousel>` work with it unchanged.
3. **Cache with `next: { revalidate: N }`** so you do not hammer a free-tier API
   on every request.

### Adding a source — six steps

1. Create `data/mock/<name>.ts` exporting `mock<Name>Items: ContentItem[]`.
   Shape it exactly like the real API response so the swap is invisible later.
2. Create `lib/sources/<name>.ts` implementing the contract above.
3. Add the env vars to `.env.local` and to the table in section 8.
4. Add a probe to `app/api/health/route.ts` so it is visible when it breaks.
5. Document the setup steps in `docs/INTEGRATIONS.md`.
6. Render it with `<Section>` + `<ProjectCard>` / `<Carousel>`.

`lib/sources/github.ts` is the simplest reference implementation.

### Existing sources

| Source | Env | Freshness |
| --- | --- | --- |
| GitHub | `GITHUB_USERNAME` (optional, defaults to `sashwatjain`) | 60s |
| YouTube | none required (RSS); optional `YOUTUBE_API_KEY` | 900s |
| Notion | `NOTION_API_KEY` (scopes via `NOTION_SCOPE`) | 60s |

### The Notion source is schema-tolerant by design

It resolves properties **by type, never by name** — the `title` property, the
longest non-title `rich_text`, the first `status` or `select`, `multi_select`,
`date`, `cover`, `url`. So you can rename columns, add columns, or add pages to
the Notion database and the site keeps working with no code change.

It also auto-discovers the `data_source_id` from the `database_id` you paste,
because Notion split databases into containers and data sources in API version
`2025-09-03`. Do not "simplify" this back to `/v1/databases/{id}/query` — that
endpoint is deprecated for current API versions.

---

## 6. Routes and section IDs

| Route | Theme | Sections |
| --- | --- | --- |
| `/` | `career` | `hero`, `github`, `education`, `experience`, `skills`, `resume` |
| `/studio` | `studio` | `hero`, `course`, `youtube`, `notion` |
| both | — | `contact` (the footer) |

This table is a mirror of `SECTIONS` in `data/site.ts` — that file is the real
source. The chat widget reads the registry, so it cannot drift out of sync with
the pages. Keep it that way: **never hardcode a section id in a component.**

---

## 7. Component layout

```
components/
  ui/         section.tsx, carousel.tsx, project-card.tsx, glyph.tsx
              → generic, page-agnostic, no data imports
  layout/     site-shell.tsx, top-bar.tsx, page-footer.tsx,
              page-theme.tsx, page-background.tsx
              → the shared shell
  career/     one file per section of `/`
  studio/     one file per section of `/studio`
  chat/       ChatWidget.tsx
  contact/    contact-form/ + types.ts — reused verbatim by the shared footer
  textAnimations/
              → gradient-text, splitting-text, highlight-text
```

Rules:
- `ui/` components take props and import **no** data files.
- `career/` and `studio/` components read from `data/career.ts` / `data/studio.ts`
  only. They never call a source directly — the **page** fetches and passes down.
- Never import from `data/mock/` in a component. Mocks are a fallback for
  `lib/sources/`, not something the UI knows about.
- `SiteShell` is the only thing that sets `data-theme`. Do not add a second
  place to set it.

---

## 8. Environment variables

All optional. Anything missing degrades to mock data rather than breaking the
build. Never commit `.env.local`.

| Variable | Used by | If missing |
| --- | --- | --- |
| `GROQ_API_KEY` | chat route | chat shows a friendly error bubble |
| `NEXT_PUBLIC_EMAILJS_SERVICE_ID` | contact form | form shows a config notice |
| `NEXT_PUBLIC_EMAILJS_TEMPLATE_ID` | contact form | ↑ |
| `NEXT_PUBLIC_EMAILJS_PUBLIC_KEY` | contact form | ↑ |
| `GITHUB_USERNAME` | `lib/sources/github.ts` | defaults to `sashwatjain` |
| `YOUTUBE_API_KEY` | `lib/sources/youtube.ts` | RSS is used instead; you only need this for durations/likes/>15 videos |
| `YOUTUBE_CHANNEL_ID` | `lib/sources/youtube.ts` | auto-discovered from `YOUTUBE_HANDLE`, cached 24h |
| `YOUTUBE_HANDLE` | `lib/sources/youtube.ts` | defaults to `@Sashwatjain` |
| `YOUTUBE_PLAYLIST_ID` | `lib/sources/youtube.ts` | shows that playlist instead of all uploads |
| `NOTION_API_KEY` | `lib/sources/notion.ts` | falls back to mock projects |
| `NOTION_SCOPE` | `lib/sources/notion.ts` | defaults to `all` — every page shared with the integration |
| `NOTION_DATABASE_ID` | `lib/sources/notion.ts` | only used when `NOTION_SCOPE=database` |
| `NOTION_PAGE_ID` | `lib/sources/notion.ts` | only used when `NOTION_SCOPE=page` |
| `NOTION_PUBLISHED_STATUS` | `lib/sources/notion.ts` | auto-detects `published`/`live`/`public`/`released`; shows everything if none match |
| `NOTION_DATA_SOURCE_ID` | `lib/sources/notion.ts` | auto-discovered from the database id |
| `NOTION_API_VERSION` | `lib/sources/notion.ts` | defaults to `2025-09-03` |

See `docs/INTEGRATIONS.md` for click-by-click setup of Notion and YouTube.

---

## 9. Debugging

**First step, always: hit `GET /api/health`.** It reports which integrations are
live, which are mocked, which env vars are missing *by name*, and any error
message. It never returns secret values.

```
http://localhost:3000/api/health
```

```jsonc
{
  "status": "degraded",
  "integrations": {
    "chat": {
      "live": true,
      // If preferredModels contains a model that is NOT in availableModels,
      // that model has been retired by the provider and must be replaced.
      "preferredModels": ["openai/gpt-oss-120b", "openai/gpt-oss-20b"],
      "availableModels": ["openai/gpt-oss-120b", "openai/gpt-oss-20b"]
    }
  }
}
```

### Chat model rot

LLM providers retire model IDs on their own schedule with no warning, which
silently breaks a fallback chain. This repo already hit it: five of six Groq
models were shut down and the chain returned HTTP 500 with no user-visible error.

Defences in place, all of which must be preserved:
- The model loop continues on **any** error, not just rate limits.
- The route returns **200** with `{ reply, action, section, error }` — never a
  bare 500. The UI can always render something.
- `/api/health` diffs `preferredModels` against `groq.models.list()`.

When adding or reordering models in `app/api/chat/route.ts`, verify them
against `/api/health` before shipping.

### Verifying SSR actually happened

`npm run build` succeeding does **not** prove the page is server-rendered. If
something forces a client boundary, the build still passes and you only get an
empty HTML shell. Check it directly:

```bash
curl -s http://localhost:3000/ | grep -c "<h1"
curl -s http://localhost:3000/ | grep -c BAILOUT_TO_CLIENT_SIDE_RENDERING
```

`<h1` must be non-zero. Section 2 explains the trap that produces a zero.

---

## 10. Commands

```bash
npm run dev     # dev server, turbopack
npm run build   # production build — run before considering work done
npm run lint    # eslint --fix
```

There is no test suite. `npm run build` is the gate.

---

## 11. Conventions

- TypeScript strict mode. No `any` in new code — the old `projects` page used it
  heavily and it is not a pattern to copy.
- Client components need the `"use client"` directive; keep them as small as
  possible and push fetching to the server page.
- Server components fetch. Client components format.
- No new runtime dependencies without a reason. The existing integrations use
  plain `fetch` rather than SDKs (no `@notionhq/client`, no YouTube SDK), and
  carousels use native CSS scroll-snap rather than a slider library.
- Images: remote URLs need `next.config.js` `images.remotePatterns` entries.