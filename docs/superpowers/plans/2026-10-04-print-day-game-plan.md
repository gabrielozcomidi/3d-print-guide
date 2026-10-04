# Print Day game: implementation plan

Spec: `docs/superpowers/specs/2026-10-04-print-day-game-design.md`. Each task ends in something runnable and checked in the browser (`npm run dev`) plus `npm run build`. Commit after each task.

## Task 1: Skeleton, chapter and engine
- Add `<section id="game">` to `index.html`; `render` in `src/sections/game.js`; register in `src/main.js`.
- `data/copy.js`: section entry (`id: "game"`, nav "יום הדפסה", title, one-sentence intro). `data/chapters.js`: chapter `{ id: "game", title: "משחק: יום הדפסה", sections: ["game"] }` after `choose`.
- `src/lib/game/engine.js`: `createGame(steps)` -> `{ step, next(), back(), retry(), onChange(fn) }`; counts retries per step. No DOM.
- `src/styles/game.css`: stage layout (drawing + one-sentence prompt + one action area), progress outline, 44 px targets, focus styles, logical properties only.
- Check: chapter 8 appears in the menu, section shows an empty stage, no console errors.

## Task 2: Content data and validation
- `src/data/game.js`: `objects` (cat, boat, lighthouse: name, outline path, repair hole position, support spots incl. one decoy with a "why not" line, finale parts), `slicing` (layer heights, infills, feedback lines, effect on layer count), `firstLayer` (3 heights, results, hints), all Hebrew copy (English terms via `bidi`, `״`/`׳` quotes, no prices).
- Extend `scripts/validate-data.js`: every object has every step's data; support spot ids valid; at least one decoy per object; slicing options complete.
- Check: `npm run validate` passes; breaking a field makes it fail.

## Task 3: Step screens 1-4 (choose, repair, slice, supports)
- `src/lib/game/steps/{choose,repair,slice,supports}.js`, each `mount(host, ctx) -> { destroy }`, calling `ctx.done()`; reuse `selector`, wobble filter, `markList`.
- Tap and keyboard for every action; feedback in an `aria-live` region; one sentence per prompt; no wrong-answer dead ends (2 misses -> hint).
- Progress outline in `game.js` fills after each step.
- Check: play steps 1-4 for all three objects with mouse and keyboard only; 360/768/1280 px sweep.

## Task 4: Step 5, first layer and print animation
- `steps/firstLayer.js`: three-height control; too high -> funny failed-print drawing + hint + instant retry; right -> print animation reusing the hero loop idea (nozzle rises per layer, reveals each layer) on the chosen object's outline.
- Reduced motion: result shown without animation.
- Check: failure and success paths, retry works repeatedly, no console errors.

## Task 5: Finale engine (Canvas 2D)
- `src/lib/game/finale.js`: parts -> per-layer cross-section polygons (ellipse/rect/cone sampled), tilt projection, painter's order bottom to top, depth-sorted within a layer, seeded jitter, paper fill + red ink stroke, colours from CSS variables only.
- Nozzle sweep reveal per layer, hold, then rotate about the vertical axis; pause when off-screen; `devicePixelRatio` capped at 2; reduced motion -> finished still frame.
- Dynamic `import()` from `steps/finish.js`; layer count from the slicing choice.
- Check: all three objects look right at 3 sizes; measure added chunk size (should be a few KB gzip and not in the main bundle).

## Task 6: Step 6, finish, and polish
- `steps/finish.js`: tap to remove supports, then finale; closing sentence summarising what the player did (their settings); "play again" and "try another object" buttons.
- Cross-links: from the workflow chapter ("נסו בעצמכם") and the home page start-paths.
- Check: full run-through x3 objects.

## Task 7: QA, docs, release
- Browser sweep (overflow 360/768/1280, click every control, keyboard-only play-through, console clean, duplicate ids, reduced motion).
- Update `CLAUDE.md` (layout, game rules) and `README.md` (editing `data/game.js`).
- `npm run build`; report bundle sizes; commit and (when the owner agrees) push.

## Order and risk
Tasks run in order; the finale (Task 5) is the main technical risk, so its three-object look is checked early on a stub before Task 6. Out of scope as in the spec: per-object stories, scores/timers, saving, sound, WebGL.
