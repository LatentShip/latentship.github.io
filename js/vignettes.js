/*
 * Live sketches of the products we built, drawn in HTML so they stay sharp and
 * light. Each one ticks only while it is on screen. The numbers are made up
 * and labelled as such.
 */

import { reduceMotion } from "./site.js";

// Dollars; per-ounce metal prices keep their cents.
const usd = (n, cents = false) =>
  `$${(cents ? n : Math.round(n)).toLocaleString("en-US", cents ? { minimumFractionDigits: 2, maximumFractionDigits: 2 } : {})}`;
const oz = (n) => usd(n, true);
const barIcon =
  '<svg viewBox="0 0 24 24" fill="none" stroke="#e6f6f7" stroke-width="1.7" stroke-linejoin="round"><path d="M3.5 16.5 6.5 10h11l3 6.5h-17Z"/><path d="M7.5 10 9.5 6h5l2 4"/></svg>';

const RATES = [
  ["Bayview Bullion", 4018.4],
  ["Cedar Ridge Metals", 4019.1],
  ["Lakeshore Gold Exchange", 4020.25],
  ["Northgate Precious Metals", 4021.6],
];

const MOVERS = [
  ["Gold up 0.44%", "as the dollar eases. Expect firmer local rates at the open."],
  ["Silver steady", "after a volatile week. Industrial demand is holding up."],
  ["Gold dips 0.2%", "on profit-taking. Local premiums are unchanged."],
];

export function vignette(kind) {
  if (kind === "rates") {
    return `<div class="vg" data-vg="rates">
      <div class="vg-rates">
        <div class="vg-row"><span class="vg-app"><span class="vg-icon">${barIcon}</span>Live Rates</span><span class="vg-live">LIVE</span></div>
        <div class="vg-tabs"><span class="on">Gold .9999</span><span>Silver .999</span></div>
        <p class="vg-cap">SELL RATES · 1 OZ</p>
        <div class="vg-list">${RATES.map(
          ([name, price], i) =>
            `<div class="vg-item${i === 0 ? " best" : ""}" data-i="${i}" style="transform:translateY(${i * 35}px)"><span class="n">${name}</span><span class="tag">BEST</span><span class="p">${oz(price)}</span></div>`
        ).join("")}</div>
        <div class="vg-mover"><span class="vg-ai">AI</span><span data-k="mover"><b>${MOVERS[0][0]}</b> ${MOVERS[0][1]}</span></div>
      </div>
      <span class="vg-note">Illustrative rates</span>
    </div>`;
  }
  if (kind === "desk") {
    return `<div class="vg" data-vg="desk">
      <div class="vg-desk">
        <div class="vg-panel">
          <div class="vg-row"><span class="vg-cap" style="margin:0">PRICE FORMULA</span><span class="vg-live">LIVE</span></div>
          <div class="vg-row" style="margin-top:6px;font-weight:600;font-size:13px">Gold .9999 · 1 oz</div>
          <div class="vg-formula">
            <div class="vg-row"><span>COMEX gold benchmark</span><b data-k="mcx">${oz(4011.2)}</b></div>
            <div class="vg-row"><span>Premium</span><b>+ ${oz(12.5)}</b></div>
            <div class="vg-row"><span>Markup · Retail</span><b>+ ${oz(6)}</b></div>
            <div class="vg-row vg-sum"><span>Your sell rate</span><b data-k="sell">${oz(4029.7)}</b></div>
          </div>
        </div>
        <div class="vg-order" data-k="order"><span class="vg-buy">BUY</span><div><span data-k="who">Main Street Jewelers</span><small data-k="qty">5 × Gold .9999 · 1 oz</small></div><b data-k="amt">${oz(20148.5)}</b></div>
        <div class="vg-hedge"><span class="vg-ai">AI</span><span>Exposure</span><span class="vg-meter"><i data-k="meter" style="--w:34%"></i></span><span data-k="exp">+35 oz</span></div>
      </div>
      <span class="vg-note">Illustrative</span>
    </div>`;
  }
  if (kind === "sync") {
    return `<div class="vg" data-vg="sync">
      <div class="vg-sync">
        <div class="vg-tally">
          <div class="vg-row" style="font-size:10px;font-weight:600;margin-bottom:4px"><span>Desktop books · Journal</span><span style="color:#6b778c;font-weight:500">Office PC</span></div>
          <div data-k="rows">
            <div class="r"><span>Oct 6</span><span>Sales · Main Street</span><b>${usd(20149)}</b></div>
            <div class="r"><span>Oct 6</span><span>Receipt · Harbor</span><b>${usd(24000)}</b></div>
            <div class="r"><span>Oct 5</span><span>Purchase · Cedar</span><b>${usd(113260)}</b></div>
          </div>
        </div>
        <svg class="vg-beam" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><path d="M0 0C55 0 45 100 100 100"/></svg>
        <div class="vg-cloud">
          <div class="vg-row"><span>Your Bullion House</span><span class="vg-sync-pill" data-k="pill">● IN SYNC</span></div>
          <div class="vg-tiles"><div><small>RECEIVABLES</small><b data-k="recv">${usd(184230)}</b></div><div><small>CASH &amp; BANK</small><b data-k="cash">${usd(421578)}</b></div></div>
          <div class="vg-flag"><span class="vg-ai">AI</span><span>PB-0881 · Sales tax doesn't match the ledger</span><em>Review</em></div>
        </div>
      </div>
      <span class="vg-note">Illustrative</span>
    </div>`;
  }
  if (kind === "thrive") {
    return `<div class="vg" data-vg="thrive">
      <div class="vg-thrive">
        <div class="vg-card">
          <p class="vg-cap">GROWTH PROFILE</p>
          <div class="vg-ring"><svg viewBox="0 0 36 36"><circle class="bg" cx="18" cy="18" r="15.9155"/><circle class="fg" data-k="ring" cx="18" cy="18" r="15.9155" pathLength="100" style="stroke-dashoffset:100"/></svg><b data-k="tq">0</b></div>
          <p class="vg-arch">Your archetype<b>Revealed</b></p>
        </div>
        <div class="vg-card vg-chat">
          <div class="vg-bubble" data-b="0"><small>COMPANION · DAY 7</small>Last week you said Mondays drain you. Want to plan this one differently?</div>
          <div class="vg-bubble me" data-b="1">Yes. Start with the 1:1 I keep putting off.</div>
          <div class="vg-bubble" data-b="2"><span class="vg-dots"><i></i><i></i><i></i></span></div>
        </div>
        <div class="vg-card vg-sim"><span class="vg-ai" style="background:#00c9b8">SIM</span><span>Hard conversation · debrief</span><span class="score" data-k="score">8.4 / 10</span></div>
      </div>
      <span class="vg-note">Illustrative</span>
    </div>`;
  }
  return "";
}

