/**
 * Radar chart as plain SVG (no chart library: full control over RTL, hand-drawn look, and size).
 *
 * Values are 1-5 per axis. RTL: the axis order runs counter-clockwise (mirrored), so the first
 * axis is still at the top and the second is on the reading-start side.
 * Only the shapes get the hand-drawn wobble; labels stay crisp so they remain readable.
 */
import { svgEl } from "./svg.js";
import { gsap, isRTL, prefersReducedMotion } from "./reveal.js";

const R = 80; // radius of the outer ring (level 5)
const MAX = 5;

/**
 * @param {{axes:string[], values:number[], labels?:boolean, animateIn?:boolean}} opts
 *   labels:false  -> small version for grids (no text, aria-label only)
 *   animateIn     -> the shape grows from the centre the first time the chart is on screen
 * @returns {SVGElement} uses CSS var --c for the data shape; set it on a parent.
 *   The element also has update(newValues): the blue shape and the numbers morph to the new values.
 */
export function radar({ axes, values, labels = true, animateIn = false }) {
  const n = axes.length;
  const dir = isRTL() ? -1 : 1;
  // point at angle for axis i, at radius r. Starts at the top (-90deg).
  const at = (i, r) => {
    const a = (-90 + dir * (i * 360) / n) * (Math.PI / 180);
    return [r * Math.cos(a), r * Math.sin(a)];
  };
  const poly = (r) => axes.map((_, i) => at(i, r).map((v) => v.toFixed(1)).join(",")).join(" ");

  const svg = svgEl("svg", {
    class: "radar",
    viewBox: labels ? "-170 -128 340 254" : "-96 -96 192 192",
    role: "img",
    "aria-label": axes.map((a, i) => `${a} ${values[i]} מתוך ${MAX}`).join(", "),
  });

  // rings (levels 1..5) and spokes
  const shapes = svgEl("g", { class: "radar__shapes wobble" });
  for (let level = 1; level <= MAX; level++) {
    shapes.append(svgEl("polygon", { class: level === MAX ? "radar__ring radar__ring--outer" : "radar__ring", points: poly((R * level) / MAX) }));
  }
  axes.forEach((_, i) => {
    const [x, y] = at(i, R);
    shapes.append(svgEl("line", { class: "radar__spoke", x1: 0, y1: 0, x2: x.toFixed(1), y2: y.toFixed(1) }));
  });
  // the data shape
  const dataPoly = svgEl("polygon", { class: "radar__data" });
  shapes.append(dataPoly);
  const valueTspans = [];
  /** draw the data shape (and numbers) for a set of values; values may be fractional mid-animation */
  const draw = (vals) => {
    dataPoly.setAttribute("points", vals.map((v, i) => at(i, (R * v) / MAX).map((c) => c.toFixed(1)).join(",")).join(" "));
    valueTspans.forEach((t, i) => (t.textContent = String(Math.round(vals[i]))));
  };
  svg.append(shapes);

  if (labels) {
    axes.forEach((name, i) => {
      let [x, y] = at(i, R + 14);
      // Side labels are wide: push them outward so they clear the data shape (anchor stays "middle").
      if (Math.abs(x) > 15) x += Math.sign(x) * 26;
      else if (y < 0) y -= 10; // top label sits higher so its value clears the outer ring
      // text-anchor "middle" keeps labels centred under RTL (where "start" would anchor right).
      const t = svgEl("text", { class: "radar__label", x: x.toFixed(1), y: y.toFixed(1), "text-anchor": "middle", direction: "rtl" });
      // axis name, then the value on a second line (a tspan with its own x/dy)
      const v = svgEl("tspan", { class: "radar__value", x: x.toFixed(1), dy: "1.2em" });
      valueTspans.push(v);
      t.append(name, v);
      svg.append(t);
    });
  }

  // ---- morphing ----
  const state = Object.fromEntries(values.map((v, i) => [i, animateIn ? 0 : v]));
  const current = () => axes.map((_, i) => state[i]);
  let tween = null;
  const describe = (vals) => axes.map((a, i) => `${a} ${vals[i]} מתוך ${MAX}`).join(", ");

  /** Morph to new values (jumps instead when the user prefers reduced motion). */
  svg.update = (next, { duration = 0.7 } = {}) => {
    svg.setAttribute("aria-label", describe(next));
    tween?.kill();
    if (prefersReducedMotion()) {
      next.forEach((v, i) => (state[i] = v));
      draw(current());
      return;
    }
    tween = gsap.to(state, { ...Object.fromEntries(next.map((v, i) => [i, v])), duration, ease: "power2.out", onUpdate: () => draw(current()) });
  };

  draw(current());
  if (animateIn) {
    // wait until the chart is actually visible, then grow it from the centre
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      svg.update(values, { duration: 0.9 });
    }, { threshold: 0.4 });
    io.observe(svg);
  }
  return svg;
}
