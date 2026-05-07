# CivitFree Personal

Local-first personal image generation UI prototype for a CivitAI-inspired mobile generation app.

## Current status

This repository is currently a static prototype/mockup bundle. The active product target is **CivitFree Personal** only.

- `CivitFree Personal.html` is the canonical prototype entry point.
- `CivitFree.html` and the non-personal `variant-*.jsx` files are legacy visual references only.
- The prototype is loaded directly in the browser through exported HTML plus Babel-loaded JSX globals.
- There is not yet an `npm install`, `npm run dev`, or `npm run build` workflow; `CODEX_TASK.md` describes the next conversion into a runnable app scaffold.

## Start here

1. Read `CLAUDE.md` for the current personal-only project status.
2. Read `NEXT_STEPS.md` for the concrete build sequence and acceptance criteria.
3. Read `CODEX_TASK.md` for the scaffold task details.
4. Read `Uploads/civitfree-claude-design-instructions-3.md` for the locked design/interaction spec.
5. Use the exported personal prototype (`CivitFree Personal.html`) and screenshots in `Uploads/` as visual references.

## Key personal files

- `CivitFree Personal.html` — canonical personal prototype canvas
- `NEXT_STEPS.md` — concrete next milestones and acceptance criteria
- `variant-personal-classic.jsx` — Screen A, generation panel
- `variant-personal-gallery.jsx` — Screens B/C, queue and image feed
- `variant-personal-inpaint.jsx` — Screen D, inpainting editor
- `personal-mock-images.jsx` — deterministic placeholder image helpers for personal screens
- `drawer.jsx` — personal side drawer screens
- `model-picker.jsx` — model and LoRA picker overlays
- `sort-filter.jsx` — sort, filter, and backend switcher sheets
- `onboarding.jsx` — first-run backend setup prototype
- `shell.jsx` — shared phone chrome/top bar/dock
- `icons.jsx` — icon set
- `controls.jsx` — shared controls
- `bottom-sheet.jsx` — action menu overlay
- `design-canvas.jsx`, `tweaks-panel.jsx` — prototype framework

## Legacy reference files

The original non-personal CivitAI-inspired mockup is retained for comparison only:

- `CivitFree.html`
- `app.jsx`
- `variant-classic.jsx`
- `variant-gallery.jsx`
- `variant-inpaint.jsx`

Do not build new product behavior from these files unless it is explicitly reframed for personal/local use in the locked spec.

## Prototype runtime dependencies

The exported HTML prototypes currently load Google Fonts, React, ReactDOM, and Babel Standalone from public CDNs. That is acceptable for the mockup, but the runnable app scaffold should vendor or bundle dependencies through the app build.

## Notes

This bundle was prepared from `CivitFree (1).zip` on May 7, 2026.
