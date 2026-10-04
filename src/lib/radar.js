/**
 * Radar chart as plain SVG (no chart library: full control over RTL, hand-drawn look, and size).
 *
 * Values are 1-5 per axis. RTL: the axis order runs counter-clockwise (mirrored), so the first
 * axis is still at the top and the second is on the reading-start side.
 * Only the shapes get the hand-drawn wobble; labels stay crisp so they remain readable.
 *
 * The chart can show several series at once (materials being compared). Each series is drawn in
 * its own colour (CSS var --c set on its polygon) with a see-through fill, so overlaps stay visible.
 */
import { svgEl } from "./svg.js";
import { gsap, isRTL, prefersReducedMotion } from "./reveal.js";

const R = 80; // radius of the outer ring (level 5)
const MAX = 5;

/**
 * @param {{axes:string[], series:{id:string, values:number[], color:string}[], labels?:boolean, animateIn?:boolean}} opts
 *   series[].color -> a CSS custom property name, e.g. "--m-3"
 *   labels:false   -> small version for grids (no text, aria-label only)
 *   animateIn      -> the shapes grow from the centre the first time the chart is on screen
 * @returns {SVGElement} with update(newSeries): shapes are added (grow from the centre), removed
 *   (shrink to the centre) or morphed, matched by id. With exactly one series the 1-5 numbers show next to the axis names.
 */
export function radar({ axes, series, labels = true, animateIn = false }) {
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
  });
  const describe = (list) => list.map((s) => `${s.name ? s.name + ": " : ""}${axes.map((a, i) => `${a} ${s.values[i]} מתוך ${MAX}`).join(", ")}`).join(". ");
  svg.setAttribute("aria-label", describe(series));

  // rings (levels 1..5) and spokes
  const shapes = svgEl("g", { class: "radar__shapes wobble" });
  for (let level = 1; level <= MAX; level++) {
    shapes.append(svgEl("polygon", { class: level === MAX ? "radar__ring radar__ring--outer" : "radar__ring", points: poly((R * level) / MAX) }));
  }
  axes.forEach((_, i) => {
    const [x, y] = at(i, R);
    shapes.append(svgEl("line", { class: "radar__spoke", x1: 0, y1: 0, x2: x.toFixed(1), y2: y.toFixed(1) }));
  });
  svg.append(shapes);

  // ---- series ----
  /** id -> { poly, vals (the values currently drawn, may be fractional mid-animation), tween } */
  const drawn = new Map();
  const pointsOf = (vals) => vals.map((v, i) => at(i, (R * v) / MAX).map((c) => c.toFixed(1)).join(",")).join(" ");
  // explicit keys (not Object.values): GSAP adds its own _gsap property to tweened objects
  const redraw = (entry) => entry.poly.setAttribute("points", pointsOf(axes.map((_, i) => entry.vals[i])));

  // axis numbers: separate <text> elements (never a tspan inside the name, which broke the label in two)
  const valueTexts = [];
  const showValues = (list) => {
    const single = list.length === 1;
    valueTexts.forEach((t, i) => {
      t.textContent = single ? String(list[0].values[i]) : "";
    });
  };

  if (labels) {
    axes.forEach((name, i) => {
      let [x, y] = at(i, R + 14);
      // Side labels are wide: push them outward so they clear the shapes (anchor stays "middle").
      if (Math.abs(x) > 15) x += Math.sign(x) * 26;
      else if (y < 0) y -= 14; // top label sits higher so its value clears the outer ring
      // text-anchor "middle" keeps labels centred under RTL (where "start" would anchor right).
      const common = { x: x.toFixed(1), "text-anchor": "middle", direction: "rtl" };
      svg.append(svgEl("text", { class: "radar__label", y: y.toFixed(1), ...common }, name));
      const value = svgEl("text", { class: "radar__value", y: (y + 16).toFixed(1), ...common });
      valueTexts.push(value);
      svg.append(value);
    });
  }

  /** Add, remove or morph shapes so the chart shows `list`. */
  let latest = series; // what the chart should show; a pick made before the chart is visible is not lost
  svg.update = (list, { duration = 0.7 } = {}) => {
    latest = list;
    svg.setAttribute("aria-label", list.length ? describe(list) : "תרשים מכ״ם להשוואת חומרים");
    showValues(list);
    const instant = prefersReducedMotion();
    const keep = new Set(list.map((s) => s.id));

    // removed: shrink to the centre, then take the shape out
    for (const [id, entry] of drawn) {
      if (keep.has(id)) continue;
      drawn.delete(id);
      entry.tween?.kill();
      if (instant) { entry.poly.remove(); continue; }
      entry.tween = gsap.to(entry.vals, { ...Object.fromEntries(axes.map((_, i) => [i, 0])), duration: duration * 0.6, ease: "power2.in", onUpdate: () => redraw(entry), onComplete: () => entry.poly.remove() });
    }

    // added or changed
    list.forEach((s) => {
      let entry = drawn.get(s.id);
      if (!entry) {
        const poly = svgEl("polygon", { class: "radar__data", style: `--c: var(${s.color})` });
        shapes.append(poly); // later shapes sit on top; the see-through fill keeps the earlier ones visible
        entry = { poly, vals: Object.fromEntries(axes.map((_, i) => [i, instant ? s.values[i] : 0])), tween: null };
        drawn.set(s.id, entry);
        redraw(entry);
      }
      entry.tween?.kill();
      if (instant) {
        s.values.forEach((v, i) => (entry.vals[i] = v));
        redraw(entry);
        return;
      }
      entry.tween = gsap.to(entry.vals, { ...Object.fromEntries(s.values.map((v, i) => [i, v])), duration, ease: "power2.out", onUpdate: () => redraw(entry) });
    });
  };

  if (animateIn) {
    // start empty; when the chart is actually visible, grow the shapes from the centre
    svg.update([]);
    latest = series;
    showValues(series);
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      svg.update(latest, { duration: 0.9 });
    }, { threshold: 0.4 });
    io.observe(svg);
  } else {
    svg.update(series, { duration: 0 });
  }
  return svg;
}
