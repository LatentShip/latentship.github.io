/*
 * The rocket opens the page.
 *
 * Arriving on the site or reloading a page, the head sets html.intro before
 * the first paint, so the page starts clean with the rocket alone in the
 * middle. It pops in, its window blinks, its flame lights, and it swoops up
 * into the nav as the logo while the page falls into place around it
 * (html.intro-go; the stylesheet times that part). About 1.7 seconds, start
 * to dock. The smoke stays behind on the pad.
 *
 * A press, a key or a scroll ends it at once. Without this script the head
 * ends it on its own. ?intro=1 replays it; ?intro=hold keeps the rocket on the
 * pad, burning, for tuning.
 */

import { bez, bezTangent } from "./rocket.js";
import { HEADING, NOZZLE, clamp, flameScale, wait } from "./site.js";

const T = {
  blink: 260, // after the script starts: the window blinks
  ignite: 470, // the flame lights
  launch: 860, // the earliest it goes
  cap: 1500, // after navigation start it goes, whatever is still loading
  crouch: 90, // a dip before the leap
  flight: 720, // the swoop into the nav
  settle: 900, // after docking, until everything has landed
};

const GESTURES = ["pointerdown", "keydown", "wheel", "touchstart"];
const HOLD = /[?&]intro=hold(&|$)/.test(window.location.search);
const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);
const easeOut = (t) => 1 - (1 - t) ** 3;
const smooth = (a, b, t) => {
  const x = clamp((t - a) / (b - a), 0, 1);
  return x * x * (3 - 2 * x);
};

/**
 * The swoop: up along its heading first, then a banking turn across the top of
 * the page and up into the logo from below. The rocket faces where it is going
 * and straightens out as it docks.
 */
function planFlight(from, to) {
  const dist = Math.hypot(to.x - from.x, to.y - from.y);
  const h = { x: Math.SQRT1_2, y: -Math.SQRT1_2 };
  const p0 = { x: from.x, y: from.y };
  const p1 = { x: from.x + h.x * dist * 0.3, y: from.y + h.y * dist * 0.3 };
  const p2 = { x: to.x + dist * 0.05, y: to.y + Math.max(110, dist * 0.38) };
  const p3 = { x: to.x, y: to.y };

  // Sample the curve so the rocket moves at a steady pace along it.
  const N = 120;
  const pts = [];
  let length = 0;
  for (let i = 0; i <= N; i += 1) {
    const t = i / N;
    const p = bez(p0, p1, p2, p3, t);
    if (i) length += Math.hypot(p.x - pts[i - 1].x, p.y - pts[i - 1].y);
    pts.push({ ...p, t, s: length });
  }
  const atLength = (s) => {
    let i = 1;
    while (i < N && pts[i].s < s) i += 1;
    const a = pts[i - 1];
    const b = pts[i];
    const k = b.s === a.s ? 0 : (s - a.s) / (b.s - a.s);
    return a.t + (b.t - a.t) * k;
  };
  const d = `M${p0.x.toFixed(1)} ${p0.y.toFixed(1)}C${p1.x.toFixed(1)} ${p1.y.toFixed(1)} ${p2.x.toFixed(1)} ${p2.y.toFixed(1)} ${p3.x.toFixed(1)} ${p3.y.toFixed(1)}`;
  return { p0, p1, p2, p3, length, atLength, d };
}

