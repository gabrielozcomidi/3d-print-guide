# 3D Printing Visual Guide (Hebrew, RTL)

Single-page, graphics-first educational site in Hebrew. Teaches how 3D printer mechanisms differ, how materials differ, and common print errors with their fixes, plus use cases and a "what should I use?" wizard.
**Scope: education only. NO prices, costs, or buying advice anywhere (no cost fields, charts, table columns, or wizard questions).**
Owner is an engineer, not a professional developer: keep code simple, readable, well-commented. Explain non-obvious choices in comments.

**Status: M0-M9 done: the site is complete. README.md documents editing and hosting. Remaining owner tasks: add the licensed Gloria font files, review the Hebrew copy and ratings, test on real devices. Further work should be new features, not part of the original plan.**

## Stack (agreed)
- Vite + vanilla JS (ES modules). No framework. Static output in `dist/`, hostable anywhere.
- GSAP + ScrollTrigger for scroll reveals and pinned diagrams (bundled via npm, no CDN).
- Radar charts: hand-written SVG module (`src/lib/radar.js`), no chart library (full RTL control, tiny).
- Fonts: self-hosted via Vite. Gloria (display, licensed, user supplies files) with `@fontsource-variable/heebo` as stand-in; `@fontsource-variable/frank-ruhl-libre` for body. See "Visual language".
- Three.js: NOT in v1. Revisit only after M5 if a hero element is still wanted.
- No analytics, no CDNs, no runtime network requests. Everything bundled locally.

## Layout
```
index.html            # section skeleton only; content is injected from data
src/
  data/               # ALL content lives here (technologies.js, materials.js, useCases.js, wizard.js, copy.js)
  sections/           # one module per page section: render(data) -> DOM, plus its animation
  diagrams/           # one SVG+GSAP animation per technology / printer type / defect (fdm.js, sla.js, msla.js, sls.js, mjf.js, dmls.js, binder.js, bedslinger.js...); powderbed.js = shared powder-bed scene; kit.js = helpers; defects.js = defect pictures; registry in index.js
  lib/                # radar.js, selector.js, meters.js, svg.js, table.js (sort/filter), reveal.js (GSAP helpers), bidi.js
  styles/             # tokens.css, base.css, then one css file per section
  main.js
scripts/validate-data.js   # checks schema + that every id referenced exists
```
Rule: editing content never requires touching `sections/` or `lib/`.

