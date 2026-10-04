// Data validator: run with `npm run validate` (also runs before every build).
// Catches typos in the content files BEFORE they become a broken page:
//   - duplicate ids, missing required fields
//   - ratings outside 1-5
//   - references to ids that don't exist (materialIds, techIds, failureRisk, color tokens)
// Exit code 1 on any problem, with a readable list.

import { readFileSync } from "node:fs";
import { technologies } from "../src/data/technologies.js";
import { materials } from "../src/data/materials.js";
import { issues } from "../src/data/issues.js";
import { useCases } from "../src/data/useCases.js";
import { fdmTypes } from "../src/data/fdmTypes.js";
import { defects } from "../src/diagrams/defects.js";
import { wizard } from "../src/data/wizard.js";
import { chapters, startPaths } from "../src/data/chapters.js";
import { sections as copySections } from "../src/data/copy.js";
import { supportGroups } from "../src/data/supports.js";
import { patterns } from "../src/data/infill.js";
import { stages, families } from "../src/data/workflow.js";
import { slicers, featureColumns, licenseLabel } from "../src/data/slicers.js";
import { artIds } from "../src/diagrams/workflow.js";

// Diagram ids that exist in src/diagrams/index.js (read from the registry file so we don't import browser code)
const diagramsSrc = readFileSync(new URL("../src/diagrams/index.js", import.meta.url), "utf8");
const diagramIds = new Set(
  (diagramsSrc.match(/export const diagrams = \{([^}]*)\}/)?.[1] ?? "").split(",").map((s) => s.trim()).filter(Boolean)
);

const errors = [];
const fail = (msg) => errors.push(msg);

const ids = (list) => new Set(list.map((x) => x.id));
const techIds = ids(technologies);
const materialIds = ids(materials);
const issueIds = ids(issues);

// Color tokens that actually exist in tokens.css
const tokensCss = readFileSync(new URL("../src/styles/tokens.css", import.meta.url), "utf8");
const tokenNames = new Set([...tokensCss.matchAll(/(--[\w-]+)\s*:/g)].map((m) => m[1]));

function checkUnique(list, label) {
  const seen = new Set();
  for (const item of list) {
    if (!item.id) fail(`${label}: entry without id`);
    else if (seen.has(item.id)) fail(`${label}: duplicate id "${item.id}"`);
    seen.add(item.id);
  }
}
function checkRefs(refs, valid, where) {
  for (const ref of refs ?? []) if (!valid.has(ref)) fail(`${where}: unknown id "${ref}"`);
}

checkUnique(technologies, "technologies");
checkUnique(materials, "materials");
checkUnique(issues, "issues");
checkUnique(useCases, "useCases");

for (const t of technologies) {
  if (!tokenNames.has(t.color)) fail(`technology ${t.id}: color token "${t.color}" not found in tokens.css`);
  if (!["filament", "resin", "powder", "metal"].includes(t.family)) fail(`technology ${t.id}: bad family "${t.family}"`);
  checkRefs(t.materialIds, materialIds, `technology ${t.id}.materialIds`);

  // Every technology needs the full set of fields:
  {
    const w = `technology ${t.id}`;
    if (!t.principle) fail(`${w}: missing principle`);
    if (!t.layerBy) fail(`${w}: missing layerBy`);
    if (!Number.isInteger(t.postEffort) || t.postEffort < 1 || t.postEffort > 5) fail(`${w}.postEffort: must be an integer 1-5`);
    if (!t.steps?.length || t.steps.some((s) => !s.title || !s.text)) fail(`${w}: steps must be [{title, text}, ...]`);
    const lh = t.layerHeightMm;
    if (!lh || !(lh.min > 0 && lh.min < lh.max)) fail(`${w}: layerHeightMm needs 0 < min < max`);
    for (const key of ["speed", "detail"]) {
      if (!Number.isInteger(t[key]) || t[key] < 1 || t[key] > 5) fail(`${w}.${key}: must be an integer 1-5`);
    }
    if (!["none", "needed"].includes(t.supports)) fail(`${w}.supports must be none|needed`);
    for (const key of ["pros", "cons", "postProcessing"]) if (!t[key]?.length) fail(`${w}.${key}: needs at least one item`);
    if (t.diagram && !diagramIds.has(t.diagram)) fail(`${w}.diagram: no diagram module registered for "${t.diagram}"`);
  }
}

