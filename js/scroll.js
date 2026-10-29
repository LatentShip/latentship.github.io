/*
 * Weighted scrolling, on a mouse wheel or trackpad: the page glides after
 * each flick and eases to rest, like a skate settling on ice, instead of
 * jumping a notch at a time. It moves the real scroll position, so sticky
 * sections, links, find-in-page and the scrollbar all keep working.
 *
 * Left alone: touch screens, reduced motion, zooming (ctrl or cmd + wheel),
 * sideways scrolling, and anything inside its own scrollable box (a text
 * area, a code block) that can still move that way. Keys and the scrollbar
 * scroll the page as they always do; the glide takes over from wherever the
 * page ends up.
 */

import { clamp, damp, finePointer, onFrame, reduceMotion } from "./util.js";

// How heavy the page feels: a higher number settles sooner.
const GLIDE = 5.6;
const LINE = 36;

let target = 0;
let current = 0;
let stop = null;
let enabled = false;
let lambda = GLIDE;

const maxY = () => Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
const jump = (y) => window.scrollTo({ top: y, left: window.scrollX, behavior: "instant" });

function tick(dt) {
  current = damp(current, target, lambda, dt);
  if (Math.abs(target - current) < 0.4) current = target;
  jump(current);
  if (current === target) {
    stop();
    stop = null;
    lambda = GLIDE;
  }
}

function run() {
  if (!stop) stop = onFrame(tick);
}

// Scrolls the page to y with the same weight (or a slower ease for long jumps).
export function scrollToY(y, { soft = false } = {}) {
  const to = clamp(y, 0, maxY());
  if (!enabled) {
    window.scrollTo({ top: to, behavior: reduceMotion ? "instant" : "smooth" });
    return;
  }
  if (!stop) target = current = window.scrollY;
  lambda = soft ? 3.6 : GLIDE;
  target = to;
  run();
}

// An element that would scroll itself in that direction keeps the wheel.
function ownScroller(node, dy) {
  for (let el = node; el && el !== document.body && el !== document.documentElement; el = el.parentElement) {
    if (el.scrollHeight <= el.clientHeight + 1) continue;
    const style = getComputedStyle(el);
    if (!/(auto|scroll)/.test(style.overflowY)) continue;
    if (dy > 0 ? el.scrollTop + el.clientHeight < el.scrollHeight - 1 : el.scrollTop > 0) return true;
  }
  return false;
}

export function initScroll() {
  if (!finePointer || reduceMotion || enabled) return;
  enabled = true;
  target = current = window.scrollY;

  window.addEventListener(
    "wheel",
    (event) => {
      if (event.defaultPrevented || event.ctrlKey || event.metaKey) return;
      if (Math.abs(event.deltaX) > Math.abs(event.deltaY)) return;
      if (document.documentElement.classList.contains("menu-open")) return;
      if (ownScroller(event.target, event.deltaY)) return;
      event.preventDefault();
      const unit = event.deltaMode === 1 ? LINE : event.deltaMode === 2 ? window.innerHeight * 0.9 : 1;
      if (!stop) target = current = window.scrollY;
      lambda = GLIDE;
      target = clamp(target + event.deltaY * unit, 0, maxY());
      run();
    },
    { passive: false }
  );

  // Something else moved the page (keys, the scrollbar, a link): follow it.
  window.addEventListener(
    "scroll",
    () => {
      if (stop && Math.abs(window.scrollY - current) > 3) {
        stop();
        stop = null;
      }
      if (!stop) target = current = window.scrollY;
    },
    { passive: true }
  );

  // Links to a place on this page glide there too.
  document.addEventListener("click", (event) => {
    const link = event.target.closest('a[href*="#"]');
    if (!link || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey) return;
    const url = new URL(link.href, window.location.href);
    if (url.pathname !== window.location.pathname || !url.hash) return;
    const spot = document.getElementById(decodeURIComponent(url.hash.slice(1)));
    if (!spot) return;
    event.preventDefault();
    const pad = parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0;
    scrollToY(spot.getBoundingClientRect().top + window.scrollY - pad, { soft: true });
    window.history.pushState(null, "", url.hash);
    if (spot.id === "main") spot.focus({ preventScroll: true });
  });

  window.addEventListener("resize", () => {
    target = clamp(target, 0, maxY());
  });
}
