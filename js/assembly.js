/*
 * Hero visual two, "assembly": the things we build, built in front of you.
 *
 * A few thousand points assemble into a mobile app, hold, burst apart and
 * rebuild as an operations dashboard, then as an AI agent's chat, and round
 * again. The caption below says what is on screen and lets the visitor jump
 * to any of the three. The pointer parts the points like a hand through
 * sand. Every frame is one draw call; positions blend on the GPU.
 */

import { attributes, createGL, mulberry, multiply, palette, perspective, program, rotX, rotY, translate, uniforms } from "./gl.js";
import { sound } from "./sound.js";
import { clamp, damp, icon, onFrame, reduceMotion } from "./util.js";

const VERT = `
precision highp float;
attribute vec3 a_t0;
attribute vec3 a_t1;
attribute vec3 a_t2;
attribute vec4 a_rnd;
attribute vec3 a_kinds;
uniform mat4 u_mvp;
uniform vec3 u_from;
uniform vec3 u_to;
uniform float u_k;
uniform float u_time;
uniform float u_intro;
uniform vec2 u_mouse;
uniform float u_push;
uniform float u_px;
uniform float u_ref;
uniform vec3 c_line;
uniform vec3 c_fill;
uniform vec3 c_accent;
varying vec4 v_color;
void main() {
  vec3 a = a_t0 * u_from.x + a_t1 * u_from.y + a_t2 * u_from.z;
  vec3 b = a_t0 * u_to.x + a_t1 * u_to.y + a_t2 * u_to.z;
  // Each point leaves a little after or before its neighbours.
  float k = clamp((u_k - a_rnd.w * 0.22) / 0.78, 0.0, 1.0);
  float e = k * k * (3.0 - 2.0 * k);
  vec3 scatter = (a_rnd.xyz - 0.5) * vec3(4.2, 3.0, 3.4);
  vec3 pos = mix(a, b, e) + scatter * sin(3.14159265 * k) * 0.9;
  pos += vec3(sin(u_time * 1.3 + a_rnd.x * 40.0), cos(u_time * 1.1 + a_rnd.y * 40.0), 0.0) * 0.008;
  vec2 d = pos.xy - u_mouse;
  float reach = 1.0 - smoothstep(0.0, 0.85, length(d));
  pos.xy += normalize(d + vec2(0.0001)) * reach * u_push * 0.42;
  // Coming in: the points gather from a wide, soft cloud.
  float arrive = clamp(u_intro * 1.6 - a_rnd.w * 0.6, 0.0, 1.0);
  arrive = 1.0 - pow(1.0 - arrive, 3.0);
  pos = mix(scatter * 1.6, pos, arrive);
  // Each point plays a part in each shape (outline 0, fill 1, accent 2).
  float kind = mix(dot(a_kinds, u_from), dot(a_kinds, u_to), e);
  vec3 col = mix(mix(c_line, c_fill, clamp(kind, 0.0, 1.0)), c_accent, clamp(kind - 1.0, 0.0, 1.0));
  float alpha = mix(mix(0.92, 0.62, clamp(kind, 0.0, 1.0)), 1.0, clamp(kind - 1.0, 0.0, 1.0)) * arrive;
  float size = mix(mix(2.3, 2.0, clamp(kind, 0.0, 1.0)), 2.8, clamp(kind - 1.0, 0.0, 1.0));
  vec4 clip = u_mvp * vec4(pos, 1.0);
  gl_Position = clip;
  gl_PointSize = size * u_px * (u_ref / clip.w);
  v_color = vec4(col, alpha);
}
`;

const FRAG = `
precision mediump float;
varying vec4 v_color;
void main() {
  vec2 c = gl_PointCoord - 0.5;
  float a = smoothstep(0.5, 0.3, length(c)) * v_color.a;
  gl_FragColor = vec4(v_color.rgb * a, a);
}
`;

/* Shapes, as primitives: an outline (0), a fill (1) or an accent (2). Each
   is sampled into exactly `count` points, spread by length or area. */
