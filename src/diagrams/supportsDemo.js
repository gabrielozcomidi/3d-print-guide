/**
 * Support demos. One scene, drawn from a few numbers (the state), for the FDM styles:
 * a mushroom-shaped part (a column with a wide cap) whose cap overhangs into thin air.
 *   mode "bare"    no supports: the cap droops in the air
 *   mode "with"    supports of the chosen style grow layer by layer under the cap
 *   mode "removed" supports gone: the underside shows the scars that style leaves
 * Styles: normal (columns), tree (trunk + branches), soluble (columns that dissolve, no scars),
 * metal (dense pillars + heat arrows), powder (loose powder around the part, no supports at all).
 * Resin has its own scene (createResinDemo): a tilted part hanging from the plate on supports with tips.
 *
 * Pictures are schematic. Style classes are the shared ones (.d-fixed outline, .d-layer printed part,
 * .d-arm lines, .d-powder tint) plus .d-sup-soluble / .d-sup-metal (technologies.css).
 */
import { gsap, prefersReducedMotion } from "../lib/reveal.js";
import { svgEl } from "../lib/svg.js";
import { set } from "./kit.js";

const LH = 10;
const PLATE_Y = 190;
const COL = { x: 125, w: 50 };
const CAP = { x: 60, w: 180 };
const COLUMN_LAYERS = 10; // layers 0..9 are the column, 10..11 the cap
const LAYERS = 12;
const CAP_TOP = PLATE_Y - LH * LAYERS; // 70
const UNDERSIDE = PLATE_Y - LH * COLUMN_LAYERS; // 90
const clamp = (v) => Math.max(0, Math.min(1, v));

/** Tree geometry: per side a trunk that splits into branches touching the cap underside at a few points. */
const TREES = [
  { base: 92, tips: [66, 92, 118] },
  { base: 208, tips: [182, 208, 234] },
];
const SPLIT_Y = 140; // below this the trunk is one thick line

/** x of branch i of a tree at height y (trunk below SPLIT_Y, straight to its tip above). */
const branchX = (tree, i, y) => (y >= SPLIT_Y ? tree.base : tree.base + (tree.tips[i] - tree.base) * ((SPLIT_Y - y) / (SPLIT_Y - UNDERSIDE)));

export const SUPPORT_KINDS = ["normal", "tree", "soluble", "metal", "powder"];

