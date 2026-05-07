# CivitFree Personal — Repo Audit

Snapshot of repo state as of 2026-05-07, on branch `claude/check-analyze-repo-6Tdph`.

This file records the gap between what `CLAUDE.md` describes and what is actually
on disk, plus a prioritized backlog. It is **descriptive, not prescriptive** — locked
product decisions live in `CLAUDE.md` and are unchanged here.

## 1. Summary

The repo is a hybrid of three layers that do not yet share code:

1. **Canonical visual prototype** — `CivitFree Personal.html`, a Babel-from-CDN single-page
   app that loads the 14 personal `.jsx` files in the repo root via global `window.*`
   exports. This is the spec-true UI.
2. **Runnable Vite + React scaffold** — `src/main.jsx` (237 lines), a from-scratch
   reimplementation of the four screens with low-fidelity inline components. Builds
   and runs via `npm run dev` / `npm run build`.
3. **Orphaned root `.jsx` files** — 760 lines of high-fidelity personal components
   (`variant-personal-*.jsx`, `drawer.jsx`, `model-picker.jsx`, etc.) that have **no
   ES module syntax** and are not imported by `src/`.

The single highest-value next task is to **port the orphan personal components into
`src/` as ES modules** so the runnable scaffold inherits the prototype's fidelity
instead of competing with it. Everything else in the backlog is downstream of that.

## 2. Current state — what runs

| Component | Path | Status |
|---|---|---|
| Vite scaffold | `package.json`, `index.html` | ✅ React 18.3 + Vite 5.4, scripts `dev` / `build` / `preview` |
| App entry | `src/main.jsx` | ✅ Renders four screens, drawer, sheets, sticky dock |
| Styles | `src/styles.css` | ✅ Dark mobile UI, CSS variables |
| ComfyUI client boundary | `src/services/comfyClient.js` | ⚠️ Six functions (`testConnection`, `listCheckpoints`, `listLoras`, `submitWorkflow`, `pollQueueHistory`, `downloadGeneratedImage`) all throw `is a ComfyUI stub` |
| Backend profiles | `src/services/comfyClient.js` | ✅ `defaultBackendProfile` (Steubenville RTX 3080) and `cloudFallbackProfile` exported |
| Canonical HTML prototype | `CivitFree Personal.html` | ✅ Loads via Babel-from-CDN; visual source of truth |

## 3. Gap vs `CLAUDE.md` "Still to do"

`CLAUDE.md` lists seven outstanding items. Reality:

| Claim in CLAUDE.md | Actual state |
|---|---|
| Convert the static prototype into a runnable Vite + React app scaffold | ✅ **Done** — `src/main.jsx` builds via Vite |
| Move/re-export personal components into `src/` with proper imports | ❌ **Not done** — `src/main.jsx` is a parallel reimplementation; root `.jsx` files remain orphaned and lack `import`/`export` syntax |
| Add a typed/stubbed ComfyUI client boundary | ✅ **Done** — `src/services/comfyClient.js` with JSDoc `BackendProfile` typedef |
| Implement real ComfyUI workflow graph mutation | ❌ **Blocked** on the stubs in `src/services/comfyClient.js` |
| Wire remaining placeholder buttons to app state | ⚠️ **Partial** — drawer, model/LoRA pickers, action sheet, backend switcher all wired; run metadata + fullscreen image viewer still missing |
| Upgrade the LoRA loaded-state section with thumbnails, strength sliders, remove buttons | ❌ **Not started** — `src/main.jsx` LoRA sheet only lists names |
| Real pagination/virtual scrolling and cross-page selection persistence | ❌ **Not started** — feed uses `mockRuns.concat(mockRuns)` (six tiles) |

## 4. Locked-spec compliance check

Verified against `src/main.jsx` (the runnable scaffold):

| Locked decision | Source line | Status |
|---|---|---|
| Enter inserts newline, never fires Generate | `src/main.jsx:142` (textarea, no submit handler) | ✅ |
| QTY full-width, supports 1–9999 | `src/main.jsx:149`, `src/main.jsx:190-198` (Stepper bounds) | ✅ |
| Screen B / Screen C have no Generate Again bar | `src/main.jsx:154-164` | ✅ |
| Hamburger opens side drawer (CF logo entry) | `src/main.jsx:116`, `src/main.jsx:209-219` | ✅ |
| No batch delete, no thumbs up/down, no X button | `src/main.jsx` action sheet `src/main.jsx:84-89` | ✅ |
| Wand is the single "do something to this image" entry point | only ⋮ click on tile is wired (`src/main.jsx:187`); no separate wand entry | ⚠️ partial |
| Bottom sheet menu (⋮ and wand on thumbnails) | `src/main.jsx:84-89` (single menu, only ⋮ wired) | ⚠️ partial |
| Cloud GPU fallback supported alongside local profiles | `src/services/comfyClient.js` `cloudFallbackProfile` | ✅ |

The orphan prototype files (`variant-personal-classic.jsx` etc.) implement the wand
entry and richer interaction set; that fidelity is lost in the scaffold until a port
happens.

## 5. Orphaned root `.jsx` inventory

None of the files below have `import` or `export` statements; they are Babel-CDN
globals consumed by `CivitFree Personal.html` and `CivitFree.html`.

### Personal — recommended for porting into `src/`

