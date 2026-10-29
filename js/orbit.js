/*
 * Hero visual three, "orbit": the real products, in a slowly turning ring.
 *
 * Six things we shipped (live sketches of the orob family and Thrive Ever,
 * and screens from Aaroha Academy and Bilkool Ezee) circle in 3D. Drag or
 * flick to spin it; let go and it glides, then settles on a product with a
 * soft snap. The name of the one in front sits underneath with a link to its
 * case, and pressing that front card opens it.
 */

import { sound } from "./sound.js";
import { clamp, icon, onFrame, reduceMotion } from "./util.js";
import { bySlug, media } from "./work.js";
import { playVignettes } from "./vignettes.js";

const SLUGS = ["orob-desk", "thrive-ever", "orob", "aaroha-academy", "orob-sync", "bilkool-ezee"];
const ROOT = new URL("../", import.meta.url);

export function mountOrbit(el) {
  el.dataset.kind = "orbit";
  el.removeAttribute("aria-hidden");
  const projects = SLUGS.map(bySlug).filter(Boolean);
  const n = projects.length;
  const step = 360 / n;
  el.innerHTML = `<div class="orbit" aria-label="Products we shipped"><div class="orbit-ring">${projects
    .map(
      (p, i) =>
        `<div class="orbit-card${p.media.dark ? " is-dark" : ""}" data-i="${i}" style="--tint:${p.media.tint || "var(--paper-2)"}">${media(p)}<a href="${new URL(`work/${p.slug}/`, ROOT).href}" aria-label="${p.name}" tabindex="-1"></a></div>`
    )
    .join("")}</div></div><p class="orbit-name" aria-live="polite"></p>`;

  const stage = el.querySelector(".orbit");
  const ring = el.querySelector(".orbit-ring");
  const cards = Array.from(el.querySelectorAll(".orbit-card"));
  const name = el.querySelector(".orbit-name");
  playVignettes(el);

  let cw = 300;
  let ch = 200;
  let radius = 420;
  const layout = () => {
    // The cards fit the room the hero leaves: about half its height.
    const w = el.clientWidth;
    ch = Math.round(clamp(el.clientHeight * 0.5, 110, 200));
    cw = Math.round(Math.min(ch * 1.5, w * 0.62));
    radius = Math.round(cw / 2 / Math.tan(Math.PI / n) + cw * 0.18);
    el.style.setProperty("--cw", `${cw}px`);
    el.style.setProperty("--ch", `${ch}px`);
    cards.forEach((card, i) => {
      card.style.transform = `rotateY(${i * step}deg) translateZ(${radius}px)`;
    });
  };
  layout();
  const sizer = "ResizeObserver" in window ? new ResizeObserver(layout) : null;
  if (sizer) sizer.observe(el);

  let angle = 0; // the ring's turn, in degrees
  let velocity = 0; // degrees per second
  let dragging = false;
  let settling = null;
  let front = -1;
  let userMoved = false;
  let visible = true;
  let stop = null;
  let lastX = 0;
  let lastT = 0;
  let moved = 0;
  let idle = 0;
  const HOLD = 2.6; // seconds each product stays in front when left alone

  const frontIndex = () => {
    const a = ((-angle % 360) + 360) % 360;
    return Math.round(a / step) % n;
  };

  const showName = (i) => {
    const p = projects[i];
    name.innerHTML = `<span class="swap"><small>${p.client}</small> ${p.name} <a href="${new URL(`work/${p.slug}/`, ROOT).href}">View case${icon.arrow}</a></span>`;
  };

  const paint = () => {
    ring.style.transform = `translateZ(${-radius * 0.55}px) rotateX(-7deg) rotateY(${angle}deg)`;
    cards.forEach((card, i) => {
      const facing = Math.cos(((i * step + angle) * Math.PI) / 180);
      card.style.filter = `brightness(${(0.62 + 0.38 * Math.max(0, facing)).toFixed(3)}) saturate(${(0.7 + 0.3 * Math.max(0, facing)).toFixed(3)})`;
      card.style.pointerEvents = facing > 0.85 ? "auto" : "none";
    });
    const f = frontIndex();
    if (f !== front) {
      front = f;
      showName(f);
    }
  };

  const tick = (dt) => {
    if (dragging) {
      paint();
      return;
    }
    if (settling !== null) {
      // Ease onto the nearest card, then rest.
      const diff = settling - angle;
      angle += diff * (1 - Math.exp(-dt * 4.2));
      if (Math.abs(diff) < 0.05) {
        angle = settling;
        settling = null;
        velocity = 0;
      }
    } else if (Math.abs(velocity) > 4) {
      angle += velocity * dt;
      velocity *= Math.exp(-dt * 2.2);
    } else if (userMoved) {
      settling = Math.round(angle / step) * step;
      userMoved = false;
      idle = -2;
      sound.play("snap", { level: 0.8 });
    } else if (!reduceMotion) {
      // Left alone, it turns one product at a time and lets each one sit.
      idle += dt;
      if (idle > HOLD) {
        idle = 0;
        settling = (Math.round(angle / step) - 1) * step;
      }
    }
    paint();
  };

  const run = () => {
    if (!stop && visible && !document.hidden) stop = onFrame(tick);
  };
  const pause = () => {
    if (stop) stop();
    stop = null;
  };

  stage.addEventListener("pointerdown", (event) => {
    dragging = true;
    settling = null;
    moved = 0;
    idle = 0;
    lastX = event.clientX;
    lastT = performance.now();
    velocity = 0;
    stage.classList.add("is-dragging");
    stage.setPointerCapture(event.pointerId);
  });
  stage.addEventListener("pointermove", (event) => {
    if (!dragging) return;
    const now = performance.now();
    const dx = event.clientX - lastX;
    moved += Math.abs(dx);
    angle += dx * 0.28;
    velocity = clamp((dx * 0.28) / Math.max(0.008, (now - lastT) / 1000), -900, 900);
    lastX = event.clientX;
    lastT = now;
  });
  const release = () => {
    if (!dragging) return;
    dragging = false;
    stage.classList.remove("is-dragging");
    if (moved > 4) userMoved = true;
    if (performance.now() - lastT > 80) velocity = 0;
  };
  stage.addEventListener("pointerup", release);
  stage.addEventListener("pointercancel", release);
  // A drag is not a click on the card under it.
  stage.addEventListener(
    "click",
    (event) => {
      if (moved > 4) {
        event.preventDefault();
        event.stopPropagation();
      }
    },
    true
  );

  const io =
    "IntersectionObserver" in window
      ? new IntersectionObserver((entries) => {
          visible = entries[0].isIntersecting;
          if (visible) run();
          else pause();
        })
      : null;
  if (io) io.observe(el);
  const onVisibility = () => (document.hidden ? pause() : run());
  document.addEventListener("visibilitychange", onVisibility);
  paint();

  return {
    start() {
      run();
    },
    destroy() {
      pause();
      if (io) io.disconnect();
      if (sizer) sizer.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      el.innerHTML = "";
      el.setAttribute("aria-hidden", "true");
    },
  };
}
