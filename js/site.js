/*
 * Shared behaviour for every page: the rocket, the nav, theme and sound
 * switches, reveals, the launch into the intake, and the page's own pointer,
 * right-click menu and weighted scrolling. Page scripts import from here.
 */

import { initContextMenu } from "./contextmenu.js";
import { initCursor } from "./cursor.js";
import { initLaunches } from "./launch.js";
import { rocketSVG } from "./rocket.js";
import { initScroll } from "./scroll.js";
import { sound } from "./sound.js";
import { finePointer, icon, reduceMotion, track } from "./util.js";

export * from "./util.js";
export { flameScale, HEADING, NOZZLE, rocketParts, rocketSVG } from "./rocket.js";
export { sound } from "./sound.js";
export { scrollToY } from "./scroll.js";

// Fills every [data-rocket] slot. data-rocket="lit" starts with the flame burning.
export function mountRockets(root = document) {
  root.querySelectorAll("[data-rocket]").forEach((slot) => {
    if (slot.querySelector(".rocket")) return;
    slot.insertAdjacentHTML("afterbegin", rocketSVG());
    const rocket = slot.querySelector(".rocket");
    const state = slot.dataset.rocket;
    if (state === "lit" || state === "idle") {
      rocket.classList.add("is-lit");
      rocket.style.setProperty("--power", state === "lit" ? "0.85" : "0.5");
    }
  });
}

/* ───────── Theme ───────── */

const THEME_KEY = "ls-theme";