| File | LOC | Recommended target |
|---|---|---|
| `variant-personal-classic.jsx` | 227 | `src/screens/GenerationScreen.jsx` |
| `variant-personal-gallery.jsx` | 235 | `src/screens/QueueScreen.jsx` + `src/screens/FeedScreen.jsx` |
| `variant-personal-inpaint.jsx` | 298 | `src/screens/EditorScreen.jsx` |
| `drawer.jsx` | 378 | `src/components/Drawer.jsx` |
| `model-picker.jsx` | 403 | `src/components/ModelPicker.jsx` + `LoraPicker.jsx` |
| `sort-filter.jsx` | 123 | `src/components/SortFilterSheet.jsx` |
| `bottom-sheet.jsx` | 67 | `src/components/BottomSheet.jsx` |
| `onboarding.jsx` | 296 | `src/screens/OnboardingScreen.jsx` |
| `shell.jsx` | 153 | `src/shared/Shell.jsx` (StatusBar / TopBar / Dock) |
| `controls.jsx` | 135 | `src/shared/controls.jsx` |
| `icons.jsx` | 296 | `src/shared/icons.jsx` |
| `personal-mock-images.jsx` | 36 | `src/shared/mockImages.jsx` (`FakeImg`, `PALETTES`) |

Porting cost ≈ 760 lines of personal screens + ≈ 1,887 lines of shared/components,
mostly mechanical: add `import React from 'react'`, replace `window.*` lookups with
`import` statements, and remove the `Ic.*` global namespace in favor of named exports.

### Legacy non-personal — keep as reference, do **not** port

Per `CLAUDE.md` ("legacy reference only"):

| File | LOC | Notes |
|---|---|---|
| `variant-classic.jsx` | 141 | Original CivitAI-style generation panel |
| `variant-gallery.jsx` | 145 | Community feed / leaderboard |
| `variant-inpaint.jsx` | 113 | Original inpaint UI |
| `app.jsx` | 53 | Design-canvas wrapper for the legacy variants |
| `design-canvas.jsx` | 622 | Prototype framework — canvas / artboard |
| `tweaks-panel.jsx` | 425 | Prototype framework — live tweak editor |

### HTML prototypes — keep as visual references

- `CivitFree Personal.html` — canonical (per `CLAUDE.md`)
- `CivitFree.html` — legacy (per `CLAUDE.md`)

## 6. Tooling gaps

| Concern | Status |
|---|---|
| `vite.config.js` | ❌ absent — Vite defaults only |
| ESLint | ❌ |
| Prettier | ❌ |
| Vitest / unit tests | ❌ |
| TypeScript / typecheck | ❌ (JSDoc-only on the comfy client) |
| Pre-commit hooks | ❌ |
| CI workflow | ❌ no `.github/workflows/` |
| `npm run build` smoke test | ❌ not in CI |

Minimum recommended baseline before the next feature PR: `vite.config.js` (explicit
React plugin), ESLint flat config with the React plugin, and a CI job that runs
`npm install && npm run build`.

## 7. Prioritized backlog

Ordered by **unblock value**: each item assumes the previous is done.

1. **Port orphan personal `.jsx` files into `src/` as ES modules.** Replace the inline
   reimplementation in `src/main.jsx` with imports from `src/screens/`,
   `src/components/`, and `src/shared/`. This single step recovers the prototype's
   fidelity (wand entry, run metadata, sheet contents) and unblocks every UI feature
   below.
2. **Wire the mock image source.** Use `personal-mock-images.jsx` (`FakeImg`, `PALETTES`)
   as `src/shared/mockImages.jsx` so feed/queue tiles match the prototype look. Needed
   before any tile-based feature feels real.
3. **Implement real ComfyUI transport.** Replace the six `notImplemented` stubs in
   `src/services/comfyClient.js` with `fetch` calls against `${baseUrl}` for
   `/prompt`, `/queue`, `/history`, `/view`. Keep the typed boundary intact so UI
   code stays transport-agnostic.
4. **Upgrade the LoRA loaded-state UI.** Thumbnails, strength sliders, remove buttons
   per the screenshot reference `Uploads/Screenshot_20260504_162956_Brave.png`.
5. **Run metadata + fullscreen image viewer.** Closes the "wire remaining placeholder
   buttons" item from `CLAUDE.md`. Action sheet's *Send to inpaint* and *Remix* should
   navigate to Screen D and Screen A respectively with state preserved.
6. **Pagination / virtual scrolling for the feed**, with cross-page selection
   persistence. Last open item from `CLAUDE.md` "Still to do".
7. **Tooling baseline.** `vite.config.js`, ESLint flat config, GitHub Actions job
   running `npm run build` on PRs.

Items 4–6 can be parallelized after items 1–3 land.

## 8. Files referenced

- `CLAUDE.md` — locked product decisions, "Still to do" list
- `NEXT_STEPS.md` — earlier roadmap, partially superseded by what shipped
- `CODEX_TASK.md` — original scaffold-conversion brief
- `README.md` — repo orientation
- `Uploads/civitfree-claude-design-instructions-3.md` — locked spec (not opened in this audit; cross-reference)
- `Uploads/Screenshot_20260504_*.png` — visual references for sheets and pickers
- `package.json`, `index.html`
- `src/main.jsx`, `src/styles.css`, `src/services/comfyClient.js`
- Personal orphans: `variant-personal-classic.jsx`, `variant-personal-gallery.jsx`,
  `variant-personal-inpaint.jsx`, `drawer.jsx`, `model-picker.jsx`, `sort-filter.jsx`,
  `bottom-sheet.jsx`, `onboarding.jsx`, `shell.jsx`, `controls.jsx`, `icons.jsx`,
  `personal-mock-images.jsx`
- Legacy references: `CivitFree.html`, `CivitFree Personal.html`, `app.jsx`,
  `variant-classic.jsx`, `variant-gallery.jsx`, `variant-inpaint.jsx`,
  `design-canvas.jsx`, `tweaks-panel.jsx`
