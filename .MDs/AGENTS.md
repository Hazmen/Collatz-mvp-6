# AGENTS.md — Collatzium MVP v6

## Project
Web Collatz explorer (3n+1). BigInt + Web Worker streaming chunks, ES Modules without bundler, Tailwind 4, lite-server. Must be served over HTTP, not `file://`. Worker is pure math, DOM knows no math — bridge is `state` + `workerManager`.

## Commands (verified `package.json`)
```bash
npm install
npm start          # concurrently: watch:css + lite-server
npm run build:css  # tailwindcss -i ./assets/tailwind/src/input.css -o ./assets/tailwind/dist/output.css
npm run watch:css  # same with --watch
npm run lite       # lite-server only
```
No tests / lint / typecheck / CI / `opencode.json` in repo. Tailwind source `assets/tailwind/src/input.css` (`@utility`) → `assets/tailwind/dist/output.css`.

## Architecture & Entrypoints
- `index.html:154` → `ESmodules/main.js` — wires modules only, no business logic.
- `ESmodules/state/state.js` — owns `state` (`activeInputValue`, `isComputing`, `workerResult`, `workerListLen`, `workerMaxNum`), `SBSconfig` (`currentStepIndex`, `isRunning`, `doneRunning`, `visibleItems`), `TUMBLERS`. Only `ESmodules/state/stateManager.js` may write to them.
- `ESmodules/workers/collatz.worker.js` — chunk size 10k, messages `chunk/done/error`. `workerManager.js:5` creates worker via `new URL('./collatz.worker.js', import.meta.url), {type:'module'}` and toggles `state.isComputing` (`true` on `workerManager_Recieve:11`, `false` on `done:24`). Forwards to `state.workerResult` / `stateTarget` (`collatz_done`).
- `ESmodules/core/SBSoutputManager.js` — step-by-step engine (`startSBS/skipSBS/pauseSBS/resumeSBS/addOneBatch/removeOneBatch`), fires `SBSeventTarget` (`sbs_batch/sbs_done/sbs_clear/sbs_removeBatch`). `instant` → `skipSBS`, `manual` driver is `+/-`.
- `ESmodules/ui/uiElements.js` — pure DOM map (`$ / $$ / $$$` from `utils/dom.js`), must not contain listeners or state mutations.
- `ESmodules/ui/runProcessControls.js` + `runProcessControls_guard.js` + `inputControls.js` — process/input controls.
- `webComponents/outputModeController.js` (shadow DOM) + `speedController.js` — segmented control. Slider + `clip-mask/labels-invert` trick.
- `ESmodules/core/resetManager.js` — single source for resets: `resetSBS` → `resetOutputOnly` (= `resetSBS`+`sbs_clear`) → `resetSession` (= `resetOutputOnly`+`resetState`).

## Data Flow
`input → runProcessControls validates → setStateValue(activeInputValue) → workerManager_Recieve → worker chunk/done → workerManager pushes to state → SBSoutputManager decides (auto: startSBS, instant: skipSBS, manual: wait) → sequenceView/stats render`.

Events: `stateTarget: collatz_done/collatz_error`, `SBSeventTarget: sbs_*`, `outputMode_EventTarget: outputMode_change`, `SBSconfig.doneRunning` / `state.hasResult`.

## Key Files & Responsibilities
- `ESmodules/main.js` — orchestration only.
- `ESmodules/ui/playButtonSVG.js:22` `setRunButtonMode` — toggles play/pause SVG. `setRunLoading/clearRunLoading` (loader `assets/media/svgs/ring-resize.svg`, inline `fill=white`, `currentColor`) must be called on `isComputing` change; `collatz_done` then overwrites with `setRunButtonMode`. Use relative path `assets/media/svgs/ring-resize.svg`, not `/assets/...`.
- `ESmodules/ui/outputModeController_Logic.js:7` `toogle_Controllers_Visibility` — visibility via `hidden` (`display:none`, fully inert) vs `locked` (`opacity .5 + pointer-events:none` but still focusable — add `inert/disabled/tabindex=-1` when truly hidden). Manual buttons container `sbs-manual_controllers` must be `hidden+inert+aria-hidden` until `collatz_done` in manual.
- `webComponents/outputModeController.js:218-249` — `Step By Step` single label hidden via CSS `visibility` with delay `220ms/180ms` on `:host([data-expanded])` (`syncExpandedAttr:314`). `allSbsSingle/allSbsSplit` duplicated in `labels` + `clip-mask`. Don't use `!important` opacity — `visibility` survives `anime.remove` interruption.
- `ESmodules/ui/bindKeypressAnimation.js` — maps `Space/KeyF/KeyR/KeyZ/KeyX` to buttons, `is-pressed` / `is-pressed-sm` (`input.css:193`), guards `!e.repeat`, ignores when input focused, removes on `blur/visibilitychange`, skips `locked`.

## Conventions & Gotchas
- Tailwind 4: build required after editing `assets/tailwind/src/input.css` or `index.html`.
- BigInt everywhere for input/sequence; `preventLetters` in `inputControls.js` blocks non-digits.
- Do not read input directly in `workerManager` — it receives `activeInputValue` from caller.
- `isComputing` true blocks Run/Skip/Reset/manual adds (guard in `runProcessControls.js:47`). While `isComputing`, Run shows spinner `aria-busy=true, disabled=true`, others `locked+disabled`.
- Manual flow: IDLE shows Run (not hidden) until `isComputing`; while `isComputing` keep Run+spinner, manual hidden+inert; on `collatz_done` swap Run→manual. Reset returns to IDLE.

## Interaction — Mentor Mode
- Default language: English. Respond in full, explanatory manner: say *what* changed, *why*, and *what to do next* as numbered steps with file:line refs and a minimal code example. Do not limit to 3-4 lines.
- Role: mentor, not silent executor. Explain, point at risks, give alternatives when relevant, but ask before refactoring, deleting dead code, moving functions, or changing logic behind the scenes.
- When the user doesn't understand the final action, end with a checklist: `What to do → files to touch → how to verify (command/output)`.
- Be direct and factual; avoid filler praise or emojis unless requested.

## Workflow & Verification
- Before any proposal or edit: `read`/`grep` the relevant files; do not guess library APIs — check `package.json`/imports.
- Do not touch files without request; exception: obvious build break (duplicate identifier, missing import, syntax error) — fix silently as infra.
- Use tools (`read`, `grep`, `bash`) to verify; run executable checks (`npm run build:css`, `npm start` smoke) when feasible. Prefer executable source over prose if docs conflict.
- Do not generate URLs unless 100% certain. Do not commit/push/PR or create docs (`README/CHANGELOG`) without explicit request.

## Verification (agent ramp-up)
1. `npm run build:css` — no errors, `output.css` updated.
2. `npm start` — app opens, `Run (Space)` → while `isComputing` shows `ring-resize` spinner, then restores play/pause; `1/2/3` hotkeys switch modes without ghost `Step By Step` text.
3. Check `hidden` elements have `inert`/`aria-hidden` and are unreachable via `Space/F/R/Z/X` and `Tab`.
