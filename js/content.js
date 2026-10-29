/*
 * Site content: projects, FAQ, the about page docs and the intake.
 * Edit words here; the pages read from this file.
 */

export const site = {
  email: "hello@latentship.com",
  // Set to a Cal.com or Calendly link to let people pick a time right after the intake.
  bookingUrl: "",
  lead: {
    endpoint: "https://api.latentship.com",
    source: "latentship-site",
    turnstileSiteKey: "0x4AAAAAADO9Pzc1GtX8YPo3",
    turnstileAction: "lead_intake_submit",
  },
};

export const categories = [
  { id: "fintech", label: "Fintech" },
  { id: "learning", label: "Learning & growth" },
  { id: "operations", label: "Operations" },
  { id: "infra", label: "AI infrastructure" },
];

/*
 * Each project:
 *   media: { vignette } draws a live sketch of the product, or
 *          { shots: [...] } shows screenshots from assets/img/work/<slug>/<n>-*.
 *   highlight: the AI (or automation) moment worth calling out.
 */
export const projects = [
  {
    slug: "growth-companion",
    chip: "AI companion + simulations",
    name: "Growth Companion",
    client: "A personal-growth startup",
    category: "learning",
    kind: "AI product",
    tagline: "An AI growth companion that remembers you.",
    summary:
      "A mobile-first personal development platform. Behavioral assessments, a personal archetype and growth profile, an AI companion with memory, and role-play simulations for hard conversations.",
    problem:
      "The founder had a validated idea and a working concept. They needed it turned into a real subscription product, without cutting corners on privacy, accessibility or AI quality.",
    built: [
      "Assessments and scoring that produce a personal archetype and growth profile",
      "A streaming AI companion that carries context from one day to the next",
      "Role-play simulations for hard conversations, with scored debriefs",
      "Habits, progress, a free trial and subscriptions",
      "A founder admin panel to change content, scoring and prompts without a deploy",
    ],
    highlight: {
      label: "AI inside",
      text: "Simulations run on several AI agents working together, and every debrief is scored against the client's own rubric. Cost and quality are tracked per conversation from day one.",
    },
    outcome:
      "It started the way we start everything: a one-week prototype, sign-up to assessment to results, working end to end. Then the full build, milestone by milestone.",
    duration: "1-week prototype, then phased build",
    media: { vignette: "thrive", tint: "#0b0b14", dark: true },
  },
  {
    slug: "bullion-trading-desk",
    chip: "AI hedging alerts",
    name: "Bullion Trading Desk",
    client: "A bullion fintech",
    family: "bullion",
    category: "fintech",
    kind: "Trading platform",
    tagline: "Your rates. Your brand. Your desk.",
    summary:
      "A white-label trading platform for bullion dealers. Their own branded website and app stream live rates, take customer orders and keep the book, all hosted and run for them.",
    problem:
      "Bullion desks ran on phone calls, spreadsheets and legacy tools. Rates changed by the second, and every order had to be priced, limit-checked, confirmed and invoiced by hand.",
    built: [
      "Live rate streaming to a branded website and app",
      "A price formula engine: premiums and markups on the exchange or spot price, per customer group",
      "Market, limit and stop orders, confirmed on the dealing desk",
      "Customer limits checked on every order",
      "Invoicing, ledgers and a real-time risk and MTM monitor",
    ],
    highlight: {
      label: "AI inside",
      text: "Intelligent hedging watches the open position as orders land and alerts the dealer when exposure crosses their thresholds. Nothing is placed without their confirmation.",
    },
    outcome: "Dealers go live in three steps (brand, rates, customers) on a platform that's built, hosted and kept running for them.",
    media: { vignette: "desk", tint: "#0d1526", dark: true },
  },
  {
    slug: "accounting-sync",
    chip: "AI bookkeeping",
    name: "Accounting Sync",
    client: "A bullion fintech",
    family: "bullion",
    category: "fintech",
    kind: "Accounting integration",
    tagline: "Your desktop books, in the cloud.",
    summary:
      "Connects the desktop accounting books a business already keeps to the cloud and keeps them in sync, so the accounts team never keys an entry in twice.",
    problem:
      "Accounts lived on one office PC. Getting a balance meant a phone call, and every invoice and bill was typed in by hand.",
    built: [
      "A connector for the desktop accounting files a business already has, with no migration",
      "Transactions and ledgers synced to the cloud continuously, in the background",
      "Balances, ledgers and outstanding amounts from any browser",
    ],
    highlight: {
      label: "AI inside",
      text: "Intelligent bookkeeping reads invoices and bills, drafts the matching entry against the right accounts, and holds anything that doesn't add up for the accountant to review.",
    },
    outcome: "Connected in an afternoon. The accountant keeps working in the desktop software they know; the double entry goes away.",
    media: { vignette: "sync", tint: "#0d1526", dark: true },
  },
  {
    slug: "live-rates-app",
    chip: "AI market notes",
    name: "Live Rates App",
    client: "A bullion fintech",
    family: "bullion",
    category: "fintech",
    kind: "Mobile app",
    tagline: "Know the best rate first.",
    summary:
      "An AI-based and self-healing price aggregating engine for jewelers and bullion buyers. It compares live gold and silver rates across dealers, with short AI notes on what's moving the market.",
    problem:
      "Buyers called around dealers or flipped between group chats to find a rate, and by the time they had compared, the market had moved.",
    built: [
      "Live gold and silver rates from dealers nearby, updating as they change",
      "The best quote for the product you're watching, always on top",
      "Native apps for iOS and Android",
    ],
    highlight: {
      label: "AI inside",
      text: "Market-mover updates: short, timely notes on what's moving gold and silver, so buyers know why before they buy.",
    },
    outcome: "On the App Store and Google Play, and the front door to the suite.",
    media: { vignette: "rates", tint: "#0d1526", dark: true },
  },
  {
    slug: "leadership-academy",
    chip: "Streaming AI coach",
    name: "Leadership Academy",
    client: "A leadership-coaching firm",
    category: "learning",
    kind: "AI learning platform",
    tagline: "Leadership learning, with an AI coach on call.",
    summary:
      "A multi-company learning and coaching platform: structured leadership modules and assessments, plus an always-on AI coach for real situations at work.",
    problem:
      "Coaching didn't scale past the sessions. Learners needed support in the moment, and admins needed to run modules for many companies without engineering help.",
    built: [
      "Role-based workspaces for learners, coaches and admins",
      "Modules, tracks and assessments, configured per company",
      "A streaming AI coach with transcription and image-aware context",
      "Prompt settings and live coach diagnostics for admins",
    ],
    highlight: {
      label: "AI inside",
      text: "The coach runs on admin-controlled prompts with privacy-aware handling, and a diagnostics view shows success rate, latency and errors, so the team can see exactly how it's performing.",
    },
    outcome: "A stronger coaching experience for learners, and real operational visibility for admins.",
    duration: "6 weeks",
    media: { shots: 3, tint: "#f1ece4" },
  },
  {
    slug: "procurement-hub",
    chip: "WhatsApp automation",
    name: "Procurement Hub",
    client: "A merchandise supplier",
    category: "operations",
    kind: "Operations platform",
    tagline: "Merchandise procurement in one place.",
    summary:
      "A procurement platform for branded merchandise that brings quotes, approvals, orders, shipments, invoicing and suppliers into one workflow.",
    problem:
      "Every order meant a chain of emails, calls and spreadsheets between clients, approvers and suppliers, and nobody had the full picture.",
    built: [
      "Quote, approval and order orchestration",
      "Shipment visibility and tax-compliant invoicing",
      "Supplier management with WhatsApp-native coordination",
      "Receivables aging and a financial overview",
    ],
    highlight: {
      label: "Automation",
      text: "Supplier updates flow in over WhatsApp, where suppliers already work, and move orders along without anyone re-typing them.",
    },
    outcome: "Less back-and-forth, and faster quote-to-order.",
    duration: "8 weeks",
    media: { shots: 2, tint: "#f6ece9" },
  },
  {
    slug: "coaching-insights",
    chip: "AI coaching insights",
    name: "Coaching Insights",
    client: "A coaching startup",
    category: "learning",
    kind: "Coaching platform",
    tagline: "Coaching that remembers every reflection.",
    summary:
      "A leadership coaching platform built around recurring reflections, coach and leader collaboration, and AI-generated insight.",
    problem:
      "Insight from coaching lived in scattered notes. Coaches walked into sessions without the full story of what a leader had been working through.",
    built: [
      "Recurring reflection capture and timelines",
      "Shared workflows between coaches and leaders",
      "Session notes, action items and progress analytics",
    ],
    highlight: {
      label: "AI inside",
      text: "AI insights read a leader's reflection patterns and surface what a coach should bring to the next session.",
    },
    outcome: "Better continuity across coaching cycles.",
    duration: "7 weeks",
    media: { shots: 1, tint: "#ecebf3" },
  },
  {
    slug: "rewards-loyalty-program",
    chip: "Geo-validated rewards",
    name: "Rewards & Loyalty",
    client: "An agri-seeds leader",
    category: "operations",
    kind: "Field app + ops",
    tagline: "Field loyalty for a large agri-seeds business.",
    summary:
      "A geo-aware rewards and loyalty program for dealers and farmers, with validated check-ins and controlled QR redemption. Client branding removed.",
    problem:
      "Rewards were easy to game and impossible to measure. The business couldn't see which regions were engaging, or whether points were being claimed fairly.",
    built: [
      "Dealer onboarding and farmer engagement journeys",
      "Location-aware check-in and validation",
      "QR redemption with duplicate and fraud controls",
      "Campaign operations tooling",
    ],
    highlight: {
      label: "Automation",
      text: "Geo-validation and signed QR scans stop duplicate or fraudulent claims before they're paid out.",
    },
    outcome: "Clear visibility into market penetration and redemption patterns.",
    duration: "4 weeks",
    media: { shots: 1, tint: "#e7efe3" },
  },
  {
    slug: "mcp-development",
    chip: "Secure AI access",
    name: "Secure MCP layer",
    client: "Capability",
    capability: true,
    category: "infra",
    kind: "AI integration",
    tagline: "Give AI assistants safe access to your business.",
    summary:
      "Custom MCP servers that connect approved internal data, tools and actions to ChatGPT, Claude, Codex or your own agents, with auth, guardrails and audit logs.",
    problem:
      "Teams want AI assistants that know the business, but handing an assistant raw database access is a non-starter.",
    built: [
      "Internal data and admin workflows mapped into approved MCP tools",
      "Auth, routing, guardrails and audit logging around every call",
      "Reporting and safe actions inside the assistants your team already uses",
    ],
    highlight: {
      label: "AI inside",
      text: "Assistants query dashboards, generate reports and run controlled actions, without broad access to raw systems.",
    },
    outcome: "A controlled way to use business data in AI workflows.",
    duration: "Scoped by systems and actions",
    media: { shots: 1, tint: "#eef6e6" },
  },
];

