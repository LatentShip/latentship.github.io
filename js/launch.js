/*
 * Booking a call is a launch. Each booking button keeps a small rocket behind
 * its arrow: pointed at, the arrow slips away and the rocket rises into its
 * place, engine idling. Pressed, the rocket grows out of the button, crouches,
 * and swoops off the top of the screen on a comet trail while the page clears
 * behind it in a soft wave. The intake then opens with the same rocket landing
 * on its progress bar (landOn, from js/intake.js), so the two pages read as
 * one move.
 *
 * The footer flies its own big rocket. A modified click (a new tab or window)
 * goes as normal, and with reduced motion the link simply opens. Coming back
 * with the browser's back button finds the page as it was left.
 */

import { HEADING, NOZZLE, bez, bezTangent, rocketSVG } from "./rocket.js";
import { sound } from "./sound.js";
import { clamp, reduceMotion } from "./util.js";

const INTAKE = /\/get-started\/$/;
const KEY = "ls-launch";
const ROOT = new URL("../", import.meta.url);
const T = {
  pop: 170, // the rocket grows out of the button, lit
  crouch: 60, // a dip before the leap
  flight: 520, // off the top of the screen
  veil: 540, // the page clears, from the leap
  cap: 1500, // whatever happens, the next page opens by then
  land: 760, // on the intake: up from below, onto the progress bar
};

const easeIn = (u) => u * (0.18 + 0.82 * u * u);
const easeOut = (u) => 1 - (1 - u) ** 3;

let busy = false;
const live = [];

// A cubic Bezier walked at a steady pace under an easing: where the rocket is
// and which way it is going (degrees, screen space) at each step.
function walk(p0, p1, p2, p3, steps, easing) {
  const N = 100;
  const pts = [];
  let length = 0;
  for (let i = 0; i <= N; i += 1) {
    const t = i / N;
    const p = bez(p0, p1, p2, p3, t);
    if (i) length += Math.hypot(p.x - pts[i - 1].x, p.y - pts[i - 1].y);
    pts.push({ ...p, t, s: length });
  }
  const tAt = (s) => {
    let i = 1;
    while (i < N && pts[i].s < s) i += 1;
    const a = pts[i - 1];
    const b = pts[i];
    return a.t + (b.t - a.t) * (b.s === a.s ? 0 : (s - a.s) / (b.s - a.s));
  };
  const points = [];
  let last = null;
  for (let i = 0; i <= steps; i += 1) {
    const u = i / steps;
    const s = length * easing(u);
    const t = tAt(s);
    const p = bez(p0, p1, p2, p3, t);
    const d = bezTangent(p0, p1, p2, p3, clamp(t, 0.001, 0.999));
    let angle = (Math.atan2(d.y, d.x) * 180) / Math.PI;
    if (last !== null) {
      while (angle - last > 180) angle -= 360;
      while (angle - last < -180) angle += 360;
    }
    last = angle;
    points.push({ u, x: p.x, y: p.y, s, angle });
  }
  const f = (n) => n.toFixed(1);
  const d = `M${f(p0.x)} ${f(p0.y)}C${f(p1.x)} ${f(p1.y)} ${f(p2.x)} ${f(p2.y)} ${f(p3.x)} ${f(p3.y)}`;
  return { points, length, d };
}

// A comet trail along the path: a soft glow and a fine line, drawn up to the
// rocket and no further, `reach` of the way back at most.
function trail(svg, path, duration, reach = 0.45) {
  const tail = Math.min(320, path.length * reach);
  svg.setAttribute("viewBox", `0 0 ${window.innerWidth} ${window.innerHeight}`);
  svg.innerHTML =
    `<path d="${path.d}" stroke="rgba(121,186,55,0.22)" stroke-width="10" style="filter:blur(4px)"/>` +
    `<path d="${path.d}" stroke="rgba(91,152,48,0.55)" stroke-width="2"/>`;
  const frames = path.points.map((p) => ({ offset: p.u, strokeDashoffset: `${(tail - p.s).toFixed(1)}px` }));
  return Array.from(svg.querySelectorAll("path")).map((line) => {
    line.style.strokeDasharray = `${tail} ${path.length + tail}`;
    line.style.strokeDashoffset = `${tail}px`;
    return line.animate(frames, { duration, easing: "linear", fill: "forwards" });
  });
}