const RATING_KEYS = ["strength", "flexibility", "heat", "uv", "easeOfPrint"];
for (const m of materials) {
  checkRefs(m.techIds, techIds, `material ${m.id}.techIds`);
  checkRefs(m.failureRisk, issueIds, `material ${m.id}.failureRisk`);
  for (const key of RATING_KEYS) {
    const v = m.ratings?.[key];
    if (!Number.isInteger(v) || v < 1 || v > 5) fail(`material ${m.id}.ratings.${key}: must be an integer 1-5 (got ${v})`);
  }
  if (!["low", "med", "high"].includes(m.safety?.level)) fail(`material ${m.id}.safety.level invalid`);
  if (!m.summary || m.summary === "TODO") fail(`material ${m.id}: summary missing`);
  if (!m.safety?.notes || m.safety.notes === "TODO") fail(`material ${m.id}: safety.notes missing`);
  if (!["filament", "resin", "powder"].includes(m.family)) fail(`material ${m.id}: bad family "${m.family}"`);
  // every technology that lists the material must agree, and vice versa
  for (const t of m.techIds) {
    const tech = technologies.find((x) => x.id === t);
    if (tech && !tech.materialIds?.includes(m.id)) fail(`material ${m.id}: technology "${t}" does not list it in materialIds`);
  }
}

for (const i of issues) {
  checkRefs(i.techIds, techIds, `issue ${i.id}.techIds`);
  checkRefs(i.materialIds, materialIds, `issue ${i.id}.materialIds`);
  if (![1, 2, 3].includes(i.severity)) fail(`issue ${i.id}.severity must be 1-3`);
  if (!i.nameHe) fail(`issue ${i.id}: missing nameHe (Hebrew description)`);
  if (!i.causes?.length) fail(`issue ${i.id}: needs at least one cause`);
  if (!defects[i.visual]) fail(`issue ${i.id}.visual: no picture "${i.visual}" in diagrams/defects.js`);
  if (!i.mechanism || i.mechanism === "TODO") fail(`issue ${i.id}: mechanism missing`);
  for (const c of i.causes ?? []) {
    if (!c.cause || !["high", "med", "low"].includes(c.likelihood) || !c.check || !c.fix?.length) fail(`issue ${i.id}: every cause needs cause, likelihood (high|med|low), check and fix[]`);
  }
  if (i.stepRef) {
    const t = technologies.find((x) => x.id === i.stepRef.tech);
    if (!t?.steps?.[i.stepRef.step]) fail(`issue ${i.id}.stepRef: technology "${i.stepRef.tech}" has no step ${i.stepRef.step}`);
  }
  if (!i.prevention?.length) fail(`issue ${i.id}: needs prevention`);
}

for (const u of useCases) {
  if (!u.summary || !u.recommendations?.length) fail(`useCase ${u.id}: needs summary and recommendations`);
  for (const r of u.recommendations ?? []) {
    const tech = technologies.find((t) => t.id === r.techId);
    if (!tech) fail(`useCase ${u.id}: unknown techId "${r.techId}"`);
    if (!r.why) fail(`useCase ${u.id}: recommendation for "${r.techId}" needs a "why"`);
    checkRefs(r.materialIds, materialIds, `useCase ${u.id} recommendation`);
    // a recommended material must be printable by the recommended technology
    for (const mid of r.materialIds ?? []) {
      const m = materials.find((x) => x.id === mid);
      if (m && tech && !m.techIds.includes(tech.id)) fail(`useCase ${u.id}: ${mid} cannot be printed with ${tech.id}`);
    }
  }
  if (u.avoid) {
    checkRefs(u.avoid.materialIds, materialIds, `useCase ${u.id}.avoid`);
    if (!u.avoid.why) fail(`useCase ${u.id}.avoid needs a "why"`);
  }
}

// Wizard: every weight must point at a real technology or material
const anyId = new Set([...techIds, ...materialIds]);
for (const q of wizard.questions) {
  if (!q.text || (q.options?.length ?? 0) < 2) fail(`wizard question ${q.id}: needs text and at least 2 options`);
  for (const o of q.options ?? []) {
    if (!o.label || !o.meaning) fail(`wizard ${q.id}/${o.id}: needs label and meaning`);
    for (const key of Object.keys(o.weights ?? {})) if (!anyId.has(key)) fail(`wizard ${q.id}/${o.id}: weight for unknown id "${key}"`);
  }
}
checkRefs(wizard.tieBreak, techIds, "wizard.tieBreak");

// Chapters: every <section id> in index.html belongs to exactly one chapter, and menu labels exist
const htmlSrc = readFileSync(new URL("../index.html", import.meta.url), "utf8");
const pageSections = [...htmlSrc.matchAll(/<section id="(\w+)"/g)].map((m) => m[1]);
const inChapters = chapters.flatMap((c) => c.sections);
for (const id of pageSections) {
  const n = inChapters.filter((x) => x === id).length;
  if (n !== 1) fail(`chapters: section "${id}" is in ${n} chapters (needs exactly 1)`);
}
for (const id of inChapters) if (!pageSections.includes(id)) fail(`chapters: "${id}" is not a <section> in index.html`);
for (const id of pageSections) if (id !== "hero" && !copySections.some((s) => s.id === id)) fail(`copy.js: section "${id}" has no title/nav entry`);
for (const p of startPaths) if (!pageSections.includes(p.target)) fail(`startPaths: unknown target "${p.target}"`);