## Visual language (agreed after M1: "one-colour print", inspired by clownshowprison.com + Gloria font)
Red ink on blush paper, hand-drawn line art, justified serif body, wide heavy display type. Structure comes from whitespace and a few rules, not cards/boxes. This REPLACES the earlier dark-graphite look.
```
--bg:#f9efeb (paper)   --surface-2:#f1e0da
--text:#b92318 (ink, body text, 5.6:1)   --text-dim:#a8231a (deeper, never lighter)
--accent:#d02c1f (display type + small accent text, 4.6:1)   --border:#e8402a (rules, outlines, line art: graphics only)
Per-technology colours (flat print set, used only for diagram fills, tab squares, dots, legends):
--t-fdm:#2f62d9  --t-sla:#7b3fc4  --t-msla:#0b8a96  --t-sls:#2e8b57  --t-mjf:#a97600  --t-industrial:#7a6f6c
Rule 1.5px, radius 4px, 8px grid, measure 38rem.
```
- Fonts: display = **Gloria** (Alef Alef Alef, licensed, NOT bundled; files go in `src/assets/fonts/`, enable the commented block in `fonts.css`; **Heebo 900 is the stand-in**). Body = **Frank Ruhl Libre** (Hebrew serif, body `line-height 1.75`, justified, `text-wrap: pretty`).
- Hand-drawn look: SVG filter `#wobble` (index.html) applied via CSS to diagrams and hero drawing. Shapes are outlines; only the printed part gets the tech colour.
- **Selectors (user-approved pattern):** any "pick one" row uses `lib/selector.js`: plain display-type text, a HOLLOW DOT (never a square) in the item's colour, wavy underline on the selected item. Static technology lists (`.chip`) use the same look. Dot meters: hollow = empty, filled = value.
- **Ids must be unique page-wide:** every `selector()` gets its own `idPrefix` (technologies "tab", FDM types "fdmtype", materials "matfam", troubleshooting "issuegrp"). Use `lib/list.js` `markList()` for marker lists (wraps text in one span; a bare `<bdi>` inside a grid `li` splits the sentence).
- No uppercase labels, no eyebrows, no per-section fade-ups. Numbers only for real sequences (process steps). Selection = wavy underline (not colour alone).
- Only entrance animation: the hero drawing draws itself once. Diagram animations stay (they teach); all respect reduced motion.
- Navigation: two-line button opens a full-screen index (built from `copy.js`).
- **Printer-type drawings** (`diagrams/bedslinger|corexy|delta|polar|scara|belt.js`, helpers in `diagrams/kit.js`): ONE rule on all of them: tinted = moves, outlined = fixed, technology colour = printed part. Each is a pure function `draw(p)` of progress. Share `lib/diagramFrame.js` with the technologies panel.
- **Powder-bed diagrams** (sls, mjf, dmls, binder) share `diagrams/powderbed.js`: state object `S` tweened by a GSAP timeline, scene re-rendered from it; each diagram only adds its energy source (laser / sprayer / lamp).
- **Radar** (`lib/radar.js`): `radar({axes, series:[{id,values,color}]})` returns an SVG with `update(series)`; shapes are matched by id (added = grow from centre, removed = shrink, changed = morph; jumps with reduced motion). Several series overlay in their own colour (multiply blend, see-through fill); numbers next to axis names show only for one series. The materials section keeps ONE big radar; tiles are multi-select toggles, the legend (a `selector`) picks whose details show. Material colours are `--m-1..--m-8` (tokens.css, contrast-checked), assigned by position inside the family (`materialColor` in materials.js).
- **Hero drawing** (`sections/hero.js`): after the stroke-by-stroke intro it loops forever: the nozzle rises one layer at a time, sweeps (alternating direction) revealing each layer behind it, holds the finished part, wipes it, repeats. Pauses off-screen; static finished picture with reduced motion.
- **Accessibility and legal** (see README): `lib/a11y.js` + `styles/a11y.css` (menu, modes as classes on `<html>`, saved in localStorage key `guide-a11y`; "pause animations" pauses GSAP (all animations, the one pause mechanism for WCAG 2.2.2; there is deliberately no extra button on the page) and makes `prefersReducedMotion()` true). Legal pages = hidden chapters (`hidden: true` in chapters.js) rendered by `sections/legal.js` from `data/legal.js`; `npm run check:legal` blocks publishing until the owner details are filled. Rules for new work: every chapter has an h1 (hidden when the page shows none), column minimums in grids use `min(Xrem, 100%)` so large text reflows, anything that moves for more than 5 s must be covered by the menu's pause option, every new colour token needs a high-contrast counterpart in `a11y.css` (checked by `check-contrast.js`).
- **Logo** (`lib/logo.js`): small printer drawing in the nav bar, side rail, footer; the favicon in index.html is the same drawing.
- **bidi()**: short English runs (<=16 chars) get `bdi.nw` (no line break); long English phrases may wrap. Never join several English names with ", " in one string; render lists.
- **Supports/infill demos**: `diagrams/supportsDemo.js` (state-driven scene: bare / with / removed) and `diagrams/infillDemo.js` (path generators per pattern id, checked by the validator). Slicer names for a feature use `lib/callsit.js` ([slicer, name] rows, always LTR).
- Diagram legends use `kind` glyphs (dash | box | hot | fill | line | resin) because everything is red ink.
- JS reads colours via CSS variables only; never hardcode hex.

## M9 polish notes
- Contrast is enforced: `scripts/check-contrast.js` (part of `npm run validate`/build) fails if text/accent < 4.5:1 or a technology/border colour < 3:1 on paper. Do not use `--border` for small text.
- Accessibility audited: all controls named, tabs control one shared panel each (never per-item panel ids), headings in order, unique ids, English runs get `lang="en"` in bidi(), skip link keeps the current chapter.
- Overflow swept at 320, 768 and 1280 px by clicking every tab/filter state (90 states). English terms are no-wrap (<=16 chars) except inside headings; any new narrow grid must allow its column to wrap or stack.
- Production build: ~210 KB, 6 requests, first paint ~350 ms, no external requests.

## Navigation (user request: "less doom scrolling")
- The page is split into 7 CHAPTERS (`src/data/chapters.js`: start, machines ("סוגי מדפסות": technologies, industrial, compare), fdm (its own page for the six FDM motion systems, linked from the FDM panel and back), prepare, materials, fix, choose); only one chapter is visible at a time. Edit that file to regroup sections.
- `lib/router.js` does it all at runtime: moves the existing `<section>`s into `div.chapter`, builds the desktop side rail (right side in RTL, from 56rem width), the phone top bar with the chapter name + a quick-link row, the full-screen index, and an end-of-chapter "next chapter" link. The URL hash selects the view (`#machines` = chapter, `#compare` = a section inside its chapter); back button and bookmarks work.
- Other modules link across chapters with `go("sectionId")` or `link()` from `lib/router.js`, never `scrollIntoView` on another chapter's element (it is hidden).
- Home page has task-based starting points (`startPaths` in chapters.js).
- The menu (side rail and phone index share `buildToc()`): chapter titles 1.5rem display type, numbers as outlined circles (filled = current), a round chevron button on chapters that have sections (opens/closes them without navigating; the current chapter opens on its own), dashed rule between items, labelled icon buttons "סגירה" / "תפריט" (never icon-only). The desktop rail can be closed (`html.rail-closed`, remembered in localStorage key `guide-rail-closed`); styles in `styles/layout.css`.
- Hebrew words joined by a maqaf (תלת־ממד) never break across lines (bidi()).

