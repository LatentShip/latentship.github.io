# Landing/Portfolio Site (Static)

This project is now a pure static site for GitHub Pages/GitLab Pages.

Structure:

- `index.html`
- `assets/`
- `css/styles.css`
- `js/content.js`
- `js/main.js`
- `.github/workflows/deploy-pages.yml`

No npm/build step is required.

## Local Development

Option 1 (recommended): run a local static server.

```bash
py -m http.server 8080
```

Then open:

`http://localhost:8080`

Option 2: open `index.html` directly in your browser.

## Deploy to GitHub Pages

1. Push to a GitHub repo.
2. Go to `Settings -> Pages`.
3. Set `Source` to `GitHub Actions`.
4. Push to `main`.
5. Workflow `Deploy Static Site` publishes automatically.

The site uses relative paths (`./css/...`, `./js/...`, `./assets/...`) so it works from a repo subpath (project Pages URLs).

## Deploy to GitLab Pages (fallback)

If you need GitLab Pages for a private GitHub source workflow:

1. Mirror this repo to GitLab.
2. Add a `.gitlab-ci.yml` Pages job that publishes the repo root.
3. Ensure `index.html` is at the published root.

## How To Change Content

Primary content file:

- `js/content.js`

Update these sections in `js/content.js`:

- `hero`: hero copy
- `whyUs`: six short trust bullets
- `roadmap.title`, `roadmap.subtitle`, `roadmap.steps`
- `roadmap.trustCards`: pricing/ownership/retainer cards
- `projects`: portfolio cards and tag values
- `faq`: FAQ question/answer entries

Tag filtering logic:

- Tags are derived from each project's `tags` array in `js/content.js`.
- No extra config needed; filter buttons update automatically.

## Styling / UI

- Main styles: `css/styles.css`
- UI behavior (rendering/filtering/animations): `js/main.js`

## Notes

- This is vanilla HTML/CSS/JS only.
- No framework or build tooling is required for deployment.
