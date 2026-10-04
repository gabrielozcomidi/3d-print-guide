/**
 * Accessibility menu: a floating button that opens a small panel of display options. Everything works by
 * switching classes / a data attribute on <html>; the matching CSS is in styles/a11y.css. Choices are kept
 * in this browser only (localStorage, see the privacy page), and applied again on the next visit.
 *
 * Options: text size (4 steps), high contrast, grayscale, highlight links, readable font, text spacing,
 * large cursor, strong focus ring, stop animations. "Reset" clears all of it.
 *  "Pause animations" pauses every GSAP animation at once (and back on resumes them) and makes prefersReducedMotion() true.
 * Keyboard: the button and every control are real <button>s; Escape closes the panel and returns focus.
 */
import { h } from "./dom.js";
import { svgEl } from "./svg.js";
import { gsap } from "./reveal.js";
import { link } from "./router.js";

const KEY = "guide-a11y";
const SIZES = ["100%", "115%", "130%", "150%"]; // html font-size per step (everything is in rem)

// flag id -> class on <html>, label shown in the panel
const FLAGS = [
  { id: "contrast", label: "ניגודיות גבוהה" },
  { id: "gray", label: "גווני אפור" },
  { id: "links", label: "הדגשת קישורים" },
  { id: "font", label: "גופן קריא" },
  { id: "spacing", label: "ריווח טקסט" },
  { id: "cursor", label: "סמן גדול" },
  { id: "focus", label: "הדגשת מיקוד" },
  { id: "motion", label: "השהיית אנימציות" },
];

const root = document.documentElement;
let prefs = { size: 0, flags: [] };
let loadedPaused = false; // the page was built with animations off, so turning them back on needs a reload

const load = () => {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY) ?? "null");
    if (saved && Number.isInteger(saved.size) && Array.isArray(saved.flags)) {
      prefs = { size: Math.max(0, Math.min(SIZES.length - 1, saved.size)), flags: saved.flags.filter((f) => FLAGS.some((x) => x.id === f)) };
    }
  } catch {
    /* storage blocked or corrupt: start from the defaults */
  }
};
const save = () => {
  try {
    if (prefs.size === 0 && !prefs.flags.length) localStorage.removeItem(KEY);
    else localStorage.setItem(KEY, JSON.stringify(prefs));
  } catch {
    /* storage blocked: the choices still apply for this visit */
  }
};

/** Put the current choices on <html>. */
function apply() {
  root.style.fontSize = SIZES[prefs.size] === "100%" ? "" : SIZES[prefs.size];
  for (const f of FLAGS) root.classList.toggle(`a11y-${f.id}`, prefs.flags.includes(f.id));
  // stopping animations: pause everything GSAP is running (the CSS side is in a11y.css)
  if (prefs.flags.includes("motion")) gsap.globalTimeline.pause();
  else gsap.globalTimeline.resume();
}

/** The accessibility symbol: a person in a circle (outline, in the site's ink). */
const icon = () =>
  svgEl("svg", { class: "a11y-icon", viewBox: "0 0 32 32", "aria-hidden": "true", focusable: "false" },
    svgEl("circle", { cx: 16, cy: 16, r: 13 }),
    svgEl("circle", { cx: 16, cy: 9.5, r: 1.8, class: "a11y-icon__fill" }),
    svgEl("path", { d: "M8.5 13 H23.5 M16 13 V19.5 M16 19.5 L12 25 M16 19.5 L20 25" }));

/** Call once, early (before the sections render), so saved choices such as "stop animations" take effect from the start. */
export function initA11y() {
  load();
  loadedPaused = prefs.flags.includes("motion");
  apply();
}

/** Build the button and panel (call after the page exists). */
export function mountA11y() {
  const panel = h("div", { class: "a11y-panel", id: "a11y-panel", role: "dialog", "aria-label": "תפריט נגישות", tabindex: "-1", hidden: true });
  const toggle = h("button", { class: "a11y-toggle", type: "button", "aria-expanded": "false", "aria-controls": "a11y-panel" }, icon(), h("span", { class: "a11y-toggle__text" }, "נגישות"));

  const sizeOut = h("output", { class: "a11y-size__value", "aria-live": "polite" });
  const smaller = h("button", { class: "a11y-btn", type: "button", dir: "ltr", "aria-label": "הקטנת טקסט" }, "A−");
  const bigger = h("button", { class: "a11y-btn", type: "button", dir: "ltr", "aria-label": "הגדלת טקסט" }, "A+");
  const flagBtns = FLAGS.map((f) => {
    const b = h("button", { class: "a11y-opt", type: "button", "aria-pressed": "false" }, h("span", { class: "a11y-opt__mark", "aria-hidden": "true" }), h("span", {}, f.label));
    b.addEventListener("click", () => {
      prefs.flags = prefs.flags.includes(f.id) ? prefs.flags.filter((x) => x !== f.id) : [...prefs.flags, f.id];
      refresh();
      resumeIfNeeded();
    });
    return b;
  });
  const reset = h("button", { class: "a11y-btn a11y-reset", type: "button" }, "איפוס הגדרות");
  const close = h("button", { class: "a11y-btn a11y-close", type: "button" }, "סגירה");

  /** Sections were drawn static when the page loaded paused, so playing again means rebuilding the page (the hash keeps the place). */
  function resumeIfNeeded() {
    if (loadedPaused && !prefs.flags.includes("motion")) location.reload();
  }

  function refresh() {
    apply();
    save();
    sizeOut.textContent = `גודל טקסט: ${SIZES[prefs.size]}`;
    smaller.disabled = prefs.size === 0;
    bigger.disabled = prefs.size === SIZES.length - 1;
    flagBtns.forEach((b, i) => b.setAttribute("aria-pressed", String(prefs.flags.includes(FLAGS[i].id))));
  }
  smaller.addEventListener("click", () => { prefs.size = Math.max(0, prefs.size - 1); refresh(); });
  bigger.addEventListener("click", () => { prefs.size = Math.min(SIZES.length - 1, prefs.size + 1); refresh(); });
  reset.addEventListener("click", () => { prefs = { size: 0, flags: [] }; refresh(); resumeIfNeeded(); });

  function setOpen(open, { returnFocus = true } = {}) {
    panel.hidden = !open;
    toggle.setAttribute("aria-expanded", String(open));
    if (open) panel.focus(); // the panel itself (screen readers announce its name); the first control can be disabled
    else if (returnFocus) toggle.focus();
  }
  toggle.addEventListener("click", () => setOpen(panel.hidden));
  close.addEventListener("click", () => setOpen(false));
  panel.addEventListener("keydown", (e) => e.key === "Escape" && (e.stopPropagation(), setOpen(false)));

  const statement = link("accessibility", { class: "a11y-link" }, "הצהרת נגישות");
  statement.addEventListener("click", () => setOpen(false, { returnFocus: false }));
  panel.append(
    h("h2", { class: "a11y-panel__title" }, "תפריט נגישות"),
    h("div", { class: "a11y-size" }, smaller, sizeOut, bigger),
    h("div", { class: "a11y-opts" }, flagBtns),
    h("div", { class: "a11y-panel__actions" }, reset, close),
    statement
  );
  document.body.append(toggle, panel);
  refresh();
}
