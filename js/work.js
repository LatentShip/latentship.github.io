/*
 * Project cards, the work page and the case pages, all drawn from content.js.
 */

import { categories, projects } from "./content.js";
import { icon, initTilt, observeReveals, sound } from "./site.js";
import { playVignettes, vignette } from "./vignettes.js";

// The site root, wherever the page sits.
const ROOT = new URL("../", import.meta.url);
const asset = (path) => new URL(path, ROOT).href;
const esc = (value) =>
  String(value).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

export const bySlug = (slug) => projects.find((p) => p.slug === slug);
const categoryLabel = (id) => (categories.find((c) => c.id === id) || {}).label || "";

function picture(project, n, { sizes = "(max-width: 900px) 92vw, 640px", eager = false } = {}) {
  const base = `assets/img/work/${project.slug}/${n}`;
  return `<picture>
    <source type="image/avif" srcset="${asset(`${base}-800.avif`)} 800w, ${asset(`${base}-1600.avif`)} 1600w" sizes="${sizes}">
    <img src="${asset(`${base}-1200.jpg`)}" alt="${esc(project.name)}, screen ${n}" width="1600" height="1000" ${eager ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async">
  </picture>`;
}

const shot = (project, n, opts) =>
  `<div class="shot"><div class="shot-bar"><i></i><i></i><i></i></div>${picture(project, n, opts)}</div>`;

export function media(project, opts = {}) {
  if (project.media.vignette) return vignette(project.media.vignette);
  return shot(project, 1, opts);
}

/**
 * A project card. `size` is a grid span class (span-7, span-5...), and `href`
 * is the path from the current page to the work folder.
 */
export function card(project, { size = "", href = "./work/", reveal = true } = {}) {
  const dark = project.media.dark ? " is-dark" : "";
  return `<article class="card ${size}${dark}" ${reveal ? "data-reveal" : ""} data-cat="${project.category}" style="--tint:${project.media.tint || "var(--paper-2)"}">
    <div class="card-media" data-tilt><div data-tilt-target style="position:absolute;inset:0;transition:transform .6s var(--ease)">${media(project)}</div></div>
    <div class="card-body">
      <div class="card-meta"><span>${esc(project.client)}</span><span>${esc(project.kind)}</span></div>
      <h3><a class="card-link" href="${href}${project.slug}/">${esc(project.name)}</a></h3>
      <p class="card-line">${esc(project.tagline)}</p>
      <div class="card-foot"><span class="chip chip-ai">${esc(project.chip)}</span><span class="card-go">View case ${icon.arrow}</span></div>
    </div>
  </article>`;
}

/* The home page selection: two headline builds, then the bullion suite. */
export function renderFeatured(target) {
  if (!target) return;
  const family = projects.filter((p) => p.family === "bullion");
  target.innerHTML =
    card(bySlug("growth-companion"), { size: "span-7" }) +
    card(bySlug("procurement-hub"), { size: "span-5" }) +
    `<div class="family" data-reveal>
      <div class="family-head">
        <div><p class="eyebrow">One bullion fintech</p><h3>The bullion suite</h3></div>
        <p>Three products for India's bullion market: a rates app, a trading desk and a cloud bridge for Tally.</p>
      </div>
      <div class="family-row">${["bullion-trading-desk", "accounting-sync", "live-rates-app"].map((slug) => card(bySlug(slug), { reveal: false })).join("")}</div>
    </div>`;
  observeReveals(target);
  playVignettes(target);
  initTilt(target);
}