## Naming rule (user decision)
Any name or term WITHOUT an official Hebrew name is written in English (machine types: Cartesian, CoreXY, Delta, Polar, SCARA, Belt; resin kinds: Standard resin, Tough resin; defects: Warping, Stringing, Bed adhesion failure; slicers; infill and support types). Defects/items that need it get a short Hebrew descriptor (`nameHe`) next to the English name. Ordinary Hebrew words stay Hebrew (שרף, אבקה, פילמנט, property words like חוזק).

## Research notes (M7, checked Oct 2026 against official pages)
- Slicers included: Cura, PrusaSlicer, OrcaSlicer, Bambu Studio (FDM); Chitubox, Lychee, PreForm, PrusaSlicer SLA mode (resin). Deliberately left out because features could not be verified: Simplify3D, ideaMaker. Version numbers and prices are intentionally not shown.
- Verified: lineage Slic3r -> PrusaSlicer -> Bambu Studio -> OrcaSlicer (Cura is separate); licences (Cura LGPL-3.0, the other three AGPL-3.0); 3MF is ISO/IEC 25422; STEP is exact CAD geometry (slicers need a mesh, PreForm imports STEP); STL has no colours or defined units.
- Medium/low confidence, so kept modest or omitted: G-code examples are standard Marlin-style; `.form` format; Blender 3D-Print Toolbox and 3D Builder as repair tools (omitted); Thingiverse ownership (omitted).
- Feature table cells (`data/slicers.js`) use yes/partial/no. Re-check when updating: Cura paint-on supports was still an alpha feature.

## Research notes (M8, checked Oct 2026 against slicer source code and docs)
- Support style names: Cura Normal/Tree; PrusaSlicer Grid/Snug/Organic; OrcaSlicer and Bambu Studio Normal + Tree (Slim, Strong, Hybrid, Organic). Defaults differ per slicer (Cura overhang 50 deg, PrusaSlicer automatic): the site says so instead of quoting one angle.
- Prusa KB: overhangs 45-60 deg print cleanly depending on nozzle/cooling; strength comes mostly from perimeters, not infill; most models need 10-15% infill, up to ~30% for durability, 100% rarely.
- Resin: Chitubox presets Light/Medium/Heavy; Formlabs: 45 deg tilt, suction cups need drain holes; PrusaSlicer hollowing wall default 3 mm (min 1 mm), at least 2 drain holes.
- Metal/powder: Protolabs: metal powder-bed needs supports against curling from internal stress, polymer does not.
- Not verified, so NOT claimed: Gyroid being slower or good for shocks, Triangles being strong against shear, soluble dissolve times, EOS/HP primary documents, Bambu wiki pages. Infill and support ratings are labelled "comparative estimate, not a measurement". Infill drawings are schematic slices.

## Planned work (approved)
- **M7 (DONE) From model to print** (section after Overview): stepper model -> check/repair -> slice -> G-code -> send -> first layer -> post-process, with a morphing drawing per stage; file formats (STEP vs STL/3MF/OBJ, G-code sample); "what changes for resin and powder". **Slicers** inside it: Cura, PrusaSlicer, OrcaSlicer, Bambu Studio; resin: Chitubox, Lychee, PreForm; industrial: noted only. License type shown (open-source / free / commercial), NO prices. Facts verified against official docs by a research agent before writing.
- **M8 (DONE) Supports** (after FDM types): FDM normal/grid, tree/organic, line/zigzag, snug interface, soluble, plus raft/brim (adhesion, not supports); resin light/medium/heavy + tip size + tilt; metal block/lattice; powder none. Animated overhang demo that grows the chosen support type and shows the scars after removal. **Infill**: Grid, Lines, Triangles, Cubic, Gyroid, Honeycomb, Concentric, Lightning; procedural pattern drawing with a density slider; walls/top-bottom layers; resin hollowing + drain holes. Optional new troubleshooting issues (overhang sagging, support scars, infill showing through).
- **M9 polish**: accessibility, performance, reduced-motion review, mobile QA, hosting notes, README for editing the data files.