/* ───────── Motion ───────── */

const players = {
  rates(el) {
    const items = Array.from(el.querySelectorAll(".vg-item"));
    const mover = el.querySelector('[data-k="mover"]');
    const prices = RATES.map((r) => r[1]);
    let tick = 0;
    return () => {
      tick += 1;
      const n = 1 + Math.floor(Math.random() * 2);
      for (let k = 0; k < n; k += 1) {
        const i = Math.floor(Math.random() * prices.length);
        const delta = Math.round((Math.random() - 0.5) * 22) / 10 || 0.2;
        prices[i] += delta;
        const p = items[i].querySelector(".p");
        p.textContent = oz(prices[i]);
        p.classList.remove("up", "down");
        void p.offsetWidth;
        p.classList.add(delta > 0 ? "up" : "down");
        window.setTimeout(() => p.classList.remove("up", "down"), 700);
      }
      const order = prices.map((p, i) => [p, i]).sort((a, b) => a[0] - b[0]);
      order.forEach(([, i], rank) => {
        items[i].style.transform = `translateY(${rank * 35}px)`;
        items[i].classList.toggle("best", rank === 0);
      });
      if (tick % 4 === 0 && mover) {
        const [b, rest] = MOVERS[(tick / 4) % MOVERS.length];
        mover.innerHTML = `<b>${b}</b> ${rest}`;
      }
    };
  },

  desk(el) {
    const q = (k) => el.querySelector(`[data-k="${k}"]`);
    const buyers = [
      ["Main Street Jewelers", 5],
      ["Harbor Coin & Gold", 2],
      ["Cedar Ridge Jewelers", 8],
      ["Westside Gold Buyers", 3],
    ];
    let bench = 4011.2;
    let tick = 0;
    let exposure = 35;
    return () => {
      tick += 1;
      bench += Math.round((Math.random() - 0.48) * 9) / 10;
      q("mcx").textContent = oz(bench);
      q("sell").textContent = oz(bench + 18.5);
      if (tick % 3 === 1) {
        const [who, qty] = buyers[(tick / 3) % buyers.length | 0];
        q("who").textContent = who;
        q("qty").textContent = `${qty} × Gold .9999 · 1 oz`;
        q("amt").textContent = oz((bench + 18.5) * qty);
        q("order").classList.add("is-on");
        exposure = exposure > 85 ? 25 : exposure + qty * 4;
        q("exp").textContent = `+${exposure} oz`;
        q("meter").style.setProperty("--w", `${Math.min(96, 20 + exposure * 0.85)}%`);
      } else if (tick % 3 === 0) {
        q("order").classList.remove("is-on");
      }
    };
  },

  sync(el) {
    const rows = el.querySelector('[data-k="rows"]');
    const pill = el.querySelector('[data-k="pill"]');
    const recv = el.querySelector('[data-k="recv"]');
    const cash = el.querySelector('[data-k="cash"]');
    const entries = [
      ["Oct 7", "Sales · Harbor Coin", 22840],
      ["Oct 7", "Payment · Bank", 18500],
      ["Oct 7", "Receipt · Westside", 31250],
      ["Oct 8", "Sales · Cedar Ridge", 91200],
    ];
    let r = 184230;
    let c = 421578;
    let tick = 0;
    return () => {
      const [d, what, amt] = entries[tick % entries.length];
      tick += 1;
      const row = document.createElement("div");
      row.className = "r new";
      row.innerHTML = `<span>${d}</span><span>${what}</span><b>${usd(amt)}</b>`;
      rows.prepend(row);
      while (rows.children.length > 3) rows.lastElementChild.remove();
      pill.textContent = "● SYNCING";
      pill.style.color = "#f5b942";
      window.setTimeout(() => {
        if (what.startsWith("Sales")) r += amt;
        else if (what.startsWith("Receipt")) {
          r -= amt;
          c += amt;
        } else c -= amt;
        recv.textContent = usd(r);
        cash.textContent = usd(c);
        pill.textContent = "● IN SYNC";
        pill.style.color = "";
      }, 700);
    };
  },

  // The ring fills once; after that each round only nudges the score up or
  // down from where it is, so nothing ever snaps back to empty.
  thrive(el) {
    const ring = el.querySelector('[data-k="ring"]');
    const tq = el.querySelector('[data-k="tq"]');
    const bubbles = Array.from(el.querySelectorAll(".vg-bubble"));
    const score = el.querySelector('[data-k="score"]');
    let tick = 0;
    let shown = 0;
    const count = (to) => {
      const from = shown;
      const start = performance.now();
      const step = (now) => {
        const k = Math.min(1, (now - start) / 1400);
        shown = Math.round(from + (to - from) * (1 - (1 - k) ** 3));
        tq.textContent = String(shown);
        if (k < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };
    return () => {
      const phase = tick % 6;
      tick += 1;
      if (phase === 0) {
        bubbles.forEach((b) => b.classList.remove("is-on"));
        const to = tick === 1 ? 72 : 68 + Math.round(Math.random() * 8);
        ring.style.strokeDashoffset = String(100 - to);
        count(to);
      }
      if (phase >= 1 && phase <= 3) bubbles[phase - 1].classList.add("is-on");
      if (phase === 4 && score) score.textContent = `${(7.6 + Math.random() * 1.6).toFixed(1)} / 10`;
    };
  },
};

const INTERVAL = { rates: 1700, desk: 1500, sync: 2600, thrive: 1300 };

// Each sketch has a fixed size; it is scaled to sit comfortably in its frame.
function fit(el) {
  const inner = el.firstElementChild;
  if (!inner || !inner.offsetWidth) return;
  const max = parseFloat(getComputedStyle(el).getPropertyValue("--vg-max")) || 1;
  const s = Math.min(max, (el.clientWidth * 0.86) / inner.offsetWidth, (el.clientHeight * 0.76) / inner.offsetHeight);
  inner.style.transform = `scale(${s.toFixed(3)})`;
}

// Refitted when the frame changes size, and when the sketch itself does (its
// text settling once the fonts arrive).
const sizer =
  "ResizeObserver" in window
    ? new ResizeObserver((entries) => entries.forEach((e) => fit(e.target.matches("[data-vg]") ? e.target : e.target.parentElement)))
    : null;

export function playVignettes(root = document) {
  const els = Array.from(root.querySelectorAll("[data-vg]")).filter((el) => !el.dataset.vgReady);
  els.forEach((el) => {
    el.dataset.vgReady = "1";
    fit(el);
    if (sizer) {
      sizer.observe(el);
      if (el.firstElementChild) sizer.observe(el.firstElementChild);
    }
    const make = players[el.dataset.vg];
    if (!make) return;
    const step = make(el);
    if (reduceMotion) {
      if (el.dataset.vg === "thrive") step();
      return;
    }
    let timer = 0;
    const start = () => {
      if (timer) return;
      step();
      timer = window.setInterval(step, INTERVAL[el.dataset.vg] || 2000);
    };
    const stop = () => {
      window.clearInterval(timer);
      timer = 0;
    };
    if (!("IntersectionObserver" in window)) {
      start();
      return;
    }
    new IntersectionObserver((entries) => (entries[0].isIntersecting && !document.hidden ? start() : stop()), {
      threshold: 0.25,
    }).observe(el);
  });
}
