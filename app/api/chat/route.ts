import { NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

export async function POST(req: Request) {
  const { messages } = await req.json();

  const systemPrompt = `
You are an AI assistant for Sashwat's portfolio.

When user asks for navigation, respond ONLY in JSON format:

{
  "reply": "text to show user",
  "action": "navigate",
  "section": "projects | about | contact | skills"
}

If no navigation needed:
{
  "reply": "text",
  "action": null,
  "section": null
}

DO NOT include navigation options list.
`;

  const res = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      { role: "system", content: systemPrompt },
      ...messages.map((m: any) => ({
        role: m.role,
        content: m.text
      }))
    ]
  });


    const reply = res.choices[0].message.content || "";
    console.log("RAW AI REPLY:", reply);

  //   let action = null;
  //   let section = null;

  //   if (/project/i.test(reply)) {
  //   action = "navigate";
  //   section = "projects";
  //   }

  //   if (/about/i.test(reply)) {
  //   action = "navigate";
  //   section = "about";
  //   }

  //   if (/skill/i.test(reply)) {
  //   action = "navigate";
  //   section = "skills";
  //   }

  //   if (/contact/i.test(reply)) {
  //   action = "navigate";
  //   section = "contact";
  //   }


  // return NextResponse.json({
  //   reply,
  //   action,
  //   section
  // });

  let parsed;

  try {
    parsed = JSON.parse(reply);
  } catch {
    parsed = {
      reply,
      action: null,
      section: null
    };
  }

  return NextResponse.json(parsed);
}