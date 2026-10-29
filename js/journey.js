/*
 * How we work: a pinned night sky. Scrolling flies the rocket along its path
 * from the proof, through the build, to launch; each stop brings up what the
 * client gets and what they pay at that stage. The flame burns harder the
 * faster you scroll, and settles to a glow when you stop.
 */

import { clamp, damp, flameScale, onFrame, reduceMotion, sound } from "./site.js";

// The path, as fractions of the track's box: a gentle climb with two swells.
const SHAPE = [
  [0.015, 0.7],
  [0.17, 0.7, 0.23, 0.3, 0.36, 0.36],
  [0.49, 0.42, 0.55, 0.86, 0.68, 0.66],
  [0.8, 0.47, 0.86, 0.18, 0.985, 0.3],
];
const STOPS = [0.07, 0.5, 0.93];

export function initJourney(section) {
  if (!section) return;
  const track = section.querySelector("[data-jtrack]");
  const svg = track && track.querySelector("svg");
  const base = svg && svg.querySelector(".base");
  const done = svg && svg.querySelector(".done");
  const rocketSlot = section.querySelector("[data-jrocket]");
  const stops = Array.from(section.querySelectorAll("[data-stop]"));
  const panels = Array.from(section.querySelectorAll("[data-panel]"));
  if (!track || !base || !done || !rocketSlot) return;

  if (reduceMotion) {
    section.classList.add("is-static");
    panels.forEach((panel) => panel.classList.add("is-on"));
    return;
  }

  const rocket = rocketSlot.querySelector(".rocket");
  const flame = rocket && rocket.querySelector(".rk-flame");
  if (rocket) rocket.classList.add("is-lit");

  let length = 1;
  let w = 0;
  let h = 0;
  let stage = -1;

  const layout = () => {
    w = track.clientWidth;
    h = track.clientHeight;
    svg.setAttribute("viewBox", `0 0 ${w} ${h}`);
    const [m, ...curves] = SHAPE;
    let d = `M${(m[0] * w).toFixed(1)} ${(m[1] * h).toFixed(1)}`;
    curves.forEach((c) => {
      d += `C${(c[0] * w).toFixed(1)} ${(c[1] * h).toFixed(1)} ${(c[2] * w).toFixed(1)} ${(c[3] * h).toFixed(1)} ${(c[4] * w).toFixed(1)} ${(c[5] * h).toFixed(1)}`;
    });
    base.setAttribute("d", d);
    done.setAttribute("d", d);
    length = base.getTotalLength();
    done.style.strokeDasharray = `${length} ${length}`;
    stops.forEach((stop, i) => {
      const p = base.getPointAtLength(length * STOPS[i]);
      stop.style.transform = `translate(${p.x}px, ${p.y}px) translate(-50%, -7px)`;
    });
  };
  layout();
  if ("ResizeObserver" in window) new ResizeObserver(layout).observe(track);
  else window.addEventListener("resize", layout);

  const setStage = (next) => {
    if (next === stage) return;
    // Reaching a new milestone on the way forward is worth a quiet tick.
    if (stage >= 0 && next > stage) sound.play("checkpoint", { level: 0.85 });
    stage = next;
    // Only the current stage shows; all three stay readable to screen readers.
    panels.forEach((panel, i) => panel.classList.toggle("is-on", i === next));
    stops.forEach((stop, i) => {
      stop.classList.toggle("is-on", i === next);
      stop.classList.toggle("is-past", i < next);
    });
  };
  setStage(0);

  let progress = 0;
  let shown = 0;
  let power = 0.5;
  let active = false;

  const target = () => {
    const r = section.getBoundingClientRect();
    const span = r.height - window.innerHeight;
    return span > 0 ? clamp(-r.top / span, 0, 1) : 0;
  };

  const place = (dt) => {
    const before = shown;
    progress = target();
    shown = dt ? damp(shown, progress, 7, dt) : progress;
    const f = STOPS[0] + (STOPS[2] - STOPS[0]) * shown;
    const s = length * f;
    const p = base.getPointAtLength(s);
    const a = base.getPointAtLength(Math.max(0, s - 2));
    const b = base.getPointAtLength(Math.min(length, s + 2));
    const angle = (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI + 45;
    rocketSlot.style.transform = `translate(${p.x.toFixed(1)}px, ${p.y.toFixed(1)}px) rotate(${angle.toFixed(1)}deg)`;
    done.style.strokeDashoffset = String(length - s);

    // Thrust follows the speed of travel.
    const speed = dt ? Math.abs(shown - before) / dt : 0;
    power = damp(power, clamp(0.45 + speed * 9, 0.45, 1.5), 6, dt || 1);
    if (flame) flame.style.transform = flameScale(power);

    setStage(shown < 0.27 ? 0 : shown < 0.73 ? 1 : 2);
  };
  place(0);

  let stop = null;
  const io = new IntersectionObserver(
    (entries) => {
      active = entries[0].isIntersecting;
      if (active && !stop) stop = onFrame(place);
      if (!active && stop) {
        stop();
        stop = null;
      }
    },
    { rootMargin: "20% 0px 20% 0px" }
  );
  io.observe(section);
}
