/*
 * The page's own pointer, on a mouse or trackpad: a clean rounded arrow at a
 * normal pointer's size, in the brand green with a white edge and a soft
 * green underglow. Moved fast, a jet fires out of its tail and stretches with
 * the speed, then dies away as it slows. ?cursor=rocket swaps the arrow for a
 * slim version of the logo's rocket, with the same jet.
 *
 * It has a little weight: it follows the mouse on a short, time-based spring
 * (the same feel at any frame rate, settled the moment the mouse stops) and
 * leans a few degrees into fast moves. Pressing snaps it onto the exact spot
 * and pushes it in until the button is let go. Over something that does
 * something it swells a little, and an element with data-cursor-label shows
 * that label beside it. Over a text field the system's text cursor takes
 * over; on touch screens, with forced colours or without the script, nothing
 * changes.
 */

import { clamp, reduceMotion } from "./util.js";

const ACTIVE = 'a, button, summary, label, select, [role="button"], [role="tab"], [role="menuitem"], [data-tilt], .orbit';
const TEXT = 'input:not([type="checkbox"]):not([type="radio"]):not([type="range"]), textarea, [contenteditable="true"]';

// The jet: a teardrop drawn pointing down from its base, turned to leave the
// tail, with a bright core.
const JET =
  '<g class="cur-jet"><path class="cur-jet-outer" d="M-2.6 0C-2.6 4.2-1.2 9 0 14 1.2 9 2.6 4.2 2.6 0 2.6-1.6-2.6-1.6-2.6 0Z"/>' +
  '<path class="cur-jet-core" d="M-1.2 0C-1.2 2.3-.55 5 0 7.8.55 5 1.2 2.3 1.2 0 1.2-.9-1.2-.9-1.2 0Z"/></g>';

// The arrow, as on Brand Bento: drawn twice, a wide white edge under the
// green body. Its tail is the notch, so the jet leaves from there.
const ARROW_PATH = '<path d="M3.6 3.4 20.8 9.3 13.4 12.7 9.6 20.1z"/>';
const ARROW =
  `<g transform="translate(12.9 12.2) rotate(-46.5)">${JET}</g>` +
  `<g class="cur-edge">${ARROW_PATH}</g><g class="cur-body">${ARROW_PATH}</g>`;

// The logo's rocket (js/rocket.js), slimmed across its body, then turned a
// quarter left so its nose points up and left like an arrow.
const ROCKET_BODY =
  '<path d="M18.196 15.759c6.363-6.464 4.385-13.443 4.298-13.737-.097-.323-.348-.576-.67-.672-.291-.088-7.207-2.073-13.552 4.372l-4.641 4.714c-.63.641-.9 1.553-.719 2.44.175.862.755 1.576 1.557 1.908 1.154.479 2.107 1.101 2.896 1.896.768.78 1.353 1.791 1.869 2.95 1.041 2.336 3.666 1.747 4.321.844l4.641-4.715Z"/>';
const ROCKET_FINS =
  '<path d="M2.206 9.034 6.847 4.32c.45-.457.904-.877 1.359-1.262-1.382-.48-2.856-.22-3.73.192-1.688.795-2.935 2.844-3.072 3.075-.075.127-.121.268-.135.415-.021.215-.129 1.627.358 3.012.167-.255.36-.495.578-.717Z"/>' +
  '<path d="M20.638 19.608c.402-.881.642-2.367.172-3.762-.364.44-.76.88-1.189 1.316l-4.641 4.715c-.233.237-.488.445-.759.624 1.365.49 2.751.386 2.964.366.151-.014.298-.062.428-.142.227-.138 2.245-1.405 3.026-3.117Z"/>';
const ROCKET_WINDOW =
  '<path d="M12.071 11.958l-.029-.029c-1.636-1.662-.703-3.106 0-3.82.611-.62 2.095-1.71 3.805 0 1.649 1.649.703 3.106 0 3.82-.61.62-2.05 1.755-3.776.029Z" transform="translate(13.95 10.03) scale(.9) translate(-13.95 -10.03)"/>';
const SLIM = "translate(11.8 11.9) rotate(-45) scale(1 .76) rotate(45) translate(-11.8 -11.9)";
const ROCKET =
  `<g transform="translate(17.9 17.8) rotate(-45)">${JET}</g>` +
  `<g transform="rotate(-90 12 12)"><g transform="${SLIM}">` +
  `<g class="cur-edge">${ROCKET_BODY}${ROCKET_FINS}</g><g class="cur-body">${ROCKET_BODY}</g><g class="cur-fin">${ROCKET_FINS}</g><g class="cur-window">${ROCKET_WINDOW}</g>` +
  "</g></g>";

// The weight: how far behind the mouse it trails, as a time constant in ms,
// and the lean: degrees per px/ms of sideways speed, at most TILT, easing
// back over TILT_EASE ms. The jet lights above IDLE px/ms.
const FOLLOW = 18;
const LEAN = 4.5;
const TILT = 5;
const TILT_EASE = 90;
const IDLE = 0.35;