function buildFrames(flight, from, to) {
  const { p0, p1, p2, p3, length, atLength } = flight;
  const scaleTo = to.size / from.size;
  const steps = 40;
  const rocket = [];
  const flame = [];
  const trail = [];
  let lastAngle = 0;
  for (let i = 0; i <= steps; i += 1) {
    const u = i / steps;
    const s = length * easeInOut(u);
    const t = atLength(s);
    const p = bez(p0, p1, p2, p3, t);
    const tan = bezTangent(p0, p1, p2, p3, Math.min(0.999, Math.max(0.001, t)));
    let angle = (Math.atan2(tan.y, tan.x) * 180) / Math.PI - HEADING;
    while (angle - lastAngle > 180) angle -= 360;
    while (angle - lastAngle < -180) angle += 360;
    lastAngle = angle;
    // Straighten out to the logo's own angle while docking.
    const rot = angle * (1 - smooth(0.78, 1, u));
    const size = 1 + (scaleTo - 1) * easeOut(Math.min(1, u * 1.08));
    rocket.push({
      offset: u,
      transform: `translate(${(p.x - from.x).toFixed(2)}px, ${(p.y - from.y).toFixed(2)}px) rotate(${rot.toFixed(2)}deg) scale(${size.toFixed(4)})`,
    });
    const power = 1.35 * smooth(0, 0.12, u) * (1 - smooth(0.62, 1, u)) + 0.25;
    flame.push({ offset: u, transform: flameScale(power) });
    trail.push({ offset: u, strokeDashoffset: `${(flight.tail - s).toFixed(1)}px` });
  }
  return { rocket, flame, trail };
}

