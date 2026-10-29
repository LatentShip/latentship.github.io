/*
 * The intake: five quick questions, one at a time.
 *
 * Pick with a click or a letter key (A to D) and it moves on by itself; Enter
 * continues from a text answer (Shift+Enter for a new line). The answers ride
 * to the intake API (worker/src/index.js) in the values it accepts, with the
 * exact words picked written into the brief. Turnstile loads only once the
 * last question is reached. ?dry=1 runs the whole flow without sending.
 * Arriving from a launch (js/launch.js), the rocket lands on the progress bar.
 */

import { intake, site } from "./content.js";
import { initIntro } from "./intro.js";
import { landOn } from "./launch.js";
import { icon, mountRockets, reduceMotion, sound, track } from "./site.js";

const form = document.querySelector("[data-intake]");
const progress = document.querySelector(".intake-progress");
const navButtons = document.querySelector("[data-intake-nav]");
const KEYS = ["A", "B", "C", "D"];
const STORE = "ls-intake";
const DRY = new URLSearchParams(window.location.search).has("dry");

const esc = (value) =>
  String(value).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

const QUESTIONS = [
  { key: "need", type: "pick", title: "What do you want to build?", hint: "Pick the closest. We&rsquo;ll get into the details on the call.", options: intake.need },
  { key: "stage", type: "pick", title: "Where are you starting from?", hint: "", options: intake.stage },
  { key: "brief", type: "text", title: "In a sentence or two, what&rsquo;s the workflow or idea?", hint: "Plain words are perfect. No spec needed." },
  { key: "timeline", type: "pick", title: "When do you want it live?", hint: "", options: intake.timeline },
  { key: "contact", type: "contact", title: "Where should we send the next step?", hint: "We review every intake within 24 to 48 hours. No newsletters, ever." },
];
const TOTAL = QUESTIONS.length;

const state = { need: -1, stage: -1, brief: "", timeline: -1, firstName: "", email: "", company: "" };
try {
  Object.assign(state, JSON.parse(window.sessionStorage.getItem(STORE) || "{}"));
} catch (_err) {
  // Nothing saved yet.
}
const save = () => {
  try {
    window.sessionStorage.setItem(STORE, JSON.stringify(state));
  } catch (_err) {
    // Private mode: answers just won't survive a refresh.
  }
};

let at = 0;
let moving = false;
let sending = false;
let started = false;

function stepMarkup(q, i) {
  const num = `<p class="step-num">${String(i + 1).padStart(2, "0")} <span class="muted">/ ${String(TOTAL).padStart(2, "0")}</span></p>`;
  const tag = i === 0 ? "h1" : "h2";
  const title = `<${tag} id="q-${q.key}">${q.title}</${tag}>`;
  const hint = q.hint ? `<p class="hint">${q.hint}</p>` : "";
  let body = "";
  if (q.type === "pick") {
    body = `<div class="opts" role="radiogroup" aria-labelledby="q-${q.key}">${q.options
      .map(
        (o, j) =>
          `<button type="button" class="opt" role="radio" aria-checked="false" data-value="${j}"><span class="key" aria-hidden="true">${KEYS[j]}</span><span>${esc(o.label)}${o.sub ? `<span class="sub">${esc(o.sub)}</span>` : ""}</span><span class="tick" aria-hidden="true">${icon.check}</span></button>`
      )
      .join("")}</div>`;
  } else if (q.type === "text") {
    body = `<div class="field"><label class="sr-only" for="f-brief">Your workflow or idea</label><textarea class="textarea" id="f-brief" name="brief" rows="2" maxlength="3600" placeholder=""></textarea></div>
      <div class="step-actions"><button class="btn btn-dark" type="button" data-next>OK${icon.check}</button><span class="enter-hint">press <kbd>Enter &crarr;</kbd></span></div>`;
  } else {
    body = `<div class="fields fields-contact">
        <div class="field"><label for="f-name">First name</label><input class="input" id="f-name" name="firstName" autocomplete="given-name" maxlength="80" placeholder="Jane"></div>
        <div class="field"><label for="f-company">Company</label><input class="input" id="f-company" name="company" autocomplete="organization" maxlength="120" placeholder="Company name"></div>
        <div class="field wide"><label for="f-email">Work email</label><input class="input" id="f-email" name="email" type="email" inputmode="email" autocomplete="email" maxlength="200" placeholder="jane@company.com"></div>
      </div>
      <div class="turnstile-slot" data-turnstile></div>
      <p class="form-error" role="alert"></p>
      <div class="step-actions"><button class="btn btn-primary btn-lg" type="submit" data-submit>Request my call${icon.arrow}</button><span class="enter-hint">press <kbd>Enter &crarr;</kbd></span></div>`;
    return `<section class="step" data-step="${i}" data-key="${q.key}"${i ? " hidden" : ""}>${num}${title}${hint}${body}</section>`;
  }
  return `<section class="step" data-step="${i}" data-key="${q.key}"${i ? " hidden" : ""}>${num}${title}${hint}${body}<p class="form-error" role="alert"></p></section>`;
}

