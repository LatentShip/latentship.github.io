/*
 * The home hero's visual. Three to choose from:
 *   flow      messy workflow in, working product out (the default)
 *   assembly  the things we build, built in front of you
 *   orbit     the real products, turning in a ring
 * ?hero=assembly or ?hero=orbit shows another; ?compare=1 adds a switch at
 * the bottom of the screen to flip between them.
 */

import { mountFlow } from "./flow.js";
import { sound } from "./sound.js";

const KINDS = {
  flow: async () => mountFlow,
  assembly: async () => (await import("./assembly.js")).mountAssembly,
  orbit: async () => (await import("./orbit.js")).mountOrbit,
};
const LABELS = { flow: "Flow", assembly: "Assembly", orbit: "Orbit" };
const DEFAULT = "flow";

export function initHero(el, go) {
  if (!el) return;
  const params = new URLSearchParams(window.location.search);
  let kind = KINDS[params.get("hero")] ? params.get("hero") : DEFAULT;
  let current = null;
  let started = false;

  const show = async (next) => {
    const mount = await KINDS[next]();
    if (current) current.destroy();
    kind = next;
    current = mount(el);
    if (started) current.start();
  };

  show(kind).then(() => go.then(() => {
    started = true;
    if (current) current.start();
  }));

  if (!params.has("compare")) return;
  const bar = document.createElement("div");
  bar.className = "hero-compare";
  bar.innerHTML = `<span>Hero</span>${Object.keys(KINDS)
    .map((k) => `<button type="button" data-hero-kind="${k}" aria-pressed="${k === kind}">${LABELS[k]}</button>`)
    .join("")}`;
  document.body.appendChild(bar);
  bar.addEventListener("click", (event) => {
    const b = event.target.closest("[data-hero-kind]");
    if (!b || b.dataset.heroKind === kind) return;
    bar.querySelectorAll("[data-hero-kind]").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
    sound.play("select");
    show(b.dataset.heroKind);
    const url = new URL(window.location.href);
    url.searchParams.set("hero", b.dataset.heroKind);
    window.history.replaceState(null, "", url);
  });
}