function shapeBuilder() {
  const prims = [];
  const rrPath = (x, y, w, h, r) => {
    // A rounded rectangle's perimeter as a function of t in 0..1.
    const straight = 2 * (w + h) - 8 * r;
    const arc = 2 * Math.PI * r;
    const total = straight + arc;
    return {
      length: total,
      at(t) {
        let s = t * total;
        const seg = [
          ["l", w - 2 * r, (u) => [x + r + u, y]],
          ["a", (Math.PI / 2) * r, (u) => arcPt(x + w - r, y + r, r, -Math.PI / 2 + u / r)],
          ["l", h - 2 * r, (u) => [x + w, y + r + u]],
          ["a", (Math.PI / 2) * r, (u) => arcPt(x + w - r, y + h - r, r, u / r)],
          ["l", w - 2 * r, (u) => [x + w - r - u, y + h]],
          ["a", (Math.PI / 2) * r, (u) => arcPt(x + r, y + h - r, r, Math.PI / 2 + u / r)],
          ["l", h - 2 * r, (u) => [x, y + h - r - u]],
          ["a", (Math.PI / 2) * r, (u) => arcPt(x + r, y + r, r, Math.PI + u / r)],
        ];
        for (const [, len, f] of seg) {
          if (s <= len) return f(s);
          s -= len;
        }
        return [x + r, y];
      },
    };
  };
  const arcPt = (cx, cy, r, a) => [cx + Math.cos(a) * r, cy + Math.sin(a) * r];
  const api = {
    rect(x, y, w, h, r = 0.08, kind = 0) {
      const p = rrPath(x, y, w, h, Math.min(r, w / 2, h / 2));
      prims.push({ weight: p.length, kind, sample: (rand) => p.at(rand()) });
      return api;
    },
    fill(x, y, w, h, kind = 1, density = 2.2) {
      prims.push({ weight: w * h * density, kind, sample: (rand) => [x + rand() * w, y + rand() * h] });
      return api;
    },
    line(x1, y1, x2, y2, kind = 0) {
      prims.push({ weight: Math.hypot(x2 - x1, y2 - y1), kind, sample: (rand) => { const t = rand(); return [x1 + (x2 - x1) * t, y1 + (y2 - y1) * t]; } });
      return api;
    },
    poly(points, kind = 2) {
      for (let i = 1; i < points.length; i += 1) api.line(points[i - 1][0], points[i - 1][1], points[i][0], points[i][1], kind);
      return api;
    },
    circle(cx, cy, r, kind = 0) {
      prims.push({ weight: 2 * Math.PI * r, kind, sample: (rand) => arcPt(cx, cy, r, rand() * Math.PI * 2) });
      return api;
    },
    disc(cx, cy, r, kind = 2) {
      prims.push({ weight: Math.PI * r * r * 3.2 + r, kind, sample: (rand) => { const a = rand() * Math.PI * 2; const d = Math.sqrt(rand()) * r; return [cx + Math.cos(a) * d, cy + Math.sin(a) * d]; } });
      return api;
    },
    sample(count, rand) {
      const total = prims.reduce((s, p) => s + p.weight, 0);
      const out = [];
      prims.forEach((p, i) => {
        const n = i === prims.length - 1 ? count - out.length : Math.round((p.weight / total) * count);
        for (let k = 0; k < n && out.length < count; k += 1) {
          const [x, y] = p.sample(rand);
          out.push([x, -y, (rand() - 0.5) * 0.08, p.kind]);
        }
      });
      while (out.length < count) out.push(out[out.length % Math.max(1, out.length)] || [0, 0, 0, 0]);
      // Shuffle, so each point travels somewhere new between shapes.
      for (let k = out.length - 1; k > 0; k -= 1) {
        const j = Math.floor(rand() * (k + 1));
        [out[k], out[j]] = [out[j], out[k]];
      }
      return out;
    },
  };
  return api;
}

