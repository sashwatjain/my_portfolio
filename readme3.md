Below is a **step‑by‑step plan** that shows where to add the new pieces, what the code looks like, and how the two features (tool‑calling from the chatbot + a “share articles” section) fit into the existing project structure.

---

## 1️⃣  Add **function‑calling** (tool‑calling) to the chatbot API

OpenAI (and a few other LLM providers) let you describe *functions* that the model can invoke.  
We’ll expose three simple tools:

| Tool name | What it does | When the model will call it |
|-----------|--------------|-----------------------------|
| `list_projects` | Returns a JSON array of the portfolio projects (title, description, link). | User asks “show me your projects”. |
| `get_contact`   | Returns the contact information (email, phone, social links). | User asks “how can i contact you?”. |
| `list_blogs`    | Returns a JSON array of recent blog posts (title, url, excerpt). | User asks “show me your blogs”. |

### 1.1  Create a **utility file** that holds the static data (or you can pull it from a CMS later)

```
src/lib/portfolio-data.ts
```

```ts src/lib/portfolio-data.ts
// This file is imported only by the API route – it can be plain JS/TS.

export const projects = [
  {
    title: "Portfolio Template",
    description: "A modern animated portfolio built with Next.js, Tailwind, Framer Motion.",
    url: "https://github.com/Sofiane-Bahmed/portfolio-template",
  },
  // ← add the rest of your projects here
];

export const contact = {
  email: "you@example.com",
  phone: "+1‑555‑123‑4567",
  linkedin: "https://linkedin.com/in/your‑profile",
  twitter: "https://twitter.com/your‑handle",
};

export const blogs = [
  {
    title: "How to build a Next.js animation library",
    url: "https://your‑site.com/blog/nextjs-animation",
    excerpt: "A step‑by‑step guide to creating smooth animations with Framer Motion…",
  },
  // ← add more blog entries or fetch them from an RSS feed later
];
```

### 1.2  Extend the **API route** to understand function calls

Edit (or replace) the existing `app/api/chat/route.ts` with the following.  
Only the **new parts** are highlighted; the rest of the file stays the same.

```ts app/api/chat/route.ts
import { NextResponse } from "next/server";
import { projects, contact, blogs } from "@/src/lib/portfolio-data";

export async function POST(request: Request) {
  const { messages, functions } = await request.json(); // keep the original payload

  // -------------------------------------------------
  // 1️⃣  Detect if the model wants to call a function
  // -------------------------------------------------
  // When using OpenAI’s function calling, the response will contain:
  //   { "function_call": { "name": "...", "arguments": "JSON string" } }
  // We first forward the request to OpenAI, then inspect that field.
  const OPENAI_API_KEY = process.env.OPENAI_API_KEY!;
  const openAiRes = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages,
      // Tell the model which functions are available
      functions: [
        {
          name: "list_projects",
          description: "Return a list of portfolio projects.",
          parameters: { type: "object", properties: {} },
        },
        {
          name: "get_contact",
          description: "Return contact information (email, phone, social links).",
          parameters: { type: "object", properties: {} },
        },
        {
          name: "list_blogs",
          description: "Return a list of recent blog posts.",
          parameters: { type: "object", properties: {} },
        },
      ],
      function_call: "auto", // let the model decide
    }),
  });

  if (!openAiRes.ok) {
    const err = await openAiRes.text();
    console.error(err);
    return NextResponse.json({ error: "LLM request failed" }, { status: 500 });
  }

  const openAiData = await openAiRes.json();

  // -------------------------------------------------
  // 2️⃣  If a function call is present, execute it locally
  // -------------------------------------------------
  const functionCall = openAiData?.choices?.[0]?.message?.function_call;
  if (functionCall) {
    const { name, arguments: args } = functionCall;
    let result: any = null;

    switch (name) {
      case "list_projects":
        result = projects;
        break;
      case "get_contact":
        result = contact;
        break;
      case "list_blogs":
        result = blogs;
        break;
      default:
        result = { error: "unknown function" };
    }

    // Return the function result to the model so it can compose a final answer
    const followUp = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          ...messages,
          { role: "assistant", content: null, function_call: functionCall },
          {
            role: "function",
            name,
            content: JSON.stringify(result),
          },
        ],
      }),
    });

    const finalData = await followUp.json();
    const reply = finalData?.choices?.[0]?.message?.content ?? "Sorry, I couldn't answer.";
    return NextResponse.json({ reply });
  }

  // -------------------------------------------------
  // 3️⃣  No function call → normal reply
  // -------------------------------------------------
  const reply = openAiData?.choices?.[0]?.message?.content ?? "I didn't understand.";
  return NextResponse.json({ reply });
}
```