export const faq = [
  {
    q: "Is the proof of concept free?",
    a: "Often, yes. We scope it together on the call: if it fits in about a week, it's on us. Bigger proofs get a small fixed fee, agreed before we start. Either way, you're not committing to anything after it.",
  },
  {
    q: "How do milestone payments work?",
    a: "After the proof, we agree a fixed price for each milestone. A kickoff fee starts the build, and each payment after that is due once a milestone is delivered and you've accepted it. No hourly billing, and no giant check on day one.",
  },
  {
    q: "Who owns the code?",
    a: "You do, from day one. Everything we build lives in your own code repository (your company's GitHub account, or similar), with documentation on how it all fits together. Keep us on an optional retainer, hand it to your own team, or both.",
  },
  {
    q: "We already have a prototype, or an AI-built app. Can you take it from there?",
    a: "Yes. We'll review what's there, keep what's solid and harden the rest: security, testing, performance and deployment. A lot of AI-generated code skips all four.",
  },
  {
    q: "Do you sign NDAs?",
    a: "Yes, happily, before we see anything sensitive.",
  },
  {
    q: "How fast can we start?",
    a: "We review every intake within 24 to 48 hours. If it's a fit, the proof of concept can start as soon as we have access to the workflow and the data behind it.",
  },
];

/* The about page: two files, as we'd keep them in a repo. */
export const docs = [
  {
    id: "soul",
    file: "soul.md",
    body: `# soul.md

> Get the AI advantage without becoming an AI company.

LatentShip is a founder-led AI product studio. We build AI products that actually ship: apps, agents, operations platforms and integrations, designed around the way your business already works.

## What we believe

**Proof beats promises.** Every engagement starts with a proof of concept on your real workflow. In about a week you're looking at something that works, not a slide.

**You pay for progress.** A kickoff fee, then milestone by milestone, after you've accepted the work. Never a giant check on day one.

**AI-native, by default.** We build with AI at every step of our own process, and put it to work in your product wherever it makes the work faster, cheaper or better.

**Production or it didn't happen.** Anyone can generate code now. The hard part is security, testing and performance, and we build all three in from the start.

**Your code is yours.** It lives in your own repository from day one. Keep us on retainer, hand it to your team, or both.

---

## How we work

\`proof -> build -> launch -> iterate\`

Weekly demos. A shared decision log. A fixed price per milestone. No black box, no surprise invoice.

## start_here

One 15-minute call. You leave with a clear yes, a clear no, or exactly what we'd build first.

[Book a scoping call](../get-started/)
`,
  },
  {
    id: "team",
    file: "team.md",
    body: `# team.md

> Founder-led. Specialist-backed.

LatentShip was founded by Hari and Shayaz. Behind every project is a team of vetted specialists across product, AI, mobile, data, infrastructure, design and QA, with one point of contact and a demo every week.

## Founders

::people

## The team

::tags product, AI engineering, mobile, backend, data, devops, design, qa

## Where we've shipped

::tags fintech, learning & coaching, procurement, agritech, AI infrastructure

---

\`proof -> build -> launch -> iterate\`. Weekly demos. Milestone billing. Your code in your repository from day one.

[Book a scoping call](../get-started/)
`,
  },
];

