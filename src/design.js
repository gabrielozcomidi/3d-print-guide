// Design-system reference: open /design.html in dev to eyeball tokens, fonts and RTL/bidi behaviour.
import "./styles/fonts.css";
import "./styles/tokens.css";
import "./styles/base.css";
import { h, cssVar } from "./lib/dom.js";
import { bidi, ltr } from "./lib/bidi.js";
import { technologies } from "./data/technologies.js";

const root = document.getElementById("root");

const swatch = (name) =>
  h("div", { class: "card", style: "padding:0;overflow:hidden" },
    h("div", { style: `background:var(${name});block-size:3rem` }),
    h("div", { style: "padding:.5rem .75rem;font-size:.85rem", html: `<bdi dir="ltr">${name}</bdi><br><bdi dir="ltr" style="color:var(--text-dim)">${cssVar(name)}</bdi>` })
  );

const grid = (children) =>
  h("div", { style: "display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:1rem" }, children);

root.append(
  h("h1", {}, "Design system"),
  h("h2", {}, "צבעים"),
  grid(["--bg", "--surface", "--surface-2", "--border", "--text", "--text-dim", "--accent"].map(swatch)),
  h("h2", { style: "margin-block-start:3rem" }, "צבעי טכנולוגיות"),
  grid(["--t-fdm", "--t-sla", "--t-msla", "--t-sls", "--t-mjf", "--t-industrial"].map(swatch)),
  h("h2", { style: "margin-block-start:3rem" }, "צ׳יפים"),
  h("div", { class: "hero__chips" }, technologies.map((t) => h("span", { class: "chip", style: `--c: var(${t.color})`, html: bidi(t.name) }))),
  h("h2", { style: "margin-block-start:3rem" }, "טיפוגרפיה"),
  h("h1", {}, "כותרת 1 · Heading 1"),
  h("h2", {}, "כותרת 2 · Heading 2"),
  h("h3", {}, "כותרת 3 · Heading 3"),
  h("p", {}, "גוף הטקסט בעברית, משקל רגיל. אבגדהוזחטיכלמנסעפצקרשת 0123456789."),
  h("h2", { style: "margin-block-start:3rem" }, "בדיקת Bidi"),
  h("div", { class: "card" },
    h("p", { html: "בלי עטיפה: מדפסת FDM, מהירה (0.05-0.3 מ״מ)." }),
    h("p", { html: bidi("עם bidi(): מדפסת FDM, מהירה (0.05-0.3 מ״מ). חומר PA 12, ואחריו PLA+.") }),
    h("p", { html: `טווח עובי שכבה: ${ltr("0.05-0.3")} מ״מ` })
  )
);
