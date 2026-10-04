/**
 * Print Day finale: the printed object drawn on a canvas as a stack of layers, seen from slightly above,
 * printed layer by layer by a nozzle and then slowly turning. No 3D library: every object is a few simple parts
 * (data/game.js), so for each layer we can work out its cross-section directly, tilt it and paint the layers
 * from the bottom up (a layer never hides one below it, so no depth sorting is needed between layers).
 *
 *   per layer:   cross-section polygons of the parts at that height (computed once, with a little seeded jitter
 *                so the edges look hand-drawn but stay still while the object turns)
 *   per frame:   rotate about the vertical axis, project, paint walls (a few offset copies), then the top face
 *   print:       layer i is revealed left to right (or back) as the nozzle sweeps over it
 *
 * Colours come from CSS variables (read once). Reduced motion: the finished object is drawn once, no turning;
 * the owner of the canvas can still call setAngle() (the game offers a slider).
 */
import { cssVar } from "../dom.js";
import { prefersReducedMotion } from "../reveal.js";

const TILT = 0.52; // camera looks down at the object by this angle (rad)
const SIDES = 22; // points used for round cross-sections
const SPIN = 0.55; // turning speed, rad/s

// ---------- geometry ----------

/** Cross-section of one part at height y: array of [x, z] points, or null when the part does not reach y. */
function sectionOf(p, y) {
  const [px, py, pz] = p.at;
  const [w, hgt, d] = p.size;
  if (y < py || y > py + hgt) return null;
  const t = (y - py) / hgt; // 0 at the bottom of the part, 1 at the top
  if (p.shape === "box") return [[px - w / 2, pz - d / 2], [px + w / 2, pz - d / 2], [px + w / 2, pz + d / 2], [px - w / 2, pz + d / 2]];
  let s = 1;
  if (p.shape === "ellipsoid") s = Math.sqrt(Math.max(0, 1 - (2 * t - 1) ** 2));
  else if (p.shape === "cone") s = 1 - t;
  else if (p.shape === "frustum") s = 1 - t * (1 - (p.taper ?? 0.6));
  if (s < 0.04) return null;
  const pts = [];
  for (let k = 0; k < SIDES; k++) {
    const a = (k / SIDES) * Math.PI * 2;
    pts.push([px + (w / 2) * s * Math.cos(a), pz + (d / 2) * s * Math.sin(a)]);
  }
  return pts;
}

/** Stable pseudo-random number in -0.5..0.5 from two integers (so jitter never changes between frames). */
const jit = (a, b) => ((Math.sin(a * 127.1 + b * 311.7) * 43758.5453) % 1 + 1) % 1 - 0.5;

/** Parse "#rrggbb" -> [r,g,b]. */
const rgb = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
const mix = (a, b, t) => `rgb(${a.map((v, i) => Math.round(v + (b[i] - v) * t)).join(",")})`;

/**
 * @param {HTMLCanvasElement} canvas
 * @param {{parts:object[]}} obj an object from data/game.js
 * @param {{layers:number}} opts how many layers the object is cut into (from the slicing choice)
 */
