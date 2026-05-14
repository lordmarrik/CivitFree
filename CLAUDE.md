# CivitFree Personal — Project Status

## Product target

CivitFree is personal-only: a local-first mobile UI for a user's own image generation workflows, with ComfyUI as the backend target. Community feeds, credit pricing, leaderboards, voting, and platform-tier concepts are legacy CivitAI reference material only.

## Canonical prototype

- **Main file**: `CivitFree Personal.html`
- **Archived legacy backup only**: `_archive/legacy-nonpersonal/` contains the old non-personal CivitFree demo
- **Locked spec**: `Uploads/civitfree-claude-design-instructions-3.md`

## What's built

- **Screen A**: Generation panel with Text→Image / Img→Img / Inpaint / Upscale tabs
- **Screen B**: Queue with run cards, negative prompts, expandable prompt text
- **Screen C**: Flat image feed
- **Screen D**: Inpainting editor with Inpaint / Outpaint / Variations tabs
- **Bottom sheet** action menu (⋮ and wand on thumbnails)
- **Hamburger menu** side drawer with Settings, Model Library, LoRA Manager, and About
- **Model picker** fullscreen overlay
- **LoRA picker** fullscreen overlay
- **Sort/filter** bottom sheets
- **Backend switcher** sheet from the GPU status bar
- **Onboarding** backend connection and resource scan mockup
- **Legend** of what's removed/kept/added vs CivitAI

## Locked product decisions

- Cloud GPU fallback is supported; local PC profiles remain first-class.
- CF logo / hamburger opens the side drawer.
- Wand is the single “do something to this image” entry point.
- Enter inserts a newline and never fires Generate.
- QTY is full-width above Generate and supports 1–9999.
- Screen B and Screen C do not have a Generate Again bar; remix lives in image action menus.
- Batch selection supports favorite and download only, no batch delete.
- No thumbs up/down anywhere.
- X button is removed.

## Active repository boundaries

- The active runnable app is CivitFree Personal in `src/`.
- Normal feature work happens in `src/`.
- `_archive/legacy-nonpersonal/` is archived backup/reference only and must not be edited unless explicitly requested.
- Prototype files must not be edited unless explicitly requested.
- Do not add features or refactor unrelated code unless explicitly requested.
- Run `npm run build` before claiming done.

## Still to do

- Implement real ComfyUI workflow graph mutation after the UI shell is scaffolded.
- Wire remaining placeholder buttons to app state where no backend is required, including run metadata and fullscreen image viewer.
- Upgrade the LoRA loaded-state section with thumbnails, strength sliders, and remove buttons.
- Implement real pagination/virtual scrolling and cross-page selection persistence.

## Reference screenshots saved

- `Uploads/Screenshot_20260504_154152_Brave.png` — CivitAI wand menu reference
- `Uploads/Screenshot_20260504_153726_Brave.png` — CivitAI image detail + overflow menu reference
- `Uploads/Screenshot_20260504_162545_Brave.png` — CivitAI model picker reference
- `Uploads/Screenshot_20260504_162539_Brave.png` — CivitAI resource picker reference
- `Uploads/Screenshot_20260504_162956_Brave.png` — CivitAI loaded LoRAs with sliders reference

## Files

- `CivitFree Personal.html` — canonical personal prototype canvas
- `variant-personal-classic.jsx` — Screen A
- `variant-personal-gallery.jsx` — Screens B and C
- `variant-personal-inpaint.jsx` — Screen D
- `drawer.jsx` — side drawer screens
- `model-picker.jsx` — model and LoRA pickers
- `sort-filter.jsx` — sort/filter/backend switcher sheets
- `onboarding.jsx` — first-run flow
- `shell.jsx` — shared chrome (StatusBar, TopBar, Dock)
- `icons.jsx` — icon set
- `controls.jsx` — shared form controls
- `bottom-sheet.jsx` — action menu overlay
- `_archive/legacy-nonpersonal/` — archived old non-personal demo; backup/reference only, not active

External code review of this codebase: see CIVITFREE_REVIEW.md (root). Read it before changing code.