// Soft puffs from the nozzle, drifting down and to the left.
function puff(smoke, size, big = false) {
  const el = document.createElement("i");
  el.className = "puff";
  el.style.left = `${(NOZZLE.x / 24) * size}px`;
  el.style.top = `${(NOZZLE.y / 24) * size}px`;
  smoke.appendChild(el);
  const ang = (135 * Math.PI) / 180 + (Math.random() - 0.5) * (big ? 2.4 : 1.2);
  const dist = (big ? 0.6 + Math.random() * 1.1 : 0.3 + Math.random() * 0.4) * size;
  const grow = big ? 1.6 + Math.random() * 2 : 0.8 + Math.random() * 0.9;
  el.animate(
    [
      { transform: "translate(0, 0) scale(0.35)", opacity: 0.95 },
      { transform: `translate(${(Math.cos(ang) * dist).toFixed(1)}px, ${(Math.sin(ang) * dist).toFixed(1)}px) scale(${grow.toFixed(2)})`, opacity: 0 },
    ],
    { duration: (big ? 1000 : 640) + Math.random() * 360, easing: "cubic-bezier(0.2, 0.8, 0.3, 1)", fill: "forwards" }
  ).finished.then(() => el.remove(), () => el.remove());
}

// The page clears in a soft wave from where the rocket left, under the nav,
// which stays put: the intake has the same one.
function clearFrom(at) {
  const reach = Math.max(
    Math.hypot(at.x, at.y),
    Math.hypot(window.innerWidth - at.x, at.y),
    Math.hypot(at.x, window.innerHeight - at.y),
    Math.hypot(window.innerWidth - at.x, window.innerHeight - at.y)
  );
  const size = Math.ceil(reach * 2.5);
  const veil = document.createElement("div");
  veil.className = "launch-veil";
  veil.setAttribute("aria-hidden", "true");
  veil.style.cssText = `left:${at.x}px;top:${at.y}px;width:${size}px;height:${size}px`;
  document.body.appendChild(veil);
  live.push(veil);
  return veil.animate(
    [
      { transform: "translate(-50%, -50%) scale(0.02)", opacity: 0.5 },
      { transform: "translate(-50%, -50%) scale(1)", opacity: 1 },
    ],
    { duration: T.veil, easing: "cubic-bezier(0.55, 0, 0.35, 1)", fill: "forwards" }
  );
}

// Off to the intake, once the page is clear and the rocket is gone.
function depart(href, ready) {
  let gone = false;
  const go = () => {
    if (gone) return;
    gone = true;
    try {
      window.sessionStorage.setItem(KEY, String(Date.now()));
    } catch (_err) {
      // The intake just opens the ordinary way.
    }
    window.location.href = href;
  };
  Promise.all(ready).then(go, go);
  window.setTimeout(go, T.cap);
}

