window.SITE_CONTENT = {
  hero: {
    eyebrow: "Boutique product + engineering team",
    qualifier: "For founders and product leaders building B2B SaaS and internal tools.",
    title: "From business problem to working product, fast.",
    subtitle: "We scope fast, build production-ready, and keep handoff clear.",
    bullets: [
      "Fixed-scope Proof of Concept in ~7 days",
      "Production-ready MVP with tests, CI, and clean handoff"
    ],
    cardMeta: "POC -> MVP -> Launch + Iterate",
    cardTitle: "Fast validation first, then production build with clear next steps.",
    timeline: [
      { label: "Week 1", text: "Proof of Concept (fixed scope)" },
      { label: "Weeks 2+", text: "MVP build and hardening" },
      { label: "Launch", text: "Release + iterate with data" }
    ]
  },
  socialProof: {
    title: "Built for operations-heavy products across:",
    badges: ["B2B Operations", "EdTech", "FinTech", "Internal Tooling", "Coaching Platforms", "AgriTech"]
  },
  whyUs: [
    {
      title: "Business-first scope",
      detail: "We map goals, constraints, and success criteria before writing code."
    },
    {
      title: "7-day POC first",
      detail: "A fixed-scope Proof of Concept reduces risk before larger build spend."
    },
    {
      title: "Production-ready delivery",
      detail: "MVPs include tests, CI, and maintainable architecture from day one."
    },
    {
      title: "Budget-aligned choices",
      detail: "Scope and deployment decisions are designed to fit your stage."
    },
    {
      title: "No lock-in",
      detail: "You own the repo, source code, and handoff documentation."
    },
    {
      title: "Optional retainer",
      detail: "Continue with us post-launch or transition to your internal team."
    }
  ],
  roadmap: {
    title: "POC first, production build next, then continuous iteration.",
    subtitle:
      "We solve product problems with technical clarity, translating business priorities into scoped delivery your team can trust.",
    collaboration:
      "Weekly demos, shared Slack channel, and clear acceptance criteria at each phase.",
    stageNote: "Typical MVP build: 3-6 weeks (depends on scope and integrations)",
    steps: [
      {
        phase: "Step 1",
        title: "POC in ~7 Days (Scoped)",
        timeline: "~1 week",
        detail:
          "We define the critical flow, constraints, and success criteria, then deliver a working proof to validate direction quickly.",
        deliverables: ["Scope doc", "Working proof", "Go/no-go recommendation"]
      },
      {
        phase: "Step 2",
        title: "MVP Build (Hardened)",
        timeline: "Typical 3-6 weeks",
        detail:
          "We convert validated scope into a production MVP with maintainable architecture, hardened tests, and clean handoff foundations.",
        deliverables: ["Core product flows", "Testing + CI baseline", "Deployment-ready stack"]
      },
      {
        phase: "Step 3",
        title: "Launch + Iterate",
        timeline: "Ongoing",
        detail:
          "We launch with QA and monitoring, then prioritize improvements from real usage data. Optional retainer support is available.",
        deliverables: ["Release support", "Feedback loop", "Prioritized iteration backlog"]
      }
    ],
    trustCards: [
      {
        label: "Low-risk POC offer",
        heading: "POC from $0-$500",
        copy: "For narrow validation flows, we can start with a lightweight mock-backend proof before full build."
      },
      {
        label: "Collaboration model",
        heading: "Clear Operating Rhythm",
        copy: "Weekly demos, shared Slack, and tracked decisions with explicit acceptance criteria."
      },
      {
        label: "Handoff package",
        heading: "Production Handoff",
        copy: "Repo ownership, runbooks, architecture notes, and a practical transition plan."
      }
    ]
  },
  projects: [
    {
      slug: "bilkool-ezee",
      title: "Bilkool Ezee",
      industry: "B2B Commerce",
      summary:
        "B2B procurement platform with quote workflows, approvals, and WhatsApp-led vendor coordination.",
      detail:
        "A procurement operations build focused on reducing lead-time across vendor requests, approvals, and order movement.",
      whatWeDid: ["Workflow design for quote-to-order", "Approval engine and operations dashboard"],
      outcome: "Faster quote-to-order flow with fewer manual follow-ups.",
      posterLine: "Reduced procurement cycle friction",
      duration: "8 weeks",
      tags: ["B2B", "Procurement", "Operations"],
      deliverables: [
        "Vendor onboarding and compliance workflow",
        "Quote-to-approval dashboard",
        "Order and invoice automation"
      ],
      preview: "linear-gradient(140deg, #b5e67a 0%, #d7f2ae 46%, #0f1218 100%)"
    },
    {
      slug: "aaroha-academy",
      title: "Aaroha Academy",
      industry: "EdTech",
      summary:
        "Learning operations platform for cohorts, mentors, and progress tracking with role-based workspaces.",
      detail:
        "A learning platform built around mentor workflows, cohort visibility, and practical reporting for operations teams.",
      whatWeDid: ["Role-based workspaces for cohorts", "Learning ops dashboard and reporting flows"],
      outcome: "Clearer cohort visibility and lower admin overhead for operations.",
      posterLine: "Improved cohort visibility for operators",
      duration: "6 weeks",
      tags: ["EdTech", "SaaS", "Operations"],
      deliverables: [
        "Multi-role learning dashboard",
        "Cohort progress tracking",
        "Mentor feedback workflow"
      ],
      preview: "linear-gradient(140deg, #0e1729 0%, #4b67a4 40%, #b5e67a 100%)"
    },
    {
      slug: "deepreflekt",
      title: "DeepReflekt",
      industry: "Coaching",
      summary:
        "Leadership development experience with reflection capture, coaching loops, and insight summaries.",
      detail:
        "A reflection and coaching platform designed for recurring sessions, qualitative feedback, and leadership growth tracking.",
      whatWeDid: ["Session workflow and reflection timeline", "Insight summaries for coaches and leaders"],
      outcome: "Improved coaching continuity across sessions and stakeholders.",
      posterLine: "Stronger coaching continuity",
      duration: "7 weeks",
      tags: ["Coaching", "AI", "Leadership"],
      deliverables: [
        "Session reflection workflow",
        "Coaching timeline view",
        "Insight digest summaries"
      ],
      preview: "linear-gradient(140deg, #101012 0%, #3a3a55 42%, #9fd957 100%)"
    },
    {
      slug: "algobullion",
      title: "AlgoBullion",
      industry: "FinTech",
      summary:
        "Real-time market monitoring dashboard for precious metals with pricing feeds and alerting.",
      detail:
        "A monitoring dashboard for commodity decision-makers requiring live price updates, alerts, and historical context.",
      whatWeDid: ["Realtime pricing feed handling", "Watchlist alerts and historical comparisons"],
      outcome: "Quicker market response decisions with centralized visibility.",
      posterLine: "Faster response to market movement",
      duration: "5 weeks",
      tags: ["FinTech", "Realtime", "Dashboards"],
      deliverables: [
        "Live pricing widget set",
        "Watchlist and threshold alerts",
        "Historical trend comparison"
      ],
      preview: "linear-gradient(140deg, #13211c 0%, #224d3f 45%, #a5dd63 100%)"
    },
    {
      slug: "rewards-poc",
      title: "Rewards POC",
      industry: "AgriTech",
      summary:
        "Geo-aware campaign prototype for engagement and reward validation across field locations.",
      detail:
        "A location-aware engagement prototype validating incentives, redemption logic, and campaign controls before scale.",
      whatWeDid: ["Geo check-in and validation logic", "Reward controls and campaign tooling"],
      outcome: "Validated field reward mechanics before production rollout.",
      posterLine: "Validated rewards before scale",
      duration: "4 weeks",
      tags: ["AgriTech", "Geo", "MVP"],
      deliverables: [
        "Geo check-in validation",
        "Reward rules engine",
        "Campaign admin controls"
      ],
      preview: "linear-gradient(140deg, #101418 0%, #395a74 44%, #b4ed7a 100%)"
    },
    {
      slug: "support-copilot",
      title: "Support Copilot",
      industry: "SaaS",
      summary:
        "Internal support tool to triage incoming tickets and suggest response drafts for operations teams.",
      detail:
        "An internal support workflow improving triage speed and response consistency for cross-functional teams.",
      whatWeDid: ["Ticket triage queue and prioritization", "Draft assistant and support performance panel"],
      outcome: "Reduced ticket handling time and improved response consistency.",
      posterLine: "Reduced support handling time",
      duration: "5 weeks",
      tags: ["SaaS", "Automation", "AI"],
      deliverables: [
        "Ticket triage board",
        "Response draft assistant",
        "Support performance snapshot"
      ],
      preview: "linear-gradient(140deg, #121212 0%, #555555 48%, #9fdb57 100%)"
    }
  ],
  about: {
    title: "Meet the team behind scoped, practical product delivery.",
    copy:
      "We are a small, senior team that translates business goals into product decisions and technical execution. We keep scope clear, ship in focused phases, and prioritize maintainability from day one."
  },
  faq: [
    {
      question: "What do I get?",
      bullets: [
        "A fixed-scope Proof of Concept (~7 days)",
        "An MVP plan with scope, timeline, and technical approach",
        "Launch + iteration support with documented handoff"
      ]
    },
    {
      question: "How does pricing work?",
      bullets: [
        "POC is fixed scope and fixed fee",
        "MVP is estimated from validated requirements",
        "Scope changes are explicit and approved before implementation"
      ]
    },
    {
      question: "Do I keep the code?",
      bullets: [
        "Yes, you own the source code and repository",
        "You keep architecture notes and handoff docs",
        "You can continue with us or your internal team"
      ]
    },
    {
      question: "What happens after POC?",
      bullets: [
        "We review what was validated and what changed",
        "We lock MVP scope and implementation plan",
        "We move into build with weekly demos and clear acceptance criteria"
      ]
    },
    {
      question: "Do you sign NDAs?",
      bullets: ["Yes, we can sign NDAs before discovery and scope review."]
    },
    {
      question: "What does the 7-day POC include?",
      bullets: [
        "One critical user flow implemented end-to-end",
        "Working prototype + technical recommendation",
        "Clear next-step plan for production MVP"
      ]
    }
  ]
}