function doneMarkup() {
  const booking = site.bookingUrl
    ? `<a class="btn btn-primary btn-lg" href="${site.bookingUrl}" target="_blank" rel="noopener">Pick a time now${icon.arrow}</a>`
    : "";
  return `<section class="step done" data-step="done" hidden tabindex="-1">
    <div class="done-rocket" data-done-rocket></div>
    <h2 data-done-title>You&rsquo;re on our radar.</h2>
    <p class="hint">We review every intake within 24 to 48 hours. Here&rsquo;s what happens next:</p>
    <ol>
      <li>We read your brief and come to the call prepared.</li>
      <li>We email you to find 15 minutes that suit you.</li>
      <li>You leave the call knowing exactly what we&rsquo;d build first.</li>
    </ol>
    <div class="step-actions">${booking}<a class="btn btn-ghost btn-lg" href="../work/">See our work</a></div>
  </section>`;
}

const steps = () => Array.from(form.querySelectorAll(".step[data-step]"));
const stepEl = (i) => form.querySelector(`.step[data-step="${i}"]`);
const errorEl = (i) => stepEl(i).querySelector(".form-error");

function setProgress(i) {
  if (!progress) return;
  const p = Math.max(0.03, i / TOTAL);
  progress.style.setProperty("--p", p.toFixed(3));
  const rail = progress.querySelector(".rail");
  progress.style.setProperty("--px", `${(rail ? rail.clientWidth : 0) * Math.min(1, i / TOTAL)}px`);
}

function focusStep(i) {
  const el = stepEl(i);
  if (!el) return;
  const target =
    el.querySelector('.opt[aria-checked="true"]') ||
    el.querySelector(".opt") ||
    el.querySelector("textarea") ||
    Array.from(el.querySelectorAll("input")).find((input) => !input.value) ||
    el.querySelector("input");
  if (target) target.focus({ preventScroll: true });
}

function fill() {
  QUESTIONS.forEach((q, i) => {
    if (q.type === "pick" && state[q.key] >= 0) {
      stepEl(i).querySelectorAll(".opt").forEach((o) => o.setAttribute("aria-checked", String(Number(o.dataset.value) === state[q.key])));
    }
  });
  const brief = form.querySelector("#f-brief");
  if (brief) brief.value = state.brief || "";
  ["firstName", "email", "company"].forEach((k) => {
    const input = form.querySelector(`[name="${k}"]`);
    if (input) input.value = state[k] || "";
  });
  placeholder();
}

// The brief's example follows what they said they want to build.
function placeholder() {
  const brief = form.querySelector("#f-brief");
  const need = intake.need[state.need] || intake.need[0];
  if (brief) brief.placeholder = need.placeholder;
}

function grow(textarea) {
  textarea.style.height = "auto";
  textarea.style.height = `${Math.min(textarea.scrollHeight + 2, 260)}px`;
}