export const getTheme = () => (document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light");

function syncThemeButtons() {
  const dark = getTheme() === "dark";
  document.querySelectorAll("[data-theme-toggle]").forEach((b) => {
    b.setAttribute("aria-label", dark ? "Switch to light mode" : "Switch to dark mode");
    b.setAttribute("aria-pressed", String(dark));
  });
}

export function setTheme(next, from = null, remember = true) {
  const html = document.documentElement;
  if (next === getTheme()) return;
  const apply = () => {
    html.setAttribute("data-theme", next);
    if (remember) {
      try {
        localStorage.setItem(THEME_KEY, next);
      } catch (_err) {
        // Private mode: the choice lasts this page.
      }
    }
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.content = next === "dark" ? "#0a110d" : "#fbfcf9";
    syncThemeButtons();
    window.dispatchEvent(new CustomEvent("ls:theme", { detail: { theme: next } }));
  };
  // The new theme opens out of the button that asked for it.
  if (!from || reduceMotion || !document.startViewTransition) {
    apply();
    return;
  }
  const r = from.getBoundingClientRect();
  const x = r.left + r.width / 2;
  const y = r.top + r.height / 2;
  const end = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));
  html.classList.add("theme-vt");
  const vt = document.startViewTransition(apply);
  vt.ready
    .then(() =>
      html.animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${end}px at ${x}px ${y}px)`] },
        { duration: 650, easing: "cubic-bezier(0.22, 1, 0.36, 1)", pseudoElement: "::view-transition-new(root)" }
      )
    )
    .catch(() => {});
  vt.finished.finally(() => html.classList.remove("theme-vt"));
}

function initTheme() {
  syncThemeButtons();
  document.addEventListener("click", (event) => {
    const button = event.target.closest("[data-theme-toggle]");
    if (!button) return;
    const next = getTheme() === "dark" ? "light" : "dark";
    setTheme(next, button);
    sound.play(next === "dark" ? "toggle-on" : "toggle-off");
    track("theme", { theme: next });
  });
  // Without a choice of their own, the page follows the system.
  const media = window.matchMedia("(prefers-color-scheme: dark)");
  const follow = () => {
    let saved = null;
    try {
      saved = localStorage.getItem(THEME_KEY);
    } catch (_err) {
      saved = null;
    }
    if (saved !== "light" && saved !== "dark") setTheme(media.matches ? "dark" : "light", null, false);
  };
  if (media.addEventListener) media.addEventListener("change", follow);
}

/* ───────── Sound switch ───────── */

function initSoundSwitch() {
  const sync = (on) => {
    document.querySelectorAll("[data-sound-toggle]").forEach((b) => {
      b.setAttribute("aria-pressed", String(on));
      b.setAttribute("aria-label", on ? "Mute sounds" : "Turn sound on");
    });
  };
  sync(sound.enabled());
  sound.onChange(sync);
  document.addEventListener("click", (event) => {
    const button = event.target.closest("[data-sound-toggle]");
    if (!button) return;
    const on = !sound.enabled();
    sound.setEnabled(on);
    toast(on ? "Sound on" : "Sound off", on ? icon.soundOn : icon.soundOff);
    track("sound", { on });
  });
}

/* ───────── Toast ───────── */

let toastEl = null;
let toastTimer = 0;

export function toast(message, glyph = icon.check) {
  if (!toastEl) {
    toastEl = document.createElement("div");
    toastEl.className = "toast";
    toastEl.setAttribute("role", "status");
    toastEl.setAttribute("aria-live", "polite");
    document.body.appendChild(toastEl);
  }
  toastEl.innerHTML = `${glyph}<span>${message}</span>`;
  window.clearTimeout(toastTimer);
  requestAnimationFrame(() => toastEl.classList.add("is-on"));
  toastTimer = window.setTimeout(() => toastEl.classList.remove("is-on"), 1800);
}

/* ───────── Nav ───────── */

function initNav() {
  const nav = document.querySelector("[data-nav]");
  if (!nav) return;
  const toggle = nav.querySelector(".nav-menu");
  const menu = document.getElementById("menu");
  const night = Array.from(document.querySelectorAll("[data-night]"));
  let lastY = -1;

  const update = () => {
    const y = window.scrollY;
    if (y === lastY) return;
    lastY = y;
    nav.classList.toggle("is-scrolled", y > 12);
  };
  update();
  window.addEventListener("scroll", update, { passive: true });

  // Dark sections under the nav turn it dark. A one-pixel band at the nav's
  // middle is watched, so it stays right as content loads or moves.
  if (night.length && "IntersectionObserver" in window) {
    const under = new Set();
    let io = null;
    const watch = () => {
      if (io) io.disconnect();
      under.clear();
      const bar = nav.querySelector(".nav-bar").getBoundingClientRect();
      const mid = Math.round(bar.top + bar.height / 2);
      io = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => (entry.isIntersecting ? under.add(entry.target) : under.delete(entry.target)));
          nav.classList.toggle("is-night", under.size > 0);
        },
        { rootMargin: `${-mid}px 0px ${-(window.innerHeight - mid - 1)}px 0px` }
      );
      night.forEach((el) => io.observe(el));
    };
    watch();
    let resizeTimer = 0;
    window.addEventListener("resize", () => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(watch, 150);
    });
  }

  if (!toggle || !menu) return;
  const setOpen = (open, quiet = false) => {
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    document.documentElement.classList.toggle("menu-open", open);
    if (!quiet) sound.play(open ? "open" : "close");
    if (open) {
      menu.hidden = false;
      requestAnimationFrame(() => menu.classList.add("is-open"));
    } else {
      menu.classList.remove("is-open");
      window.setTimeout(() => {
        if (!menu.classList.contains("is-open")) menu.hidden = true;
      }, 420);
    }
  };
  toggle.addEventListener("click", () => setOpen(toggle.getAttribute("aria-expanded") !== "true"));
  menu.addEventListener("click", (event) => {
    if (event.target.closest("a")) setOpen(false, true);
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") setOpen(false);
  });
}

/* ───────── Reveals ───────── */

export function observeReveals(root = document) {
  const items = root.querySelectorAll("[data-reveal]:not(.is-in)");
  root.querySelectorAll("[data-stagger]").forEach((group) => {
    const step = Number(group.dataset.stagger) || 80;
    Array.from(group.querySelectorAll(":scope > [data-reveal]")).forEach((child, i) => {
      child.style.setProperty("--d", `${i * step}ms`);
    });
  });
  if (reduceMotion || !("IntersectionObserver" in window)) {
    items.forEach((el) => el.classList.add("is-in"));
    return;
  }
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-in");
        io.unobserve(entry.target);
      });
    },
    { rootMargin: "0px 0px -8% 0px", threshold: 0.12 }
  );
  items.forEach((el) => io.observe(el));
}

// Adds .is-in to elements while they are on screen (for looping illustrations).
export function observeInView(selector, root = document) {
  const els = root.querySelectorAll(selector);
  if (!("IntersectionObserver" in window)) {
    els.forEach((el) => el.classList.add("is-in"));
    return;
  }
  const io = new IntersectionObserver(
    (entries) => entries.forEach((entry) => entry.target.classList.toggle("is-in", entry.isIntersecting)),
    { threshold: 0.2 }
  );
  els.forEach((el) => io.observe(el));
}

/* ───────── Stars for the night sections (and the dark theme's sky) ───────── */

export function sprinkleStars(root = document) {
  root.querySelectorAll("[data-stars]").forEach((field) => {
    if (field.childElementCount) return;
    const count = Number(field.dataset.stars) || 60;
    let seed = count * 9301 + 49297 + field.className.length * 131;
    const rand = () => {
      seed = (seed * 9301 + 49297) % 233280;
      return seed / 233280;
    };
    const frag = document.createDocumentFragment();
    for (let i = 0; i < count; i += 1) {
      const star = document.createElement("i");
      const size = rand() < 0.15 ? 3 : 2;
      star.style.cssText = `left:${(rand() * 100).toFixed(2)}%;top:${(rand() * 100).toFixed(2)}%;width:${size}px;height:${size}px;animation-delay:${(rand() * 4).toFixed(2)}s;animation-duration:${(3 + rand() * 4).toFixed(2)}s`;
      frag.appendChild(star);
    }
    field.appendChild(frag);
  });
}

/* ───────── Cards follow the pointer a little ───────── */

export function initTilt(root = document) {
  if (!finePointer || reduceMotion) return;
  root.querySelectorAll("[data-tilt]").forEach((el) => {
    if (el.dataset.tiltReady) return;
    el.dataset.tiltReady = "1";
    const target = el.querySelector("[data-tilt-target]") || el;
    let raf = 0;
    el.addEventListener("pointermove", (event) => {
      const r = el.getBoundingClientRect();
      const x = (event.clientX - r.left) / r.width - 0.5;
      const y = (event.clientY - r.top) / r.height - 0.5;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        target.style.transform = `perspective(1100px) rotateX(${(-y * 4).toFixed(2)}deg) rotateY(${(x * 5).toFixed(2)}deg)`;
      });
    });
    el.addEventListener("pointerleave", () => {
      cancelAnimationFrame(raf);
      target.style.transform = "";
    });
  });
}

/* ───────── Boot ───────── */

function boot() {
  window.__lsBoot = true;
  document.documentElement.classList.add("js");
  mountRockets();
  sprinkleStars();
  initNav();
  initTheme();
  sound.start();
  initSoundSwitch();
  observeReveals();
  initTilt();
  initScroll();
  initCursor();
  initContextMenu({ toast, setTheme, getTheme });
  initLaunches();
  document.querySelectorAll("[data-year]").forEach((el) => {
    el.textContent = String(new Date().getFullYear());
  });
  document.addEventListener("click", (event) => {
    const link = event.target.closest("[data-track]");
    if (link) track(link.dataset.track, { href: link.getAttribute("href") || "" });
  });
  // Where the page was when it was left: a reload part-way down skips the intro.
  window.addEventListener("pagehide", () => {
    try {
      sessionStorage.setItem(`ls-y:${location.pathname}`, String(Math.round(window.scrollY)));
    } catch (_err) {
      // Fine.
    }
  });
  // The ordinary entrance runs once; later classes must not replay it.
  window.setTimeout(() => document.documentElement.classList.remove("enter"), 2200);
}

boot();
