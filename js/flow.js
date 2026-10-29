/*
 * Hero visual one, "flow": messy workflow in, working product out.
 *
 * Thousands of points, and a few dozen real pieces of work (emails,
 * spreadsheets, chats, documents, invoices, meetings), drift in from the left
 * in no order at all, funnel through a turning ring at the centre, and leave
 * on the right as tidy task cards moving in step along neat rows. Run the
 * pointer through the mess and it falls into line under it.
 *
 * Every path is computed on the GPU from a seed and the time: two draw calls
 * a frame and no work on the main thread. It pauses off screen and in a
 * hidden tab, and draws one still frame for reduced motion.
 */

import { attributes, createGL, mulberry, multiply, palette, perspective, program, rotX, rotY, translate, uniforms } from "./gl.js";
import { clamp, damp, finePointer, icon, onFrame, reduceMotion } from "./util.js";

const COMMON = `
uniform float u_time;
uniform float u_speed;
uniform float u_W;
uniform float u_lanes;
uniform vec2 u_mouse;
uniform float u_brush;

// The ring is turned toward the viewer so it reads as a portal, not a slit.
const float RY = 1.08;
const mat3 TILT = mat3(cos(RY), 0.0, -sin(RY), 0.0, 1.0, 0.0, sin(RY), 0.0, cos(RY));

// Where a flowing particle is at phase p, and how much of it is in the mess
// (wc), the ring (wr) and the rows (wl); near is the pointer's pull on it.
vec3 flowPos(vec4 seed, float lane, float p, out float wc, out float wr, out float wl, out float near) {
  float s1 = seed.y * 6.2831853;
  float s2 = seed.z * 6.2831853;
  float s3 = seed.w * 6.2831853;
  float t = u_time;
  float k = smoothstep(0.0, 0.42, p);
  float amp = mix(1.55, 0.12, k);
  vec3 chaos;
  chaos.x = mix(-u_W, -0.4, k) + sin(t * 0.5 + s1 + p * 7.0) * 0.5 * amp;
  chaos.y = (sin(s2 + t * 0.6 + p * 10.0) * 0.62 + sin(s3 * 1.7 + t * 1.05 + p * 21.0) * 0.3) * amp;
  chaos.z = (cos(s3 + t * 0.45 + p * 8.0) * 0.62 + cos(s1 * 1.3 + t * 0.85 + p * 17.0) * 0.3) * amp;
  float ly = (lane - (u_lanes - 1.0) * 0.5) * 0.3;
  near = u_brush * (1.0 - smoothstep(0.2, 1.05, length(chaos.xy - u_mouse)));
  chaos = mix(chaos, vec3(chaos.x, ly, 0.0), near * 0.94);
  float ang = s2 + p * 24.0;
  vec3 ring = TILT * vec3((p - 0.5) * 0.9, cos(ang) * 0.98, sin(ang) * 0.98);
  vec3 row = vec3(mix(0.75, u_W, smoothstep(0.58, 1.0, p)), ly, 0.0);
  wc = 1.0 - smoothstep(0.3, 0.46, p);
  wl = smoothstep(0.54, 0.68, p);
  wr = clamp(1.0 - wc - wl, 0.0, 1.0);
  near *= wc;
  return chaos * wc + ring * wr + row * wl;
}

float arrive(float intro, float w) {
  float e = clamp(intro * 1.7 - w * 0.7, 0.0, 1.0);
  return 1.0 - pow(1.0 - e, 3.0);
}
`;

