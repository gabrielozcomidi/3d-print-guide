/**
 * Shared helpers for the printer-type diagrams (bedslinger.js, corexy.js, delta.js, ...).
 *
 * The big idea of these drawings: every machine prints the same little shape, so what differs is
 * WHAT MOVES to make it. Moving parts are tinted (.d-move), fixed parts are outlined (.d-fixed),
 * and the printed part uses the technology colour. Same legend on every drawing.
 *
 * Every diagram is a pure function of a progress value p (0..1): draw(p) sets the position of
 * everything. That keeps the kinematics readable and makes the reduced-motion version trivial
 * (just draw(1)).
 */
import { gsap } from "../lib/reveal.js";

/** Same legend for every machine drawing (kinds are styled in styles/technologies.css). */
export const movingLegend = [
  { label: "חלק נע", kind: "move" },
  { label: "חלק קבוע", kind: "box" },
  { label: "החלק המודפס", kind: "fill" },
];

/** Set several attributes at once; numbers are rounded to keep the DOM tidy. */
export function set(el, attrs) {
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, typeof v === "number" ? String(Math.round(v * 100) / 100) : v);
}

/**
 * Run draw(p) as a looping animation, or once at its end state when motion is reduced.
 * @returns {{play(), pause(), destroy()}} same control object every diagram returns
 */
export function runLoop(draw, { animate, duration = 9 }) {
  if (!animate) {
    draw(1);
    return { play() {}, pause() {}, destroy() {} };
  }
  const state = { p: 0 };
  draw(0);
  const tween = gsap.to(state, { p: 1, duration, ease: "none", repeat: -1, paused: true, onUpdate: () => draw(state.p) });
  return { play: () => tween.play(), pause: () => tween.pause(), destroy: () => tween.kill() };
}

/** Point on a square outline for t in 0..1 (clockwise from the top-left corner). */
export function squarePoint(t, cx, cy, half) {
  const corners = [
    [cx - half, cy - half],
    [cx + half, cy - half],
    [cx + half, cy + half],
    [cx - half, cy + half],
    [cx - half, cy - half],
  ];
  const side = Math.min(Math.floor(t * 4), 3);
  const f = t * 4 - side;
  const [a, b] = [corners[side], corners[side + 1]];
  return [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f];
}

/** Sample `point(t)` for t from 0 to q and return an SVG path string (the trail drawn so far). */
export function trailPath(point, q, samples = 64) {
  const n = Math.max(2, Math.ceil(samples * q));
  let d = "";
  for (let i = 0; i <= n; i++) {
    const [x, y] = point((q * i) / n);
    d += (i ? "L" : "M") + x.toFixed(1) + " " + y.toFixed(1);
  }
  return d;
}

/** Printing takes the first 90% of the loop, the finished part is shown for the rest. */
export const printProgress = (p) => Math.min(p / 0.9, 1);
