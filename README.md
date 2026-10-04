# מדריך חזותי להדפסת תלת־ממד: 3D printing visual guide (Hebrew, RTL)

A single-page educational site in Hebrew about how 3D printers work, what the materials are for, how to prepare a model, and how to fix common defects. Mostly drawings and animations, very little running text.

Everything is local-first: no analytics, no CDN, no cloud calls. `npm run build` produces a static folder (`dist/`) you can host anywhere.

## Quick start

```bash
npm install
npm run dev          # development server with live reload (http://localhost:5173)
npm run validate     # checks all the content files and the colour contrast
npm run check:wizard # runs sample answers through the "what should I use?" wizard
npm run build        # validates, then writes the site to dist/
npm run preview      # serves dist/ locally to test the real build
```

Needs Node 20 or newer. `npm run build` refuses to build if the content has a mistake (a broken id, a rating outside 1-5, a colour that is too faint to read), and tells you exactly what and where.

## Where to edit content (no layout code needed)

All text, numbers and ratings live in `src/data/`. The layout code only reads them.

| File | What it controls |
|---|---|
| `copy.js` | Hero text, section titles, intros, menu labels, footer note |
| `chapters.js` | Which sections belong to which chapter, the chapter order, the "where to start" links on the home page |
| `technologies.js` | The 7 technologies: how they work (steps shown next to the animation), layer height, speed, pros and cons, post-processing |
| `fdmTypes.js` | FDM printer types (Cartesian, CoreXY, Delta, Polar, SCARA, Belt): what moves, pros and cons, ratings |
| `materials.js` | The 17 materials: 5 radar ratings, safety notes, summary, which technologies print them |
| `issues.js` | Troubleshooting: each defect with mechanism, ranked causes (how to check, how to fix), prevention |
| `useCases.js` | Use cases and the recommended technology + material for each |
| `wizard.js` | The 4 wizard questions and the weights behind the recommendation |
| `workflow.js`, `slicers.js` | The "model to print" stages and the slicer comparison |
| `supports.js`, `infill.js` | Support styles and infill patterns, with ratings and advice |

Every file starts with a comment explaining its fields. Text in the files is plain Hebrew; write English names (PLA, Gyroid, Cura) as they are, the site handles mixing directions.

**Naming rule:** anything without an official Hebrew name is written in English (printer types, defect names, slicers, patterns). Defects also get a short Hebrew description (`nameHe`).

### Adding things

- **A material:** add an entry to `materials.js`, then add its id to the `materialIds` list of each technology that can print it in `technologies.js`. `npm run validate` checks that both sides agree.
- **A defect:** add an entry to `issues.js` and a picture with the same id in `src/diagrams/defects.js` (a few lines of SVG shapes; copy a neighbour). Link materials that are prone to it through `failureRisk` in `materials.js`.
- **A support style or infill pattern:** add the entry to the data file. Infill patterns also need a drawing function with the same id in `src/diagrams/infillDemo.js` (`generators`).
- **A section or chapter:** add the `<section id>` to `index.html`, a render function in `src/sections/`, an entry in `copy.js` and `chapters.js`, and register it in `src/main.js`. The validator checks that every section is in exactly one chapter.
- **A wizard question:** edit `wizard.js`. Run `npm run check:wizard` to see what sample answers recommend; edit the expected results in `scripts/check-wizard.js` if you changed the logic on purpose.

## Design

Red ink on blush paper, hand-drawn line art, justified serif text, heavy display type. The tokens (colours, spacing, type sizes) are all in `src/styles/tokens.css`; never hardcode colours elsewhere. `npm run validate` checks WCAG contrast of the tokens, so a colour edit cannot silently make the site unreadable.

- **Display font:** the design uses **Gloria** (Alef Alef Alef). It is a licensed font and is not included. Until you add it, Heebo Black is used. To switch: buy or confirm the web license, put the `.woff2` files in `src/assets/fonts/`, and uncomment the Gloria block in `src/styles/fonts.css`.
- **Body font:** Frank Ruhl Libre, bundled locally (OFL license).
- **Motion:** respects `prefers-reduced-motion`. With it on, every animation shows its finished state and the page does not scroll smoothly.
- **Dev reference page:** open `/design.html` while running `npm run dev` to see colours and type. It is not part of the build.

## Hosting

`dist/` is plain static files with relative URLs. Upload the folder to any static host or your own server.

- **No server setup needed.** The site is one page; chapters use the URL hash (`#materials`), so there are no routes to configure and refreshing or bookmarking always works.
- **Any location.** It works from a domain root or from a sub-folder (`example.com/printing/`) because paths are relative.
- **Caching (optional).** Files in `dist/assets/` have a hash in their name, so they can be cached for a year; `index.html` should not be cached for long.
- **Nginx example:**

  ```nginx
  server {
    root /var/www/printing-guide;   # the contents of dist/
    index index.html;
    location /assets/ { add_header Cache-Control "public, max-age=31536000, immutable"; }
    location = /index.html { add_header Cache-Control "no-cache"; }
  }
  ```

- **Privacy.** The built site makes no requests to any other domain. Its only browser storage is one optional setting (`guide-rail-closed`, whether the side menu is closed).
- **Size.** About 210 KB in total (JavaScript 97 KB gzipped, CSS 7 KB, four font files 105 KB).

## Accuracy

Tool, file-format, slicer and support/infill facts were checked against official documentation and source code in October 2026 (notes in `CLAUDE.md`). Slicers change between versions, so re-check the slicer table and the support and infill defaults from time to time. Ratings (1-5) are comparative estimates for choosing between options, not measurements, and the pages say so. The site deliberately shows no prices.

## Project structure

```
index.html              page skeleton (empty sections, filled from data)
src/data/               all content (see the table above)
src/sections/           one file per section: builds its DOM from the data
src/diagrams/           SVG + GSAP drawings and animations
src/lib/                shared helpers: router (chapters, menu), selector, radar chart, bidi text, ...
src/styles/             tokens.css (design tokens), base.css, layout.css, one css file per section
scripts/                validate-data.js, check-contrast.js, check-wizard.js
```

`CLAUDE.md` records the design decisions and conventions in more detail.