function validate(i) {
  const q = QUESTIONS[i];
  if (!q) return "";
  if (q.type === "pick") return state[q.key] >= 0 ? "" : "Pick one to continue.";
  if (q.type === "text") return (state.brief || "").trim().length >= 12 ? "" : "A sentence or two helps us prepare (12 characters or more).";
  if (!state.firstName.trim()) return "What should we call you?";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(state.email.trim())) return "That email doesn't look right.";
  if (!state.company.trim()) return "Which company is this for?";
  return "";
}

function go(next, dir = 1) {
  if (moving || next === at || next < 0) return;
  const from = stepEl(at);
  const to = next === "done" ? form.querySelector('[data-step="done"]') : stepEl(next);
  if (!to) return;
  moving = true;
  const back = dir < 0;
  const finish = () => {
    from.hidden = true;
    from.classList.remove("is-leaving", "is-back");
    to.classList.remove("is-entering", "is-back");
    moving = false;
  };
  to.hidden = false;
  if (reduceMotion) {
    finish();
  } else {
    from.classList.toggle("is-back", back);
    to.classList.toggle("is-back", back);
    from.classList.add("is-leaving");
    to.classList.add("is-entering");
    // The old question is gone (220 ms) before the new one arrives (from 200 ms).
    window.setTimeout(() => {
      from.hidden = true;
      from.classList.remove("is-leaving", "is-back");
      moving = false;
    }, 230);
    window.setTimeout(() => to.classList.remove("is-entering", "is-back"), 800);
  }
  at = next;
  if (next === "done") {
    setProgress(TOTAL);
  } else {
    setProgress(next);
    if (QUESTIONS[next].type === "contact") loadTurnstile();
    window.setTimeout(() => focusStep(next), reduceMotion ? 0 : 120);
  }
  updateNav();
}

// auto: moving on by itself after a pick, which has already sounded.
function next(auto = false) {
  if (at === "done") return;
  const message = validate(at);
  errorEl(at).textContent = message;
  if (message) {
    sound.play("blocked");
    const el = stepEl(at);
    if (!reduceMotion && el.animate) {
      el.animate([{ transform: "translateX(0)" }, { transform: "translateX(-6px)" }, { transform: "translateX(5px)" }, { transform: "translateX(0)" }], {
        duration: 320,
        easing: "ease-out",
      });
    }
    return;
  }
  if (!started) {
    started = true;
    track("lead_form_start", { page: "get-started" });
  }
  track("lead_form_step_complete", { step: at + 1, key: QUESTIONS[at].key });
  // A typed answer, or a pick moved on by hand, gets a step.
  if (QUESTIONS[at].type === "text" || (QUESTIONS[at].type === "pick" && !auto)) sound.play("progress-step");
  if (at < TOTAL - 1) go(at + 1, 1);
  else submit();
}

function back() {
  if (at === "done" || at === 0 || moving) return;
  sound.play("back");
  go(at - 1, -1);
}

function updateNav() {
  if (!navButtons) return;
  navButtons.hidden = at === "done";
  navButtons.querySelector(".up").disabled = at === 0 || at === "done";
  navButtons.querySelector(".down").disabled = at === "done" || at === TOTAL - 1;
}

function pick(i, value) {
  const q = QUESTIONS[i];
  if (state[q.key] !== value) sound.play("select");
  state[q.key] = value;
  save();
  const el = stepEl(i);
  el.querySelectorAll(".opt").forEach((o) => {
    const on = Number(o.dataset.value) === value;
    o.setAttribute("aria-checked", String(on));
    o.classList.toggle("is-picked", on);
  });
  errorEl(i).textContent = "";
  if (q.key === "need") placeholder();
  window.setTimeout(() => {
    if (at === i) next(true);
  }, reduceMotion ? 120 : 420);
}

/* ───────── Turnstile ───────── */

let turnstileLoading = null;
let widgetId = null;
let pending = null;