export function initIntro() {
  const html = document.documentElement;
  const opener = document.querySelector("[data-opener]");
  const none = { played: false, go: Promise.resolve(), done: Promise.resolve() };

  if (!opener) return none;
  if (!html.classList.contains("intro")) {
    opener.remove();
    return none;
  }
  window.clearTimeout(window.__lsIntroFallback);

  const pad = opener.querySelector("[data-pad]");
  const fly = opener.querySelector("[data-fly]");
  const smoke = opener.querySelector("[data-smoke]");
  const trailSvg = opener.querySelector("[data-trail]");
  const rocket = fly.querySelector(".rocket");
  const flameEl = rocket.querySelector(".rk-flame");
  const logo = document.querySelector(".nav .brand-mark .rocket");

  let finished = false;
  let going = false;
  let puffTimer = 0;
  const timers = [];
  const anims = [];
  let resolveGo;
  let resolveDone;
  const go = new Promise((r) => (resolveGo = r));
  const done = new Promise((r) => (resolveDone = r));
  const later = (fn, ms) => timers.push(window.setTimeout(fn, ms));

  /* Smoke: soft puffs from the nozzle, drifting down and left. */
  const puff = (big = false) => {
    if (finished || !smoke.animate) return;
    const size = pad.getBoundingClientRect().width;
    const el = document.createElement("i");
    el.className = "puff";
    el.style.left = `${(NOZZLE.x / 24) * size}px`;
    el.style.top = `${(NOZZLE.y / 24) * size}px`;
    smoke.appendChild(el);
    const ang = (135 * Math.PI) / 180 + (Math.random() - 0.5) * (big ? 2.2 : 1.1);
    const dist = (big ? 0.55 + Math.random() * 0.95 : 0.28 + Math.random() * 0.4) * size;
    const grow = big ? 1.8 + Math.random() * 2.4 : 0.9 + Math.random() * 1.1;
    const a = el.animate(
      [
        { transform: "translate(0, 0) scale(0.35)", opacity: 0.95 },
        {
          transform: `translate(${(Math.cos(ang) * dist).toFixed(1)}px, ${(Math.sin(ang) * dist).toFixed(1)}px) scale(${grow.toFixed(2)})`,
          opacity: 0,
        },
      ],
      { duration: (big ? 1200 : 760) + Math.random() * 420, easing: "cubic-bezier(0.2, 0.8, 0.3, 1)", fill: "forwards" }
    );
    a.finished.then(() => el.remove(), () => el.remove());
  };

  const finish = () => {
    if (finished) return;
    finished = true;
    window.clearTimeout(puffTimer);
    timers.forEach((id) => window.clearTimeout(id));
    GESTURES.forEach((type) => window.removeEventListener(type, hurry, true));
    anims.forEach((a) => a.cancel());
    opener.hidden = true;
    html.classList.remove("intro", "intro-go", "intro-landed");
    resolveGo();
    resolveDone();
  };

  // A press, a key or a scroll: the visitor is ready, so the page is.
  function hurry(event) {
    if (!event.isTrusted) return;
    if (event.type === "keydown" && ["Shift", "Control", "Alt", "Meta"].includes(event.key)) return;
    finish();
  }
  if (!HOLD) GESTURES.forEach((type) => window.addEventListener(type, hurry, { capture: true, passive: true }));

  const ignite = () => {
    if (finished) return;
    opener.classList.add("is-lit");
    rocket.classList.add("is-lit");
    rocket.style.setProperty("--power", "0.85");
    fly.classList.add("is-rumbling");
    const tick = () => {
      if (finished || going) return;
      puff();
      puffTimer = window.setTimeout(tick, 60 + Math.random() * 40);
    };
    tick();
  };

  let landed = false;
  const land = () => {
    if (finished || landed) return;
    landed = true;
    html.classList.add("intro-landed");
    fly.style.visibility = "hidden";
    anims.push(trailSvg.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 450, easing: "ease-out", fill: "forwards" }));
    later(finish, T.settle);
  };

  const launch = () => {
    if (finished || going || HOLD) return;
    going = true;
    window.clearTimeout(puffTimer);
    const padRect = pad.getBoundingClientRect();
    const logoRect = logo ? logo.getBoundingClientRect() : null;
    const from = { x: padRect.left + padRect.width / 2, y: padRect.top + padRect.height / 2, size: padRect.width };
    const to = logoRect && logoRect.width ? { x: logoRect.left + logoRect.width / 2, y: logoRect.top + logoRect.height / 2, size: logoRect.width } : null;

    // A short crouch on the pad, a burst of smoke, then away.
    fly.classList.remove("is-rumbling");
    const crouch = fly.animate([{ transform: "none" }, { transform: "translate(-3px, 3px) scale(1.04, 0.95)" }], {
      duration: T.crouch,
      easing: "ease-in",
      fill: "forwards",
    });
    anims.push(crouch);
    for (let i = 0; i < 14; i += 1) puff(true);

    // Animations can stall in a page that isn't being drawn, so a timer backs
    // up every step.
    let lifted = false;
    const liftOff = () => {
      if (finished || lifted) return;
      lifted = true;
      html.classList.add("intro-go");
      resolveGo();
      if (!to || !fly.animate) {
        later(land, 300);
        return;
      }
      const flight = planFlight(from, to);
      flight.tail = Math.min(380, flight.length * 0.42);
      const frames = buildFrames(flight, from, to);

      trailSvg.setAttribute("viewBox", `0 0 ${window.innerWidth} ${window.innerHeight}`);
      trailSvg.innerHTML =
        `<path d="${flight.d}" stroke="rgba(121,186,55,0.2)" stroke-width="10" style="filter:blur(4px)"/>` +
        `<path d="${flight.d}" stroke="rgba(91,152,48,0.5)" stroke-width="2"/>`;
      const dash = `${flight.tail} ${flight.length + flight.tail}`;
      trailSvg.querySelectorAll("path").forEach((path) => {
        path.style.strokeDasharray = dash;
        path.style.strokeDashoffset = `${flight.tail}px`;
        anims.push(path.animate(frames.trail, { duration: T.flight, easing: "linear", fill: "forwards" }));
      });

      crouch.cancel();
      rocket.style.setProperty("--power", "1");
      const move = fly.animate(frames.rocket, { duration: T.flight, easing: "linear", fill: "forwards" });
      anims.push(move);
      if (flameEl) anims.push(flameEl.animate(frames.flame, { duration: T.flight, easing: "linear", fill: "forwards" }));
      move.finished.then(land, () => {});
      later(land, T.flight + 220);
    };
    crouch.finished.then(liftOff, () => {});
    later(liftOff, T.crouch + 140);
  };

  // A page opened behind another tab waits for its visitor. Visibility events
  // are not always delivered, so it checks rather than listens.
  const seen = () =>
    new Promise((resolve) => {
      const check = () => (document.hidden ? window.setTimeout(check, 250) : resolve());
      check();
    });

  // Wait for the fonts so the page never jumps, but never for long.
  const fontsReady = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
  const ready = Promise.race([fontsReady, wait(T.cap - performance.now())]);

  later(() => opener.classList.add("is-blink"), T.blink);
  later(ignite, T.ignite);
  Promise.all([ready, wait(T.launch)])
    .then(seen)
    .then(launch)
    .catch(finish);

  return { played: true, go, done };
}
