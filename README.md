# LatentShip site

The marketing site for [latentship.com](https://latentship.com): static HTML, CSS and
vanilla JavaScript modules on GitHub Pages. There is no build step, so every push to
`main` deploys as is.

## Structure

- `index.html`: home (hero and its visual, what we build, the difference, how we work,
  work, FAQ)
- `work/index.html`: all projects, filterable by area
- `work/<slug>/index.html`: one page per project (a shell; `js/work.js` fills it in)
- `about/index.html`: soul.md and team.md, with an outline
- `get-started/index.html`: the five-question intake for the 15-minute scoping call
- `404.html`: shown by GitHub Pages for any missing page
- `css/site.css`: every style, tokens first (light, then `[data-theme="dark"]`)
- `js/content.js`: **all the words**: projects, FAQ, the about docs, intake options
- `js/site.js`: what every page shares (nav, theme, sound switch, reveals, the footer
  launch); it also starts the cursor, the right-click menu and the scroll
- `js/util.js`, `js/rocket.js`: small helpers and icons; the rocket SVG and its flame
- `js/intro.js`: the rocket intro
- `js/hero.js`: picks the hero visual, `js/flow.js` (the default), `js/assembly.js` or
  `js/orbit.js`; the first two are WebGL, with helpers in `js/gl.js`
- `js/journey.js`, `js/home.js`: the rest of the home page
- `js/work.js`, `js/vignettes.js`, `js/work-page.js`, `js/case.js`: project cards, the
  work page, case pages and the live product sketches
- `js/about.js`, `js/intake.js`: the about page and the intake
- `js/sound.js`, `js/vendor/uisfx.js`: interface sounds
- `js/launch.js`: the rocket launch from any link to the intake, and its landing there
- `js/cursor.js`, `js/contextmenu.js`, `js/scroll.js`: the green arrow cursor, the
  right-click menu and the weighted wheel scroll
- `assets/img/work/<slug>/`: project screenshots (AVIF and JPEG, three sizes)
- `assets/work/<slug>/`: full-size originals of those screenshots
- `assets/og.png`: the link preview image (1200 × 630)
- `favicon.ico`, `assets/favicon.svg`, `assets/apple-touch-icon.png`: the tab and home
  screen icons (the ICO is for browsers that don't show SVG icons)
- `worker/`: the Cloudflare Worker behind the intake (`api.latentship.com`)

## Local development

Serve the folder with any static server (ES modules don't load from `file://`):

```bash
python3 -m http.server 8080
```

Then open `http://localhost:8080`.

Handy switches:

- `?intro=0` skips the rocket intro, `?intro=1` forces it and `?intro=hold` keeps the
  rocket burning on the pad, for tuning the flame. They work on any page.
- `/?hero=flow`, `/?hero=assembly` or `/?hero=orbit` shows one hero visual, and
  `/?compare=1` adds a floating switch to flip between them. The default is `DEFAULT`
  in `js/hero.js`.
- `/?h=1`, `/?h=2` and `/?h=3` try the other headlines.
- `?cursor=rocket` swaps the arrow cursor for a slim logo rocket, on any page.
- `/get-started/?dry=1` runs the whole intake without sending anything.

## Changing words

Almost everything lives in `js/content.js`:

- `projects`: name, tagline, summary, problem, what we built, the AI highlight, outcome
- `faq`: the questions and answers on the home page
- `docs` and `founders`: the about page (markdown; `::people` and `::tags a, b` are page blocks)
- `intake`: the intake options (`send` is the value the intake API accepts)
- `site.bookingUrl`: set a Cal.com or Calendly link to offer "Pick a time now" after the intake

The home page's own sections (hero, what we build, the difference, how we work) are
written straight into `index.html`.

## Adding a project

1. Add it to `projects` in `js/content.js` with a unique `slug`.
2. Copy any `work/<slug>/index.html` to `work/<new-slug>/index.html` and change the
   title, description, canonical URL and `data-slug` on `<body>`.
3. For screenshots, add `1-800.avif`, `1-1600.avif` and `1-1200.jpg` (then 2, 3...) to
   `assets/img/work/<new-slug>/` and set `media: { shots: <count> }`. On a Mac:

   ```bash
   sips -Z 1600 shot.png --out /tmp/a.png && sips -s format avif -s formatOptions 68 /tmp/a.png --out 1-1600.avif
   ```

   Or draw a live sketch in `js/vignettes.js` and set `media: { vignette: "<name>" }`.
4. Add the page to `sitemap.xml`.

## Motion

- Easing and timing tokens are at the top of `css/site.css` (`--ease`, `--ease-spring`).
- The rocket is one SVG (`rocketSVG()` in `js/rocket.js`); its flame follows `--power`.
- The intro plays on a fresh load or reload of any page except the 404, in about 1.7 s.
  It's skipped when arriving from another page of the site, through a `#` link, with
  back or forward, on a reload while scrolled down, and with reduced motion. That rule
  is the small script at the top of each page's `<head>`; the timings are `T` in
  `js/intro.js`. Keep `css/site.css` linked above that script: it switches on the fade
  between pages (`@view-transition`), and a browser that runs the script first decides
  there is no fade.
- Any link to the intake launches. Pointed at, a booking button's arrow slips away and
  a small rocket rises into its place, engine idling; pressed, that rocket grows out of
  the button and swoops off the top while the page clears in a soft wave under the nav,
  then the intake opens with the rocket landing on its progress bar. The intake page and its script are prefetched when
  a visitor points at such a link. Modified clicks (new tab) and reduced motion just
  open the page.
- The cursor, the right-click menu and the weighted scroll only run with a mouse or
  trackpad. Text fields keep the system's text cursor and their own right-click menu,
  shift + right-click opens the browser's menu anywhere, and keys, the scrollbar and
  touch scroll natively. `GLIDE` in `js/scroll.js` sets how far the page coasts. The
  cursor fires a jet from its tail on fast moves, stays out of the intro, and shows the
  text of any `data-cursor-label` beside it (the hero visual uses one in place of a
  printed hint).
- Everything respects `prefers-reduced-motion`: the intro is skipped, the journey becomes
  three plain cards, the hero visual holds still, the scroll stays native and the cursor
  follows the mouse exactly.

## Light and dark

The page follows the system until the visitor picks a theme with the moon and sun
button (or the right-click menu); the choice is kept in this browser (`ls-theme` in
localStorage). The script at the top of each page's `<head>` applies it before the
first paint, so nothing flashes. Colours are tokens at the top of `css/site.css`; dark
mode overrides them under `[data-theme="dark"]`, and the WebGL visuals take theirs from
`palette()` in `js/gl.js`.

## Sound

Interface sounds come from [uisfx](https://uisfx.com) 0.4.0, Minimal pack, vendored in
`js/vendor/` with its MIT license. They're synthesized in the browser: no audio files
and no network requests. Browsers only allow sound after a click, tap or key press, so a
first-time visitor who only scrolls hears nothing until they do. Where the browser
already allows it (after a press on an earlier page of the site, in Chrome, or for a
visitor it trusts), sound starts as soon as the page loads, so scrolling alone is heard.
The speaker button in the nav (in the menu on phones, and in the right-click menu)
mutes everything; that choice is kept under `latentship:sound` in localStorage.

| Cue | Plays on |
| --- | --- |
| `open`, `close` | the phone menu and the right-click menu |
| `expand`, `collapse` | FAQ answers |
| `select` | intake picks, work filters, hero switches, about files and views |
| `toggle-on`, `toggle-off` | dark and light mode; sound turned back on |
| `progress-step`, `back`, `blocked` | moving on, back, or held up in the intake |
| `success`, `error` | sending the intake |
| `checkpoint` | each stage of the journey |
| `swipe` | case page galleries |
| `snap` | the orbit settling on a product |
| `copy` | anything copied from the right-click menu |
| `send` | a rocket launching into the intake |

Each cue's gain is in `LEVELS` in `js/sound.js`, measured so they all land at about the
same loudness. Measure a new cue the same way rather than guessing.

## Deploy

Pushing to `main` runs `.github/workflows/deploy-pages.yml`, which publishes the repo
root to GitHub Pages. Changes under `worker/` also run `deploy-worker.yml`.

## Intake API + captcha

The intake posts to the Worker at `api.latentship.com`, which checks a Cloudflare
Turnstile token, validates the payload and emails the lead through Resend.

- `site.lead.turnstileSiteKey` in `js/content.js` holds the Turnstile site key.
- Worker secrets: `TURNSTILE_SECRET_KEY`, `RESEND_API_KEY`, `LEAD_FORWARD_TO`
  (`wrangler secret put <NAME>`).
- Optional Worker vars: `ALLOWED_ORIGINS`, `TURNSTILE_ALLOWED_HOSTNAMES`.

The Worker only accepts its known `needType` and `timeline` values, so the intake maps
each option to one of them (`send` in `js/content.js`) and writes the visitor's exact
answers, including where they're starting from, at the top of the brief. Rejected
submissions are logged in the Worker with the reason, IP and origin.