const DOTS_VERT = `
precision highp float;
attribute vec4 a_seed;
attribute float a_lane;
attribute float a_kind;
uniform mat4 u_mvp;
uniform float u_intro;
uniform float u_px;
uniform float u_ref;
uniform vec3 c_chaos;
uniform vec3 c_ring;
uniform vec3 c_lane0;
uniform vec3 c_lane1;
varying vec4 v_color;
${COMMON}
void main() {
  vec3 pos;
  vec3 col;
  float alpha;
  float size;
  if (a_kind > 0.5) {
    float ang = a_seed.y * 6.2831853 + u_time * 0.22;
    float r = 0.98 + (a_seed.z - 0.5) * 0.1;
    pos = TILT * vec3((a_seed.w - 0.5) * 0.16, cos(ang) * r, sin(ang) * r);
    col = c_ring;
    alpha = 0.55;
    size = 2.0;
  } else {
    float p = fract(a_seed.x + u_time * u_speed);
    float wc, wr, wl, near;
    pos = flowPos(a_seed, a_lane, p, wc, wr, wl, near);
    vec3 laneCol = mod(a_lane, 2.0) < 0.5 ? c_lane0 : c_lane1;
    col = c_chaos * wc + c_ring * wr + laneCol * wl;
    col = mix(col, laneCol, near);
    alpha = mix(0.5 * wc + 0.95 * wr + 0.95 * wl, 0.95, near);
    size = mix(mix(1.4, 3.3, a_seed.w) * wc + 2.6 * wr + 2.4 * wl, 2.4, near);
    alpha *= smoothstep(0.0, 0.05, p) * (1.0 - smoothstep(0.95, 1.0, p));
  }
  float e = arrive(u_intro, a_seed.w);
  pos *= e;
  alpha *= e;
  vec4 clip = u_mvp * vec4(pos, 1.0);
  gl_Position = clip;
  gl_PointSize = size * u_px * (u_ref / clip.w);
  v_color = vec4(col, alpha);
}
`;

const DOTS_FRAG = `
precision mediump float;
varying vec4 v_color;
void main() {
  vec2 c = gl_PointCoord - 0.5;
  float a = smoothstep(0.5, 0.3, length(c)) * v_color.a;
  gl_FragColor = vec4(v_color.rgb * a, a);
}
`;

const ICONS_VERT = `
precision highp float;
attribute vec4 a_seed;
attribute float a_lane;
attribute float a_icon;
uniform mat4 u_mvp;
uniform float u_intro;
uniform float u_px;
uniform float u_ref;
uniform vec3 c_ink;
uniform vec3 c_lane0;
varying vec4 v_color;
varying float v_icon;
varying float v_rot;
${COMMON}
void main() {
  float p = fract(a_seed.x + u_time * u_speed);
  float wc, wr, wl, near;
  vec3 pos = flowPos(a_seed, a_lane, p, wc, wr, wl, near);
  float after = step(0.5, p);
  v_icon = after > 0.5 ? 6.0 : a_icon;
  v_rot = (a_seed.y * 6.2831853 + u_time * (0.3 + a_seed.z * 0.5)) * wc * (1.0 - near);
  vec3 col = mix(c_ink, c_lane0, max(wl, near));
  float alpha = (0.82 * wc + 0.95 * wl) * (1.0 - wr * 0.95);
  alpha *= smoothstep(0.0, 0.06, p) * (1.0 - smoothstep(0.93, 1.0, p));
  float size = (mix(25.0, 30.0, a_seed.w) * wc + 19.0 * wl) * (1.0 - wr * 0.8);
  float e = arrive(u_intro, a_seed.w);
  pos *= e;
  alpha *= e;
  vec4 clip = u_mvp * vec4(pos, 1.0);
  gl_Position = clip;
  gl_PointSize = size * u_px * (u_ref / clip.w);
  v_color = vec4(col, alpha);
}
`;

const ICONS_FRAG = `
precision mediump float;
uniform sampler2D u_atlas;
varying vec4 v_color;
varying float v_icon;
varying float v_rot;
void main() {
  vec2 c = gl_PointCoord - 0.5;
  float cs = cos(v_rot);
  float sn = sin(v_rot);
  c = vec2(c.x * cs - c.y * sn, c.x * sn + c.y * cs) + 0.5;
  if (c.x < 0.0 || c.y < 0.0 || c.x > 1.0 || c.y > 1.0) discard;
  float a = texture2D(u_atlas, vec2((floor(v_icon + 0.5) + c.x) / 8.0, c.y)).a * v_color.a;
  gl_FragColor = vec4(v_color.rgb * a, a);
}
`;