// The mobile app, about 1.6 x 3 units, centred.
const app = () =>
  shapeBuilder()
    .rect(-0.8, -1.5, 1.6, 3.0, 0.26)
    .line(-0.16, -1.33, 0.16, -1.33)
    .fill(-0.62, -1.08, 0.66, 0.12, 1, 4)
    .circle(0.48, -1.02, 0.11)
    .rect(-0.62, -0.78, 1.24, 0.66, 0.1)
    .poly([[-0.5, -0.24], [-0.26, -0.44], [-0.02, -0.34], [0.22, -0.6], [0.5, -0.5]])
    .circle(-0.48, 0.12, 0.11)
    .line(-0.3, 0.07, 0.5, 0.07)
    .line(-0.3, 0.18, 0.18, 0.18, 1)
    .circle(-0.48, 0.5, 0.11)
    .line(-0.3, 0.45, 0.5, 0.45)
    .line(-0.3, 0.56, 0.1, 0.56, 1)
    .circle(-0.48, 0.88, 0.11)
    .line(-0.3, 0.83, 0.5, 0.83)
    .line(-0.3, 0.94, 0.22, 0.94, 1)
    .disc(0.46, 1.08, 0.15)
    .line(-0.62, 1.3, 0.62, 1.3, 1);

// The operations dashboard, about 4.6 x 2.8 units.
const dashboard = () => {
  const b = shapeBuilder()
    .rect(-2.3, -1.4, 4.6, 2.8, 0.14)
    .line(-2.3, -1.1, 2.3, -1.1)
    .disc(-2.12, -1.25, 0.04, 1)
    .disc(-1.98, -1.25, 0.04, 1)
    .disc(-1.84, -1.25, 0.04, 1)
    .line(-1.5, -1.1, -1.5, 1.4)
    .fill(-2.15, -0.9, 0.5, 0.08, 2, 6)
    .line(-2.15, -0.62, -1.75, -0.62, 1)
    .line(-2.15, -0.38, -1.7, -0.38, 1)
    .line(-2.15, -0.14, -1.8, -0.14, 1);
  [-1.32, -0.12, 1.08].forEach((x) => b.rect(x, -0.92, 1.04, 0.46, 0.08).line(x + 0.12, -0.74, x + 0.5, -0.74, 2).line(x + 0.12, -0.6, x + 0.36, -0.6, 1));
  [0.42, 0.6, 0.36, 0.78, 0.5, 0.9, 0.64].forEach((h, k) => b.fill(-1.24 + k * 0.32, 1.2 - h, 0.16, h, 1, 3.2));
  b.line(-1.3, 1.22, 0.95, 1.22).poly([[1.08, 1.0], [1.36, 0.62], [1.64, 0.78], [1.92, 0.3], [2.16, 0.42]]);
  return b;
};

// The AI agent's chat, about 3.6 x 2.8 units.
const agent = () =>
  shapeBuilder()
    .rect(-1.8, -1.4, 3.6, 2.8, 0.22)
    .circle(-1.45, -1.08, 0.15, 2)
    .line(-1.6, -1.08, -1.3, -1.08, 2)
    .line(-1.45, -1.23, -1.45, -0.93, 2)
    .line(-1.18, -1.12, -0.4, -1.12)
    .line(-1.18, -1.0, -0.7, -1.0, 1)
    .fill(0.0, -0.66, 1.55, 0.36, 1, 3.4)
    .rect(-1.55, -0.12, 2.15, 0.66, 0.2)
    .line(-1.38, 0.08, 0.36, 0.08)
    .line(-1.38, 0.3, -0.1, 0.3, 1)
    .rect(-1.55, 0.7, 0.98, 0.3, 0.15)
    .poly([[-1.42, 0.86], [-1.35, 0.93], [-1.22, 0.78]])
    .line(-1.12, 0.85, -0.7, 0.85, 1)
    .rect(-0.46, 0.7, 0.98, 0.3, 0.15)
    .line(-0.33, 0.85, 0.36, 0.85, 1)
    .rect(-1.55, 1.08, 3.1, 0.24, 0.12)
    .disc(1.38, 1.2, 0.08);

const SHAPES = [
  { name: "Mobile app", icon: icon.phone, build: app },
  { name: "Operations platform", icon: icon.dashboard, build: dashboard },
  { name: "AI agent", icon: icon.agent, build: agent },
];

const HOLD = 3.4; // seconds a shape stays built
const MORPH = 1.5; // seconds to burst and rebuild

