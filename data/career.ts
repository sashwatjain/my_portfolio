/**
 * Content for the career page at `/`.
 */

export const CAREER = {
  hero: {
    eyebrow: "Portfolio",
    name: "Sashwat Jain",
    role: "AI & Software Development Engineer",
    tagline:
      "I build AI systems that move from prototype to production — LLM applications, RAG pipelines and backend services that hold up once they're real.",
    summary:
      "Currently building LLM applications and document intelligence systems at Dassault Systèmes. Previously shipped OCR pipelines and production REST APIs handling 150K+ documents a month.",
    primaryCta: { label: "View Projects", href: "#github" },
    secondaryCta: { label: "Download Resume", href: "/resume.pdf" },
    stats: [
      { label: "Years shipping", value: "3+" },
      { label: "Docs / month", value: "150K+" },
      { label: "Projects built", value: "20+" },
    ],
  },

  /**
   * `featured` renders large and is deliberately the only entry that does.
   * The institute is the headline; the degree is metadata.
   */
  education: {
    featured: {
      institution: "National Institute of Technology, Nagpur",
      shortName: "NIT Nagpur",
      period: "2019 — 2023",
      degree: "B.Tech · Mechanical Engineering",
      honour: "Institute of National Importance",
      emblem: "lucide:landmark",
      summary:
        "An institute of national importance, and the place where I stopped treating engineering as coursework and started treating it as a design problem.",
      highlights: [
        "Systems thinking and engineering fundamentals",
        "Where I first got serious about building software",
      ],
    },
    earlier: [
      {
        institution: "DAVV, Institute of Engineering & Technology",
        shortName: "DAVV Indore",
        period: "2018 — 2019",
        detail: "Entry point into software development and design.",
      },
      {
        institution: "Viberant Academy",
        shortName: "Viberant Academy",
        period: "2016 — 2018",
        detail: "Foundational engineering — mathematics, physics, chemistry.",
      },
    ],
  },

  experience: [
    {
      role: "Specialist Software Engineer",
      company: "Dassault Systèmes",
      period: "Mar 2025 — Present",
      icon: "lucide:cpu",
      summary:
        "Advanced AI/ML systems for LLM applications and GenAI workflows.",
      points: [
        "Designed AI guardrails for secure, auditable LLM usage",
        "Built document intelligence pipelines on Mistral and LLaMA",
        "Scaled RAG systems processing 150K+ documents monthly",
        "Integrated AI services with FastAPI microservices",
      ],
    },
    {
      role: "Associate Software Engineer",
      company: "Dassault Systèmes",
      period: "Jul 2023 — Mar 2025",
      icon: "lucide:server",
      summary: "End-to-end OCR and image-to-text pipelines in Python.",
      points: [
        "Built OCR pipelines using Python, Tesseract and FastAPI",
        "Developed production-grade REST APIs",
        "Shipped LLM solutions for receipt extraction and chatbots with LangChain",
      ],
    },
    {
      role: "Physics Educator",
      company: "JEE Foundation",
      period: "2022",
      icon: "lucide:graduation-cap",
      summary: "Concept-first physics instruction for JEE aspirants.",
      points: [
        "Built strong conceptual understanding before formulas",
        "Simplified difficult topics into structured learning paths",
      ],
    },
  ],

  technologies: [
    {
      id: "ai",
      title: "AI & Machine Learning",
      icon: "lucide:brain",
      description:
        "LLM applications, RAG pipelines and scalable AI architectures.",
      tools: [
        { name: "OpenAI", icon: "simple-icons:openai" },
        { name: "LLaMA", icon: "simple-icons:meta" },
        { name: "Mistral", icon: "simple-icons:mistral" },
        { name: "LangChain", icon: "simple-icons:langchain" },
        { name: "FAISS", icon: "simple-icons:faiss" },
        { name: "Prompt Engineering", icon: "lucide:sparkles" },
      ],
    },
    {
      id: "backend",
      title: "Backend & Systems",
      icon: "lucide:server",
      description: "APIs and services designed to carry real traffic.",
      tools: [
        { name: "Python", icon: "logos:python" },
        { name: "FastAPI", icon: "simple-icons:fastapi" },
        { name: "Node.js", icon: "logos:nodejs-icon" },
        { name: "REST APIs", icon: "lucide:plug" },
        { name: "Microservices", icon: "lucide:box" },
      ],
    },
    {
      id: "cloud",
      title: "Cloud & MLOps",
      icon: "lucide:cloud",
      description: "Deploying and observing AI systems in production.",
      tools: [
        { name: "Docker", icon: "logos:docker-icon" },
        { name: "CI/CD", icon: "lucide:infinity" },
        { name: "Model Deployment", icon: "lucide:rocket" },
        { name: "Monitoring", icon: "lucide:activity" },
      ],
    },
    {
      id: "frontend",
      title: "Frontend",
      icon: "lucide:layout",
      description: "Interfaces for making AI systems usable.",
      tools: [
        { name: "React", icon: "logos:react" },
        { name: "Next.js", icon: "simple-icons:nextdotjs" },
        { name: "TypeScript", icon: "logos:typescript-icon" },
        { name: "Tailwind CSS", icon: "logos:tailwindcss-icon" },
        { name: "HeroUI", icon: "simple-icons:heroicons" },
      ],
    },
    {
      id: "film",
      title: "Filmmaking",
      icon: "lucide:clapperboard",
      description:
        "Cinematic video for brands and personal storytelling — the other half of the work.",
      tools: [
        { name: "Premiere Pro", icon: "logos:adobe-premiere" },
        { name: "After Effects", icon: "logos:adobe-aftereffects" },
        { name: "DaVinci Resolve", icon: "simple-icons:davinciresolve" },
        { name: "Cinematography", icon: "lucide:camera" },
        { name: "Color Grading", icon: "lucide:palette" },
      ],
    },
  ],

  resume: {
    file: "/resume.pdf",
    filename: "Sashwat_Jain_Resume.pdf",
    summary:
      "A one-page summary of my work across AI systems, backend engineering and film. Everything here is also on this page in full.",
    highlights: [
      "3+ years building and shipping production AI systems",
      "LLM guardrails, RAG and document intelligence at 150K+ docs/month",
      "B.Tech from NIT Nagpur",
    ],
  },
} as const;