**What changed**

* Imported the static data (`projects`, `contact`, `blogs`).
* Sent a `functions` array to OpenAI so it knows the three tools exist.
* After the first LLM call we inspect `function_call`. If present we run the matching local function and **send a second request** that includes the function result, letting the model craft a natural‑language answer.
* The client (`ChatWidget`) does **not** need to change – it still POSTs to `/api/chat` and receives `{ reply: string }`.

> **Tip** – If you later want to fetch projects/blogs from a headless CMS or a database, replace the static arrays in `portfolio-data.ts` with an async fetch. The API route can `await` those calls before returning the result.

---

## 2️⃣  Add a **“Share Articles”** section (Medium / LinkedIn)

The UI for a list of external articles is completely independent of the chatbot, so we’ll create a new reusable component and drop it onto the home page (or any page you like).

### 2.1  Create a **service** that pulls the latest posts

Medium and LinkedIn both expose RSS feeds (or you can use their public APIs).  
For simplicity we’ll use the RSS feed and parse it with the tiny `rss-parser` package.

1. **Install the dependency** (run in the terminal)

```bash
npm install rss-parser
```

2. **Add a server‑only helper**:

```
src/lib/articles.ts
```

```ts src/lib/articles.ts
import Parser from "rss-parser";

const parser = new Parser();

/**
 * Fetch the latest N items from a public RSS feed.
 * Returns an array of { title, link, isoDate, contentSnippet }.
 */
export async function fetchRss(url: string, limit = 5) {
  const feed = await parser.parseURL(url);
  return feed.items.slice(0, limit).map((item) => ({
    title: item.title ?? "",
    link: item.link ?? "",
    date: item.isoDate ?? "",
    excerpt: item.contentSnippet ?? "",
  }));
}

/**
 * Convenience wrappers for Medium & LinkedIn.
 */
export async function getMediumArticles(username: string, limit = 5) {
  const url = `https://medium.com/feed/@${username}`;
  return fetchRss(url, limit);
}

export async function getLinkedInArticles(profileId: string, limit = 5) {
  // LinkedIn does not have a public RSS feed any more, but many people use
  // https://www.linkedin.com/feed/rss/author/{profileId}
  const url = `https://www.linkedin.com/feed/rss/author/${profileId}`;
  return fetchRss(url, limit);
}
```

> **Why server‑only?**  
> The RSS request needs a secret‑less fetch and we don’t want to expose the parser to the client bundle. By keeping the code in `src/lib` (imported only from a server component or API route) it stays out of the client bundle.

### 2.2  Create a **React Server Component** that renders the cards

```
components/articles/ArticleList.tsx
```

```tsx components/articles/ArticleList.tsx
import { getMediumArticles, getLinkedInArticles } from "@/src/lib/articles";

type Article = {
  title: string;
  link: string;
  date: string;
  excerpt: string;
};

interface ArticleListProps {
  mediumUser?: string;
  linkedInProfileId?: string;
  limit?: number;
}

/**
 * Server Component – runs on the server, fetches RSS, then renders HTML.
 * No client‑side JavaScript needed unless you add interactivity later.
 */
