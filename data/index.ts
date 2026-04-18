export const DATA = {
  home: {
    hero: {
      name: "Sashwat Jain",
      title: "AI & SD Engineer",
      subtitle:
        "empowering, securing innovation, and weaving creativity into everything I do.",
    },
    skills: {
      sectionTitle: "Skills & Expertise",
      sectionDescription:
        " Specialized in building AI systems, automation workflows, and high-quality digital experiences that drive efficiency, engagement, and growth.",
      overview: [
      {
        name: "AI Engineering",
        level: 90,
        icon: "lucide:brain",
        color: "primary",
      },
      {
        name: "Backend & Systems",
        level: 85,
        icon: "lucide:server",
        color: "secondary",
      },
      {
        name: "Automation & Scripting",
        level: 90,
        icon: "lucide:cpu",
        color: "success",
      },
      {
        name: "Branding and Creatives",
        level: 80,
        icon: "lucide:video",
        color: "warning",
      },
    ],
    },
    
  },
  about: {
    profile: {
      name: "Sashwat Jain",
      title: " AI engineer",
      image:
        "https://raw.githubusercontent.com/sashwatjain/my_portfolio/main/profile_image.jpg",
      description: [
      "I'm an AI engineer and creative technologist focused on building intelligent systems that combine automation, design, and real-world impact. I enjoy solving complex problems and turning ideas into scalable, practical solutions.",
      
      "My work spans across backend systems, AI-driven applications, and automation pipelines. I work primarily with Python and modern web technologies, creating tools that are not just functional but efficient and future-ready.",
      
      "Beyond engineering, I'm deeply interested in filmmaking and storytelling — blending creativity with technology to build meaningful digital experiences and a strong personal brand.",
    ],
    },
    education: [
      {
        title: "National Institute of Technology, Nagpur",
        date: "2019 - 2023",
        icon: "mdi:school-outline",
        description:
          "Completed a Bachelor's degree in Mechanical Engineering",
      },
      {
        title: "DAVV, Institute of Engineering and Technology, Indore",
        date: "2018 - 2019",
        icon: "mdi:school",
        description:
          "Enrolled for the bachelor's degree in Computer Science and Engineering, this was my entrypoint into the world of software development and design.",
      },
      {
        title: "Viberant Academy",
        date: "2016 - 2018",
        icon: "mdi:palette",
        description:
          "Focused on foundational engineering skills Mathamatics, Physics, Chemistry",
      },
      
      
    ],
    experience: [
      {
        title: "Specialist Software Engineer",
        date: "Mar 2025 - Present",
        icon: "mdi:briefcase",
        description:
          "Working on advanced AI/ML systems focused on LLM applications and GenAI workflows. Designed AI guardrails for secure LLM usage, built document intelligence pipelines using Mistral and LLaMA, and developed scalable RAG systems. Integrated AI services with FastAPI microservices and scaled solutions to process 150K+ documents monthly.",
      },
      {
        title: "Associate Software Engineer",
        date: "Jul 2023 - Mar 2025",
        icon: "mdi:monitor-dashboard",
        description:
          "Built end-to-end OCR and image-to-text pipelines using Python, Tesseract, and FastAPI. Developed modular AI pipelines and production-grade REST APIs. Worked on LLM-based solutions like receipt data extraction and chatbot systems using LangChain and OpenAI.",
      },
      {
        title: "Physics Educator (JEE Foundation)",
        date: "2022",
        icon: "mdi:school",
        description:
          "Taught JEE foundation-level physics concepts, focusing on building strong conceptual understanding and problem-solving skills. Simplified complex topics for students and developed structured learning approaches to improve clarity and retention.",
      },
    ],

    technologies: {
      aiMl: {
        description:
          "I build intelligent systems using LLMs, RAG pipelines, and scalable AI architectures.",
        tools: [
          { name: "OpenAI", icon: "simple-icons:openai" },
          { name: "LLaMA", icon: "simple-icons:meta" },
          { name: "Mistral", icon: "simple-icons:mistral" },
          { name: "LangChain", icon: "simple-icons:chainlink" },
          { name: "FAISS", icon: "simple-icons:facebook" },
          { name: "Prompt Engineering", icon: "mdi:brain" },
        ],
      },

      backend: {
        description:
          "I design scalable backend systems and APIs for AI-driven applications.",
        tools: [
          { name: "Python", icon: "logos:python" },
          { name: "FastAPI", icon: "simple-icons:fastapi" },
          { name: "Node.js", icon: "logos:nodejs-icon" },
          { name: "REST APIs", icon: "mdi:api" },
          { name: "Microservices", icon: "mdi:cube-outline" },
        ],
      },

      cloud: {
        description:
          "I deploy and scale AI systems using cloud-native tools and MLOps practices.",
        tools: [
          { name: "Docker", icon: "logos:docker-icon" },
          { name: "CI/CD", icon: "mdi:infinity" },
          { name: "Model Deployment", icon: "mdi:cloud-upload" },
          { name: "Monitoring", icon: "mdi:monitor-dashboard" },
        ],
      },

      frontend: {
        description:
          "I build clean interfaces and dashboards for interacting with AI systems.",
        tools: [
          { name: "React", icon: "logos:react" },
          { name: "Next.js", icon: "skill-icons:nextjs-dark" },
          { name: "JavaScript", icon: "logos:javascript" },
          { name: "HTML5", icon: "logos:html-5" },
          { name: "CSS3", icon: "logos:css-3" },
        ],
      },

      filmmaking: {
        description:
          "I create cinematic videos for brands and personal storytelling, focusing on visuals, emotion, and storytelling.",
        tools: [
          { name: "Premiere Pro", icon: "logos:adobe-premiere" },
          { name: "After Effects", icon: "logos:adobe-after-effects" },
          { name: "DaVinci Resolve", icon: "simple-icons:blackmagicdesign" },
          { name: "Cinematography", icon: "mdi:camera" },
          { name: "Color Grading", icon: "mdi:palette" },
          { name: "Storytelling", icon: "mdi:movie-open" },
        ],
      },

      other: {
        description:
          "Additional tools and libraries I use across projects.",
        tools: [
          { name: "PyTorch", icon: "logos:pytorch" },
          { name: "scikit-learn", icon: "simple-icons:scikitlearn" },
          { name: "SQL", icon: "mdi:database" },
        ],
      },
    },
  },
  projects: {
    sectionTitle: "Featured Projects",
    sectionDescription:
      "A selection of my recent projects showcasing AI and development skills",
    work: [
      {
        id: 1,
        title: "Cat learns to walk",
        description:
          "An AI-powered quadruped that learns to run using Reinforcement Learning + PyBullet Physics Simulation. Built with Python, TensorFlow, and OpenAI Gym, this project demonstrates the capabilities of deep learning in robotics and control systems.",
        image: "https://raw.githubusercontent.com/sashwatjain/cat_learns2_run/main/preview.gif",
        gallery: [
          "https://img.heroui.chat/image/dashboard?w=600&h=400&u=1",
          "https://img.heroui.chat/image/dashboard?w=600&h=400&u=1-1",
          "https://img.heroui.chat/image/dashboard?w=600&h=400&u=1-2",
          "https://img.heroui.chat/image/dashboard?w=600&h=400&u=1-3",
        ],
        category: "AI/ML",
        details:
          "An AI-powered quadruped that learns to run using Reinforcement Learning + PyBullet Physics Simulation. Built with Python, TensorFlow, and OpenAI Gym, this project demonstrates the capabilities of deep learning in robotics and control systems.",
        github: "https://github.com/sashwatjain/cat_learns_2_run/",
        live: "https://github.com/sashwatjain/cat_learns_2_run/",
        tech: [
          { name: "Python", icon: "logos:python" },
          { name: "NumPy", icon: "logos:numpy" },
          { name: "PyTorch", icon: "logos:pytorch-icon" },
          { name: "Matplotlib", icon: "logos:matplotlib" },
        ],
      },
      {
        id: 2,
        title: "MCP server-client",
        description:
          "A modular, multi-agent history question-answering system inspired by the Model Context Protocol (MCP). This project demonstrates how MCP concepts (clients, servers, tools, agents, routing) can be implemented in a stable, production-ready way using HTTP transport, while remaining fully compatible with MCP’s design philosophy.",
        image: "https://raw.githubusercontent.com/sashwatjain/mcp_history_bot/main/preview.gif",
        gallery: [
          "https://img.heroui.chat/image/dashboard?w=600&h=400&u=2",
          "https://img.heroui.chat/image/dashboard?w=600&h=400&u=2-1",
          "https://img.heroui.chat/image/dashboard?w=600&h=400&u=2-2",
          "https://img.heroui.chat/image/dashboard?w=600&h=400&u=2-3",
        ],
        category: "AI/ML",
        details:
          "A modular, multi-agent history question-answering system inspired by the Model Context Protocol (MCP). This project demonstrates how MCP concepts (clients, servers, tools, agents, routing) can be implemented in a stable, production-ready way using HTTP transport, while remaining fully compatible with MCP’s design philosophy.",
        github: "https://github.com/sashwatjain/mcp_history_bot",
        live: "https://github.com/sashwatjain/mcp_history_bot",
        tech: [
          { name: "Python", icon: "logos:python" },
          { name: "FastAPI", icon: "logos:fastapi-icon" },
          { name: "PostgreSQL", icon: "logos:postgresql" },
          { name: "OpenAI API", icon: "simple-icons:openai" },
        ],
      },
      {
        id: 3,
        title: "Habit Arena",
        description:
          "Habit Arena is a gamified habit-tracking platform where users build streaks, earn coins, and climb leaderboards — all by completing real-life habits. It transforms self-improvement into an addictive, RPG-style challenge with a smooth backend API and an interactive frontend UI.",
        image: "https://raw.githubusercontent.com/sashwatjain/habit_arena/main/preview.gif",
        gallery: [
          "https://img.heroui.chat/image/dashboard?w=600&h=400&u=3",
          "https://img.heroui.chat/image/dashboard?w=600&h=400&u=3-1",
          "https://img.heroui.chat/image/dashboard?w=600&h=400&u=3-2",
          "https://img.heroui.chat/image/dashboard?w=600&h=400&u=3-3",
        ],
        category: "Full Stack",
        details:
          "Habit Arena is a gamified habit-tracking platform where users build streaks, earn coins, and climb leaderboards — all by completing real-life habits. It transforms self-improvement into an addictive, RPG-style challenge with a smooth backend API and an interactive frontend UI.",
        github: "https://github.com/sashwatjain/habit_arena",
        live: "https://github.com/sashwatjain/habit_arena",
       tech: [
          { name: "FastAPI", icon: "logos:fastapi-icon" },
          { name: "Python", icon: "logos:python" },
          { name: "SQLModel", icon: "simple-icons:sqlmodel" },
          { name: "SQLite", icon: "simple-icons:sqlite" },
          { name: "JavaScript", icon: "logos:javascript" },
          { name: "HTML5", icon: "logos:html-5" },
          { name: "CSS3", icon: "logos:css-3" },
        ],
      },
      
    ],
  },
  contact: {
    heading:
      "Have a project in mind? Get in touch and let's create something amazing.",
    location: {
      mapSrc:
        "https://www.google.com/maps?q=Pune,India&output=embed",
      address: "Pune, India",
    },
  },
  morphingTexts: {
    about: ["Creative", "Passionate", "Developer"] as const,
    projects: ["My Work", "Creations", "Experiments", "Innovations"] as const,
    contact: ["Let's", "Build", "Together"] as const,
  },
  navigation: [
    { name: "Home", href: "/", icon: "lucide:home" },
    { name: "About", href: "/about", icon: "lucide:user" },
    { name: "Projects", href: "/projects", icon: "lucide:folder-code" },
    { name: "Contact", href: "/contact", icon: "lucide:send" },
  ],
  footer: {
    name: "Sashwat Jain",
    description: "Always interested in new projects and collaborations.",
    contact: {
      email: "sashwatkjain@gmail.com",
      phone: "+91 8989440441",
      location: "Pune, India",
    },
    socialLinks: [

      { platform: "GitHub", url: "https://github.com/sashwatjain", icon: "mdi:github" },
      {
        platform: "Instagram",
        url: "https://instagram.com/sashwatjain",
        icon: "mdi:instagram",
      },
      {
        platform: "YouTube",
        url: "https://youtube.com/@sashwatjain",
        icon: "mdi:youtube",
      },
      {
        platform: "Medium",
        url: "https://medium.com/@sashwatkjain",
        icon: "mdi:medium",
      },
      {
        platform: "LinkedIn",
        url: "https://www.linkedin.com/in/sashwatjain",
        icon: "mdi:linkedin",
      },
      
    ],
    services: [
      "AI Automation Systems",
      "Content & Brand Systems",
      "Custom Digital Products",
      "Growth & Tech Strategy"
    ],
  },
} as const;
