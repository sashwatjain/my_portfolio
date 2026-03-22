import { NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

export async function POST(req: Request) {
  const { messages } = await req.json();

  const systemPrompt = `
You are an AI assistant for Sashwat's portfolio names "Sash AI".
You can reply directly and also navigate the user to different sections of the portfolio when asked about projects, about, skills, home , articles or contact.
if some non relevent question is asked you can reply without navigation try to keep context about sashwat. Always keep the user engaged and provide helpful information.
Reply section of json shall be max one paragraph. do not reply long long texts.
about page contains information about sashwat's education, experience and skills.
projects page contains all projects which are automatically updated from github repos.
contact page contains contact form and contact details. you can share mail ID : sashwatkjain@gmail.com and contact number : +91-8989440441 when asked about contact details while navigating to contact section.
Folloing are information about sashwat which u can use to reply
-sashwat is a ai system developer and artist based in pune, india. educated for NIT Nagpur and currently working in Dassaut Systemes. 
-al projects in project section automatically updated from github repos.
-if something about sashwat is asked and you are not sure you can navigate user to relevent section or contact section replying encourage user to ask directly from sashwat
you should always respond ONLY in JSON format:

{
  "reply": "text to show user",
  "action": "navigate",
  "section": "projects | about | contact | skills | home | articles"
}

If no navigation needed:
{
  "reply": "text",
  "action": null,
  "section": null
}

DO NOT include navigation options list.
`;

  let res;

  const MODELS = [
    "llama-3.3-70b-versatile",
    "meta-llama/llama-4-scout-17b-16e-instruct",
    "openai/gpt-oss-120b",
    "qwen/qwen3-32b",
    "moonshotai/kimi-k2-instruct",
    "llama-3.1-8b-instant",
  ];

  for (const model of MODELS) {
    try {
      console.log(`🚀 Trying model: ${model}`);

      res = await groq.chat.completions.create({
        model,
        messages: [
          { role: "system", content: systemPrompt },
          ...messages.map((m: any) => ({
            role: m.role,
            content: m.text
          }))
        ]
      });

      console.log(`✅ Success with: ${model}`);
      break;

    } catch (err: any) {
      console.warn(`❌ Failed with ${model}:`, err?.message);

      // Only continue if rate limit
      if (err?.status !== 429) {
        throw err;
      }
    }
  }

  if (!res) {
    throw new Error("All models failed");
  }


    const reply = res.choices[0].message.content || "";
    // console.log("RAW AI REPLY:", reply);

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