// Pieces of a messy workflow, and the finished task they become, drawn once
// into an atlas of 64 px cells.
function drawAtlas() {
  const cv = document.createElement("canvas");
  cv.width = 512;
  cv.height = 64;
  const g = cv.getContext("2d");
  g.strokeStyle = "#fff";
  g.fillStyle = "#fff";
  g.lineWidth = 3.6;
  g.lineCap = "round";
  g.lineJoin = "round";
  const rr = (x, y, w, h, r) => {
    g.beginPath();
    g.moveTo(x + r, y);
    g.arcTo(x + w, y, x + w, y + h, r);
    g.arcTo(x + w, y + h, x, y + h, r);
    g.arcTo(x, y + h, x, y, r);
    g.arcTo(x, y, x + w, y, r);
    g.closePath();
  };
  const line = (pts) => {
    g.beginPath();
    pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y)));
    g.stroke();
  };
  const cell = (i, draw) => {
    g.save();
    g.translate(i * 64, 0);
    draw();
    g.restore();
  };
  // 0 email
  cell(0, () => {
    rr(12, 18, 40, 28, 5);
    g.stroke();
    line([[14, 21], [32, 35], [50, 21]]);
  });
  // 1 spreadsheet
  cell(1, () => {
    rr(14, 13, 36, 38, 5);
    g.stroke();
    line([[14, 25], [50, 25]]);
    line([[14, 37], [50, 37]]);
    line([[26, 13], [26, 51]]);
    line([[38, 13], [38, 51]]);
  });
  // 2 chat
  cell(2, () => {
    rr(10, 14, 44, 28, 11);
    g.stroke();
    line([[22, 42], [17, 51], [30, 42]]);
    [23, 32, 41].forEach((x) => {
      g.beginPath();
      g.arc(x, 28, 2.6, 0, Math.PI * 2);
      g.fill();
    });
  });
  // 3 document
  cell(3, () => {
    line([[19, 10], [39, 10], [47, 18], [47, 54], [19, 54], [19, 10]]);
    line([[39, 10], [39, 18], [47, 18]]);
    line([[25, 29], [41, 29]]);
    line([[25, 37], [41, 37]]);
    line([[25, 45], [35, 45]]);
  });
  // 4 invoice
  cell(4, () => {
    line([[17, 10], [47, 10], [47, 52], [42, 48], [37, 52], [32, 48], [27, 52], [22, 48], [17, 52], [17, 10]]);
    line([[23, 21], [41, 21]]);
    line([[23, 29], [36, 29]]);
    line([[23, 38], [41, 38]]);
  });
  // 5 meeting
  cell(5, () => {
    rr(12, 16, 40, 36, 6);
    g.stroke();
    line([[12, 26], [52, 26]]);
    line([[23, 11], [23, 20]]);
    line([[41, 11], [41, 20]]);
    g.beginPath();
    g.arc(25, 37, 2.8, 0, Math.PI * 2);
    g.arc(38, 37, 2.8, 0, Math.PI * 2);
    g.fill();
  });
  // 6 the finished task: a card with a tick
  cell(6, () => {
    rr(7, 17, 50, 30, 9);
    g.stroke();
    line([[15, 32], [20, 37], [28, 27]]);
    line([[35, 28], [49, 28]]);
    line([[35, 36], [44, 36]]);
  });
  return cv;
}

const LABEL_IN = `<span class="visual-label in">${icon.shuffle}Messy workflow</span>`;
const LABEL_OUT = `<span class="visual-label out">Working product${icon.checkCircle}</span>`;
// What to do with it, beside the pointer, until the visitor has done it.
const SWEPT = "ls-swept";
const SAY = "Sweep to tidy up";

