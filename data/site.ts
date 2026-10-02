/**
 * Shared site-wide content: identity, contact details, and the two registries
 * that drive navigation, theming and the chat widget.
 */

export const PAGES = {
  career: {
    href: "/",
    theme: "career",
    label: "Career",
    description: "Engineering",
    icon: "lucide:briefcase",
    /**
     * Colour the Career/Studio transition wipes to. Kept here rather than in the
     * transition component so the palette stays in one place.
     */
    wipe: "#070708",
    accent: "#FF2438",
  },
  studio: {
    href: "/studio",
    theme: "studio",
    label: "Studio",
    description: "Stories & Ideas",
    icon: "lucide:compass",
    wipe: "#FFF9EE",
    accent: "#FF9F1C",
  },
} as const;

export type PageKey = keyof typeof PAGES;

export const PAGE_KEYS = Object.keys(PAGES) as PageKey[];

/** Which page a pathname belongs to. Unknown paths fall back to the career page. */
export const resolveTheme = (pathname: string): PageKey =>
  PAGE_KEYS.find((key) => PAGES[key].href === pathname) ?? "career";

/**
 * Every anchor on the site. Registering a section here is what makes it
 * reachable by the chat widget — see AGENTS.md section 4.
 */
export const SECTIONS = [
  { id: "hero", page: "career", label: "Home", icon: "lucide:home" },
  { id: "github", page: "career", label: "Projects", icon: "lucide:github" },
  {
    id: "education",
    page: "career",
    label: "Education",
    icon: "lucide:graduation-cap",
  },
  {
    id: "experience",
    page: "career",
    label: "Experience",
    icon: "lucide:briefcase",
  },
  { id: "skills", page: "career", label: "Skills", icon: "lucide:sparkles" },
  { id: "resume", page: "career", label: "Resume", icon: "lucide:file-text" },
  { id: "youtube", page: "studio", label: "Videos", icon: "mdi:youtube" },
  { id: "notion", page: "studio", label: "Projects", icon: "lucide:rocket" },
  { id: "contact", page: "both", label: "Contact", icon: "lucide:send" },
] as const;

export type SectionId = (typeof SECTIONS)[number]["id"];
export type SectionPage = (typeof SECTIONS)[number]["page"];

/** Sections belonging to a page (or to both, when passed "both"). */
export const sectionsForPage = (page: PageKey) =>
  SECTIONS.filter((section) => section.page === page || section.page === "both");

/** Every id a chat navigation target may use. */
export const SECTION_IDS = SECTIONS.map((section) => section.id) as SectionId[];

export const SITE = {
  name: "Sashwat Jain",
  role: "AI & Software Development Engineer",
  tagline: "Building intelligent systems and sharing the stories I find along the way.",

  profile: {
    careerImage: "/profile_image.jpg",
    studioImage: "/studio-profile.jpg",
  },

  contact: {
    email: "sashwatkjain@gmail.com",
    phone: "+91 8989440441",
    location: "Pune, India",
    heading: "Let's build something worth making.",
    description:
      "Available for AI systems, backend engineering, and creative collaborations. Send a message and I'll get back to you.",
  },

  socialLinks: [
    { platform: "GitHub", url: "https://github.com/sashwatjain", icon: "mdi:github" },
    { platform: "LinkedIn", url: "https://www.linkedin.com/in/sashwatjain", icon: "mdi:linkedin" },
    { platform: "YouTube", url: "https://youtube.com/@sashwatjain", icon: "mdi:youtube" },
    { platform: "Instagram", url: "https://instagram.com/sashwatjain", icon: "mdi:instagram" },
    { platform: "Email", url: "mailto:sashwatkjain@gmail.com", icon: "lucide:mail" },
  ],

  services: [
    "AI Automation Systems",
    "Content & Brand Systems",
    "Custom Digital Products",
    "Growth & Tech Strategy",
  ],
} as const;