function loadTurnstile() {
  if (DRY || turnstileLoading) return turnstileLoading;
  turnstileLoading = new Promise((resolve, reject) => {
    if (window.turnstile) return resolve();
    const s = document.createElement("script");
    s.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("Turnstile script failed to load."));
    document.head.appendChild(s);
  });
  return turnstileLoading;
}

async function turnstileToken() {
  await loadTurnstile();
  const started = Date.now();
  while (!(window.turnstile && window.turnstile.render)) {
    if (Date.now() - started > 10000) throw new Error("Turnstile did not load.");
    await new Promise((r) => window.setTimeout(r, 80));
  }
  if (widgetId === null) {
    widgetId = window.turnstile.render(form.querySelector("[data-turnstile]"), {
      sitekey: site.lead.turnstileSiteKey,
      action: site.lead.turnstileAction,
      appearance: "interaction-only",
      execution: "execute",
      callback: (token) => pending && pending.resolve(token),
      "error-callback": () => pending && pending.reject(new Error("verification failed")),
      "expired-callback": () => pending && pending.reject(new Error("verification expired")),
    });
  }
  const cached = window.turnstile.getResponse(widgetId);
  if (cached) return cached;
  return new Promise((resolve, reject) => {
    pending = { resolve, reject };
    window.turnstile.execute(widgetId);
    window.setTimeout(() => reject(new Error("verification timed out")), 20000);
  }).finally(() => {
    pending = null;
  });
}

/* ───────── Sending ───────── */

function payload() {
  const need = intake.need[state.need];
  const stage = intake.stage[state.stage];
  const when = intake.timeline[state.timeline];
  const brief = [`What: ${need.label}`, `Starting from: ${stage.label}`, `When: ${when.label}`, "", state.brief.trim()].join("\n");
  return {
    needType: need.send,
    projectBrief: brief.slice(0, 3990),
    timeline: when.send,
    firstName: state.firstName.trim(),
    email: state.email.trim(),
    company: state.company.trim(),
    submittedAt: new Date().toISOString(),
    source: site.lead.source,
    page: window.location.href.slice(0, 380),
  };
}

function setSending(on) {
  sending = on;
  const button = form.querySelector("[data-submit]");
  if (button) {
    button.disabled = on;
    button.innerHTML = on ? "Sending&hellip;" : `Request my call${icon.arrow}`;
  }
}

async function submit() {
  if (sending) return;
  const err = errorEl(TOTAL - 1);
  err.textContent = "";

  const honeypot = form.querySelector('[name="website"]');
  if (honeypot && honeypot.value.trim()) {
    done();
    return;
  }

  const body = payload();
  track("lead_form_submit", { needType: body.needType, timeline: body.timeline });
  setSending(true);
  try {
    if (DRY) {
      await new Promise((r) => window.setTimeout(r, 900));
    } else {
      body.turnstileToken = await turnstileToken();
      const res = await fetch(site.lead.endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        let message = `status ${res.status}`;
        try {
          const data = await res.json();
          if (data && typeof data.error === "string") message = data.error;
        } catch (_err) {
          // Keep the status.
        }
        throw new Error(message);
      }
    }
    track("lead_form_submit_success", { provider: "resend" });
    sound.play("success");
    done();
  } catch (error) {
    if (widgetId !== null && window.turnstile) window.turnstile.reset(widgetId);
    track("lead_form_submit_error", { message: String(error && error.message).slice(0, 120) });
    sound.play("error");
    err.innerHTML = /verif|turnstile/i.test(String(error && error.message))
      ? "We couldn&rsquo;t verify the request. Please try again."
      : `Something went wrong sending this. Please try again, or email <a href="mailto:${site.email}">${site.email}</a>.`;
  } finally {
    setSending(false);
  }
}

