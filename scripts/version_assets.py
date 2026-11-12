"""Fingerprint the site's scripts and styles so a deploy never mixes old and new files.

GitHub Pages lets browsers keep every file for ten minutes. Without this, a
visitor who came by just before a deploy can get new HTML with old JavaScript
(or the reverse) and see a broken or empty page.

Run from the repository root:  python3 scripts/version_assets.py
The deploy workflow runs it on its own copy just before publishing, so the
HTML in the repository stays clean. It:

- adds ?v=<content hash> to every local CSS and JS link in each HTML page
  (stylesheets, module scripts, modulepreloads, plain scripts);
- adds an import map to each page that loads modules, so files that modules
  import from each other (./site.js, ./vendor/uisfx.js, dynamic imports)
  are fetched with their hash too.

A file only gets a new URL when its contents change, so unchanged files stay
cached. Running it twice gives the same result.
"""

import hashlib
import json
import os
import re
import sys

ROOT = os.path.abspath(sys.argv[1] if len(sys.argv) > 1 else ".")
SKIP = {".git", "node_modules", "worker", ".github"}

ATTR = re.compile(r'(\s(?:src|href)=")([^"]*?((?:js|css)/[^"?#]+\.(?:js|css)))(?:\?v=[0-9a-f]+)?(")')
IMPORT_MAP = re.compile(r'<script type="importmap">.*?</script>\n?', re.S)
FIRST_MODULE = re.compile(r'<link rel="modulepreload"|<script type="module"')


def digest(path):
    with open(path, "rb") as f:
        return hashlib.sha256(f.read()).hexdigest()[:10]


def assets():
    found = {}
    for top in ("js", "css"):
        for folder, _, files in os.walk(os.path.join(ROOT, top)):
            for name in files:
                if name.endswith((".js", ".css")):
                    full = os.path.join(folder, name)
                    found["/" + os.path.relpath(full, ROOT).replace(os.sep, "/")] = digest(full)
    return found


def stamp(html, page_dir, hashes):
    def swap(m):
        url = m.group(2)
        if url.startswith(("http:", "https:", "//")):
            return m.group(0)
        if url.startswith("/"):
            key = os.path.normpath(url).replace(os.sep, "/")
        else:
            key = "/" + os.path.relpath(os.path.normpath(os.path.join(page_dir, url)), ROOT).replace(os.sep, "/")
        h = hashes.get(key)
        return f"{m.group(1)}{url}?v={h}{m.group(4)}" if h else m.group(0)

    html = ATTR.sub(swap, IMPORT_MAP.sub("", html))
    first = FIRST_MODULE.search(html)
    if first:
        modules = {k: f"{k}?v={v}" for k, v in sorted(hashes.items()) if k.endswith(".js")}
        block = f'<script type="importmap">{json.dumps({"imports": modules}, separators=(",", ":"))}</script>\n'
        html = html[: first.start()] + block + html[first.start():]
    return html


def main():
    hashes = assets()
    changed = 0
    for folder, dirs, files in os.walk(ROOT):
        dirs[:] = [d for d in dirs if d not in SKIP]
        for name in files:
            if not name.endswith(".html"):
                continue
            path = os.path.join(folder, name)
            with open(path, encoding="utf-8") as f:
                before = f.read()
            after = stamp(before, folder, hashes)
            if after != before:
                with open(path, "w", encoding="utf-8") as f:
                    f.write(after)
                changed += 1
    print(f"versioned {len(hashes)} assets across {changed} pages")


if __name__ == "__main__":
    main()