/** Lift off from `from` (a button or link) and open `href` once it's gone. */
export function launch(href, from) {
  if (busy) return;
  if (reduceMotion || !document.body.animate) {
    window.location.href = href;
    return;
  }
  busy = true;
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const size = vw < 640 ? 40 : 46;
  // The button's own rocket, if it is already up; otherwise its arrow or icon.
  const glyph = from && from.querySelector(".cta-rocket");
  const armed = glyph && Number(getComputedStyle(glyph).opacity) > 0.5;
  const anchor = (armed && glyph) || (from && (from.querySelector(".ico-arrow") || from.querySelector(".ico"))) || from;
  const box = anchor ? anchor.getBoundingClientRect() : { left: vw / 2, top: vh / 2, width: 0, height: 0 };
  const at = { x: box.left + box.width / 2, y: box.top + box.height / 2 };
  const grow = armed ? box.width / size : 0.3;
  // Near the top there is no room to climb, so it drops out under the button first.
  const drop = at.y < vh * 0.22 ? 76 : 0;
  const start = { x: at.x, y: at.y + drop };

  if (from) {
    from.classList.add("is-launching");
    live.push(from);
  }

  const layer = document.createElement("div");
  layer.className = "launch";
  layer.setAttribute("aria-hidden", "true");
  layer.innerHTML =
    '<svg class="launch-trail"></svg>' +
    `<div class="launch-pad" style="left:${start.x - size / 2}px;top:${start.y - size / 2}px;width:${size}px;height:${size}px">` +
    `<div class="launch-glow"></div><div class="launch-smoke"></div><div class="launch-fly"><div class="launch-pop">${rocketSVG()}</div></div></div>`;
  document.body.appendChild(layer);
  live.push(layer);
  const pad = layer.querySelector(".launch-pad");
  const fly = layer.querySelector(".launch-fly");
  const smoke = layer.querySelector(".launch-smoke");
  const rocket = layer.querySelector(".rocket");

  // Out of the button, already burning.
  rocket.classList.add("is-lit");
  rocket.style.setProperty("--power", "0.9");
  layer.querySelector(".launch-pop").animate(
    [
      armed
        ? { transform: `translate(0, ${-drop}px) scale(${grow.toFixed(3)})`, opacity: 1 }
        : { transform: `translate(${-size * 0.12}px, ${size * 0.2 - drop}px) scale(0.3)`, opacity: 0 },
      { transform: "none", opacity: 1 },
    ],
    { duration: T.pop + 120, easing: "cubic-bezier(0.34, 1.56, 0.64, 1)", fill: "backwards" }
  );
  pad.classList.add("is-lit");
  fly.classList.add("is-rumbling");
  let puffing = true;
  const smolder = () => {
    if (!puffing) return;
    puff(smoke, size);
    window.setTimeout(smolder, 50 + Math.random() * 30);
  };
  smolder();

  // The exit: up and to the right, off the top of the screen.
  const end = { x: Math.min(start.x + clamp(vw * 0.3, 160, 440), vw + 60), y: -size * 1.6 };
  const reach = Math.hypot(end.x - start.x, end.y - start.y);
  const heading = { x: Math.SQRT1_2, y: -Math.SQRT1_2 };
  const p1 = { x: start.x + heading.x * reach * 0.32, y: start.y + heading.y * reach * 0.32 };
  const p2 = { x: end.x - reach * 0.06, y: end.y + reach * 0.42 };
  const path = walk(start, p1, p2, end, 36, easeIn);

  const flown = new Promise((resolve) => {
    window.setTimeout(() => {
      puffing = false;
      fly.classList.remove("is-rumbling");
      sound.play("send");
      for (let i = 0; i < 12; i += 1) puff(smoke, size, true);
      const crouch = fly.animate([{ transform: "none" }, { transform: "translate(-2px, 2px) scale(1.05, 0.94)" }], {
        duration: T.crouch,
        easing: "ease-in",
        fill: "forwards",
      });
      const veiled = clearFrom(at).finished;
      window.setTimeout(() => {
        crouch.cancel();
        pad.classList.remove("is-lit");
        rocket.style.setProperty("--power", "1.5");
        trail(layer.querySelector(".launch-trail"), path, T.flight);
        const frames = path.points.map((p) => ({
          offset: p.u,
          transform: `translate(${(p.x - start.x).toFixed(2)}px, ${(p.y - start.y).toFixed(2)}px) rotate(${(p.angle - HEADING).toFixed(2)}deg)`,
        }));
        const move = fly.animate(frames, { duration: T.flight, easing: "linear", fill: "forwards" });
        Promise.all([move.finished, veiled]).then(resolve, resolve);
      }, T.crouch);
    }, T.pop);
  });
  depart(href, [flown]);
}

