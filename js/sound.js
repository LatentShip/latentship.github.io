/*
 * The site's interface sound: one shared player (uisfx, the Minimal pack)
 * behind semantic cues. Code asks for what happened ("open", "select",
 * "success"), never for a file; the sounds are made in the browser, so
 * nothing downloads.
 *
 * Rules (from the UI SFX guide):
 * - Nothing plays before the browser allows it, and until then every cue is
 *   dropped, not queued. Browsers allow sound after a press, a tap or a key on
 *   the page, and some carry that over from an earlier page of the same site
 *   (or trust a returning visitor); there, sound starts as soon as the page
 *   loads, so a visitor who only scrolls still hears it. The audio is prepared
 *   in quiet moments after load, so the first cue is heard at once.
 * - Sound only reinforces something visible; one cue per interaction.
 *   Scrolling, hover and anything frequent or already obvious stay silent.
 * - Every cue lands near the same loudness (LEVELS), so none is lost under
 *   music and none startles.
 * - The visitor can turn it off; the choice is kept in this browser, and
 *   turning it off stops everything at once. Reduced motion is not a mute.
 *
 *   import { sound } from './sound.js';
 *   sound.play('open');            // null when dropped; fine
 *   sound.setEnabled(false);
 */

import { createUISFX } from "./vendor/uisfx.js";

const PACK = "minimal";
const KEY = "latentship:sound";

// Each cue's gain, measured so they land at about the same loudness: the
// loudest 50 ms of each Minimal cue, as RMS, brought to -28 dBFS (-29 to -30
// for small, frequent ones like a selection, -26 for outcomes worth noticing).
// The pack's own defaults spread over 10 dB. Measured with uisfx 0.4.0.
const LEVELS = {
  open: 0.163,
  close: 0.156,
  "toggle-on": 0.176,
  "toggle-off": 0.163,
  expand: 0.197,
  collapse: 0.198,
  select: 0.173,
  swipe: 0.239,
  back: 0.191,
  forward: 0.181,
  "progress-step": 0.214,
  checkpoint: 0.162,
  blocked: 0.18,
  success: 0.218,
  error: 0.178,
  send: 0.239,
  copy: 0.226,
  snap: 0.195,
  complete: 0.205,
};

const CUES = Object.keys(LEVELS);

// Browsers let audio start inside a real press: a mouse button going down, a
// finger lifting, a tap or a key (arrow keys and the space bar included, so
// scrolling by keyboard counts). A scroll wheel or trackpad never does.
const GESTURES = ["pointerdown", "pointerup", "touchend", "click", "keydown"];
const grants = (event) =>
  event.type === "keydown" ||
  event.type === "click" ||
  event.type === "touchend" ||
  (event.type === "pointerdown") === (event.pointerType === "mouse");
const idle = (fn) => (window.requestIdleCallback ? window.requestIdleCallback(fn, { timeout: 1200 }) : window.setTimeout(fn, 200));

let player = null;
let unlocked = false;
let started = false;
const watchers = new Set();

const ensure = () => {
  if (!player) player = createUISFX({ pack: PACK, volume: 1, preferences: { key: KEY } });
  return player;
};

// Each cue is drawn once ahead of time, one per quiet moment, so the first
// press only has to wake the audio, which is instant.
const prepare = () => {
  if (!ensure().isEnabled()) return;
  const list = [...CUES];
  const next = () => {
    const cue = list.shift();
    if (cue) idle(() => player.preload([cue]).then(next, next));
  };
  next();
};

function open() {
  return ensure()
    .unlock()
    .catch(() => false)
    .then((ok) => {
      if (ok && !unlocked) {
        unlocked = true;
        GESTURES.forEach((type) => window.removeEventListener(type, wake, true));
      }
      return unlocked;
    });
}

function wake(event) {
  if (unlocked || !event.isTrusted || !grants(event) || !ensure().isEnabled()) return;
  open();
}

const pressing = () => Boolean(navigator.userActivation && navigator.userActivation.isActive);

export const sound = {
  start() {
    if (started || typeof window === "undefined") return;
    started = true;
    GESTURES.forEach((type) => window.addEventListener(type, wake, true));
    // Where the browser already allows sound, it starts now, without a press.
    const early = () => {
      prepare();
      if (ensure().isEnabled()) idle(open);
    };
    if (document.readyState === "complete") idle(early);
    else window.addEventListener("load", () => idle(early), { once: true });
    document.addEventListener("visibilitychange", () => {
      if (document.hidden && player) player.stopAll();
    });
  },

  // A one-shot cue at its measured level, times `level`. Returns the playing
  // sound, or null when it was dropped (no press yet, or sound is off).
  play(cue, { level = 1, ...options } = {}) {
    if (!(unlocked || (player && pressing())) || !ensure().isEnabled()) return null;
    const base = LEVELS[cue];
    const handle = player.play(cue, base === undefined ? options : { ...options, volume: Math.min(1, base * level) });
    if (handle) window.dispatchEvent(new CustomEvent("ls-sound", { detail: { cue } }));
    return handle;
  },

  enabled() {
    return ensure().isEnabled();
  },

  setEnabled(on) {
    const p = ensure();
    if (!on) p.stopAll();
    p.setEnabled(on);
    watchers.forEach((fn) => fn(on));
    // Turned on, it says so: this press asked for sound.
    if (on) {
      if (unlocked) sound.play("toggle-on");
      else open().then((ok) => ok && sound.play("toggle-on"));
      prepare();
    }
  },

  onChange(fn) {
    watchers.add(fn);
    return () => watchers.delete(fn);
  },
};