export function createSupportsDemo(svg, { kind }) {
  svg.setAttribute("viewBox", "0 0 300 220");
  svg.setAttribute("role", "img");

  const S = { build: LAYERS, sup: 1, bare: 0, scar: 0 }; // build: how many layers are printed (0..12)

  // ---- elements ----
  const plate = svgEl("rect", { class: "d-fixed", x: 20, y: PLATE_Y, width: 260, height: 10, rx: 3 });
  const powder = svgEl("rect", { class: "d-powder", x: 30, y: CAP_TOP - 14, width: 240, height: PLATE_Y - CAP_TOP + 14 });
  const layers = Array.from({ length: LAYERS }, (_, k) => svgEl(k < COLUMN_LAYERS ? "rect" : "polygon", { class: "d-layer" }));

  // supports: a group of small pieces per layer so they can grow with the part
  const supClass = kind === "soluble" ? "d-sup-soluble" : kind === "metal" ? "d-sup-metal" : "d-sup";
  const pieces = Array.from({ length: COLUMN_LAYERS }, () => []);
  const supGroup = svgEl("g", {});
  if (kind === "normal" || kind === "soluble" || kind === "metal") {
    const step = kind === "metal" ? 5 : 12;
    const xs = [];
    for (let x = CAP.x + 4; x < COL.x - 2; x += step) xs.push(x);
    for (let x = COL.x + COL.w + 4; x < CAP.x + CAP.w - 2; x += step) xs.push(x);
    for (let k = 0; k < COLUMN_LAYERS; k++) {
      for (const x of xs) {
        const r = svgEl("rect", { class: supClass, x, width: kind === "metal" ? 2 : 3.5 });
        pieces[k].push({ el: r, kind: "rect" });
        supGroup.append(r);
      }
    }
  } else if (kind === "tree") {
    for (let k = 0; k < COLUMN_LAYERS; k++) {
      const yLo = PLATE_Y - LH * k;
      const yHi = yLo - LH;
      for (const tree of TREES) {
        // below the split: one trunk piece; above: one piece per branch
        const trunk = yLo > SPLIT_Y && yHi >= SPLIT_Y;
        const count = trunk ? 1 : tree.tips.length;
        for (let i = 0; i < count; i++) {
          const el = svgEl("line", { class: "d-arm", "stroke-width": trunk ? 5 : 2.6 });
          pieces[k].push({ el, kind: "line", tree, i, yLo, yHi });
          supGroup.append(el);
        }
      }
    }
  }
  // metal: heat arrows going down the column into the plate
  const heat = kind === "metal" ? [145, 155, 165].map((x) => svgEl("path", { class: "d-mark", d: `M${x} 110 V150 M${x - 4} 144 L${x} 151 L${x + 4} 144` })) : [];
  const roof = svgEl("rect", { class: supClass, x: CAP.x, y: UNDERSIDE - 3, width: CAP.w, height: 3 }); // dense interface layer under the cap

  // scars on the underside after removal
  let scarD = "";
  const zig = (x0, x1, amp, st) => {
    let d = `M${x0} ${UNDERSIDE}`;
    for (let x = x0, up = true; x < x1; x += st, up = !up) d += `L${x + st / 2} ${UNDERSIDE + (up ? amp : -amp * 0.2)}`;
    return d;
  };
  if (kind === "normal") scarD = zig(CAP.x, COL.x, 3.2, 5) + zig(COL.x + COL.w, CAP.x + CAP.w, 3.2, 5);
  else if (kind === "metal") scarD = zig(CAP.x, COL.x, 2.2, 3.4) + zig(COL.x + COL.w, CAP.x + CAP.w, 2.2, 3.4);
  else if (kind === "tree") scarD = TREES.flatMap((t) => t.tips.map((x) => `M${x - 3} ${UNDERSIDE}q3 5 6 0`)).join("");
  else scarD = `M${CAP.x} ${UNDERSIDE + 1}H${COL.x}M${COL.x + COL.w} ${UNDERSIDE + 1}H${CAP.x + CAP.w}`; // soluble / powder: a clean edge
  const scars = svgEl("path", { class: "d-mark", d: scarD, "stroke-width": 2.5 });

  svg.append(...(kind === "powder" ? [powder] : []), plate, ...layers, supGroup, roof, ...heat, scars);

  // ---- render ----
  function render() {
    // part layers
    layers.forEach((el, k) => {
      const frac = clamp(S.build - k);
      const y = PLATE_Y - LH * (k + 1);
      if (k < COLUMN_LAYERS) {
        set(el, { x: COL.x, y, width: COL.w * frac, height: LH - 1 });
        return;
      }
      // cap layers: a polygon whose outer ends sag when there are no supports
      const sag = (S.bare ? (k === COLUMN_LAYERS ? 11 : 17) : 0) * frac;
      const w = CAP.w * frac;
      const cx = CAP.x + CAP.w / 2;
      const x0 = cx - w / 2;
      const x1 = cx + w / 2;
      const h = LH - 1;
      set(el, { points: `${x0},${y + sag} ${COL.x},${y} ${COL.x + COL.w},${y} ${x1},${y + sag} ${x1},${y + sag + h} ${COL.x + COL.w},${y + h} ${COL.x},${y + h} ${x0},${y + sag + h}`, opacity: frac > 0 ? 1 : 0 });
    });

    // supports (grow with the part; drawn only for layers already printed)
    pieces.forEach((list, k) => {
      const frac = clamp(S.build - k);
      for (const p of list) {
        if (p.kind === "rect") {
          const h = (LH - 0.5) * frac;
          set(p.el, { y: PLATE_Y - LH * k - h, height: h });
        } else {
          const yEnd = p.yLo - (p.yLo - p.yHi) * frac;
          set(p.el, { x1: branchX(p.tree, p.i, p.yLo), y1: p.yLo, x2: branchX(p.tree, p.i, yEnd), y2: yEnd });
        }
      }
    });
    const supVisible = clamp(S.build - COLUMN_LAYERS + 0.5);
    set(supGroup, { opacity: S.sup });
    set(roof, { opacity: S.sup * supVisible * (kind === "tree" || kind === "powder" ? 0 : 1) });
    heat.forEach((h) => set(h, { opacity: S.sup * clamp(S.build / 6) }));
    set(powder, { opacity: kind === "powder" ? S.sup * clamp(S.build / 4) : 0 });
    set(scars, { opacity: S.scar });
  }

  // ---- control ----
  let tween = null;
  /** mode: "bare" | "with" | "removed". Builds up again for bare/with; removal fades supports out. */
  function setMode(mode) {
    tween?.kill();
    const reduced = prefersReducedMotion();
    svg.setAttribute("aria-label", mode === "bare" ? "בלי תמיכות הבליטה צונחת באוויר" : mode === "with" ? "התמיכות גדלות שכבה אחרי שכבה מתחת לבליטה" : "אחרי הסרת התמיכות נשארים סימנים על התחתית");
    if (mode === "removed") {
      Object.assign(S, { build: LAYERS, bare: 0 });
      if (reduced) {
        Object.assign(S, { sup: 0, scar: 1 });
        render();
      } else {
        tween = gsap.to(S, { sup: 0, scar: 1, duration: 0.8, ease: "power1.inOut", onUpdate: render });
      }
      return;
    }
    Object.assign(S, { bare: mode === "bare" ? 1 : 0, sup: mode === "bare" ? 0 : 1, scar: 0, build: reduced ? LAYERS : 0 });
    render();
    if (!reduced) tween = gsap.to(S, { build: LAYERS, duration: 4.2, ease: "none", onUpdate: render });
  }

  setMode("with");
  return { setMode, destroy: () => tween?.kill() };
}

