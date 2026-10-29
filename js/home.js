/*
 * The home page: the rocket's intro, the hero visual, the journey, the work,
 * the FAQ and the launch at the bottom.
 */

import { faq } from "./content.js";
import { initHero } from "./hero.js";
import { initIntro } from "./intro.js";
import { initJourney } from "./journey.js";
import { observeInView, reduceMotion, sound, track } from "./site.js";
import { renderFeatured } from "./work.js";

const intro = initIntro();
initHero(document.querySelector("[data-visual]"), intro.go);
initJourney(document.querySelector("[data-journey]"));
renderFeatured(document.querySelector("[data-featured]"));
observeInView(".cap");
initDiff();
renderFaq();

/* The usual way, struck through as each row reaches the reader. */
function initDiff() {
  const rows = document.querySelectorAll("[data-diff] .diff-row:not(.diff-head)");
  if (reduceMotion || !("IntersectionObserver" in window)) {
    rows.forEach((row) => row.classList.add("is-flipped"));
    return;
  }
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting || entry.boundingClientRect.top < 0) {
          entry.target.classList.add("is-flipped");
          io.unobserve(entry.target);
        }
      });
    },
    { rootMargin: "0px 0px -36% 0px" }
  );
  rows.forEach((row) => io.observe(row));
}

/* FAQ: native <details>, opened and closed with a height animation. */
function renderFaq() {
  const list = document.querySelector("[data-faq]");
  if (!list) return;
  list.innerHTML = faq
    .map(
      (item) =>
        `<details class="qa"><summary>${item.q}<span class="qa-ico" aria-hidden="true"></span></summary><div class="qa-body"><p>${item.a}</p></div></details>`
    )
    .join("");

  list.querySelectorAll(".qa").forEach((details) => {
    const summary = details.querySelector("summary");
    const body = details.querySelector(".qa-body");
    let anim = null;
    summary.addEventListener("click", (event) => {
      const opening = !details.open;
      sound.play(opening ? "expand" : "collapse");
      if (opening) track("faq_open", { question: summary.textContent.trim().slice(0, 80) });
      if (reduceMotion || !body.animate) return;
      event.preventDefault();
      if (anim) anim.cancel();
      if (!opening) {
        const h = body.offsetHeight;
        anim = body.animate([{ height: `${h}px`, opacity: 1 }, { height: "0px", opacity: 0 }], {
          duration: 380,
          easing: "cubic-bezier(0.65, 0, 0.35, 1)",
          fill: "forwards",
        });
        anim.onfinish = () => {
          details.open = false;
          anim.cancel();
          anim = null;
        };
      } else {
        details.open = true;
        const h = body.offsetHeight;
        anim = body.animate([{ height: "0px", opacity: 0 }, { height: `${h}px`, opacity: 1 }], {
          duration: 520,
          easing: "cubic-bezier(0.22, 1, 0.36, 1)",
        });
        anim.onfinish = () => (anim = null);
      }
    });
  });

  // Answers for search engines too.
  const ld = document.createElement("script");
  ld.type = "application/ld+json";
  ld.textContent = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  });
  document.head.appendChild(ld);
}
