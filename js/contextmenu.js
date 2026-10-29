/*
 * The page's own right-click menu, on a mouse or trackpad. The browser's menu
 * breaks the spell of the page, so this one offers what makes sense here:
 * copy what is selected, open or copy a link, copy the page's link, go back to
 * the top, book a call, and switch the theme or the sound.
 *
 * Text fields keep the browser's menu (paste, spelling). Arrow keys move
 * through the items, Escape or a click anywhere else closes it, and so does
 * any scroll.
 */

import { launch } from "./launch.js";
import { scrollToY } from "./scroll.js";
import { sound } from "./sound.js";
import { icon } from "./util.js";

const FIELD = 'input, textarea, select, [contenteditable]:not([contenteditable="false"])';
const ROOT = new URL("../", import.meta.url);

export function initContextMenu({ toast, setTheme, getTheme }) {
  if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

  const menu = document.createElement("div");
  menu.className = "ctx";
  menu.setAttribute("role", "menu");
  menu.setAttribute("aria-label", "Page");
  menu.tabIndex = -1;
  menu.hidden = true;
  document.body.appendChild(menu);

  let returnTo = null;
  let hideTimer = 0;

  const copy = async (text, said) => {
    try {
      await navigator.clipboard.writeText(text);
      sound.play("copy");
      toast(said, icon.check);
    } catch (_err) {
      toast("This browser blocked copying.", icon.x);
    }
  };

  // What it offers here, in groups a line apart.
  const groups = (target) => {
    const list = [];
    const selected = String(window.getSelection() || "").trim();
    const link = target.closest && target.closest("a[href]");

    if (selected) list.push([{ label: "Copy", icon: icon.copy, key: "⌘C", run: () => copy(selected, "Copied") }]);
    if (link && !link.href.startsWith("mailto:")) {
      list.push([
        { label: "Open in new tab", icon: icon.external, run: () => window.open(link.href, "_blank", "noopener") },
        { label: "Copy link", icon: icon.link, run: () => copy(link.href, "Link copied") },
      ]);
    } else if (link) {
      const address = link.href.replace(/^mailto:/, "");
      list.push([{ label: "Copy email address", icon: icon.copy, run: () => copy(address, "Email copied") }]);
    }

    const page = [{ label: "Copy page link", icon: icon.link, run: () => copy(window.location.href.split("#")[0], "Link copied") }];
    if (window.scrollY > 200) page.push({ label: "Back to top", icon: icon.top, run: () => scrollToY(0, { soft: true }) });
    list.push(page);

    const dark = getTheme() === "dark";
    const on = sound.enabled();
    list.push([
      {
        label: dark ? "Light mode" : "Dark mode",
        icon: dark ? icon.sun : icon.moon,
        run: () => {
          setTheme(dark ? "light" : "dark", null);
          sound.play(dark ? "toggle-off" : "toggle-on");
        },
      },
      { label: on ? "Mute sounds" : "Turn sound on", icon: on ? icon.soundOff : icon.soundOn, run: () => sound.setEnabled(!on) },
    ]);

    if (!window.location.pathname.includes("/get-started")) {
      list.push([{ label: "Book a 15-min call", icon: icon.call, accent: true, run: (item) => launch(new URL("get-started/", ROOT).href, item) }]);
    }
    return list;
  };

  const items = () => Array.from(menu.querySelectorAll(".ctx-item"));

  const close = (quiet = true) => {
    if (!menu.classList.contains("is-open")) return;
    menu.classList.remove("is-open");
    if (!quiet) sound.play("close");
    hideTimer = window.setTimeout(() => {
      menu.hidden = true;
    }, 160);
    if (menu.contains(document.activeElement)) {
      document.activeElement.blur();
      if (returnTo && returnTo.focus) returnTo.focus({ preventScroll: true });
    }
  };

  const open = (x, y, target) => {
    window.clearTimeout(hideTimer);
    returnTo = document.activeElement;
    const actions = [];
    menu.innerHTML = groups(target)
      .map(
        (group) =>
          group
            .map((item) => {
              actions.push(item.run);
              return `<button type="button" class="ctx-item${item.accent ? " is-accent" : ""}" role="menuitem" data-i="${actions.length - 1}">${item.icon}<span>${item.label}</span>${item.key ? `<kbd>${item.key}</kbd>` : ""}</button>`;
            })
            .join("")
      )
      .join('<div class="ctx-sep" role="separator"></div>');
    menu._actions = actions;
    menu.hidden = false;
    // Keep it on screen, opening toward the room there is.
    const w = menu.offsetWidth;
    const h = menu.offsetHeight;
    const left = x + w + 8 > window.innerWidth ? x - w : x;
    const top = y + h + 8 > window.innerHeight ? y - h : y;
    menu.style.left = `${Math.max(8, left)}px`;
    menu.style.top = `${Math.max(8, top)}px`;
    menu.style.setProperty("--ox", left < x ? "100%" : "0");
    menu.style.setProperty("--oy", top < y ? "100%" : "0");
    requestAnimationFrame(() => menu.classList.add("is-open"));
    menu.focus({ preventScroll: true });
    sound.play("open", { level: 0.8 });
  };

  document.addEventListener("contextmenu", (event) => {
    if (event.target.closest(FIELD) || event.shiftKey) return;
    event.preventDefault();
    open(event.clientX, event.clientY, event.target);
  });

  menu.addEventListener("click", (event) => {
    const button = event.target.closest(".ctx-item");
    if (!button) return;
    const run = menu._actions[Number(button.dataset.i)];
    close();
    if (run) run(button);
  });

  menu.addEventListener("keydown", (event) => {
    const list = items();
    const at = list.indexOf(document.activeElement);
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      const next = at < 0 ? (event.key === "ArrowDown" ? 0 : list.length - 1) : (at + (event.key === "ArrowDown" ? 1 : -1) + list.length) % list.length;
      list[next].focus();
    } else if (event.key === "Escape" || event.key === "Tab") {
      event.preventDefault();
      close(false);
    }
  });

  document.addEventListener("pointerdown", (event) => {
    if (!menu.contains(event.target)) close();
  });
  window.addEventListener("wheel", () => close(), { passive: true });
  window.addEventListener("resize", () => close());
  window.addEventListener("blur", () => close());
}
