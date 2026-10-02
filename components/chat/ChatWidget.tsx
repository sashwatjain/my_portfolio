"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@iconify/react";
import { AnimatePresence, motion } from "framer-motion";
import ReactMarkdown from "react-markdown";

import { PAGES, SECTIONS, SITE } from "@/data/site";
import { cn } from "@/lib/utils";

type Message = { role: "user" | "assistant"; content: string };

type ChatResponse = {
  reply?: string;
  action?: string | null;
  section?: string | null;
  error?: string | null;
};

const STARTERS = [
  "What does Sash actually build?",
  "Show me the projects",
  "Tell me about the films",
];

/**
 * Reads SECTIONS to work out where a navigation target lives, so the widget can
 * never point at a section on the wrong page. See AGENTS.md section 6.
 */
const routeForSection = (sectionId: string): string | null => {
  const section = SECTIONS.find((candidate) => candidate.id === sectionId);

  if (!section) return null;

  if (section.page === "both") return PAGES.career.href;

  return PAGES[section.page].href;
};

export const ChatWidget = () => {
  const router = useRouter();

  const [open, setOpen] = React.useState(false);
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [input, setInput] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const bottomRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  React.useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    window.addEventListener("keydown", onKeyDown);

    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  const navigateTo = React.useCallback(
    (sectionId: string | null) => {
      if (!sectionId) return;

      const route = routeForSection(sectionId);

      if (!route) return;

      setOpen(false);

      if (route !== window.location.pathname) {
        router.push(route);
        // Let the new page mount before scrolling to the anchor.
        window.setTimeout(() => document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth" }), 120);

        return;
      }

      document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth" });
    },
    [router],
  );

  const send = React.useCallback(async () => {
    const trimmed = input.trim();

    if (!trimmed || loading) return;

    const history: Message[] = [...messages, { role: "user", content: trimmed }];

    setMessages(history);
    setInput("");
    setError(null);
    setLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history }),
      });

      // The route is contracted to always return 200 with a renderable body,
      // but never assume it — a reverse proxy or a future regression can still
      // produce something else, and the old widget failed silently here.
      if (!response.ok) {
        setError(`Chat is unavailable (${response.status}).`);

        return;
      }

      const data = (await response.json()) as ChatResponse;

      setMessages((previous) => [
        ...previous,
        { role: "assistant", content: data.reply?.trim() || "…" },
      ]);

      if (data.action === "navigate") navigateTo(data.section ?? null);
    } catch (caught) {
      console.error("[chat] request failed:", caught);
      setError("I couldn't reach the chat service. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }, [input, loading, messages, navigateTo]);

  const reset = () => {
    setMessages([]);
    setError(null);
  };

  return (
    <>
      <AnimatePresence>
        {!open ? (
          <motion.button
            animate={{ opacity: 1, scale: 1 }}
            className="fixed bottom-6 right-6 z-[60] inline-flex h-12 items-center gap-2 rounded-full border border-divider bg-content1/90 px-5 text-sm font-medium text-ink-strong shadow-lg shadow-background/40 backdrop-blur-xl transition-colors hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            exit={{ opacity: 0, scale: 0.9 }}
            initial={{ opacity: 0, scale: 0.9 }}
            type="button"
            whileHover={{ scale: 1.03 }}
            onClick={() => setOpen(true)}
          >
            <Icon aria-hidden className="size-4 text-primary" icon="lucide:sparkles" />
            Ask Sash AI
          </motion.button>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {open ? (
          <motion.div
            animate={{ opacity: 1, y: 0, scale: 1 }}
            aria-label="Ask Sash AI"
            className="fixed right-4 bottom-4 z-[60] flex h-[min(32rem,calc(100vh-2rem))] w-[min(22rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-large border border-divider bg-background/95 shadow-2xl shadow-background/60 backdrop-blur-xl"
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            role="dialog"
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          >
            <header className="flex items-center justify-between border-b border-divider px-4 py-3">
              <div className="flex items-center gap-2">
                <Icon aria-hidden className="size-4 text-primary" icon="lucide:sparkles" />
                <span className="text-sm font-semibold text-ink-strong">Sash AI</span>
              </div>

              <div className="flex items-center gap-1">
                {messages.length > 0 ? (
                  <button
                    aria-label="Clear conversation"
                    className="flex size-7 items-center justify-center rounded-small text-ink-muted transition-colors hover:text-ink-strong"
                    type="button"
                    onClick={reset}
                  >
                    <Icon aria-hidden className="size-3.5" icon="lucide:rotate-ccw" />
                  </button>
                ) : null}

                <button
                  aria-label="Close chat"
                  className="flex size-7 items-center justify-center rounded-small text-ink-muted transition-colors hover:text-ink-strong"
                  type="button"
                  onClick={() => setOpen(false)}
                >
                  <Icon aria-hidden className="size-3.5" icon="lucide:x" />
                </button>
              </div>
            </header>

            <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
              {messages.length === 0 ? (
                <div className="space-y-3">
                  <p className="text-sm leading-relaxed text-ink-body">
                    Ask about {SITE.name}&apos;s work, projects, or the films. I can take you
                    straight to any section.
                  </p>

                  <ul className="space-y-2">
                    {STARTERS.map((starter) => (
                      <li key={starter}>
                        <button
                          className="w-full rounded-medium border border-divider px-3 py-2 text-left text-sm text-ink-body transition-colors hover:border-primary hover:text-primary"
                          type="button"
                          onClick={() => setInput(starter)}
                        >
                          {starter}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              {messages.map((message, index) => (
                <div
                  key={index}
                  className={cn(
                    "max-w-[85%] rounded-large px-3.5 py-2.5 text-sm leading-relaxed",
                    message.role === "user"
                      ? "ml-auto bg-primary text-primary-foreground"
                      : "bg-content2 text-ink-body",
                  )}
                >
                  <ReactMarkdown
                    components={{
                      p: ({ children }) => <p className="mb-1 last:mb-0">{children}</p>,
                      a: ({ children, href }) => (
                        <a
                          className="underline underline-offset-2"
                          href={href}
                          rel="noopener noreferrer"
                          target="_blank"
                        >
                          {children}
                        </a>
                      ),
                      ul: ({ children }) => <ul className="my-1 list-disc pl-4">{children}</ul>,
                    }}
                  >
                    {message.content}
                  </ReactMarkdown>
                </div>
              ))}

              {loading ? (
                <p className="flex items-center gap-2 text-sm text-ink-muted">
                  <span className="flex gap-1">
                    {[0, 1, 2].map((dot) => (
                      <span
                        key={dot}
                        className="size-1.5 animate-pulse rounded-full bg-foreground-500"
                        style={{ animationDelay: `${dot * 160}ms` }}
                      />
                    ))}
                  </span>
                  Thinking
                </p>
              ) : null}

              {error ? (
                <p className="rounded-medium bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p>
              ) : null}

              <div ref={bottomRef} />
            </div>

            <form
              className="flex items-center gap-2 border-t border-divider p-3"
              onSubmit={(event) => {
                event.preventDefault();
                void send();
              }}
            >
              <input
                aria-label="Message"
                className="min-w-0 flex-1 rounded-medium border border-divider bg-content1 px-3 py-2 text-sm text-ink-strong placeholder:text-ink-muted focus:border-primary focus:outline-none"
                placeholder="Ask about projects, work, films…"
                value={input}
                onChange={(event) => setInput(event.target.value)}
              />

              <button
                aria-label="Send message"
                className="flex size-9 shrink-0 items-center justify-center rounded-medium bg-primary text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-40"
                disabled={loading || !input.trim()}
                type="submit"
              >
                <Icon aria-hidden className="size-4" icon="lucide:send" />
              </button>
            </form>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
};
