# CivitFree Personal — Repo Audit

Snapshot of repo state as of 2026-05-07, on branch `claude/check-analyze-repo-6Tdph`.

This file records the gap between what `CLAUDE.md` describes and what is actually
on disk, plus a prioritized backlog. It is **descriptive, not prescriptive** — locked
product decisions live in `CLAUDE.md` and are unchanged here.

## 1. Summary

The runnable Vite + React app at `src/` now imports the personal components as
ES modules — the orphan `.jsx` files in the repo root were ported into
`src/screens/`, `src/components/`, and `src/shared/`, and the HTML prototype's CSS
was lifted into `src/styles.css`. The HTML prototype (`CivitFree Personal.html`)
still loads its own copy of the orphan files via Babel-from-CDN as the visual
source of truth, per `CLAUDE.md`.

The two layers no longer compete:

1. **Canonical visual prototype** — `CivitFree Personal.html` plus the repo-root
   `.jsx` files (Babel-CDN globals). Untouched by this audit.
2. **Runnable Vite + React app** — `src/main.jsx` composes
   `VariantPersonalClassic` / `Queue` / `Feed` / `Inpaint` / `OnboardingFlow` from
   the new `src/screens/` modules.

The next highest-value task is **#2 below**: implementing real ComfyUI transport
in `src/services/comfyClient.js` so the UI can actually generate.

## 2. Current state — what runs

| Component | Path | Status |
|---|---|---|
| Vite scaffold | `package.json`, `index.html` | ✅ React 18.3 + Vite 5.4, scripts `dev` / `build` / `preview` |
| App entry | `src/main.jsx` | ✅ Composes ported screens A/B/C/D + onboarding overlay |
| Shared layer | `src/shared/{icons,Shell,controls,mockImages}.jsx` | ✅ Ported from root `.jsx` as ES modules |
| Components | `src/components/{BottomSheet,Drawer,ModelPicker,SortFilter}.jsx` | ✅ Ported from root `.jsx` as ES modules |
| Screens | `src/screens/{Generation,QueueAndFeed,Inpaint,Onboarding}.jsx` | ✅ Ported from root `variant-personal-*.jsx` as ES modules |
| Styles | `src/styles.css` | ✅ Lifted from `CivitFree Personal.html`, plus `.app-shell` / `.intro-panel` / `.screen-tabs` chrome |
| ComfyUI client boundary | `src/services/comfyClient.js` | ⚠️ Six functions (`testConnection`, `listCheckpoints`, `listLoras`, `submitWorkflow`, `pollQueueHistory`, `downloadGeneratedImage`) all throw `is a ComfyUI stub` |
| Backend profiles | `src/services/comfyClient.js` | ✅ `defaultBackendProfile` (Steubenville RTX 3080) and `cloudFallbackProfile` exported |
| Canonical HTML prototype | `CivitFree Personal.html` | ✅ Untouched; still loads via Babel-from-CDN |

## 3. Gap vs `CLAUDE.md` "Still to do"

`CLAUDE.md` lists seven outstanding items. Reality:

| Claim in CLAUDE.md | Actual state |
|---|---|
| Convert the static prototype into a runnable Vite + React app scaffold | ✅ **Done** — `src/main.jsx` builds via Vite |
| Move/re-export personal components into `src/` with proper imports | ✅ **Done** — ported into `src/shared/`, `src/components/`, `src/screens/` |
| Add a typed/stubbed ComfyUI client boundary | ✅ **Done** — `src/services/comfyClient.js` with JSDoc `BackendProfile` typedef |
| Implement real ComfyUI workflow graph mutation | ✅ **Done (text → image)** — `src/services/buildWorkflow.js` builds the graph; `src/services/comfyClient.js` submits and polls. img→img / inpaint / upscale graphs are follow-ups. |
| Wire remaining placeholder buttons to app state | ⚠️ **Partial** — drawer, model/LoRA pickers, action sheet, backend switcher, sort/filter all wired; LoRA picker's _Select_ now adds to the loaded list; image action sheet's _Send to inpaint_ navigates to Screen D with the source seed/palette; _Remix_ copies prompt back to Screen A. Run metadata and fullscreen image viewer are still missing |
| Upgrade the LoRA loaded-state section with thumbnails, strength sliders, remove buttons | ✅ **Done** — `src/screens/Generation.jsx` renders `.cf-lora-row` per loaded LoRA |
| Real pagination/virtual scrolling and cross-page selection persistence | ❌ **Not started** — feed renders 12 mock tiles |