export function mountFlow(el) {
  el.dataset.kind = "flow";
  el.innerHTML = `<div class="visual-core"></div><canvas></canvas><div class="visual-halo"></div>${LABEL_IN}${LABEL_OUT}`;
  let swept = 0;
  try {
    if (finePointer && window.sessionStorage.getItem(SWEPT) !== "1") el.dataset.cursorLabel = SAY;
  } catch (_err) {
    if (finePointer) el.dataset.cursorLabel = SAY;
  }
  const canvas = el.querySelector("canvas");
  const gl = createGL(canvas);
  const none = {
    start() {},
    destroy() {
      el.innerHTML = "";
    },
  };
  if (!gl) return none;

  let dots;
  let icons;
  try {
    dots = program(gl, DOTS_VERT, DOTS_FRAG);
    icons = program(gl, ICONS_VERT, ICONS_FRAG);
  } catch (err) {
    console.warn("[flow]", err);
    return none;
  }

  /* Points: clusters that travel together (they become the dashes in each
     row), a few hundred that only trace the ring, and the pieces of work. */
  const small = window.innerWidth < 720;
  const lanes = 7;
  const clusters = small ? 150 : 250;
  const per = small ? 13 : 16;
  const ringOnly = small ? 220 : 380;
  const count = clusters * per + ringOnly;
  const seeds = new Float32Array(count * 4);
  const laneOf = new Float32Array(count);
  const kind = new Float32Array(count);
  const rand = mulberry(20260127);
  let i = 0;
  for (let c = 0; c < clusters; c += 1) {
    const base = c / clusters;
    const lane = (c * 3) % lanes;
    for (let j = 0; j < per; j += 1, i += 1) {
      seeds.set([(base + (rand() - 0.5) * 0.012 + 1) % 1, rand(), rand(), rand()], i * 4);
      laneOf[i] = lane;
    }
  }
  for (; i < count; i += 1) {
    seeds.set([rand(), rand(), rand(), rand()], i * 4);
    kind[i] = 1;
  }

  const pieces = small ? 18 : 32;
  const pSeeds = new Float32Array(pieces * 4);
  const pLane = new Float32Array(pieces);
  const pIcon = new Float32Array(pieces);
  for (let k = 0; k < pieces; k += 1) {
    pSeeds.set([(k / pieces + rand() * 0.02) % 1, rand(), rand(), rand()], k * 4);
    pLane[k] = Math.floor(rand() * lanes);
    pIcon[k] = k % 6;
  }

  const dotAttrs = attributes(gl, dots, { a_seed: [seeds, 4], a_lane: [laneOf, 1], a_kind: [kind, 1] });
  const iconAttrs = attributes(gl, icons, { a_seed: [pSeeds, 4], a_lane: [pLane, 1], a_icon: [pIcon, 1] });
  const shared = ["u_mvp", "u_time", "u_speed", "u_W", "u_lanes", "u_mouse", "u_brush", "u_intro", "u_px", "u_ref"];
  const ud = uniforms(gl, dots, [...shared, "c_chaos", "c_ring", "c_lane0", "c_lane1"]);
  const ui = uniforms(gl, icons, [...shared, "c_ink", "c_lane0", "u_atlas"]);

  const tex = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, drawAtlas());
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

  gl.disable(gl.DEPTH_TEST);
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
  gl.clearColor(0, 0, 0, 0);

  const applyColors = () => {
    const c = palette();
    gl.useProgram(dots);
    gl.uniform3fv(ud.c_chaos, c.chaos);
    gl.uniform3fv(ud.c_ring, c.ring);
    gl.uniform3fv(ud.c_lane0, c.lane0);
    gl.uniform3fv(ud.c_lane1, c.lane1);
    gl.useProgram(icons);
    gl.uniform3fv(ui.c_ink, c.ink);
    gl.uniform3fv(ui.c_lane0, c.lane0);
  };
  applyColors();

  const FOV = (32 * Math.PI) / 180;
  const HALF_H = 1.95;
  const dist = HALF_H / Math.tan(FOV / 2);
  let proj = perspective(FOV, 1, 0.1, 100);
  let W = 6;
  let pxDots = 1;
  let pxIcons = 1;
  let time = 8;
  let started = false;
  let introAt = 0;
  let visible = true;
  let stop = null;
  const pointer = { x: 0, y: 0, tx: 0, ty: 0, wx: -99, wy: -99, twx: -99, twy: -99, brush: 0, over: false };

  const draw = (dt) => {
    time += dt;
    pointer.x = damp(pointer.x, pointer.tx, 3, dt);
    pointer.y = damp(pointer.y, pointer.ty, 3, dt);
    pointer.wx = damp(pointer.wx, pointer.twx, 14, dt);
    pointer.wy = damp(pointer.wy, pointer.twy, 14, dt);
    pointer.brush = damp(pointer.brush, pointer.over ? 1 : 0, pointer.over ? 6 : 2.5, dt);
    const intro = started ? clamp((time - introAt) / 1.9, 0, 1) : 0;
    const yaw = pointer.x * 0.16 + Math.sin(time * 0.13) * 0.05;
    const pitch = 0.1 + pointer.y * 0.1 + Math.sin(time * 0.1) * 0.03;
    const mvp = multiply(proj, multiply(translate(0, 0, -dist), multiply(rotX(pitch), rotY(yaw))));
    gl.clear(gl.COLOR_BUFFER_BIT);
    [
      [dots, ud, dotAttrs, count, pxDots],
      [icons, ui, iconAttrs, pieces, pxIcons],
    ].forEach(([prog, u, attrs, n, px]) => {
      gl.useProgram(prog);
      attrs.bind();
      gl.uniformMatrix4fv(u.u_mvp, false, mvp);
      gl.uniform1f(u.u_time, time);
      gl.uniform1f(u.u_speed, 0.052);
      gl.uniform1f(u.u_W, W);
      gl.uniform1f(u.u_lanes, lanes);
      gl.uniform2f(u.u_mouse, pointer.wx, pointer.wy);
      gl.uniform1f(u.u_brush, pointer.brush);
      gl.uniform1f(u.u_intro, intro);
      gl.uniform1f(u.u_px, px);
      gl.uniform1f(u.u_ref, dist);
      if (u.u_atlas) {
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, tex);
        gl.uniform1i(u.u_atlas, 0);
      }
      gl.drawArrays(gl.POINTS, 0, n);
      attrs.unbind();
    });
  };

  const resize = () => {
    const rect = el.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, small ? 1.6 : 1.8);
    canvas.width = Math.max(1, Math.round(rect.width * dpr));
    canvas.height = Math.max(1, Math.round(rect.height * dpr));
    gl.viewport(0, 0, canvas.width, canvas.height);
    const aspect = rect.width / Math.max(1, rect.height);
    proj = perspective(FOV, aspect, 0.1, 100);
    W = HALF_H * aspect * 1.04;
    pxDots = dpr * (rect.width < 720 ? 1.05 : 1.2);
    pxIcons = dpr * (rect.width < 720 ? 0.72 : 0.95);
    if (!stop && started) draw(0);
  };
  resize();
  const sizer = "ResizeObserver" in window ? new ResizeObserver(resize) : null;
  if (sizer) sizer.observe(el);

  // The pointer: tilts the scene a little, and brushes the mess into rows.
  const onMove = (event) => {
    const r = el.getBoundingClientRect();
    const x = event.clientX - r.left;
    const y = event.clientY - r.top;
    pointer.tx = clamp((x - r.width / 2) / (r.width / 2), -1, 1);
    pointer.ty = clamp((y - r.height / 2) / Math.max(200, r.height), -1, 1);
    pointer.twx = ((x / r.width) * 2 - 1) * HALF_H * (r.width / r.height);
    pointer.twy = (1 - (y / r.height) * 2) * HALF_H;
    if (pointer.wx < -50) {
      pointer.wx = pointer.twx;
      pointer.wy = pointer.twy;
    }
    el.style.setProperty("--hx", `${x}px`);
    el.style.setProperty("--hy", `${y}px`);
    // A good sweep through it and the word by the pointer has done its job.
    if (el.dataset.cursorLabel && event.pointerType === "mouse") {
      swept += Math.hypot(event.movementX || 0, event.movementY || 0);
      if (swept > 900) {
        delete el.dataset.cursorLabel;
        window.dispatchEvent(new Event("ls:cursor"));
        try {
          window.sessionStorage.setItem(SWEPT, "1");
        } catch (_err) {
          // It just shows again next visit.
        }
      }
    }
    if (!pointer.over) {
      pointer.over = true;
      el.classList.add("is-hovered");
    }
  };
  const onLeave = () => {
    pointer.over = false;
    pointer.tx = 0;
    pointer.ty = 0;
    el.classList.remove("is-hovered");
  };
  el.addEventListener("pointermove", onMove);
  el.addEventListener("pointerdown", onMove);
  el.addEventListener("pointerleave", onLeave);
  el.addEventListener("pointercancel", onLeave);

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
  canvas.addEventListener("webglcontextlost", (event) => {
    event.preventDefault();
    pause();
  });

  return {
    start() {
      started = true;
      introAt = reduceMotion ? time - 10 : time;
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
      el.classList.remove("is-hovered");
    },
  };
}
