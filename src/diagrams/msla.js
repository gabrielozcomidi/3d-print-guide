/**
 * MSLA/DLP, side view (bottom-up, like SLA). Under the resin vat sits an LCD "mask" and a UV light
 * panel. The LCD shows the layer as an image: black pixels block the light, open pixels let it through.
 * The WHOLE layer cures at once, so every layer takes the same time however much detail it has.
 * Steps: 0 show the layer on the LCD, 1 cure the whole layer, 2 peel and lower.
 */
import { gsap } from "../lib/reveal.js";
import { svgEl } from "../lib/svg.js";

export const legend = [
  { label: "חלק נע", kind: "move" },
  { label: "חלק קבוע", kind: "box" },
  { label: "שרף נוזלי", kind: "resin" },
  { label: "החלק", kind: "fill" },
  { label: "אור UV", kind: "hot" },
  { label: "מסך LCD (פיקסלים סגורים)", kind: "mask" },
];

const LAYERS = 6;
const LAYER_H = 12;
const PART_X = 140;
const PART_W = 120;
const CURE_BOTTOM = 234;
const FIRST_LAYER_Y = CURE_BOTTOM - LAYER_H;
const PEEL = 26;
const LCD_Y = 250;

export function create(svg, { animate, onStep = () => {} }) {
  svg.setAttribute("viewBox", "0 0 400 300");
  svg.setAttribute("role", "img");
  svg.setAttribute("aria-label", "מסך LCD מעביר אור רק דרך הפיקסלים הפתוחים, וכל השכבה מתקשה בבת אחת");

  // ----- static scene -----
  const resin = svgEl("rect", { class: "d-resin", x: 71, y: 150, width: 258, height: 86 });
  const vat = svgEl("path", { class: "d-vat", d: "M70 140 V240 H330 V140" });
  const film = svgEl("line", { class: "d-film", x1: 71, y1: 236, x2: 329, y2: 236 });
  // LCD: closed pixels (solid ink) on both sides, open window in the middle (matches the part's width)
  const lcdClosed = [svgEl("rect", { class: "d-mask", x: 70, y: LCD_Y, width: PART_X - 70, height: 10 }), svgEl("rect", { class: "d-mask", x: PART_X + PART_W, y: LCD_Y, width: 330 - PART_X - PART_W, height: 10 })];
  const lcdOpen = svgEl("rect", { class: "d-fixed", x: PART_X, y: LCD_Y, width: PART_W, height: 10 });
  const panel = svgEl("rect", { class: "d-fixed", x: 70, y: 280, width: 260, height: 10, rx: 3 });
  // light: vertical rays through the open window
  const rays = Array.from({ length: 11 }, (_, i) => svgEl("line", { class: "d-beam", x1: PART_X + 6 + i * 10.8, x2: PART_X + 6 + i * 10.8, y1: 278, y2: CURE_BOTTOM + 2 }));
  const light = svgEl("g", { opacity: 0 }, ...rays);

  // ----- moving assembly: rod + plate + part -----
  const rod = svgEl("rect", { class: "d-plate", x: 197, y: -20, width: 6, height: FIRST_LAYER_Y - 10 + 20 });
  const plate = svgEl("rect", { class: "d-plate", x: 120, y: FIRST_LAYER_Y - 10, width: 160, height: 10, rx: 2 });
  const layers = Array.from({ length: LAYERS }, (_, i) =>
    svgEl("rect", { class: "d-layer", x: PART_X, y: FIRST_LAYER_Y + i * LAYER_H, width: animate ? 0 : PART_W, height: LAYER_H - 1 })
  );
  const asm = svgEl("g", {}, rod, plate, ...layers);
  svg.replaceChildren(resin, vat, film, ...lcdClosed, lcdOpen, panel, asm, light);

  if (!animate) {
    gsap.set(asm, { y: -LAYERS * LAYER_H - PEEL });
    return { legend, play() {}, pause() {}, destroy() {} };
  }

  const tl = gsap.timeline({ repeat: -1, paused: true });
  tl.set(layers, { attr: { width: 0 }, opacity: 1 }, 0);
  tl.set(asm, { y: 0 }, 0);
  tl.set(light, { opacity: 0 }, 0);

  for (let i = 0; i < LAYERS; i++) {
    // 0) the LCD shows the layer: the window opens
    tl.call(onStep, [0]);
    tl.to(lcdOpen, { attr: { "stroke-width": 5 }, duration: 0.2 });
    // 1) UV light passes through the open pixels and the WHOLE layer cures at once (same time for every layer)
    tl.call(onStep, [1]);
    tl.set(light, { opacity: 1 });
    tl.to(layers[i], { attr: { width: PART_W }, duration: 0.25, ease: "power2.out" });
    tl.to({}, { duration: i === 0 ? 0.6 : 0.3 }); // exposure time
    tl.set(light, { opacity: 0 });
    tl.to(lcdOpen, { attr: { "stroke-width": 2.5 }, duration: 0.1 });
    // 2) peel and lower
    tl.call(onStep, [2]);
    tl.to(asm, { y: -(i + 1) * LAYER_H - PEEL, duration: 0.45, ease: "power2.out" });
    if (i < LAYERS - 1) tl.to(asm, { y: -(i + 1) * LAYER_H, duration: 0.35, ease: "power2.inOut" });
  }
  tl.to({}, { duration: 1.2 });
  tl.to(layers, { opacity: 0, duration: 0.4 });
  tl.to(asm, { y: 0, duration: 0.6, ease: "power2.inOut" });

  return { legend, play() { tl.play(); }, pause() { tl.pause(); }, destroy() { tl.kill(); } };
}
