// ─────────────────────────────────────────────────────────────
//  PROFILE DATA — the single source of truth for the whole site.
//  Edit anything here: the page, the AI twin, the job-match
//  analyzer and semantic project search all read from this file.
// ─────────────────────────────────────────────────────────────
export const profile = {
  name: "Xola Twayise",
  title: "AI & Automation Engineer",
  roles: [
    "AI & Automation Engineer",
    "Copilot Studio Agent Builder",
    "C# / .NET Developer",
    "Enterprise Integration Specialist",
    "Game Developer (for fun)",
  ],
  location: "Gqeberha, South Africa",
  email: "twayisexola@gmail.com",
  github: "https://github.com/Xola-Twayise",
  linkedin: "https://www.linkedin.com/in/xola-twayise-342808139",
  cv: "", // e.g. "assets/Xola_Twayise_CV.pdf" — leave empty to hide the download button

  // Drop your photos into /assets with these names. Missing photos fall back to a holographic "XT" avatar.
  photos: {
    portrait: "assets/photo-headshot.jpg", // square headshot (hero)
    outdoors: "assets/photo-outdoors.jpg", // about section
    event: "assets/photo-event.jpg",       // "beyond the code" section
  },

  stats: [
    ["3+", "Years in production"],
    ["20+", "AI & automation solutions shipped"],
    ["10+", "Microsoft & Boomi certifications"],
    ["3", "Environments: DEV · UAT · PROD"],
  ],

  summary:
    "I'm an AI & Automation Engineer at JAS Worldwide. I build AI agents, intelligent document workflows and enterprise " +
    "integrations that global logistics teams use every day. My tools are Copilot Studio, Power Automate, Azure, C#/.NET and Dataverse.",

  about: [
    "I'm an AI & Automation Engineer with over three years of experience shipping production software in global logistics at JAS Worldwide. I started as a backend intern in March 2024, became a Junior Software Developer in January 2025, and moved into AI & Automation in March 2026.",
    "I turn business problems into AI solutions that people adopt. That means sitting with stakeholders, mapping the process, finding the inefficiencies, and building agents, document-intelligence pipelines and automated workflows that run reliably across DEV, UAT and PROD.",
    "My stack covers Microsoft Power Platform, Copilot Studio, Power Automate, Azure AI, Dataverse and SharePoint, backed by C#, .NET, ASP.NET MVC, TypeScript, SQL and REST APIs. I'm also a certified Boomi integration developer and architect.",
    "I hold a BSc in Computer Science from Nelson Mandela University (2018–2023). Outside work I build creative projects like Induku, a Street Fighter-style game about Xhosa stick fighting.",
  ],

  skills: [
    { group: "AI & Automation", items: [["LLM app integration / GenAI", 90], ["Agent workflows (Copilot Studio)", 90], ["Intelligent document processing", 88], ["Prompt engineering & RAG", 85]] },
    { group: "Development", items: [["C# / .NET / ASP.NET MVC", 88], ["SQL", 84], ["REST APIs & API design", 87], ["TypeScript / Blazor", 78]] },
    { group: "Platforms", items: [["Power Automate & Power Platform", 92], ["Dataverse & SharePoint", 88], ["Azure (AZ-204)", 82], ["Boomi", 85]] },
    { group: "Engineering & Governance", items: [["Git / GitLab / CI/CD", 82], ["SOLID, DI & unit testing", 84], ["Agile / Scrum", 85], ["Access control & auditability", 82]] },
  ],

  projects: [
    {
      name: "AI SOP Control Tower",
      tag: "AI · Compliance",
      year: "2026",
      description:
        "An AI-powered shipment compliance solution. It reads standard operating procedures, extracts the operational rules, validates shipment information against them and flags exceptions, so compliance teams can monitor shipments proactively instead of reacting to problems.",
      tech: ["Copilot Studio", "Azure AI", "Power Automate", "Dataverse", "LLM"],
      accent: "#00f0ff",
      enterprise: true,
    },
    {
      name: "Meeting Minutes Agent",
      tag: "AI Agent · Teams",
      year: "2026",
      description:
        "An agent that turns Microsoft Teams meetings into structured summaries, decisions, action items and follow-up documents. It saves hours of manual note-taking and leaves a clear audit trail.",
      tech: ["Copilot Studio", "Microsoft Teams", "Power Automate", "SharePoint", "GenAI"],
      accent: "#a78bfa",
      enterprise: true,
    },
    {
      name: "AI Document Automation",
      tag: "Document Intelligence",
      year: "2026",
      description:
        "Automated processing of Arrival Notices, Proofs of Delivery and Master Bills of Lading. AI extracts and validates the data, then pushes it to Dataverse, SharePoint and downstream systems such as CargoWise, cutting manual data entry from logistics operations.",
      tech: ["Azure AI", "Power Automate", "Dataverse", "SharePoint", "CargoWise"],
      accent: "#7cff6b",
      enterprise: true,
    },
    {
      name: "Direct Carrier Submission",
      tag: "Integration · Automation",
      year: "2026",
      description:
        "Automated workflows that connect internal processes directly to external carriers and enterprise systems through APIs and reusable integration patterns, with error handling and configuration per environment.",
      tech: ["REST APIs", "Power Automate", "Boomi", "Child flows", "C#"],
      accent: "#ffb84d",
      enterprise: true,
    },
    {
      name: "Smart Freight System",
      tag: "WMS · Full-stack",
      year: "2025",
      description:
        "An end-to-end shipment management solution integrated with warehouse management systems. It covers order processing, manifest generation, tracking, label processing, APIs and the database layer.",
      tech: ["C#", ".NET", "ASP.NET MVC", "SQL Server", "NuGet"],
      accent: "#38bdf8",
      enterprise: true,
    },
    {
      name: "Arrival Monitor",
      tag: "Dashboard · Logistics",
      year: "2026",
      description:
        "A live dashboard of inbound shipment arrivals. A React and TypeScript front end talks to an ASP.NET Core minimal API that proxies Microsoft Dataverse, so operations teams can see what's landing, what's late and what needs action.",
      tech: ["React", "TypeScript", "ASP.NET Core", "Dataverse", "GitLab CI"],
      accent: "#f472b6",
      enterprise: true,
    },
    {
      name: "Induku",
      tag: "Game · Mobile · Web",
      year: "2026",
      description:
        "A Street Fighter-style game built around Xhosa stick fighting (ukulwa ngeentonga). It has four fighters with isiXhosa names, Eastern Cape arenas including Hole in the Wall, a CPU opponent with three difficulty levels, local 2-player mode and touch controls. There's no game engine: every sprite and sound is generated in code. It ships to Android, iOS and the web.",
      tech: ["JavaScript", "Canvas 2D", "Web Audio", "Capacitor", "PWA"],
      live: "https://xola-twayise.github.io/Induku/",
      repo: "https://github.com/Xola-Twayise/Induku",
      accent: "#ff3df2",
    },
    {
      name: "This AI Portfolio",
      tag: "AI · Web",
      year: "2026",
      description:
        "The site you're on. An AI twin answers questions about me using a sentence-embedding model (RAG) that runs in your browser, with an optional LLM that also runs locally on WebGPU. It includes a job-match analyzer, semantic project search and voice control. There's no server and no API key, and it costs nothing to host on GitHub Pages.",
      tech: ["Transformers.js", "WebLLM", "WebGPU", "RAG", "Web Speech API"],
      repo: "https://github.com/Xola-Twayise/PortFolio",
      accent: "#00f0ff",
    },
  ],

  experience: [
    {
      role: "AI & Automation Specialist",
      org: "JAS Worldwide",
      period: "Mar 2026 – Present",
      points: [
        "Design, build, deploy and maintain end-to-end AI and automation solutions with Power Automate, Copilot Studio, Dataverse, SharePoint, Teams, Azure AI and enterprise APIs.",
        "Delivered shipment compliance monitoring, meeting minutes automation, Arrival Notice, Proof of Delivery and Master Bill of Lading processing, and direct carrier submission workflows.",
        "Build reusable workflow components, child flows, environment-based configuration and error handling for scalable delivery across DEV, UAT and PROD.",
        "Own testing, monitoring, access control, auditability, documentation, demos and adoption support.",
      ],
    },
    {
      role: "Junior Software Developer",
      org: "JAS Worldwide",
      period: "Jan 2025 – Mar 2026",
      points: [
        "Built enterprise logistics software with C#, .NET, ASP.NET MVC, TypeScript, SQL and REST APIs, following clean architecture practices.",
        "Integrated third-party Warehouse Management Systems, logistics providers and internal platforms for shipment creation, tracking, manifests and labels.",
        "Built reusable NuGet packages and applied SOLID, dependency injection and unit testing.",
      ],
    },
    {
      role: "Software Developer Intern, Backend",
      org: "JAS Worldwide",
      period: "Mar 2024 – Jan 2025",
      points: [
        "Developed and supported backend services with ASP.NET MVC, WinForms, C#, SQL and API integrations.",
        "Introduced dependency injection and unit-testing practices during maintenance and enhancement work.",
      ],
    },
    {
      role: "BSc Computer Science",
      org: "Nelson Mandela University",
      period: "2018 – 2023",
      points: ["Studied the foundations of computer science, software engineering, algorithms and data systems."],
    },
  ],

  certifications: [
    ["Microsoft Azure Developer Associate (AZ-204)", "Microsoft", "2025"],
    ["Generative AI for Developers", "Pluralsight", "2026"],
    ["Microsoft 365: Power Automate Foundations", "Pluralsight", "2026"],
    ["Professional Integration Developer", "Boomi", "2025"],
    ["Professional API Design", "Boomi", "2025"],
    ["Professional API Management", "Boomi", "2025"],
    ["Associate Integration Architect", "Boomi", "2025"],
    ["Associate Integration Developer", "Boomi", "2025"],
    ["Associate Administrator", "Boomi", "2025"],
    ["Associate Event Streams", "Boomi", "2025"],
    ["Associate EDI for X12", "Boomi", "2025"],
  ],

  strengths: [
    "Business process analysis", "Stakeholder engagement", "Solution design", "Cross-functional collaboration",
    "Technical reviews", "User demos & training", "Production support", "Process optimisation", "Knowledge sharing",
  ],

  // Extra facts the AI twin can draw on. Add anything people might ask about.
  faq: [
    { q: "Can I work or collaborate with you?", a: "I'm always happy to connect about AI, automation and integration ideas. The quickest way to reach me is twayisexola@gmail.com or LinkedIn." },
    { q: "How can I contact you?", a: "Email me at twayisexola@gmail.com, connect on LinkedIn, or find me on GitHub as Xola-Twayise. You can also say 'contact' and I'll scroll you to the contact form." },
    { q: "Where are you based?", a: "I'm based in Gqeberha (Port Elizabeth), South Africa, and happy to work with teams anywhere." },
    { q: "What is your current job?", a: "I'm an AI & Automation Specialist at JAS Worldwide, a global logistics company, and have been since March 2026. I build AI agents, document intelligence and automation workflows with Copilot Studio, Power Automate, Azure AI and Dataverse." },
    { q: "How many years of experience do you have?", a: "Over three years of production experience at JAS Worldwide: intern from March 2024, Junior Software Developer from January 2025, and AI & Automation Specialist since March 2026. In that time I've shipped more than 20 AI and automation solutions." },
    { q: "What did you study? Education degree university", a: "I have a BSc in Computer Science from Nelson Mandela University (2018–2023)." },
    { q: "What certifications do you have?", a: "Microsoft Azure Developer Associate (AZ-204), Generative AI for Developers and Power Automate Foundations (Pluralsight), and eight Boomi certifications, including Professional Integration Developer, Professional API Design, Professional API Management and Associate Integration Architect." },
    { q: "What is your strongest skill?", a: "Turning messy business processes into reliable AI-powered automation. I combine Copilot Studio agents and Power Automate with solid C#/.NET and API engineering, so the solutions hold up in production." },
    { q: "Do you have experience with LLMs, generative AI, agents and RAG?", a: "Yes. I build LLM-based applications and agent workflows professionally, including the AI SOP Control Tower and the Meeting Minutes Agent. I work with prompt orchestration, intelligent document processing, RAG and AI evaluation. This portfolio's AI twin is itself a small RAG system running in your browser." },
    { q: "What do you do for fun?", a: "I build games and creative experiments. Induku, my Xhosa stick-fighting game, is the one I'm proudest of, and you can play it in your browser." },
    { q: "How does this AI work?", a: "Everything runs in your browser. A small sentence-embedding model (all-MiniLM-L6-v2 through Transformers.js) turns your question into a vector and retrieves the closest facts about me. If your browser supports WebGPU, you can turn on Neural Boost, which loads a small LLM (Qwen 2.5) locally to write a fuller answer from those facts. There's no server and no API key, and your questions never leave your device." },
    { q: "Why should we hire you?", a: "I understand both the business and the technology. I've shipped AI and automation solutions that a global logistics operation relies on, I hold Azure and Boomi certifications, and I own the full lifecycle: requirements, build, testing, deployment, monitoring and adoption." },
    { q: "What languages do you speak?", a: "English and isiXhosa. My game Induku celebrates Xhosa culture, and its fighters all have isiXhosa names." },
  ],
};
