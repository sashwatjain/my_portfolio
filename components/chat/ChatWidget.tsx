'use client';

import { useState } from "react";
import { useRef, useEffect } from "react";
import { useRouter } from "next/navigation";

export const ChatWidget = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const router = useRouter();
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

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
        body: JSON.stringify({
          messages: [...messages, userMsg]
        })
      });

      const data = await res.json();
      console.log("AI RESPONSE:", data);

      // add AI response
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: data.reply }
      ]);

      // 🔥 handle navigation tool
      if (data.action === "navigate") {
        const sectionMap: any = {
          projects: "projects-section",
          about: "about-section",
          skills: "skills-section",
          contact: "contact-section"
        };

    if (data.action === "navigate") {
        const routeMap: any = {
            projects: "/projects",
            about: "/about",
            contact: "/contact",
            skills: "/" // 👈 important
        };

        const route = routeMap[data.section];

        if (!route) return;

        // 🔥 If skills → go home THEN scroll
        if (data.section === "skills") {
            router.push("/?scroll=skills");
        } else {
            router.push(route);
        }
        }
      }

    } catch (err) {
      console.error(err);
    }

    setLoading(false);
  };

  return (
    <>
      {/* Floating Button */}
      {!open && (
        <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-[9999] px-5 py-3 rounded-full 
                    bg-gradient-to-r from-purple-600 to-blue-500 
                    text-white shadow-lg shadow-purple-500/30 
                    backdrop-blur-md border border-white/10
                    hover:scale-105 transition-all duration-300"
        >
        ✨ Ask AI
        </button>
      )}

      {/* Chat Box */}
      {open && (
        <div
        className="fixed bottom-6 right-6 w-80 h-[500px] 
                    bg-black/40 backdrop-blur-xl 
                    border border-white/10 
                    rounded-2xl 
                    shadow-[0_0_30px_rgba(168,85,247,0.3)]
                    flex flex-col z-[9999] overflow-hidden"
        >

          {/* Header */}
          <div className="p-3 border-b border-white/10 flex justify-between items-center 
                bg-gradient-to-r from-purple-500/20 to-blue-500/20">
            <span className="font-semibold text-white">AI Assistant</span>
            <button 
                onClick={() => setOpen(false)} 
                className="text-white/70 hover:text-white"
            >
                ✕
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`p-2 px-3 rounded-xl text-sm max-w-[80%] ${
                    msg.role === "user"
                    ? "ml-auto bg-gradient-to-r from-purple-600 to-blue-500 text-white"
                    : "mr-auto bg-white/10 text-white backdrop-blur-md border border-white/10"
                }`}
                >
                {msg.text}
              </div>
            ))}
            {loading && (
            <p className="text-white/60 text-sm animate-pulse">
                AI is thinking...
            </p>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="p-3 border-t border-white/10 flex gap-2">
            <input
                className="flex-1 bg-white/10 border border-white/10 rounded-lg px-3 py-2 
                        text-white placeholder-white/50 focus:outline-none"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask me anything..."
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            />
            <button 
                onClick={sendMessage}
                className="px-4 py-2 rounded-lg 
                        bg-gradient-to-r from-purple-600 to-blue-500 
                        text-white hover:opacity-90"
            >
                Send
            </button>
            </div>
        </div>
      )}
    </>
  );
};