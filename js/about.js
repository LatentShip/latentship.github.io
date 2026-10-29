/*
 * About: soul.md and team.md, the files we keep in our own repo, shown the
 * way an editor would. Read mode renders the markdown; Source shows the file
 * itself. The line you are reading is highlighted, as a cursor would be.
 */

import { docs, founders } from "./content.js";
import { initIntro } from "./intro.js";
import { icon, observeReveals, reduceMotion, scrollToY, sound } from "./site.js";

const esc = (value) =>
  String(value).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

const inline = (text) =>
  esc(text)
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\*([^*]+)\*/g, "<em>$1</em>")
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');

const person = (f) => `<div class="person">
  <span class="avatar">${esc(f.initials)}</span>
  <h3>${esc(f.name)}</h3>
  <p class="role">${esc(f.role)}</p>
  <p>${esc(f.quote)}</p>
  <p class="role"><a href="mailto:${f.email}">${f.email}</a></p>
</div>`;

const mark = (n) => `<span class="ln-mark" aria-hidden="true">${n}</span>`;

function render(md) {
  const lines = md.split("\n");
  const out = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    const n = i + 1;
    let m;
    if (!line.trim()) {
      i += 1;
    } else if ((m = line.match(/^(#{1,3}) (.*)$/))) {
      const level = m[1].length;
      const id = m[2].toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
      out.push(`<h${level} id="${id}" data-ln="${n}">${mark(n)}<span class="hash" aria-hidden="true">${m[1]}</span>${inline(m[2])}</h${level}>`);
      i += 1;
    } else if (line.startsWith("> ")) {
      const buf = [];
      while (i < lines.length && lines[i].startsWith("> ")) buf.push(lines[i++].slice(2));
      out.push(`<blockquote data-ln="${n}">${mark(n)}<p>${inline(buf.join(" "))}</p></blockquote>`);
    } else if (line.startsWith("- ")) {
      const buf = [];
      while (i < lines.length && lines[i].startsWith("- ")) buf.push(lines[i++].slice(2));
      out.push(`<ul data-ln="${n}">${mark(n)}${buf.map((item) => `<li>${inline(item)}</li>`).join("")}</ul>`);
    } else if (line.trim() === "---") {
      out.push("<hr>");
      i += 1;
    } else if (line.startsWith("::people")) {
      out.push(`<div class="people" data-ln="${n}">${founders.map(person).join("")}</div>`);
      i += 1;
    } else if (line.startsWith("::tags ")) {
      const tags = line.slice(7).split(",").map((t) => t.trim());
      out.push(`<div class="tags" data-ln="${n}">${mark(n)}${tags.map((t) => `<span class="chip">${esc(t)}</span>`).join("")}</div>`);
      i += 1;
    } else if ((m = line.match(/^\[([^\]]+)\]\(([^)]+)\)$/))) {
      out.push(`<p class="cta-row" data-ln="${n}"><a class="btn btn-primary" href="${m[2]}" data-track="cta_about">${esc(m[1])}${icon.arrow}</a></p>`);
      i += 1;
    } else {
      const buf = [];
      while (i < lines.length && lines[i].trim() && !/^(#{1,3} |> |- |---|::|\[[^\]]+\]\([^)]+\)$)/.test(lines[i])) buf.push(lines[i++]);
      out.push(`<p data-ln="${n}">${mark(n)}${inline(buf.join(" "))}</p>`);
    }
  }
  return out.join("");
}

// The source view shows plain markdown, with the page's own blocks written out.
const expand = (md) =>
  md
    .split("\n")
    .flatMap((line) => {
      if (line.startsWith("::people")) {
        return founders.flatMap((f) => [`### ${f.name}`, "", `${f.role} · \`${f.email}\``, "", `> ${f.quote}`, ""]).slice(0, -1);
      }
      if (line.startsWith("::tags ")) {
        return [line.slice(7).split(",").map((t) => `\`${t.trim()}\``).join(" · ")];
      }
      return [line];
    })
    .join("\n");

function source(md) {
  return expand(md)
    .split("\n")
    .map((line) => {
      let html = esc(line);
      if (/^#{1,3} /.test(line)) html = `<span class="t-h">${html.replace(/^(#{1,3})/, '<span class="t-mark">$1</span>')}</span>`;
      else if (line.startsWith("> ")) html = `<span class="t-q"><span class="t-mark">&gt;</span>${html.slice(4)}</span>`;
      else if (line.startsWith("- ")) html = `<span class="t-mark">-</span>${html.slice(1)}`;
      else if (line.startsWith("::")) html = `<span class="t-c">${html}</span>`;
      html = html
        .replace(/\*\*([^*]+)\*\*/g, '<span class="t-mark">**</span><span class="t-b">$1</span><span class="t-mark">**</span>')
        .replace(/`([^`]+)`/g, '<span class="t-c">`$1`</span>')
        .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<span class="t-mark">[</span><span class="t-link">$1</span><span class="t-mark">]($2)</span>');
      return `<span class="l">${html || " "}</span>`;
    })
    .join("");
}

/* A segmented control with a thumb that slides to the chosen button. */
function placeThumb(seg) {
  const thumb = seg.querySelector(".seg-thumb");
  const on = seg.querySelector('[aria-selected="true"], [aria-pressed="true"]');
  if (!thumb || !on) return;
  thumb.style.width = `${on.offsetWidth}px`;
  thumb.style.transform = `translateX(${on.offsetLeft}px)`;
}

function init() {
  const files = document.querySelector("[data-files]");
  const modes = document.querySelector("[data-modes]");
  const read = document.querySelector('[data-view="read"]');
  const src = document.querySelector('[data-view="source"]');
  const pre = src && src.querySelector("pre");
  const pathEl = document.querySelector("[data-path]");
  const outline = document.querySelector("[data-outline]");
  let headingWatch = null;
  const statusFile = document.querySelector("[data-status-file]");
  const statusLn = document.querySelector("[data-status-ln]");
  if (!files || !read || !pre) return;

  let current = window.location.hash === "#team" ? "team" : "soul";
  let mode = "read";
  let reader = null;
  let typed = false;

  const followReading = () => {
    if (reader) reader.disconnect();
    if (!("IntersectionObserver" in window)) return;
    reader = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          read.querySelectorAll(".is-reading").forEach((el) => el.classList.remove("is-reading"));
          entry.target.classList.add("is-reading");
          if (statusLn) statusLn.textContent = `Ln ${entry.target.dataset.ln}, Col 1`;
        });
      },
      { rootMargin: "-42% 0px -52% 0px" }
    );
    read.querySelectorAll("[data-ln]").forEach((el) => reader.observe(el));
  };

  // The title types itself in, once.
  const typeTitle = () => {
    const h1 = read.querySelector("h1");
    if (!h1 || typed || reduceMotion) return;
    typed = true;
    const textNode = Array.from(h1.childNodes).find((n) => n.nodeType === 3);
    if (!textNode) return;
    const full = textNode.textContent;
    textNode.textContent = "";
    const caret = document.createElement("span");
    caret.className = "caret";
    h1.appendChild(caret);
    let k = 0;
    const step = () => {
      k += 1;
      textNode.textContent = full.slice(0, k);
      if (k < full.length) window.setTimeout(step, 55 + Math.random() * 50);
      else window.setTimeout(() => caret.remove(), 1600);
    };
    window.setTimeout(step, 450);
  };

  const show = (id, animate) => {
    const doc = docs.find((d) => d.id === id) || docs[0];
    current = doc.id;
    read.innerHTML = render(doc.body);
    pre.innerHTML = source(doc.body);
    if (pathEl) pathEl.textContent = doc.file;
    if (statusFile) statusFile.textContent = doc.file;
    if (statusLn) statusLn.textContent = "Ln 1, Col 1";
    files.querySelectorAll("[data-file]").forEach((b) => b.setAttribute("aria-selected", String(b.dataset.file === doc.id)));
    placeThumb(files);
    const view = mode === "read" ? read : src;
    if (animate && !reduceMotion) {
      view.classList.remove("doc-swap");
      void view.offsetWidth;
      view.classList.add("doc-swap");
    }
    followReading();
    buildOutline();
    observeReveals(read);
    if (doc.id === "soul") typeTitle();
    const hash = doc.id === "team" ? "#team" : "";
    if (window.location.hash !== hash) window.history.replaceState(null, "", hash || window.location.pathname);
  };

  // The outline: this file's sections, the one being read marked.
  function buildOutline() {
    if (!outline) return;
    const heads = Array.from(read.querySelectorAll("h2, h3"));
    outline.innerHTML = heads
      .map((h) => {
        const copy = h.cloneNode(true);
        copy.querySelectorAll(".ln-mark, .hash, .caret").forEach((n) => n.remove());
        return `<li><a href="#${h.id}" class="${h.tagName === "H3" ? "sub" : ""}">${copy.textContent.trim()}</a></li>`;
      })
      .join("");
    if (headingWatch) headingWatch.disconnect();
    if (!("IntersectionObserver" in window)) return;
    headingWatch = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          outline.querySelectorAll("a").forEach((a) => a.classList.toggle("is-on", a.getAttribute("href") === `#${entry.target.id}`));
        });
      },
      { rootMargin: "-25% 0px -65% 0px" }
    );
    heads.forEach((h) => headingWatch.observe(h));
  }

  if (outline) {
    outline.addEventListener("click", (event) => {
      const a = event.target.closest("a");
      if (!a) return;
      event.preventDefault();
      const h = document.getElementById(a.getAttribute("href").slice(1));
      if (h) scrollToY(h.getBoundingClientRect().top + window.scrollY - 150, { soft: true });
    });
  }

  const setMode = (next) => {
    mode = next;
    read.hidden = mode !== "read";
    src.hidden = mode !== "source";
    modes.querySelectorAll("[data-mode]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.mode === mode)));
    placeThumb(modes);
    const view = mode === "read" ? read : src;
    if (!reduceMotion) {
      view.classList.remove("doc-swap");
      void view.offsetWidth;
      view.classList.add("doc-swap");
    }
  };

  files.addEventListener("click", (event) => {
    const b = event.target.closest("[data-file]");
    if (b && b.dataset.file !== current) {
      sound.play("select");
      show(b.dataset.file, true);
    }
  });
  modes.addEventListener("click", (event) => {
    const b = event.target.closest("[data-mode]");
    if (b && b.dataset.mode !== mode) {
      sound.play("select");
      setMode(b.dataset.mode);
    }
  });
  document.addEventListener("keydown", (event) => {
    if (event.metaKey || event.ctrlKey || event.altKey || /input|textarea|select/i.test(event.target.tagName)) return;
    const key = event.key.toLowerCase();
    if (key === "t") {
      sound.play("select");
      show(current === "soul" ? "team" : "soul", true);
    }
    if (key === "p" || key === "s") {
      sound.play("select");
      setMode(mode === "read" ? "source" : "read");
    }
  });
  window.addEventListener("resize", () => {
    placeThumb(files);
    placeThumb(modes);
  });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => {
    placeThumb(files);
    placeThumb(modes);
  });

  show(current, false);
  placeThumb(modes);
}

initIntro();
init();