## 4. Locked-spec compliance check

Verified against `src/main.jsx` (the runnable scaffold):

| Locked decision | Source line | Status |
|---|---|---|
| Enter inserts newline, never fires Generate | `src/screens/Generation.jsx` (textarea, no submit handler) | ✅ |
| QTY full-width, supports 1–9999 | `src/shared/Shell.jsx` (Dock personal QTY row) | ✅ |
| Screen B / Screen C have no Generate Again bar | `src/screens/QueueAndFeed.jsx` (no Dock rendered) | ✅ |
| Hamburger opens side drawer (CF logo entry) | `src/shared/Shell.jsx` (TopBar `cf-logo onClick={onMenu}`) | ✅ |
| No batch delete, no thumbs up/down, no X button | `src/components/BottomSheet.jsx` ImageActionSheet | ✅ |
| Wand is the single "do something to this image" entry point | `src/screens/QueueAndFeed.jsx` FeedCard wand button + ⋮ both open ImageActionSheet | ✅ |
| Bottom sheet menu (⋮ and wand on thumbnails) | wired in FeedCard | ✅ |
| Cloud GPU fallback supported alongside local profiles | `src/services/comfyClient.js` `cloudFallbackProfile`; `src/components/SortFilter.jsx` BackendSwitcher | ✅ |

## 5. Personal `.jsx` mapping (root → `src/`)

The root `.jsx` files are kept on disk because the canonical HTML prototype
(`CivitFree Personal.html`) still loads them via Babel-from-CDN. Each one was
ported into `src/` as ES modules consumed by the Vite app:

| Root file (Babel-CDN globals, kept) | `src/` ES module (used by Vite app) |
|---|---|
| `variant-personal-classic.jsx` | `src/screens/Generation.jsx` |
| `variant-personal-gallery.jsx` | `src/screens/QueueAndFeed.jsx` |
| `variant-personal-inpaint.jsx` | `src/screens/Inpaint.jsx` |
| `onboarding.jsx` | `src/screens/Onboarding.jsx` |
| `drawer.jsx` | `src/components/Drawer.jsx` |
| `model-picker.jsx` | `src/components/ModelPicker.jsx` (`ModelPicker`, `LoraPicker`) |
| `sort-filter.jsx` | `src/components/SortFilter.jsx` |
| `bottom-sheet.jsx` | `src/components/BottomSheet.jsx` |
| `shell.jsx` | `src/shared/Shell.jsx` |
| `controls.jsx` | `src/shared/controls.jsx` |
| `icons.jsx` | `src/shared/icons.jsx` (`Ic`) |
| `personal-mock-images.jsx` | `src/shared/mockImages.jsx` |

Two copies exist by design: the HTML prototype keeps its self-contained Babel
build for visual reference, and the Vite app uses the new modules. Future spec
changes should land in both — or, if the HTML prototype is retired, in `src/`
only.

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

1. ~~**Port orphan personal `.jsx` files into `src/` as ES modules.**~~ ✅ Done.
2. ~~**Upgrade the LoRA loaded-state UI** + **wire cross-screen state** (LoRA picker
   → loaded list, _Send to inpaint_ → Screen D source, _Remix_ → Screen A prompt).~~
   ✅ Done.
3. ~~**Implement real ComfyUI transport.**~~ ✅ Done for the Generate flow.
   Real `fetch` calls against `/prompt`, `/history`, `/view`,
   `/object_info`, `/system_stats` in `src/services/comfyClient.js`.
   Generate button on Screen A wired end-to-end. Remaining: feed
   queue/feed polling loop (replaces hardcoded mock data) — Phase 4.
4. **Run metadata + fullscreen image viewer.** Tap any image to open a fullscreen
   viewer with prompt/seed/sampler details. Closes the last "wire placeholder
   buttons" gap from `CLAUDE.md`.
5. **Pagination / virtual scrolling for the feed**, with cross-page selection
   persistence. Last open item from `CLAUDE.md` "Still to do".
6. **Tooling baseline.** `vite.config.js` with `@vitejs/plugin-react`, ESLint flat
   config, GitHub Actions job running `npm run build` on PRs.

Items 4–6 can be parallelized after item 3 lands.

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
