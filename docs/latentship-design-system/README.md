# LatentShip Design System

## Company Overview

**LatentShip** is a small, senior AI-native product and engineering team. Their core value proposition: they turn messy, operations-heavy workflows into AI-agentic products that teams actually use — not demos, but production-ready systems.

### Delivery Model
- **Week 1** — Scoped POC for the highest-leverage workflow
- **Weeks 2+** — MVP build with production foundations
- **Launch** — Release, instrument, and iterate from real usage

### Tagline / Core Copy
> "We turn messy workflows into AI-agentic products teams actually use."

### Founders
- **Hariharan Ragunathan** — Product + Engineering (hari@latentship.com)
- **Shayaz Pithawalla** — Engineering + Architecture (shayaz@latentship.com)

### Contact
- hello@latentship.com
- https://latentship.github.io/

---

## Sources

| Source | Details |
|---|---|
| GitHub repo | https://github.com/LatentShip/latentship.github.io (public) |
| Live site | https://latentship.github.io/ |
| Primary stylesheet | `css/styles.css` (39 KB, single file) |
| Content data | `js/content.js` — all hero copy, projects, FAQ, roadmap |
| Pages | Home, About Us, Our Work, Get Started (multi-page static) |

No Figma link was provided.

---

## Products / Surfaces

There is **one product surface**: the LatentShip marketing + portfolio website. It is a static multi-page site. Pages:
- **Home** — Hero, social proof strip, Why Us, Delivery Roadmap, Featured Projects, FAQ, Footer CTA
- **Our Work** — Filterable project grid with tag buttons
- **About Us** — Founder bios
- **Get Started** — Multi-step intake/lead form

### Portfolio Projects (as of May 2026)
| Project | Industry | Duration |
|---|---|---|
| Aaroha Academy | AI Systems, EdTech | 6 weeks |
| AlgoBullion | FinTech, Operational Platforms | 5 weeks |
| Bilkool Ezee | Operational Platforms | 8 weeks |
| DeepReflekt | AI Systems, Coaching | 7 weeks |
| Rewards & Loyalty Program | AgriTech, Operational Platforms | 4 weeks |

---

## CONTENT FUNDAMENTALS

### Voice & Tone
- **Direct and senior.** No buzzword fluff. Every sentence earns its place.
- **"We" not "I".** The team speaks as one unit. ("We turn messy workflows…", "We apply AI to concrete workflow bottlenecks…")
- **Second person for the client.** "You keep repos and implementation context." "You own the source code."
- **Concrete over vague.** Specific timelines, deliverables, and outcomes. ("~7 days", "3-6 weeks", "go/no-go recommendation")
- **No hype.** Anti-"transformational AI" — they deliberately say "practical", "maintainable", "concrete", "handoff-ready".

### Casing
- **Sentence case** for headlines and section titles (not Title Case). e.g. "Short, concrete reasons teams trust us."
- **ALL CAPS with letter-spacing** for eyebrows/labels/metadata. e.g. "AI-NATIVE PRODUCT + ENGINEERING TEAM", "STEP 1"
- CTA buttons: sentence case. "Book a 15-min scoping call", "See recent builds"

### Punctuation & Style
- Em dashes used for sub-clauses: "POC -> MVP -> Launch + Iterate" (uses `->` not `→`)
- Bullet lists, not prose, for deliverables and trust signals
- Short, declarative sentences. Rarely more than 2 clauses.
- No emoji anywhere on the site.
- Numbers are specific: "~7 Days", "3-6 weeks", "1 business day"

### Copy Examples
- **Hero:** "We turn messy workflows into AI-agentic products teams actually use."
- **Why Us:** "AI where it helps — We apply AI to concrete workflow bottlenecks, not generic demos."
- **FAQ:** "We avoid over-automating critical decisions without safeguards."
- **Footer:** "Ready to ship your next product?"

---

## VISUAL FOUNDATIONS

### Colors
The palette is a **deep forest green + off-white** system. No blues, purples, or saturated accent colors beyond the single brand green.