export function initCursor() {
  const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
  if (!fine.matches || window.matchMedia("(forced-colors: active)").matches) return;

  const html = document.documentElement;
  const rocket = /[?&]cursor=rocket(&|$)/.test(window.location.search);
  const el = document.createElement("div");
  el.className = rocket ? "cursor is-rocket" : "cursor";
  el.setAttribute("aria-hidden", "true");
  // The lean turns it about its tip every frame; the swell and the press are
  // eased in CSS.
  el.innerHTML = `<span class="cursor-lean"><svg class="cursor-mark" viewBox="0 0 24 24">${rocket ? ROCKET : ARROW}</svg></span><span class="cursor-label"></span>`;
  document.body.appendChild(el);
  const jet = el.querySelector(".cur-jet");
  const label = el.querySelector(".cursor-label");

  const target = { x: -100, y: -100 };
  const at = { x: -100, y: -100 };
  let tilt = 0;
  let speed = 0;
  let power = 0;
  let frame = 0;
  let last = 0;

  const draw = () => {
    el.style.transform = `translate3d(${at.x.toFixed(2)}px, ${at.y.toFixed(2)}px, 0)`;
    el.style.setProperty("--tilt", `${tilt.toFixed(2)}deg`);
    jet.style.transform = `scale(${(0.55 + power * 0.45).toFixed(3)}, ${power.toFixed(3)})`;
    jet.style.opacity = power > 0.03 ? "1" : "0";
  };

  const step = (now) => {
    frame = 0;
    const dt = Math.min(48, last ? now - last : 16);
    last = now;
    const bx = at.x;
    const by = at.y;
    const k = 1 - Math.exp(-dt / FOLLOW);
    at.x += (target.x - at.x) * k;
    at.y += (target.y - at.y) * k;

    const goal = clamp(((at.x - bx) / dt) * LEAN, -TILT, TILT);
    tilt += (goal - tilt) * (1 - Math.exp(-dt / TILT_EASE));
    // The jet: quick to light, slower to die away.
    speed += (Math.hypot(at.x - bx, at.y - by) / dt - speed) * (1 - Math.exp(-dt / 60));
    const thrust = reduceMotion ? 0 : clamp((speed - IDLE) * 0.85, 0, 1.25);
    power += (thrust - power) * (1 - Math.exp(-dt / (thrust > power ? 50 : 140)));

    const moving = Math.abs(target.x - at.x) > 0.15 || Math.abs(target.y - at.y) > 0.15 || Math.abs(tilt) > 0.05 || power > 0.01;
    if (!moving) {
      at.x = target.x;
      at.y = target.y;
      tilt = 0;
      speed = 0;
      power = 0;
    }
    draw();
    if (moving) frame = requestAnimationFrame(step);
    else last = 0;
  };

  const follow = () => {
    if (reduceMotion) {
      at.x = target.x;
      at.y = target.y;
      draw();
      return;
    }
    if (!frame) frame = requestAnimationFrame(step);
  };

  // What is under it: something to press, a field to type in, a label to show.
  const read = (node) => {
    if (!(node instanceof Element)) return;
    const field = node.closest(TEXT);
    el.classList.toggle("is-text", Boolean(field));
    el.classList.toggle("is-hot", !field && Boolean(node.closest(ACTIVE)));
    const named = node.closest("[data-cursor-label]");
    const text = (named && named.dataset.cursorLabel) || "";
    if (text) label.textContent = text;
    el.classList.toggle("has-label", Boolean(text));
  };

  window.addEventListener(
    "pointermove",
    (event) => {
      if (event.pointerType !== "mouse") {
        el.classList.remove("is-on");
        return;
      }
      target.x = event.clientX;
      target.y = event.clientY;
      // The system's pointer is hidden only once ours is showing, and it
      // starts on the spot rather than flying in.
      if (!el.classList.contains("is-on")) {
        at.x = target.x;
        at.y = target.y;
        draw();
        el.classList.add("is-on");
        html.classList.add("has-cursor");
      }
      follow();
    },
    { passive: true }
  );

  document.addEventListener(
    "pointerover",
    (event) => {
      if (event.pointerType === "mouse") read(event.target);
    },
    { passive: true }
  );
  // A click can change what is under it, and so can the page gliding under a
  // still mouse or a script changing a label.
  const again = () => read(document.elementFromPoint(target.x, target.y));
  window.addEventListener("click", (event) => read(event.target));
  window.addEventListener("ls:cursor", again);
  let recheck = 0;
  window.addEventListener(
    "scroll",
    () => {
      if (recheck || !el.classList.contains("is-on")) return;
      recheck = requestAnimationFrame(() => {
        recheck = 0;
        again();
      });
    },
    { passive: true }
  );

  // Heard on the way down, before anything on the page can stop it: a press
  // lands exactly where the click does.
  window.addEventListener(
    "pointerdown",
    (event) => {
      if (event.pointerType !== "mouse") return;
      target.x = at.x = event.clientX;
      target.y = at.y = event.clientY;
      draw();
      el.classList.add("is-down");
    },
    { passive: true, capture: true }
  );
  const release = () => el.classList.remove("is-down");
  window.addEventListener("pointerup", release, { passive: true, capture: true });
  window.addEventListener("pointercancel", release, { passive: true, capture: true });
  window.addEventListener("blur", release);

  // Off the window it goes; back on, it comes back where the mouse is.
  html.addEventListener("pointerleave", () => el.classList.remove("is-on"));
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) el.classList.remove("is-on");
  });
}