export const founders = [
  {
    name: "Hariharan Ragunathan",
    initials: "HR",
    role: "Product + Engineering",
    email: "hari@latentship.com",
    quote: "I build products by deeply understanding customer problems and turning them into simple, useful experiences.",
  },
  {
    name: "Shayaz Pithawalla",
    initials: "SP",
    role: "Engineering + Architecture",
    email: "shayaz@latentship.com",
    quote: "I build AI-forward products: agentic workflows, creative automation and open cloud infrastructure.",
  },
];

/*
 * The intake. `send` maps each answer to the value the intake API accepts
 * (worker/src/index.js); the exact words picked travel in the brief too.
 */
export const intake = {
  need: [
    {
      label: "An AI agent for a workflow we already run",
      sub: "Automate the work your team does by hand today",
      send: "Build an agent for an existing workflow",
      placeholder: "e.g. Our ops team reads 200 supplier emails a day and re-types them into our ERP.",
    },
    {
      label: "A new AI-powered product",
      sub: "Web or mobile, with AI at the core",
      send: "Build a new AI product or workflow",
      placeholder: "e.g. An AI coach for new managers that remembers each person's goals.",
    },
    {
      label: "An internal tool or operations platform",
      sub: "Orders, pricing, approvals, dashboards",
      send: "Build a new AI product or workflow",
      placeholder: "e.g. One place for quotes, approvals and invoices instead of five spreadsheets.",
    },
    {
      label: "Help with an existing build",
      sub: "Architecture, advice or a rescue",
      send: "Architecture / advisory / rescue",
      placeholder: "e.g. We have an AI-built prototype that works in demos but breaks with real users.",
    },
  ],
  stage: [
    { label: "Just an idea" },
    { label: "A manual process or spreadsheets" },
    { label: "A prototype or AI-built app" },
    { label: "A live product" },
  ],
  timeline: [
    { label: "As soon as possible", send: "ASAP" },
    { label: "In the next 2 to 4 weeks", send: "Within 2-4 weeks" },
    { label: "In 1 to 2 months", send: "Within 1-2 months" },
    { label: "Just exploring", send: "Just exploring" },
  ],
};