export const ArticleList = async ({
  mediumUser,
  linkedInProfileId,
  limit = 4,
}: ArticleListProps) => {
  const articles: Article[] = [];

  if (mediumUser) {
    const medium = await getMediumArticles(mediumUser, limit);
    articles.push(...medium);
  }

  if (linkedInProfileId) {
    const linkedIn = await getLinkedInArticles(linkedInProfileId, limit);
    articles.push(...linkedIn);
  }

  // Sort by date (newest first)
  articles.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <section className="my-12">
      <h2 className="text-2xl font-bold mb-6">Latest Articles</h2>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {articles.map((a, i) => (
          <article
            key={i}
            className="p-4 border rounded-lg bg-background/60 hover:shadow-lg transition-shadow"
          >
            <h3 className="font-semibold text-lg">{a.title}</h3>
            <p className="text-sm text-muted-foreground mt-2 line-clamp-3">
              {a.excerpt}
            </p>
            <a
              href={a.link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-3 text-primary-500 hover:underline"
            >
              Read more →
            </a>
          </article>
        ))}
      </div>
    </section>
  );
};
```

**Key points**

* The component is **async** (a Next.js Server Component) – it can `await` the RSS fetch directly.
* Tailwind utilities (`grid`, `border`, `bg-background/60`, etc.) match the rest of the theme.
* You can pass either a Medium username, a LinkedIn profile ID, or both.

### 2.3  Drop the component onto a page

For example, add it to the home page (`app/page.tsx`).

```tsx app/page.tsx
import { HeroSection } from "@/components/home/hero";
import { SkillsOverviewSection } from "@/components/home/skills-overview";
import { WorkSection } from "@/components/home/work";
import { TestimonialsSection } from "@/components/home/testimonials";
import { ArticleList } from "@/components/articles/ArticleList";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <SkillsOverviewSection />
      <WorkSection />
      <TestimonialsSection />

      {/* <-- New article section --> */}
      <ArticleList mediumUser="your-medium-username" linkedInProfileId="your-linkedin-id" />
    </>
  );
}
```

Replace `your-medium-username` and `your-linkedin-id` with the actual handles.  
If you only want Medium, omit the `linkedInProfileId` prop, and vice‑versa.

---

## 3️⃣  Recap of **file locations** you’ll create / edit

| Feature | File (create if missing) | Path |
|--------|--------------------------|------|
| Static portfolio data (projects, contact, blogs) | `portfolio-data.ts` | `src/lib/portfolio-data.ts` |
| Updated chatbot API with function calling | `route.ts` (POST) | `app/api/chat/route.ts` |
| RSS helper (Medium / LinkedIn) | `articles.ts` | `src/lib/articles.ts` |
| Article list UI component | `ArticleList.tsx` | `components/articles/ArticleList.tsx` |
| Add article list to a page | edit `app/page.tsx` (or any page) | `app/page.tsx` |
| (Optional) Install dependency | `rss-parser` | `npm install rss-parser` |
| Environment variable for LLM key | `.env.local` (root) | — |
| (Optional) Add any Tailwind custom colours – already covered by `globals.css` | `app/globals.css` | — |

---

## 4️⃣  How it works together

1. **Chatbot** – When the user asks a question that matches one of the three tools, the LLM returns a `function_call`.  
   The API route runs the matching local function (`list_projects`, `get_contact`, `list_blogs`) and sends the result back to the model, which finally replies with a friendly sentence.  
   The front‑end (`ChatWidget`) shows that sentence exactly as before.

2. **Article section** – The `ArticleList` server component fetches the latest RSS items at request time, renders a grid of cards, and ships static HTML to the browser. No extra client‑side JavaScript is required, keeping the bundle small.

3. **Future extensions** –  
   * Add more tools (e.g., “schedule a meeting”, “show my GitHub repos”) by adding a new entry to the `functions` array and a matching case in the switch‑statement.  
   * Replace the static `portfolio-data.ts` with a real CMS call – just make the function `async` and return the same shape.

---

### 🎉 You’re all set!

* **Backend** – `app/api/chat/route.ts` now knows how to call your custom tools.  
* **Frontend** – The chat widget stays unchanged, and you have a brand‑new “Latest Articles” section that pulls Medium/LinkedIn content.

If you need any of the snippets turned into a full file or want to see how to style the article cards further, just let me know – you can also hit the **Apply** button on any code block or switch to **Agent Mode** to have the changes written automatically. Happy coding!

















































### What happens when the user types **“show me recent projects”**

| Step | Where the code lives | What it does |
|------|----------------------|--------------|
| **1️⃣  User sends the message** | `components/chat/ChatWidget.tsx` – `sendMessage()` | The text is added to the local `messages` array and a **POST** request is sent to **`/api/chat`**. |
| **2️⃣  API receives the request** | `app/api/chat/route.ts` (POST) | The request is forwarded to OpenAI **with the three function definitions** (`list_projects`, `get_contact`, `list_blogs`). |
| **3️⃣  LLM decides to call a function** | OpenAI response contains `function_call: { name: "list_projects", … }` | The route detects the `function_call`, runs the matching local helper (`projects` from `src/lib/portfolio-data.ts`) and sends a **second request** to OpenAI that includes the function result. |
| **4️⃣  LLM returns a natural‑language answer** | Same route, after the second request | The final JSON sent back to the client looks like `{ reply: "Here are my recent projects …" }`. |
| **5️⃣  Front‑end receives the reply** | `ChatWidget.tsx` – after `await fetch(...)` | The reply is appended to `messages`. Because the widget **does not close** after sending, it stays on screen. |
| **6️⃣  (Optional) Auto‑scroll to the Projects section** | `ChatWidget.tsx` – a small `useEffect` that watches the last message | If the reply contains the word *projects* (or you check a flag returned from the API), the effect calls `document.getElementById('projects-section')?.scrollIntoView({ behavior: 'smooth' })`. |

---

## 1️⃣ Keep the chatbot open until the user closes it  

The widget you already have never calls `setOpen(false)` after a message is sent, so it stays open.  
If you ever added logic that auto‑closes the panel, simply **remove** it.  
The only place that changes the `open` state is the **close button** (`✕`) and the **floating “💬” button** that opens it.

No extra code is required for this behaviour – the component you copied already satisfies it.

---

## 2️⃣ Add an anchor so the page can scroll to the Projects section  

1. **Give the section an `id`** (or a `ref`).  
   In the page where the projects are rendered (`WorkSection` is the component that shows the portfolio items), wrap it with a container that has an id like `projects-section`.

```tsx app/page.tsx
import { WorkSection } from "@/components/home/work";