| Token | Value | Usage |
|---|---|---|
| `--bg` | `#f3f8f1` | Page background |
| `--bg-soft` | `#fbfdf9` | Softer background surfaces |
| `--surface` | `#ffffff` | Card/panel surface |
| `--ink` | `#132019` | Primary text (near-black green-tinted) |
| `--ink-soft` | `#3d4f44` | Secondary text |
| `--ink-muted` | `#6d7d73` | Tertiary/meta text |
| `--brand-50` | `#edf8e3` | Very light green tint |
| `--brand-100` | `#d9efc5` | Light green |
| `--brand-200` | `#bde092` | Soft mid green |
| `--brand-400` | `#6fb23a` | **Primary brand green** (CTAs, bullets, chips) |
| `--brand-500` | `#5b9830` | Darker brand green (hover states, border accents) |
| `--brand-700` | `#3a6422` | Deep green (eyebrow text, back-link) |

**Dark surface** (hero card, footer CTA):
- Background: `linear-gradient(150deg, #152019 0%, #0f1813 55%, #111c16 100%)`
- Foreground: `#f4f8f2`

**Status colors** (semantic, not decorative):
- Info: `#1f69d6` on `#e4efff`
- Success: `#227a48` on `#e2f6eb`
- Warning: `#a66a00` on `#fff3dd`
- Danger: `#ba2f2f` on `#ffe7e7`

### Typography
Two typefaces only:

| Role | Family | Weights | Usage |
|---|---|---|---|
| Display | **Sora** | 500, 600, 700 | All h1, h2, h3; letter-spacing -0.03em; line-height 1.12 |
| Body | **Plus Jakarta Sans** | 400, 500, 600, 700, 800 | All body copy, UI labels, buttons |

**Type scale:**
- `--text-xs`: 12px — labels, metadata, uppercase eyebrows
- `--text-sm`: 14px — body small, buttons, nav
- `--text-md`: 16px — default body
- `--text-lg`: 20px — card titles, why-list headings
- `--text-xl`: clamp(28px, 3.5vw, 42px) — section headings
- `--text-hero`: clamp(36px, 5.2vw, 64px) — hero headline

**Eyebrows:** ALL CAPS, `letter-spacing: 0.08em`, `font-weight: 800`, `color: var(--brand-700)`, `font-size: 12px`

### Backgrounds
- Page background is a **subtle radial gradient** of light green tones — never flat white.
- Body: `radial-gradient(circle at 3% -4%, #e5f5d4 ...) + linear-gradient(#f8fcf4 → #f3f8f1 → #eff5eb)`
- Hero card: dark `linear-gradient` with a green radial accent at top-left corner.
- Roadmap stage: a warm green `linear-gradient(145deg, #deefc8 → #d2e8b7 → #f4faeb)` — the "brand moment" background.
- No full-bleed photography, no hero images. Layout is purely typographic + geometric.
- No gradients with purple, blue, or any off-brand hue.

### Spacing
4px base grid: `--space-1` (4px) through `--space-16` (64px).

### Borders & Radius
- Panels/cards: `--radius-lg` (26px) for hero-level; `--radius-md` (18px) for standard cards; `--radius-sm` (12px) for small items
- Pills: `--radius-pill` (999px) for nav, badges, chips, buttons
- Border color: `rgba(18, 32, 24, 0.12)` — semi-transparent near-black (green-tinted)

### Shadows
Three tiers, all warm near-black green shadows:
- `--shadow-sm`: `0 10px 22px rgba(26, 42, 29, 0.07)`
- `--shadow-md`: `0 20px 40px rgba(21, 35, 26, 0.09)`
- `--shadow-lg`: `0 30px 64px rgba(18, 28, 22, 0.12)`

No inner shadows except on `.roadmap-step` (subtle white highlight: `inset 0 1px 0 rgba(255,255,255,0.5)`).

### Animation & Motion
- **Ease:** `cubic-bezier(0.2, 0.8, 0.2, 1)` — smooth deceleration, never bouncy
- **Fast:** 140ms (color, opacity transitions)
- **Normal:** 220ms (transforms, shadows)
- **Reveal animation:** elements fade up from `translateY(14px)` over 420ms on scroll (disabled on mobile for performance)
- **No springs, no bounces, no looping animations.** Everything is purposeful and calm.

### Hover / Active States
- **CTAs (primary):** `translateY(-1px)` lift on hover, `translateY(1px) scale(0.99)` press on active
- **Cards (project):** `translateY(-3px)` lift + deeper shadow on hover
- **Ghost/secondary buttons:** border & background tint to `--brand-100` mix on hover
- **Nav links:** background tint hover; active state uses dark pill `#13201a`
- **Nav CTA:** transitions from brand-400 to brand-500 (darker green) on hover, with `color: #f7fbf5`