/* The work page: every project, filterable by area. */
export function renderWorkPage() {
  const grid = document.querySelector("[data-all]");
  const filters = document.querySelector("[data-filters]");
  if (!grid || !filters) return;
  grid.innerHTML = projects.map((p) => card(p, { href: "./" })).join("");
  const counts = Object.fromEntries(categories.map((c) => [c.id, projects.filter((p) => p.category === c.id).length]));
  filters.innerHTML =
    `<button class="filter" type="button" data-filter="all" aria-pressed="true">All<span class="count">${projects.length}</span></button>` +
    categories
      .filter((c) => counts[c.id])
      .map((c) => `<button class="filter" type="button" data-filter="${c.id}" aria-pressed="false">${esc(c.label)}<span class="count">${counts[c.id]}</span></button>`)
      .join("");

  const apply = (id, animate) => {
    filters.querySelectorAll("[data-filter]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.filter === id)));
    let n = 0;
    grid.querySelectorAll(".card").forEach((el) => {
      const show = id === "all" || el.dataset.cat === id;
      el.classList.toggle("is-hidden", !show);
      el.classList.remove("is-entering");
      if (show && animate) {
        el.classList.add("is-in");
        el.style.setProperty("--d", `${n * 60}ms`);
        void el.offsetWidth;
        el.classList.add("is-entering");
        n += 1;
      }
    });
  };
  filters.addEventListener("click", (event) => {
    const button = event.target.closest("[data-filter]");
    if (!button || button.getAttribute("aria-pressed") === "true") return;
    sound.play("select");
    apply(button.dataset.filter, true);
    const url = new URL(window.location.href);
    if (button.dataset.filter === "all") url.searchParams.delete("area");
    else url.searchParams.set("area", button.dataset.filter);
    window.history.replaceState(null, "", url);
  });
  const initial = new URLSearchParams(window.location.search).get("area");
  if (initial && categories.some((c) => c.id === initial)) apply(initial, false);

  observeReveals(grid);
  playVignettes(grid);
  initTilt(grid);
}

/* A case page, from the slug on <body>. */
export function renderCase() {
  const slug = document.body.dataset.slug;
  const project = bySlug(slug);
  const main = document.querySelector("[data-case]");
  if (!project || !main) return;

  const i = projects.indexOf(project);
  const next = projects[(i + 1) % projects.length];
  const shots = project.media.shots || 0;

  const stage = project.media.vignette
    ? `<div class="frame">${vignette(project.media.vignette)}</div>`
    : `<div class="frame">${Array.from({ length: shots }, (_, k) =>
        shot(project, k + 1, { sizes: "(max-width: 900px) 92vw, 1100px", eager: k === 0 }).replace('class="shot"', `class="shot${k ? " is-off" : ""}" data-shot="${k}"`)
      ).join("")}</div>${
        shots > 1
          ? `<div class="gallery-nav"><button class="prev" type="button" aria-label="Previous screen">${icon.arrow}</button><span class="gallery-dots">${Array.from(
              { length: shots },
              (_, k) => `<i class="${k ? "" : "on"}"></i>`
            ).join("")}</span><button class="next-shot" type="button" aria-label="Next screen">${icon.arrow}</button></div>`
          : ""
      }`;

  const meta = [
    project.capability ? ["Type", "A capability we build"] : ["Client", esc(project.client)],
    ["What we built", esc(project.kind)],
    project.duration ? ["Timeline", esc(project.duration)] : null,
    project.link
      ? ["Live", `<a href="${project.link}" target="_blank" rel="noopener">${esc(new URL(project.link).host)}${icon.arrow}</a>`]
      : null,
  ].filter(Boolean);

  main.innerHTML = `
    <section class="case-head wrap">
      <a class="back" href="../">${icon.arrow}All work</a>
      <div class="case-title">
        <p class="eyebrow" data-in style="--in:0">${esc(categoryLabel(project.category))}</p>
        <h1 class="display" data-in style="--in:1">${esc(project.name)}</h1>
        <p class="lede" data-in style="--in:2">${esc(project.tagline)}</p>
      </div>
      <dl class="case-meta" data-in style="--in:3">${meta.map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join("")}</dl>
      <div class="case-stage${project.media.dark ? " is-dark" : ""}" style="--tint:${project.media.tint || "var(--paper-2)"};--in:4" data-in>${stage}</div>
    </section>
    <section class="wrap case-body">
      <div class="case-blocks">
        <div class="case-block" data-reveal><h2>Overview</h2><p>${esc(project.summary)}</p></div>
        <div class="case-block" data-reveal><h2>The problem</h2><p>${esc(project.problem)}</p></div>
        <div class="case-block" data-reveal><h2>What we built</h2><ul>${project.built.map((b) => `<li>${esc(b)}</li>`).join("")}</ul></div>
        <div class="case-block" data-reveal><h2>${esc(project.highlight.label)}</h2><div class="case-ai"><span class="chip chip-ai">${esc(project.chip)}</span><p>${esc(project.highlight.text)}</p></div></div>
        <div class="case-block" data-reveal><h2>The outcome</h2><p>${esc(project.outcome)}</p></div>
      </div>
    </section>
    <a class="next wrap" href="../${next.slug}/" data-reveal><small>Next case</small><strong>${esc(next.name)}${icon.arrow}</strong></a>`;

  // The gallery: arrows, dots, swipe and keys.
  if (shots > 1) {
    const items = Array.from(main.querySelectorAll("[data-shot]"));
    const dots = Array.from(main.querySelectorAll(".gallery-dots i"));
    let at = 0;
    const show = (k) => {
      sound.play("swipe");
      at = (k + items.length) % items.length;
      items.forEach((el, j) => el.classList.toggle("is-off", j !== at));
      dots.forEach((d, j) => d.classList.toggle("on", j === at));
    };
    main.querySelector(".gallery-nav .prev").addEventListener("click", () => show(at - 1));
    main.querySelector(".gallery-nav .next-shot").addEventListener("click", () => show(at + 1));
    const frame = main.querySelector(".case-stage");
    let x0 = null;
    frame.addEventListener("pointerdown", (e) => (x0 = e.clientX), { passive: true });
    frame.addEventListener("pointerup", (e) => {
      if (x0 === null) return;
      const dx = e.clientX - x0;
      if (Math.abs(dx) > 40) show(at + (dx < 0 ? 1 : -1));
      x0 = null;
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "ArrowRight") show(at + 1);
      if (e.key === "ArrowLeft") show(at - 1);
    });
  }

  observeReveals(main);
  playVignettes(main);
}