export default function HomePage() {
  return (
    <>
      {/* …other sections… */}
      <WorkSection />
      {/* … */}
    </>
  );
}
```

If `WorkSection` is a simple component you can edit it directly, otherwise you can add a wrapper in the page:

```tsx app/page.tsx
<div id="projects-section">
  <WorkSection />
</div>
```

2. **(Optional) Add a smooth‑scroll CSS rule** – Tailwind already provides `scroll-smooth` on the `<html>` element, but you can also add it in `globals.css`:

```css app/globals.css
html {
  scroll-behavior: smooth;
}
```

---

## 3️⃣ Detect the “show projects” reply and scroll automatically  

Add a tiny `useEffect` inside **`ChatWidget.tsx`** that runs whenever a new message is added.

```tsx components/chat/ChatWidget.tsx
'use client';
import { useState, useEffect } from "react";
import { cn } from "@heroui/system";
import { motion } from "framer-motion";

export const ChatWidget = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Array<{ role: string; text: string }>>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMsg = { role: "user", text: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [...messages, userMsg] }),
      });
      const data = await res.json();
      const botMsg = { role: "assistant", text: data.reply };
      setMessages((prev) => [...prev, botMsg]);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // -------------------------------------------------
  //  👇  Auto‑scroll to the Projects section
  // -------------------------------------------------
  useEffect(() => {
    // Look at the *last* message only
    const last = messages[messages.length - 1];
    if (!last) return;

    // Simple heuristic – you can make it stricter (e.g. check a flag from the API)
    const wantsProjects = /project|portfolio|show.*project/i.test(last.text);
    if (wantsProjects) {
      // The id we added in the page
      const el = document.getElementById("projects-section");
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // -------------------------------------------------
  //  UI (unchanged from the previous snippet)
  // -------------------------------------------------
  return (
    <>
      {/* floating button */}
      <button
        className={cn(
          "fixed bottom-6 right-6 z-50 rounded-full p-3 shadow-lg bg-primary-500 text-white",
          open && "hidden"
        )}
        onClick={() => setOpen(true)}
        aria-label="Open chat"
      >
        💬
      </button>

      {open && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            "fixed bottom-6 right-6 z-50 w-80 max-h-[70vh] flex flex-col bg-background border rounded-lg shadow-xl"
          )}
        >
          {/* header */}
          <div className="flex items-center justify-between p-3 border-b">
            <h4 className="font-semibold">Chatbot</h4>
            <button onClick={() => setOpen(false)} aria-label="Close chat">
              ✕
            </button>
          </div>

          {/* messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={cn(
                  "max-w-[80%] p-2 rounded-lg",
                  msg.role === "user"
                    ? "ml-auto bg-primary-500 text-white"
                    : "mr-auto bg-muted-200 text-foreground"
                )}
              >
                {msg.text}
              </div>
            ))}
            {loading && <p className="text-sm text-muted-foreground">Typing…</p>}
          </div>

          {/* input */}
          <div className="p-3 border-t flex gap-2">
            <input
              type="text"
              className="flex-1 rounded border px-2 py-1 focus:outline-none"
              placeholder="Ask me anything…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            />
            <button
              className="px-3 py-1 bg-primary-500 text-white rounded"
              onClick={sendMessage}
              disabled={loading}
            >
              Send
            </button>
          </div>
        </motion.div>
      )}
    </>
  );
};
```

### What this does

* **Keeps the chat window open** – the only way to hide it is the ✕ button.
* After every new message it checks whether the text looks like a request for projects.
* If it does, it scrolls the element with `id="projects-section"` into view (smoothly, thanks to the CSS rule).

You can replace the simple regex with a more robust flag that the backend returns (e.g., `{ reply, action: "show_projects" }`). In that case you would just test `last.action === "show_projects"` instead of a regex.

---

## 4️⃣ Recap of files you need to touch / create

| Feature | File | Path |
|--------|------|------|
| **Static data for tools** | `portfolio-data.ts` | `src/lib/portfolio-data.ts` |
| **Chat API with function calling** | `route.ts` (POST) | `app/api/chat/route.ts` |
| **Add `id` to the projects section** | either edit `WorkSection` or wrap it in the page | `components/home/work.tsx` **or** `app/page.tsx` |
| **Smooth‑scroll CSS (optional)** | `globals.css` | `app/globals.css` |
| **Chat widget auto‑scroll logic** | `ChatWidget.tsx` | `components/chat/ChatWidget.tsx` |
| **Environment variable for LLM key** | `.env.local` (root) | — |
| **(Optional) Article list** – unchanged from previous answer, but still present if you want it. | `ArticleList.tsx` etc. | `components/articles/ArticleList.tsx` |

---

### TL;DR

* The user asks “show me recent projects”.  
* The LLM calls the **`list_projects`** function on the server, which returns the static project list.  
* The server sends a friendly reply back to the client.  
* The **chat widget stays open** (no code closes it).  
* A small `useEffect` watches the incoming reply; when it detects a “projects” request it scrolls the page to the element with `id="projects-section"` (the section that renders your projects).  

That gives you the exact behaviour you described: the chatbot remains visible, and the UI automatically brings the projects into view when the user asks for them. If you need any of the snippets turned into full files or want to tweak the regex/flag logic, just let me know!