import { NextResponse } from "next/server";
import Groq from "groq-sdk";

import { PAGES, SECTION_IDS, SITE } from "@/data/site";

export const runtime = "nodejs";

/**
 * Providers retire model ids on their own schedule, with no warning. Keep this
 * list short and verify it against GET /api/health before shipping — a model
 * that is gone here is a silent 500, which is exactly how this endpoint used to
 * break. See AGENTS.md section 9.
 */
const MODELS = [
  "openai/gpt-oss-120b",
  "openai/gpt-oss-20b",
  "qwen/qwen3.8-27b",
] as const;

const MAX_MESSAGES = 24;
const MAX_CONTENT_LENGTH = 4000;

type ChatMessage = { role: "user" | "assistant"; content: string };

/**
 * Built from the SECTIONS registry so the model can never be told to navigate
 * to a section that does not exist.
 */
const systemPrompt = `You are Sash AI — the assistant embedded in ${SITE.name}'s portfolio, a two-page site.

SITE STRUCTURE
- "/" is the career page. Sections: hero, github, education, experience, skills, resume.
- "/studio" is the studio page. Sections: hero, youtube, notion.
- "contact" is the shared footer and exists on both pages.

HOW TO NAVIGATE
You may send the user to a section by replying with action "navigate" and one of these exact section ids:
${SECTION_IDS.join(", ")}

Rules for section choice:
- github -> projects on the career page
- education / experience / skills / resume -> career page only
- youtube / notion -> studio page only
- contact -> either page, it is in the shared footer
If the user asks for something that only exists on the other page, navigate there first rather than guessing.

ABOUT ${SITE.name.toUpperCase()}
- ${SITE.role}, based in ${SITE.contact.location}. Contact: ${SITE.contact.email}.
- Studied B.Tech Mechanical Engineering at NIT Nagpur (institute of national importance).
- Works at Dassault Systèmes on LLM applications, document intelligence and RAG at scale.
- Builds AI systems professionally and films as a parallel pursuit.
- The projects section is live from GitHub. The ongoing projects section is live from Notion and needs no deploy.

STYLE
Keep replies to one short paragraph, under 80 words. Be concrete and warm, no filler. Never invent facts about ${SITE.name} — if you do not know, say so and suggest the contact section.

You must reply with ONLY a JSON object, no prose and no code fence:
{"reply": "...", "action": "navigate" | null, "section": "<one section id>" | null}`;

const isChatMessage = (value: unknown): value is ChatMessage => {
  if (typeof value !== "object" || value === null) return false;

  const candidate = value as Record<string, unknown>;

  if (candidate.role !== "user" && candidate.role !== "assistant") return false;

  // The widget historically sent `text`; accept either shape.
  const content = candidate.content ?? candidate.text;

  return typeof content === "string" && content.trim().length > 0;
};

const parseMessages = (body: unknown): ChatMessage[] | null => {
  if (typeof body !== "object" || body === null) return null;

  const raw = (body as Record<string, unknown>).messages;

  if (!Array.isArray(raw)) return null;

  const messages = raw.filter(isChatMessage).slice(-MAX_MESSAGES).map((message) => ({
    role: message.role,
    content: message.content.slice(0, MAX_CONTENT_LENGTH),
  }));

  // The last message must be from the user, or there is nothing to answer.
  return messages.length > 0 && messages[messages.length - 1].role === "user" ? messages : null;
};

/**
 * Models wrap JSON in ```json fences roughly as often as not, and sometimes
 * prefix it with a sentence. Recover the object rather than giving up.
 */
const parseModelReply = (raw: string): { reply: string; action: string | null; section: string | null } => {
  const unfenced = raw
    .replace(/^\s*```(?:json)?/i, "")
    .replace(/```\s*$/, "")
    .trim();

  const start = unfenced.indexOf("{");
  const end = unfenced.lastIndexOf("}");

  if (start !== -1 && end > start) {
    try {
      const parsed = JSON.parse(unfenced.slice(start, end + 1)) as Record<string, unknown>;

      const reply = typeof parsed.reply === "string" ? parsed.reply.trim() : "";
      const action = parsed.action === "navigate" ? "navigate" : null;

      // Only accept a section id that is actually registered on the site.
      const section =
        typeof parsed.section === "string" && SECTION_IDS.includes(parsed.section as never)
          ? parsed.section
          : null;

      if (reply) return { reply, action, section: action ? section : null };
    } catch {
      // Fall through to treating it as plain text.
    }
  }

  return { reply: unfenced, action: null, section: null };
};

/**
 * Always 200 with a renderable body. The widget must never have to handle a
 * bare 500 — that was the original bug.
 */
export async function POST(req: Request) {
  let body: unknown;

  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { reply: "I couldn't read that message.", action: null, section: null, error: "invalid_json" },
      { status: 200 },
    );
  }

  const messages = parseMessages(body);

  if (!messages) {
    return NextResponse.json(
      { reply: "Send me a message and I'll pick it up from there.", action: null, section: null, error: "invalid_messages" },
      { status: 200 },
    );
  }

  if (!process.env.GROQ_API_KEY) {
    console.warn("[chat] GROQ_API_KEY is not set");

    return NextResponse.json(
      { reply: "I'm not configured right now — email is faster.", action: "navigate", section: "contact", error: "missing_groq_api_key" },
      { status: 200 },
    );
  }

  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

  let content: string | null = null;
  let usedModel: string | null = null;
  const failures: string[] = [];

  // Continue on ANY error, not just rate limits. A retired model returns 400 or
  // 404, and bailing on those was what killed the whole chain.
  for (const model of MODELS) {
    try {
      const completion = await groq.chat.completions.create({
        model,
        messages: [{ role: "system", content: systemPrompt }, ...messages],
        max_tokens: 400,
        temperature: 0.4,
      });

      const text = completion.choices[0]?.message?.content;

      if (text && text.trim()) {
        content = text;
        usedModel = model;
        break;
      }

      failures.push(`${model}: empty response`);
    } catch (error) {
      failures.push(`${model}: ${(error as Error).message}`);
    }
  }

  if (content === null) {
    console.error("[chat] every model failed:", failures);

    return NextResponse.json(
      {
        reply: "I'm having trouble reaching my model right now — try again, or email me directly.",
        action: "navigate",
        section: "contact",
        error: "all_models_failed",
      },
      { status: 200 },
    );
  }

  return NextResponse.json({
    ...parseModelReply(content),
    error: null,
    model: usedModel,
    pages: Object.values(PAGES).map((page) => page.href),
  });
}