/* The footer's own rocket: it heats while the button is hovered, and on a
   press it rumbles and leaves from where it stands. */
function initFooter() {
  const slot = document.querySelector("[data-end-rocket]");
  const rocket = slot && slot.querySelector(".rocket");
  const end = slot && slot.closest(".end");
  if (!rocket) return null;
  const heat = (on) => {
    rocket.style.setProperty("--power", on ? "1.15" : "0.5");
    slot.classList.toggle("is-rumbling", on);
    end.classList.toggle("is-hot", on);
  };
  document.querySelectorAll("[data-launch]").forEach((button) => {
    button.addEventListener("pointerenter", () => heat(true));
    button.addEventListener("pointerleave", () => heat(false));
    button.addEventListener("focus", () => heat(true));
    button.addEventListener("blur", () => heat(false));
  });
  return (href, button) => {
    // Scrolled past it, the button launches its own.
    const box = slot.getBoundingClientRect();
    if (box.bottom < 90 || box.top > window.innerHeight) {
      launch(href, button);
      return;
    }
    if (busy) return;
    busy = true;
    button.classList.add("is-launching");
    live.push(button);
    sound.play("send");
    slot.classList.remove("is-rumbling");
    rocket.style.setProperty("--power", "1.5");
    const flight = slot.animate(
      [
        { transform: "none" },
        { transform: "translate(-3px, 3px) scale(1.04, 0.95)", offset: 0.18 },
        { transform: "translate(55vw, -75vh) scale(0.7)" },
      ],
      { duration: 760, easing: "cubic-bezier(0.55, 0, 0.75, 0.2)", fill: "forwards" }
    );
    live.push(flight);
    const veiled = new Promise((resolve) => {
      window.setTimeout(() => clearFrom({ x: box.left + box.width / 2, y: box.top + box.height / 2 }).finished.then(resolve, resolve), 160);
    });
    depart(href, [flight.finished, veiled]);
  };
}

/* The intake and its script are fetched as soon as a visitor heads for a
   link to it, so the page is there the moment the rocket is gone. */
let fetched = false;
function prefetch(href) {
  if (fetched) return;
  fetched = true;
  [href, new URL("js/intake.js", ROOT).href].forEach((url) => {
    const link = document.createElement("link");
    link.rel = "prefetch";
    link.href = url;
    document.head.appendChild(link);
  });
}

// The small rocket behind a booking button's arrow. The footer's button has
// the big one above it instead.
function arm(link) {
  if (link.hasAttribute("data-launch") || !link.classList.contains("btn")) return;
  const arrow = link.querySelector(".ico-arrow");
  if (!arrow || arrow.parentElement.classList.contains("cta-ico")) return;
  const wrap = document.createElement("span");
  wrap.className = "cta-ico";
  arrow.replaceWith(wrap);
  wrap.appendChild(arrow);
  wrap.insertAdjacentHTML("beforeend", `<span class="cta-rocket" aria-hidden="true">${rocketSVG()}</span>`);
  const rocket = wrap.querySelector(".rocket");
  rocket.classList.add("is-lit");
  rocket.style.setProperty("--power", "0.6");
}

const intakeLink = (node) => {
  const link = node && node.closest && node.closest("a[href]");
  if (!link || link.target === "_blank") return null;
  const url = new URL(link.href, window.location.href);
  return url.origin === window.location.origin && INTAKE.test(url.pathname) ? link : null;
};