// ====================================================================== resin

const LEVELS = {
  light: { pillars: 5, w: 2, tip: 1.6 },
  medium: { pillars: 4, w: 3.6, tip: 2.6 },
  heavy: { pillars: 3, w: 6, tip: 4.2 },
};

/**
 * Resin: the part hangs from the plate (printed upside down), tilted, held by supports that end in
 * small tips. `level` sets how many supports, how thick, and how big the tips are (and so the marks).
 */
export function createResinDemo(svg, { level }) {
  svg.setAttribute("viewBox", "0 0 300 220");
  svg.setAttribute("role", "img");
  const cfg = LEVELS[level];
  const S = { build: 0, sup: 1, mark: 0 };

  const plate = svgEl("rect", { class: "d-fixed", x: 30, y: 10, width: 240, height: 12, rx: 3 });
  const raft = svgEl("rect", { class: "d-sup", x: 70, y: 22, width: 160, height: 6 });
  const part = svgEl("rect", { class: "d-layer", x: -62, y: -14, width: 124, height: 28, rx: 4 });
  const partG = svgEl("g", { transform: "translate(150 138) rotate(-28)" }, part);
  const angle = (-28 * Math.PI) / 180;
  // points along the part's upper edge (local y = -14), where supports end
  const tips = Array.from({ length: cfg.pillars }, (_, i) => {
    const xl = -50 + (100 * i) / (cfg.pillars - 1);
    const yl = -14;
    return { x: 150 + xl * Math.cos(angle) - yl * Math.sin(angle), y: 138 + xl * Math.sin(angle) + yl * Math.cos(angle) };
  });
  const pillars = tips.map((t) => svgEl("rect", { class: "d-arm-fat", x: t.x - cfg.w / 2, y: 28, width: cfg.w, height: Math.max(1, t.y - 28 - cfg.tip) }));
  const tipEls = tips.map((t) => svgEl("circle", { class: "d-arm-fat", cx: t.x, cy: t.y - cfg.tip / 2, r: cfg.tip }));
  const marks = tips.map((t) => svgEl("circle", { class: "d-mark", cx: t.x, cy: t.y, r: cfg.tip * 0.9, "stroke-width": 1.6 }));
  const supG = svgEl("g", {}, raft, ...pillars, ...tipEls);
  const markG = svgEl("g", {}, ...marks);
  const tilt = svgEl("path", { class: "d-mark", d: "M214 160 a60 60 0 0 0 -8 -40 M210 126 l-4 -8 l-9 3", "stroke-width": 2 });
  svg.append(plate, supG, partG, markG, tilt);

  function render() {
    set(supG, { opacity: S.sup * clamp(S.build * 1.4) });
    set(partG, { opacity: clamp(S.build * 3) });
    set(markG, { opacity: S.mark });
  }
  let tween = null;
  function setMode(mode) {
    tween?.kill();
    const reduced = prefersReducedMotion();
    svg.setAttribute("aria-label", mode === "with" ? "תמיכות ברמה שנבחרה מחזיקות את החלק הנטוי על הפלטה" : "אחרי ההסרה נשארים סימנים קטנים בנקודות המגע");
    if (mode === "removed") {
      if (reduced) Object.assign(S, { build: 1, sup: 0, mark: 1 }), render();
      else tween = gsap.to(S, { build: 1, sup: 0, mark: 1, duration: 0.8, onUpdate: render });
      return;
    }
    Object.assign(S, { build: reduced ? 1 : 0, sup: 1, mark: 0 });
    render();
    if (!reduced) tween = gsap.to(S, { build: 1, duration: 1.6, ease: "power1.out", onUpdate: render });
  }
  setMode("with");
  return { setMode, destroy: () => tween?.kill() };
}
