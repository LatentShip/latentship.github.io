/*
 * The little WebGL kit the hero visuals share: a context, shaders, a few 4x4
 * matrices (column-major), a seeded random, and the colours for each theme.
 */

export function createGL(canvas) {
  try {
    return canvas.getContext("webgl", { alpha: true, antialias: false, premultipliedAlpha: true, powerPreference: "low-power" });
  } catch (_err) {
    return null;
  }
}

export function program(gl, vert, frag) {
  const compile = (type, source) => {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(shader) || "shader failed");
    return shader;
  };
  const p = gl.createProgram();
  gl.attachShader(p, compile(gl.VERTEX_SHADER, vert));
  gl.attachShader(p, compile(gl.FRAGMENT_SHADER, frag));
  gl.linkProgram(p);
  if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p) || "link failed");
  return p;
}

// Static attribute buffers for a program, bound again before each draw.
export function attributes(gl, prog, spec) {
  const list = Object.entries(spec).map(([name, [data, size]]) => {
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
    return { loc: gl.getAttribLocation(prog, name), buffer, size };
  });
  return {
    bind() {
      list.forEach(({ loc, buffer, size }) => {
        if (loc < 0) return;
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.enableVertexAttribArray(loc);
        gl.vertexAttribPointer(loc, size, gl.FLOAT, false, 0, 0);
      });
    },
    unbind() {
      list.forEach(({ loc }) => loc >= 0 && gl.disableVertexAttribArray(loc));
    },
  };
}

export function uniforms(gl, prog, names) {
  return Object.fromEntries(names.map((name) => [name, gl.getUniformLocation(prog, name)]));
}

export const perspective = (fovy, aspect, near, far) => {
  const f = 1 / Math.tan(fovy / 2);
  const nf = 1 / (near - far);
  return new Float32Array([f / aspect, 0, 0, 0, 0, f, 0, 0, 0, 0, (far + near) * nf, -1, 0, 0, 2 * far * near * nf, 0]);
};

export const multiply = (a, b) => {
  const out = new Float32Array(16);
  for (let c = 0; c < 4; c += 1) {
    for (let r = 0; r < 4; r += 1) {
      let s = 0;
      for (let k = 0; k < 4; k += 1) s += a[k * 4 + r] * b[c * 4 + k];
      out[c * 4 + r] = s;
    }
  }
  return out;
};

export const translate = (x, y, z) => new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, x, y, z, 1]);

export const rotX = (a) => {
  const c = Math.cos(a);
  const s = Math.sin(a);
  return new Float32Array([1, 0, 0, 0, 0, c, s, 0, 0, -s, c, 0, 0, 0, 0, 1]);
};

export const rotY = (a) => {
  const c = Math.cos(a);
  const s = Math.sin(a);
  return new Float32Array([c, 0, -s, 0, 0, 1, 0, 0, s, 0, c, 0, 0, 0, 0, 1]);
};

// A small seeded random, so the visuals look the same on every visit.
export const mulberry = (seed) => () => {
  seed |= 0;
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

// Particle colours (linear 0..1) for the light and dark themes.
export function palette() {
  const dark = document.documentElement.getAttribute("data-theme") === "dark";
  return dark
    ? { chaos: [0.56, 0.66, 0.6], ring: [0.62, 0.86, 0.4], lane0: [0.7, 0.88, 0.5], lane1: [0.47, 0.74, 0.22], ink: [0.74, 0.82, 0.76], soft: [0.38, 0.58, 0.26] }
    : { chaos: [0.42, 0.5, 0.45], ring: [0.435, 0.698, 0.227], lane0: [0.227, 0.392, 0.133], lane1: [0.357, 0.596, 0.188], ink: [0.28, 0.36, 0.31], soft: [0.62, 0.8, 0.46] };
}