// Supports: demo kinds must exist; ratings 1-5
const SUPPORT_KINDS = ["normal", "tree", "soluble", "metal", "powder", "resin-light", "resin-medium", "resin-heavy"];
for (const g of supportGroups) {
  for (const t of g.types) {
    const w = `support ${g.id}/${t.id}`;
    if (!SUPPORT_KINDS.includes(t.kind)) fail(`${w}: unknown demo kind "${t.kind}"`);
    if (!t.modes?.every((m) => ["bare", "with", "removed"].includes(m)) || !t.modes?.length) fail(`${w}: modes must be a list of bare|with|removed`);
    if (!t.how || !t.pros?.length || !t.cons?.length || !t.whenToUse) fail(`${w}: needs how, pros, cons and whenToUse`);
    for (const [k, v] of Object.entries(t.ratings ?? {})) if (!Number.isInteger(v) || v < 1 || v > 5) fail(`${w}.ratings.${k}: must be an integer 1-5`);
  }
}

// Infill: every pattern needs a drawing generator in diagrams/infillDemo.js (read as text: it imports browser code)
const infillSrc = readFileSync(new URL("../src/diagrams/infillDemo.js", import.meta.url), "utf8");
const generatorIds = new Set([...(infillSrc.match(/export const generators = \{([\s\S]*?)\n\};/)?.[1] ?? "").matchAll(/^  (\w+):/gm)].map((m) => m[1]));
checkUnique(patterns, "infill patterns");
for (const p of patterns) {
  if (!generatorIds.has(p.id)) fail(`infill ${p.id}: no generator in diagrams/infillDemo.js`);
  if (!p.how || !p.pros?.length || !p.cons?.length || !p.bestFor) fail(`infill ${p.id}: needs how, pros, cons and bestFor`);
  for (const k of ["strength", "speed", "material", "top"]) if (!Number.isInteger(p.ratings?.[k]) || p.ratings[k] < 1 || p.ratings[k] > 5) fail(`infill ${p.id}.ratings.${k}: must be an integer 1-5`);
}

// Workflow stages: every stage needs a picture that exists and some text; resin/powder variants are optional
checkUnique(stages, "workflow stages");
for (const st of stages) {
  if (!artIds.includes(st.art)) fail(`workflow stage ${st.id}: no picture "${st.art}" in diagrams/workflow.js`);
  if (!st.title || !st.text || !st.short) fail(`workflow stage ${st.id}: needs short, title and text`);
  if (st.issueLink && !issueIds.has(st.issueLink)) fail(`workflow stage ${st.id}.issueLink: unknown issue "${st.issueLink}"`);
}
if (families.length !== 3) fail("workflow families: expected fdm, resin, powder");

// Slicers: licence TYPE only, every FDM slicer rates every feature column
checkUnique(slicers, "slicers");
for (const s of slicers) {
  if (!licenseLabel[s.license]) fail(`slicer ${s.id}: unknown license type "${s.license}"`);
  if (!s.knownFor?.length || !s.platforms || !s.maker) fail(`slicer ${s.id}: needs maker, platforms and knownFor`);
  if (s.group === "fdm") for (const c of featureColumns) if (!["yes", "partial", "no"].includes(s.features?.[c.key])) fail(`slicer ${s.id}.features.${c.key}: must be yes|partial|no`);
  if (/\$|₪|price|מחיר/i.test(JSON.stringify(s))) fail(`slicer ${s.id}: no prices on this site`);
}

checkUnique(fdmTypes, "fdmTypes");
for (const t of fdmTypes) {
  const w = `fdmType ${t.id}`;
  if (!diagramIds.has(t.diagram)) fail(`${w}.diagram: no diagram module registered for "${t.diagram}"`);
  if (t.sideDiagram && (!diagramIds.has(t.sideDiagram) || !t.sideView)) fail(`${w}: sideDiagram needs a registered diagram and a sideView caption`);
  if (!t.principle || !t.moves?.length || t.moves.some((m) => !m.part || !m.does)) fail(`${w}: needs principle and moves [{part, does}]`);
  for (const key of ["speed", "accuracy", "upkeep"]) {
    const v = t.ratings?.[key];
    if (!Number.isInteger(v) || v < 1 || v > 5) fail(`${w}.ratings.${key}: must be an integer 1-5 (got ${v})`);
  }
  for (const key of ["pros", "cons"]) if (!t[key]?.length) fail(`${w}.${key}: needs at least one item`);
}

if (errors.length) {
  console.error(`\nData validation failed (${errors.length}):\n` + errors.map((e) => "  - " + e).join("\n") + "\n");
  process.exit(1);
}
console.log(
  `Data OK: ${technologies.length} technologies, ${materials.length} materials, ${issues.length} issues, ${useCases.length} use cases, ${fdmTypes.length} FDM types.`
);