export function createFinale(canvas, obj, { layers: N }) {
  const ctx = canvas.getContext("2d");
  const top = Math.max(...obj.parts.map((p) => p.at[1] + p.size[1]));
  const dy = top / N; // height of one layer in model units
  const R = Math.max(...obj.parts.map((p) => Math.hypot(Math.abs(p.at[0]) + p.size[0] / 2, Math.abs(p.at[2]) + p.size[2] / 2))); // radius that always contains the object

  // colours: the printed part in the technology colour, top faces lighter, ink for the lines
  const ink = cssVar("--accent");
  const blue = rgb(cssVar("--t-fdm"));
  const paper = rgb(cssVar("--bg"));
  const wallColor = mix(blue, paper, 0);
  const faceColor = mix(blue, paper, 0.38);
  const inkSoft = ink;

  // cross-sections for every layer, computed once
  const slabs = Array.from({ length: N }, (_, i) => {
    const y = (i + 0.5) * dy;
    const polys = [];
    obj.parts.forEach((p, pi) => {
      const pts = sectionOf(p, y);
      if (!pts) return;
      const j = pts.map(([x, z], k) => [x + jit(i * 7 + pi, k) * 0.5, z + jit(i * 13 + pi, k + 50) * 0.5]);
      polys.push({ pts: j, cx: p.at[0], cz: p.at[2] });
    });
    return polys;
  });

  // ---------- view ----------
  let W = 0, H = 0, S = 1, cx = 0, cy = 0, dpr = 1;
  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    const r = canvas.getBoundingClientRect();
    W = Math.max(1, Math.round(r.width));
    H = Math.max(1, Math.round(r.height));
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    const sinT = Math.sin(TILT), cosT = Math.cos(TILT);
    // scale so the whole object (and the bed under it) fits with a margin
    S = Math.min((W * 0.88) / (2 * R * 1.08), (H * 0.9) / (top * cosT + 2 * R * 1.08 * sinT));
    cx = W / 2;
    cy = H - 0.05 * H - R * 1.08 * sinT * S; // screen y of the middle of the bed
    if (!running) draw();
  }

  /** model (x,y,z) turned by `a` about the vertical axis -> screen [X, Y, depth] */
  let angle = 0.6;
  const project = (x, y, z) => {
    const c = Math.cos(angle), s = Math.sin(angle);
    const xr = x * c + z * s;
    const zr = -x * s + z * c; // larger = nearer the viewer
    return [cx + xr * S, cy - y * Math.cos(TILT) * S + zr * Math.sin(TILT) * S, zr];
  };

  function polygon(pts, y, ox = 0) {
    ctx.beginPath();
    pts.forEach(([x, z], k) => {
      const [X, Y] = project(x, y, z);
      if (k) ctx.lineTo(X + ox, Y);
      else ctx.moveTo(X + ox, Y);
    });
    ctx.closePath();
  }

  /** one layer: walls (copies of the polygon slid down), then the lit top face with an ink edge */
  function drawLayer(i) {
    const yTop = (i + 1) * dy;
    const wall = Math.max(1, dy * Math.cos(TILT) * S); // screen height of the wall in px
    const polys = slabs[i].map((p) => ({ ...p, depth: project(p.cx, 0, p.cz)[2] })).sort((a, b) => a.depth - b.depth); // far parts first
    for (const p of polys) {
      ctx.fillStyle = wallColor;
      for (let o = wall; o > 0.5; o -= 1.2) {
        polygon(p.pts, yTop);
        ctx.save();
        ctx.translate(0, o);
        ctx.fill();
        ctx.restore();
      }
      polygon(p.pts, yTop);
      ctx.fillStyle = faceColor;
      ctx.fill();
      ctx.strokeStyle = inkSoft;
      ctx.lineWidth = N > 70 ? 0.7 : 1;
      ctx.stroke();
    }
  }

  function drawBed() {
    ctx.beginPath();
    ctx.ellipse(cx, cy, R * 1.08 * S, R * 1.08 * Math.sin(TILT) * S, 0, 0, Math.PI * 2);
    ctx.fillStyle = mix(paper, blue, 0.06);
    ctx.fill();
    ctx.strokeStyle = ink;
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  function drawNozzle(x, y) {
    ctx.save();
    ctx.translate(x, y);
    ctx.strokeStyle = ink;
    ctx.fillStyle = mix(paper, paper, 0);
    ctx.lineWidth = 1.6;
    ctx.lineJoin = ctx.lineCap = "round";
    ctx.beginPath(); ctx.moveTo(0, -13); ctx.lineTo(0, -44); ctx.stroke();
    ctx.beginPath(); ctx.roundRect(-8, -14, 16, 10, 2); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-5, -4); ctx.lineTo(5, -4); ctx.lineTo(0, 3); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.restore();
  }

  // ---------- state and loop ----------
  let progress = N; // 0..N layers printed (fractional while the nozzle is on a layer); starts finished
  let spinning = false;
  let running = false;
  let raf = 0, last = 0;
  let printState = null; // { t, dur, onDone }
  let visible = true;

  function draw() {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);
    drawBed();
    const whole = Math.floor(progress);
    for (let i = 0; i < Math.min(whole, N); i++) drawLayer(i);
    if (whole >= 0 && whole < N && progress > whole) {
      // the layer being printed: revealed up to the nozzle, which sweeps back and forth
      const within = progress - whole;
      const reach = R * 1.1 * S;
      const frac = whole % 2 ? 1 - within : within;
      const nx = cx - reach + frac * 2 * reach;
      ctx.save();
      ctx.beginPath();
      if (whole % 2) ctx.rect(nx, 0, W - nx, H);
      else ctx.rect(0, 0, nx, H);
      ctx.clip();
      drawLayer(whole);
      ctx.restore();
      drawNozzle(nx, project(0, (whole + 1) * dy, 0)[1]);
    }
  }

  function frame(now) {
    raf = requestAnimationFrame(frame);
    const dt = Math.max(0, Math.min(0.05, (now - last) / 1000)); // never negative: the first rAF timestamp can be a hair before `last`
    last = now;
    if (!visible) return;
    if (printState) {
      printState.t += dt;
      progress = Math.min(N, (printState.t / printState.dur) * N);
      if (progress >= N) {
        const done = printState.onDone;
        printState = null;
        progress = N;
        done?.();
      }
    } else if (spinning) angle += dt * SPIN;
    draw();
  }
  function loop(on) {
    if (on === running) return;
    running = on;
    cancelAnimationFrame(raf);
    if (on) { last = performance.now(); raf = requestAnimationFrame(frame); }
  }

  const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting), { threshold: 0.05 });
  io.observe(canvas);
  const ro = new ResizeObserver(resize);
  ro.observe(canvas);
  resize();
  draw();

  return {
    /** print the whole object, then call onDone. Reduced motion: shows it finished at once. */
    print({ onDone } = {}) {
      if (prefersReducedMotion()) { progress = N; draw(); onDone?.(); return; }
      progress = 0;
      printState = { t: 0, dur: Math.min(5.5, 2 + N * 0.04), onDone };
      loop(true);
    },
    /** turn slowly (false: stop). Ignored when the user prefers reduced motion. */
    spin(on) {
      spinning = on && !prefersReducedMotion();
      loop(spinning || !!printState);
    },
    /** turn to a given angle in radians (the slider) */
    setAngle(a) { angle = a; if (!running) draw(); },
    get angle() { return angle; },
    /** show the finished object without any animation */
    showFinished() { progress = N; printState = null; draw(); },
    destroy() { loop(false); io.disconnect(); ro.disconnect(); },
  };
}
