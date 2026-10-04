# Print Day: educational mini-game (design)

Status: design approved in conversation 2026-10-04; implementation not started.

## Goal
A short, simple, creative game that teaches the 3D-printing process and its vocabulary, in the site's existing look (red ink on blush paper, hand-drawn wobbly SVG, GSAP motion). It ends with an animated 3D-looking model of what the player printed. Education only: no prices, no buying advice, no scores that punish.

## Decisions made with the owner
- Audience/shape: a mix. One run follows a print from model to finished part, with a few decisions and one failure to fix ("Print Day" with a "Print Doctor" moment inside it).
- Placement: its own menu page, new chapter 8 "משחק: יום הדפסה" (chapter id `game`, section id `game`).
- Objects: the player chooses one of three: a cat figure, a boat, a lighthouse.
- Variation: same 6 steps for every object; only the object-specific details change (decision A). Per-object stories are out of scope for v1.
- Finale technology: Canvas 2D, no new dependency (research: Three.js would add ~135 KB gzip, needs WebGL, cannot reuse the hand-drawn wobble, and a 2D fallback would still be required). Lazy-loaded.

## Game flow (6 steps, one action each, one short sentence of text)
1. **Choose**: pick cat, boat or lighthouse; its outline appears.
2. **Repair**: the model has a hole in its mesh; tap it to patch it.
3. **Slice**: pick layer height (draft / standard / fine) and infill (light / medium / solid); a live preview shows the time vs finish trade-off. No wrong answer, only trade-offs.
4. **Supports**: tap the overhangs that need support (cat ears and tail, boat bow, lighthouse balcony). One decoy spot needs none; feedback explains why.
5. **First layer** (the failure moment): set nozzle height in three steps (too high / right / too low). Too high -> a funny, visible failed print and a one-line hint; instant retry, no lives or score. Then the print runs with the home-page layer-by-layer animation.
6. **Finish**: tap to remove supports, then the finale: the object is drawn layer by layer and spins.

Rules for every step: tap and keyboard both work (drag is never required); no timers; failure is visible, funny, retryable and never blocks progress (after 2 misses a hint is shown); progress is shown as the object filling in after each step; works in RTL; `prefers-reduced-motion` shows the finale finished (no animation) and the game stays fully playable; touch targets >= 44 px; feedback in an `aria-live` region; no colour-only cues.

## Architecture
- Chapter + section: `src/sections/game.js`, `src/styles/game.css`; entries in `index.html`, `src/main.js`, `data/copy.js`, `data/chapters.js` (chapter `game`, after `choose`).
- `src/lib/game/engine.js`: small step machine (current step, next/back, retry count). No drawing.
- `src/data/game.js`: all wording and per-object data (objects, the repair hole, support spots and decoy, slicing options with feedback lines, hints, finale shape definitions). Editing wording never touches code.
- `src/lib/game/steps/*.js`: one file per step (choose, repair, slice, supports, firstLayer, finish); each draws its SVG, reuses `selector`, buttons and the wobble filter, and reports "done".
- `src/lib/game/finale.js`: Canvas 2D layered object, loaded with `import()` only when step 6 starts.
- State is in memory only: no saving, no network, no analytics.

## Finale (non-axisymmetric objects without a 3D library)
Each object is a few simple parts with an analytic cross-section per height: cat = body, head, ears, tail; boat = hull, cabin, mast; lighthouse = tower, balcony, lamp. Per layer the code computes the cross-section polygons, tilts them, and draws layers bottom to top with paper fill and red ink strokes (small seeded jitter per layer for the hand-drawn look; shapes within a layer sorted by depth). The nozzle sweep reveals each layer as in the hero loop; then the model rotates (shapes rotated about the vertical axis per frame). Expected cost: a few KB of JS. Known limit: cannot show true undersides; acceptable for this stylised view. Layer count/finish follows the player's layer-height choice from step 3.

## Testing
- Extend `scripts/validate-data.js`: every object defines every step's data; support spots reference valid ids; slicing options complete.
- Browser sweep at 360 / 768 / 1280 px: no overflow, no console errors; keyboard-only play-through of all three objects; reduced-motion check.
- `npm run build` stays green; contrast check unchanged (reuses existing tokens).

## Out of scope for v1
Different stories per object, scores/lives/timers, saving progress, sound, Three.js/WebGL, prices or buying advice.
