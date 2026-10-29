/*
 * Small shared helpers with no dependencies: motion preferences, math, one
 * animation loop for the whole page, analytics and icons.
 */

export const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
export const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

export const clamp = (v, min, max) => Math.min(max, Math.max(min, v));
export const lerp = (a, b, t) => a + (b - a) * t;
// Frame-rate independent easing toward a target.
export const damp = (current, target, lambda, dt) => lerp(current, target, 1 - Math.exp(-lambda * dt));
export const wait = (ms) => new Promise((resolve) => window.setTimeout(resolve, Math.max(0, ms)));

/* ───────── One animation loop ───────── */

const frameCallbacks = new Set();
let frameId = 0;
let lastTime = 0;

function frame(now) {
  const dt = Math.min(0.05, (now - lastTime) / 1000 || 0.016);
  lastTime = now;
  frameCallbacks.forEach((fn) => fn(dt, now));
  frameId = frameCallbacks.size ? requestAnimationFrame(frame) : 0;
}

export function onFrame(fn) {
  frameCallbacks.add(fn);
  if (!frameId) {
    lastTime = performance.now();
    frameId = requestAnimationFrame(frame);
  }
  return () => frameCallbacks.delete(fn);
}

/* ───────── Analytics hook (pushes to a dataLayer when one exists) ───────── */

export function track(event, payload = {}) {
  if (Array.isArray(window.dataLayer)) window.dataLayer.push({ event, ...payload });
}
window.latentshipTrack = track;

/* ───────── Icons ───────── */

const svg = (body, cls = "ico") => `<svg class="${cls}" viewBox="0 0 20 20" fill="none" aria-hidden="true">${body}</svg>`;
const S = 'stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"';

export const icon = {
  arrow: svg(`<path d="M4 10h11m0 0-4.5-4.5M15 10l-4.5 4.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>`, "ico ico-arrow"),
  check: svg(`<path d="m4.5 10.5 3.5 3.5 7.5-8" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>`),
  x: svg(`<path d="m6 6 8 8m0-8-8 8" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>`),
  copy: svg(`<rect x="7" y="7" width="9.5" height="9.5" rx="2" ${S}/><path d="M13 7V5a1.5 1.5 0 0 0-1.5-1.5h-6A1.5 1.5 0 0 0 4 5v6.5A1.5 1.5 0 0 0 5.5 13H7" ${S}/>`),
  link: svg(`<path d="M8.5 11.5a3.2 3.2 0 0 0 4.6 0l2.5-2.5a3.2 3.2 0 0 0-4.6-4.6l-.8.8" ${S}/><path d="M11.5 8.5a3.2 3.2 0 0 0-4.6 0L4.4 11a3.2 3.2 0 0 0 4.6 4.6l.8-.8" ${S}/>`),
  external: svg(`<path d="M11 4h5v5M16 4l-7 7M14 11.5V15a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h3.5" ${S}/>`),
  top: svg(`<path d="M10 16V5m0 0-4.5 4.5M10 5l4.5 4.5M4.5 3h11" ${S}/>`),
  moon: svg(`<path d="M15.5 12.4A6.2 6.2 0 0 1 7.6 4.5a6.4 6.4 0 1 0 7.9 7.9Z" ${S}/>`),
  sun: svg(`<circle cx="10" cy="10" r="3.4" ${S}/><path d="M10 2.5v1.6M10 15.9v1.6M2.5 10h1.6M15.9 10h1.6M4.7 4.7l1.1 1.1M14.2 14.2l1.1 1.1M4.7 15.3l1.1-1.1M14.2 5.8l1.1-1.1" ${S}/>`),
  soundOn: svg(`<path d="M3.5 8h2.4L9.5 5v10L5.9 12H3.5z" fill="currentColor" ${S}/><path d="M12.5 7.8a3 3 0 0 1 0 4.4M14.8 5.8a6 6 0 0 1 0 8.4" ${S}/>`),
  soundOff: svg(`<path d="M3.5 8h2.4L9.5 5v10L5.9 12H3.5z" fill="currentColor" ${S}/><path d="m12.5 8 4 4m0-4-4 4" ${S}/>`),
  call: svg(`<rect x="3" y="4" width="14" height="13" rx="2.5" ${S}/><path d="M3 8h14M7 2.5v3M13 2.5v3" ${S}/><path d="m7.5 12.3 1.8 1.8 3.4-3.6" ${S}/>`),
  shuffle: svg(`<path d="M3 6.5h2.2c1.5 0 2.5.6 3.3 1.8l2.9 4.4c.8 1.2 1.8 1.8 3.3 1.8H17" ${S}/><path d="M3 14.5h2.2c1.5 0 2.5-.6 3.3-1.8M11.5 7.3c.8-1.2 1.8-1.8 3.3-1.8H17" ${S}/><path d="m15 3.5 2 2-2 2M15 12.5l2 2-2 2" ${S}/>`),
  checkCircle: svg(`<circle cx="10" cy="10" r="7" ${S}/><path d="m7 10.2 2 2 4-4.4" ${S}/>`),
  phone: svg(`<rect x="6" y="2.5" width="8" height="15" rx="2" ${S}/><path d="M9 15h2" ${S}/>`),
  dashboard: svg(`<rect x="2.5" y="3.5" width="15" height="13" rx="2" ${S}/><path d="M2.5 7h15M7 7v9.5M10 13v-2.5M13 13V9.5" ${S}/>`),
  agent: svg(`<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3h7A2.5 2.5 0 0 1 16 5.5v5a2.5 2.5 0 0 1-2.5 2.5H9l-3.5 3v-3A2.5 2.5 0 0 1 4 10.5z" ${S}/><path d="M10 5.6c.3 1.6.9 2.2 2.4 2.4-1.5.3-2.1.9-2.4 2.4-.3-1.5-.9-2.1-2.4-2.4 1.5-.2 2.1-.8 2.4-2.4Z" fill="currentColor"/>`),
};
