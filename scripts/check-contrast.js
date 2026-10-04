// Colour contrast check (WCAG 2.x), run by `npm run validate` and before every build.
// Reads the colour tokens from src/styles/tokens.css and checks the pairs the site actually uses:
//   text and accent on paper must reach 4.5:1 (they are used for small text too)
//   each technology colour, the border colour and the hollow-dot outlines must reach 3:1 against paper
//   (they are graphics: dots, bars, outlines; the technology is always also named in words)
// A failing pair stops the build with the numbers, so a colour edit can never silently hurt readability.

import { readFileSync } from "node:fs";

const css = readFileSync(new URL("../src/styles/tokens.css", import.meta.url), "utf8");
const token = (name) => {
  const m = css.match(new RegExp(`${name}\\s*:\\s*(#[0-9a-fA-F]{6})`));
  if (!m) throw new Error(`token ${name} not found in tokens.css`);
  return m[1];
};

const channel = (v) => {
  const c = v / 255;
  return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
};
const luminance = (hex) => {
  const n = parseInt(hex.slice(1), 16);
  return 0.2126 * channel((n >> 16) & 255) + 0.7152 * channel((n >> 8) & 255) + 0.0722 * channel(n & 255);
};
const ratio = (a, b) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

const paper = token("--bg");
const checks = [
  ["--text", 4.5],
  ["--text-dim", 4.5],
  ["--accent", 4.5],
  ["--border", 3],
  ["--t-fdm", 3],
  ["--t-sla", 3],
  ["--t-msla", 3],
  ["--t-sls", 3],
  ["--t-mjf", 3],
  ["--t-industrial", 3],
  ...Array.from({ length: 8 }, (_, i) => [`--m-${i + 1}`, 3]), // material colours in the radar
];

let bad = 0;
for (const [name, min] of checks) {
  const r = ratio(token(name), paper);
  const ok = r >= min;
  if (!ok) bad++;
  console.log(`${ok ? "ok  " : "FAIL"} ${name.padEnd(16)} ${r.toFixed(2)}:1 on paper (needs ${min}:1)`);
}
// text on filled ink (step numbers, selected chips): paper on accent
const onAccent = ratio(token("--on-accent"), token("--accent"));
console.log(`${onAccent >= 4.5 ? "ok  " : "FAIL"} ${"--on-accent".padEnd(16)} ${onAccent.toFixed(2)}:1 on accent (needs 4.5:1)`);
if (onAccent < 4.5) bad++;

// high-contrast mode (styles/a11y.css): the same pairs against its own black background
const a11yCss = readFileSync(new URL("../src/styles/a11y.css", import.meta.url), "utf8");
const hcBlock = a11yCss.match(/html\.a11y-contrast\s*\{([^}]*)\}/)?.[1] ?? "";
const hc = (name) => hcBlock.match(new RegExp(`${name}\\s*:\\s*(#[0-9a-fA-F]{6})`))?.[1];
const hcBg = hc("--bg");
if (!hcBg) { console.error("FAIL high-contrast block not found in a11y.css"); bad++; }
else {
  const hcChecks = [["--text", 4.5], ["--text-dim", 4.5], ["--accent", 4.5], ["--border", 3], ["--t-fdm", 3], ["--t-sla", 3], ["--t-msla", 3], ["--t-sls", 3], ["--t-mjf", 3], ["--t-industrial", 3], ...Array.from({ length: 8 }, (_, i) => [`--m-${i + 1}`, 3])];
  for (const [name, min] of hcChecks) {
    const v = hc(name);
    const r = v ? ratio(v, hcBg) : 0;
    const ok = r >= min;
    if (!ok) bad++;
    console.log(`${ok ? "ok  " : "FAIL"} hc ${name.padEnd(13)} ${r.toFixed(2)}:1 on black (needs ${min}:1)`);
  }
  const hcOn = ratio(hc("--on-accent"), hc("--accent"));
  console.log(`${hcOn >= 4.5 ? "ok  " : "FAIL"} hc --on-accent    ${hcOn.toFixed(2)}:1 on accent (needs 4.5:1)`);
  if (hcOn < 4.5) bad++;
}

if (bad) {
  console.error(`\nContrast check failed (${bad}). Adjust the colour in src/styles/tokens.css.`);
  process.exit(1);
}