export function mountAssembly(el) {
  el.dataset.kind = "assembly";
  el.innerHTML = `<canvas></canvas><div class="visual-caption" role="group" aria-label="What we build">${SHAPES.map(
    (s, i) => `<button type="button" data-shape="${i}" aria-pressed="${i === 0}">${s.icon}${s.name}</button>`
  ).join("")}</div>`;
  el.removeAttribute("aria-hidden");
  const canvas = el.querySelector("canvas");
  const buttons = Array.from(el.querySelectorAll("[data-shape]"));
  const gl = createGL(canvas);
  const none = {
    start() {},
    destroy() {
      el.innerHTML = "";
    },
  };
  if (!gl) return none;
  let prog;
  try {
    prog = program(gl, VERT, FRAG);
  } catch (err) {
    console.warn("[assembly]", err);
    return none;
  }

  const small = window.innerWidth < 720;
  const count = small ? 2600 : 4600;
  const rand = mulberry(7731);
  const pts = SHAPES.map((s) => s.build().sample(count, rand));
  const t0 = new Float32Array(count * 3);
  const t1 = new Float32Array(count * 3);
  const t2 = new Float32Array(count * 3);
  const rnd = new Float32Array(count * 4);
  const kinds = new Float32Array(count * 3);
  for (let i = 0; i < count; i += 1) {
    t0.set(pts[0][i].slice(0, 3), i * 3);
    t1.set(pts[1][i].slice(0, 3), i * 3);
    t2.set(pts[2][i].slice(0, 3), i * 3);
    rnd.set([rand(), rand(), rand(), rand()], i * 4);
    kinds.set([pts[0][i][3], pts[1][i][3], pts[2][i][3]], i * 3);
  }
  const attrs = attributes(gl, prog, { a_t0: [t0, 3], a_t1: [t1, 3], a_t2: [t2, 3], a_rnd: [rnd, 4], a_kinds: [kinds, 3] });
  const u = uniforms(gl, prog, ["u_mvp", "u_from", "u_to", "u_k", "u_time", "u_intro", "u_mouse", "u_push", "u_px", "u_ref", "c_line", "c_fill", "c_accent"]);
  gl.useProgram(prog);
  attrs.bind();
  gl.disable(gl.DEPTH_TEST);
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
  gl.clearColor(0, 0, 0, 0);

  const applyColors = () => {
    const c = palette();
    gl.uniform3fv(u.c_line, c.lane0);
    gl.uniform3fv(u.c_fill, c.soft);
    gl.uniform3fv(u.c_accent, c.ring);
  };
  applyColors();

  const FOV = (30 * Math.PI) / 180;
  const HALF_H = 2.12;
  const dist = HALF_H / Math.tan(FOV / 2);
  let proj = perspective(FOV, 1, 0.1, 100);
  let px = 1;
  let time = 0;
  let started = false;
  let introAt = 0;
  let visible = true;
  let stop = null;

  // The cycle: which shape, and how far into the burst to the next.
  let from = 0;
  let to = 0;
  let phase = HOLD; // time since the current shape began
  let k = 0;
  const pointer = { x: 0, y: 0, tx: 0, ty: 0, wx: 0, wy: 0, twx: 0, twy: 0, push: 0, over: false };

  const setCaption = (i) => buttons.forEach((b, j) => b.setAttribute("aria-pressed", String(j === i)));
  // Jump to a shape: the one forming now becomes the start of the burst.
  const goTo = (i) => {
    from = to;
    to = i;
    phase = HOLD;
    k = 0;
    setCaption(i);
  };
  const oneHot = (i) => [i === 0 ? 1 : 0, i === 1 ? 1 : 0, i === 2 ? 1 : 0];

  const draw = (dt) => {
    time += dt;
    if (!reduceMotion) {
      phase += dt;
      if (phase > HOLD && from === to) {
        to = (from + 1) % SHAPES.length;
        setCaption(to);
      }
      if (from !== to) {
        k = clamp((phase - HOLD) / MORPH, 0, 1);
        if (k >= 1) {
          from = to;
          k = 0;
          phase = 0;
        }
      }
    }
    pointer.x = damp(pointer.x, pointer.tx, 3, dt);
    pointer.y = damp(pointer.y, pointer.ty, 3, dt);
    pointer.wx = damp(pointer.wx, pointer.twx, 12, dt);
    pointer.wy = damp(pointer.wy, pointer.twy, 12, dt);
    pointer.push = damp(pointer.push, pointer.over ? 1 : 0, 5, dt);
    const intro = started ? clamp((time - introAt) / 1.6, 0, 1) : 0;
    const yaw = Math.sin(time * 0.35) * 0.26 + pointer.x * 0.18;
    const pitch = 0.06 + Math.sin(time * 0.27) * 0.05 + pointer.y * 0.08;
    const mvp = multiply(proj, multiply(translate(0, 0, -dist), multiply(rotX(pitch), rotY(yaw))));
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.uniformMatrix4fv(u.u_mvp, false, mvp);
    gl.uniform3fv(u.u_from, oneHot(from));
    gl.uniform3fv(u.u_to, oneHot(to));
    gl.uniform1f(u.u_k, k);
    gl.uniform1f(u.u_time, time);
    gl.uniform1f(u.u_intro, intro);
    gl.uniform2f(u.u_mouse, pointer.wx, pointer.wy);
    gl.uniform1f(u.u_push, pointer.push);
    gl.uniform1f(u.u_px, px);
    gl.uniform1f(u.u_ref, dist);
    gl.drawArrays(gl.POINTS, 0, count);
  };

  const resize = () => {
    const rect = el.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, small ? 1.6 : 1.8);
    canvas.width = Math.max(1, Math.round(rect.width * dpr));
    canvas.height = Math.max(1, Math.round(rect.height * dpr));
    gl.viewport(0, 0, canvas.width, canvas.height);
    const aspect = rect.width / Math.max(1, rect.height);
    // Narrow screens pull back so the dashboard still fits across.
    proj = perspective(FOV * (aspect < 1.75 ? Math.min(1.7, 1.75 / aspect) : 1), aspect, 0.1, 100);
    px = dpr * (rect.width < 720 ? 1.0 : 1.15);
    if (!stop && started) draw(0);
  };
  resize();
  const sizer = "ResizeObserver" in window ? new ResizeObserver(resize) : null;
  if (sizer) sizer.observe(el);

  const onMove = (event) => {
    if (event.target.closest(".visual-caption")) {
      pointer.over = false;
      return;
    }
    const r = el.getBoundingClientRect();
    const x = event.clientX - r.left;
    const y = event.clientY - r.top;
    pointer.tx = clamp((x - r.width / 2) / (r.width / 2), -1, 1);
    pointer.ty = clamp((y - r.height / 2) / Math.max(200, r.height), -1, 1);
    pointer.twx = ((x / r.width) * 2 - 1) * HALF_H * (r.width / r.height);
    pointer.twy = (1 - (y / r.height) * 2) * HALF_H;
    pointer.over = true;
  };
  const onLeave = () => {
    pointer.over = false;
    pointer.tx = 0;
    pointer.ty = 0;
  };
  el.addEventListener("pointermove", onMove);
  el.addEventListener("pointerleave", onLeave);
  el.addEventListener("click", (event) => {
    const b = event.target.closest("[data-shape]");
    if (!b) return;
    const i = Number(b.dataset.shape);
    if (i === to) return;
    goTo(i);
    sound.play("select");
    if (reduceMotion) {
      from = to;
      draw(0);
    }
  });

  const run = () => {
    if (reduceMotion) {
      if (started) draw(0);
      return;
    }
    if (stop || !visible || document.hidden) return;
    stop = onFrame((dt) => draw(dt));
  };
  const pause = () => {
    if (stop) stop();
    stop = null;
  };
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
  const onTheme = () => {
    applyColors();
    if (!stop && started) draw(0);
  };
  document.addEventListener("visibilitychange", onVisibility);
  window.addEventListener("ls:theme", onTheme);

  return {
    start() {
      started = true;
      introAt = reduceMotion ? time - 10 : time;
      phase = 0;
      if (reduceMotion) draw(0);
      else run();
    },
    destroy() {
      pause();
      if (io) io.disconnect();
      if (sizer) sizer.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("ls:theme", onTheme);
      const lose = gl.getExtension("WEBGL_lose_context");
      if (lose) lose.loseContext();
      el.innerHTML = "";
      el.setAttribute("aria-hidden", "true");
    },
  };
}