## RTL / Hebrew conventions
- `<html lang="he" dir="rtl">`. CSS logical properties only (`margin-inline-start`, `inset-inline-end`, `padding-block`, `text-align: start`). No `left/right` in CSS except where a diagram is physically asymmetric (comment why).
- Latin terms (PLA, SLA, MJF, numbers with units) wrapped in `<bdi>` by the `bidi()` helper in `lib/bidi.js`, which data-driven text goes through. Hand-written HTML uses `<bdi>` directly.
- Numbers/units/ranges (`0.05-0.3 מ"מ`) go in `<bdi dir="ltr">`.
- Physical process diagrams (nozzle moves, laser sweeps) are NOT mirrored: physics has no language direction. Mark them `dir="ltr"` on the SVG and keep labels as separate RTL HTML/`<text>` with `direction="rtl"`.
- Timelines, progress bars, comparison scales, radar axis order, carousels: DO mirror (start = right).
- SVG text: set `direction="rtl"` and `text-anchor` carefully (`start` in RTL SVG anchors right).
- Directional icons (arrows, chevrons) flip via `[dir=rtl] .icon-dir { transform: scaleX(-1) }`.
- GSAP: use `xPercent` with sign from a `isRTL` constant; ScrollTrigger horizontal scrolling must account for RTL scroll origin. Prefer vertical-only scroll storytelling.
- Hebrew quotation marks/gershayim in copy: use `״` and `׳`, not ASCII `"`/`'`, to avoid JS string breakage.
- Test every milestone at 360px, 768px, 1280px, and with a long English term wrapped mid-sentence.

## Motion
- Reveals via GSAP ScrollTrigger; every animation goes through `lib/reveal.js`.
- `prefers-reduced-motion: reduce` → no scrubbing, no loops; diagrams render in a static, fully-readable end state. This is tested, not optional.
- Looping process diagrams pause when off-screen.

## Data schemas (summary; full spec lives in `src/data/README.md` once created)
- **technology**: `id, name, fullName, color, family(filament|resin|powder|metal), principle (he), steps[] (diagram stages), layerHeightMm{min,max}, speed(1-5), supports(none|needed|self), detail(1-5), pros[], cons[], postProcessing[], materialIds[], diagram(id)`
- **fdmType** (`data/fdmTypes.js`): `id, name (English), nameLong, diagram, view, sideDiagram?, sideView?, principle, moves[{part,does}], note, pros[], cons[], bestFor, volume, short, ratings{speed,accuracy,upkeep}, examples`
- **material**: `id, name, techIds[], family, ratings{strength,flexibility,heat,uv,easeOfPrint} (each 1-5, 5 = better), failureRisk[] (issue ids), safety{level(low|med|high), notes (he)}, summary (he)`
- **issue** (troubleshooting, `data/issues.js`): `id, name (English), nameHe (Hebrew descriptor), techIds[], materialIds[], severity(1-3), visual (picture id in diagrams/defects.js), stepRef{tech,step}|null (links to a process step), mechanism (he), causes[{cause, likelihood(high|med|low), check, fix[]}] (ordered most likely first), prevention[]`
- **useCase**: `id, name, summary (he), recommendations[{techId, materialIds[], why (he, one line)}], avoid?{materialIds[], why}`
- **wizard** (`data/wizard.js`, logic in `lib/recommend.js`, sanity check `npm run check:wizard`): `questions[{id, text, options[{id,label,weights:{techId|materialId:number}}]}]` (strength, outdoor, detail level, handling effort/fumes/cleanup), scoring = sum of weights, top result + runner-up, plus `explanations` keyed by result id.
- All cross-references use string ids; `scripts/validate-data.js` fails the build on a dangling id (tech, material, issue, visual) or out-of-range rating.

## Conventions
- Plain JS with JSDoc on exported functions; no TypeScript, no build-time magic beyond Vite defaults.
- One section = one module + one CSS file. No cross-section imports except from `lib/`.
- No new dependency without stating why and the size cost.
- Content accuracy: numbers are typical ranges, labeled as approximate; keep sources/assumptions in a comment next to the data.
- Commands: `npm run dev`, `npm run build`, `npm run preview`, `npm run validate`.

## Milestones
M0 skeleton + design system + data validation · M1 Technologies section (reference, fully finished) · M2 Materials (5-axis radar + sortable table) · M3 Troubleshooting (technology -> defect gallery -> causes/fixes; 3-4 defects per family first) · M4 Use cases + wizard · M5 Remaining technologies content, industrial, mechanism-comparison chart, hero · M6 polish: a11y, perf, reduced motion, mobile QA, build/hosting notes.

## Page sections (order)
Hero · How it works (overview) · Technologies · FDM printer types (6 motion systems, own chapter) · Industrial (brief) · Compare mechanisms (layer height, supports, post-processing effort, detail) · Materials · Troubleshooting · Use cases · Wizard · Footer.