### Cards & Panels
Cards use the `.panel` class:
- Background: `color-mix(in srgb, white 70%, #eff8e8 30%)` — very subtly green-tinted white
- Border: `1px solid rgba(18, 32, 24, 0.12)`
- Shadow: `--shadow-md`
- Radius: `--radius-lg` (hero panels) or `--radius-md` (standard)

Dark panel variation (`.panel-dark`):
- Dark forest gradient with green radial highlight
- Green-tinted border: `rgba(144, 203, 83, 0.24)`
- Text: `#f4f8f2` (light cream-green)

### Iconography
The brand uses **no external icon library**. Icons are:
1. **CSS mask-based arrow** — a custom SVG arrow baked into a CSS custom property (`--arrow-mask`), applied via `mask-image`. Used on all CTAs and text links. Size: 17px.
2. **Brand mark** — shared SVG asset in `assets/logo-mark.svg`. A light green circle containing the rocketship mark from `preview/brand-logo.html`.
3. **Favicon** — same rocketship mark adapted for a dark rounded square.
4. **No emoji** anywhere on the site.
5. **No icon font** (no Font Awesome, Lucide, etc.)

All iconography is minimal and purposeful. The arrow is the only repeated icon pattern.

### Layout
- Max container width: `1140px`, centered with `margin-inline: auto`
- Standard section padding: `64px` block
- Key layout patterns: 3-column grid (why-us, roadmap, trust-cards, project grid), 2-column hero split (1.12fr / 0.88fr)
- Navigation: pill-shaped floating navbar with animated active indicator
- Mobile: stacks to 1-column, sticky blurred header, mobile sticky CTA button

### Imagery
- Project preview images provided for each portfolio case (PNG screenshots)
- No illustrations, no stock photography, no hand-drawn elements
- Project cards without images use generated gradient backgrounds (dark + brand green)
- Color vibe: dark forest green + lime green gradients; no warm/orange tones

---

## ICONOGRAPHY

The canonical brand mark is the rocketship-style SVG from `preview/brand-logo.html`, exported for production as `assets/logo-mark.svg`:
- Outer circle: fill `#eef7e2`, stroke `#b6d98a`
- Exhaust dot: fill `#3a6422`
- Main rocket body: fill `#5b9830`
- Fin accents: fill `#79ba37`

**No external icon library is used.** The only repeated icon is the CSS-mask arrow (→) applied to all CTA buttons and text links via `--arrow-mask` custom property.

**Assets available in `assets/`:**
- `logo-mark.svg` - rocketship brand mark
- `favicon.svg` - rocketship brand mark favicon
- `AarohaAcademy_1.png` — portfolio screenshot
- `AlgoBullion_1.png` — portfolio screenshot
- `BilkoolEzee_1.png` — portfolio screenshot
- `DeepReflekt_1.png` — portfolio screenshot

---

## File Index

```
README.md                    ← This file (design system manifest)
SKILL.md                     ← Agent skill definition
colors_and_type.css          ← CSS custom properties: colors, type, spacing, radii, shadows
assets/
  logo-mark.svg              <- Rocketship brand mark SVG
  favicon.svg                <- Rocketship brand mark favicon
  *.png                      ← Portfolio project screenshots
preview/
  colors-brand.html          ← Brand color palette swatch card
  colors-neutral.html        ← Neutral/ink color swatch card
  colors-semantic.html       ← Status/semantic colors card
  colors-dark.html           ← Dark surface color card
  type-display.html          ← Display type specimen (Sora)
  type-body.html             ← Body type specimen (Plus Jakarta Sans)
  type-scale.html            ← Full type scale card
  type-eyebrow.html          ← Eyebrow / label style card
  spacing-tokens.html        ← Spacing token grid
  spacing-radii.html         ← Border radius tokens
  spacing-shadows.html       ← Shadow system card
  comp-buttons.html          ← Button components
  comp-nav.html              ← Navigation bar component
  comp-cards.html            ← Panel/card components
  comp-chips.html            ← Chips, badges, status chips
  comp-forms.html            ← Form inputs and fields
  brand-logo.html            ← Logo/brand mark card
  brand-animation.html       ← Motion/animation tokens
ui_kits/
  website/
    README.md                ← UI kit notes
    index.html               ← Interactive marketing site prototype
    Nav.jsx                  ← Navigation component
    Hero.jsx                 ← Hero section component
    ProjectCard.jsx          ← Project card component
    RoadmapSection.jsx       ← Roadmap section component
    Footer.jsx               ← Footer component
```