export function initLaunches() {
  // Already on the intake: its links just reload it.
  if (INTAKE.test(window.location.pathname)) return;
  const footer = initFooter();
  document.querySelectorAll("a.btn[href]").forEach((link) => {
    if (intakeLink(link)) arm(link);
  });

  const intent = (event) => {
    const link = intakeLink(event.target);
    if (!link) return;
    prefetch(link.href);
    // A button drawn after the page started (a case page's) gets its rocket
    // now, a frame before its hover look applies, so the rocket still rises.
    if (link.classList.contains("btn") && !link.querySelector(".cta-ico")) {
      link.classList.add("is-arming");
      arm(link);
      requestAnimationFrame(() => requestAnimationFrame(() => link.classList.remove("is-arming")));
    }
  };
  document.addEventListener("pointerover", intent, { passive: true });
  document.addEventListener("focusin", intent);
  document.addEventListener("touchstart", intent, { passive: true });

  document.addEventListener("click", (event) => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const link = intakeLink(event.target);
    if (!link) return;
    event.preventDefault();
    if (footer && link.hasAttribute("data-launch")) footer(link.href, link);
    else launch(link.href, link);
  });

  // Back from the intake, the page is as it was: no veil, no rocket gone.
  window.addEventListener("pageshow", (event) => {
    if (!event.persisted) return;
    live.splice(0).forEach((item) => {
      if (typeof item.cancel === "function") item.cancel();
      else if (item.classList && item.classList.contains("is-launching")) item.classList.remove("is-launching");
      else if (item.remove) item.remove();
    });
    busy = false;
  });
}

/**
 * The other half, on the intake: the rocket rises from below the page on its
 * trail, banks left and comes round onto the start of the progress bar,
 * straightening out along it as the bar draws out under it; then the first
 * question rises. html.landing (set before the first paint) asks for it.
 */
export function landOn(rk) {
  const html = document.documentElement;
  if (!html.classList.contains("landing")) return;
  const finish = () => html.classList.remove("landing", "landing-go");
  const rocket = rk && rk.querySelector(".rocket");
  if (!rocket || !rk.animate || reduceMotion) {
    finish();
    return;
  }
  const box = rk.getBoundingClientRect();
  const to = { x: box.left + box.width / 2, y: box.top + box.height / 2 };
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const from = { x: Math.max(to.x + 80, vw * 0.42), y: vh + 90 };
  const p1 = { x: Math.max(to.x + 30, vw * 0.16), y: vh * 0.55 };
  const p2 = { x: Math.max(12, to.x - 140), y: to.y + 90 };
  const path = walk(from, p1, p2, to, 36, easeOut);

  const layer = document.createElement("div");
  layer.className = "launch";
  layer.setAttribute("aria-hidden", "true");
  layer.innerHTML = '<svg class="launch-trail"></svg>';
  document.body.appendChild(layer);
  trail(layer.querySelector(".launch-trail"), path, T.land, 0.26);

  rocket.style.setProperty("--power", "1.4");
  html.classList.add("landing-go");
  // It faces where it is going, then lines up with the bar as it touches down.
  const level = (u) => {
    const k = clamp((u - 0.72) / 0.28, 0, 1);
    return 1 - k * k * (3 - 2 * k);
  };
  const frames = path.points.map((p) => ({
    offset: p.u,
    translate: `${(p.x - to.x).toFixed(2)}px ${(p.y - to.y).toFixed(2)}px`,
    rotate: `${(p.angle * level(p.u)).toFixed(2)}deg`,
  }));
  const move = rk.animate(frames, { duration: T.land, easing: "linear" });
  let settled = false;
  const settle = () => {
    if (settled) return;
    settled = true;
    rocket.style.setProperty("--power", "0.85");
    rk.classList.add("is-landed");
    const fade = layer.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 300, easing: "ease-out", fill: "forwards" });
    fade.finished.then(() => layer.remove(), () => layer.remove());
    window.setTimeout(() => {
      rk.classList.remove("is-landed");
      finish();
    }, 1100);
  };
  move.finished.then(settle, settle);
  window.setTimeout(settle, T.land + 400);
}