function done() {
  const title = form.querySelector("[data-done-title]");
  if (title && state.firstName.trim()) title.innerHTML = `You&rsquo;re on our radar, ${esc(state.firstName.trim())}.`;
  try {
    window.sessionStorage.removeItem(STORE);
  } catch (_err) {
    // Fine.
  }
  // The rocket on the progress bar takes off; a new one waits on the done screen.
  const rk = progress && progress.querySelector(".rk");
  const rocket = rk && rk.querySelector(".rocket");
  if (rocket && rk.animate && !reduceMotion) {
    rocket.style.setProperty("--power", "1.4");
    rk.animate([{ translate: "0 0", opacity: 1 }, { translate: "40vw -30vh", opacity: 0 }], {
      duration: 900,
      easing: "cubic-bezier(0.55, 0, 0.75, 0.2)",
      fill: "forwards",
    });
  }
  const slot = form.querySelector("[data-done-rocket]");
  if (slot && !slot.childElementCount) {
    slot.setAttribute("data-rocket", "lit");
    mountRockets(form);
  }
  go("done", 1);
  window.setTimeout(() => {
    const el = form.querySelector('[data-step="done"]');
    if (el) el.focus({ preventScroll: true });
  }, 450);
}

/* ───────── Wiring ───────── */

function init() {
  if (!form) return;
  form.insertAdjacentHTML("beforeend", QUESTIONS.map(stepMarkup).join("") + doneMarkup());
  fill();
  setProgress(0);
  updateNav();

  form.addEventListener("click", (event) => {
    const opt = event.target.closest(".opt");
    if (opt) {
      const i = Number(opt.closest(".step").dataset.step);
      pick(i, Number(opt.dataset.value));
      return;
    }
    if (event.target.closest("[data-next]")) next();
  });

  form.addEventListener("input", (event) => {
    const t = event.target;
    if (t.id === "f-brief") {
      state.brief = t.value;
      grow(t);
    } else if (t.name in state) {
      state[t.name] = t.value;
    }
    const step = t.closest(".step");
    if (step) step.querySelector(".form-error").textContent = "";
    save();
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (at === TOTAL - 1) next();
  });

  document.addEventListener("keydown", (event) => {
    if (at === "done" || event.metaKey || event.ctrlKey || event.altKey) return;
    const q = QUESTIONS[at];
    const tag = event.target.tagName;
    if (q.type === "pick") {
      const k = event.key.toUpperCase();
      const idx = KEYS.indexOf(k) >= 0 ? KEYS.indexOf(k) : ["1", "2", "3", "4"].indexOf(event.key);
      if (idx >= 0 && idx < q.options.length && tag !== "INPUT" && tag !== "TEXTAREA") {
        event.preventDefault();
        pick(at, idx);
        stepEl(at).querySelectorAll(".opt")[idx].focus({ preventScroll: true });
        return;
      }
      if (event.key === "ArrowDown" || event.key === "ArrowUp") {
        const opts = Array.from(stepEl(at).querySelectorAll(".opt"));
        const cur = opts.indexOf(document.activeElement);
        if (cur >= 0) {
          event.preventDefault();
          opts[(cur + (event.key === "ArrowDown" ? 1 : -1) + opts.length) % opts.length].focus();
        }
        return;
      }
      if (event.key === "Enter" && !event.target.closest(".opt")) {
        event.preventDefault();
        next();
      }
      return;
    }
    if (event.key !== "Enter") return;
    if (q.type === "text") {
      if (event.shiftKey) return;
      event.preventDefault();
      next();
      return;
    }
    if (q.type === "contact" && tag === "INPUT") {
      event.preventDefault();
      const inputs = Array.from(stepEl(at).querySelectorAll("input"));
      const i = inputs.indexOf(event.target);
      const empty = inputs.find((input) => !input.value.trim());
      if (empty && empty !== event.target) empty.focus();
      else if (i < inputs.length - 1 && !inputs[i + 1].value.trim()) inputs[i + 1].focus();
      else next();
    }
  });

  if (navButtons) {
    navButtons.querySelector(".up").addEventListener("click", back);
    navButtons.querySelector(".down").addEventListener("click", () => next());
  }
  window.addEventListener("resize", () => setProgress(at === "done" ? TOTAL : at));

  window.setTimeout(() => focusStep(0), 500);
}

initIntro();
init();
landOn(progress && progress.querySelector(".rk"));
