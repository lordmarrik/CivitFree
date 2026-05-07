# CivitFree Personal

Local-first personal image generation UI prototype for a CivitAI-inspired mobile generation app. The runnable scaffold targets the personal/local workflow only.

## Start here

1. Read `CLAUDE.md` for the current project status.
2. Read `CODEX_TASK.md` for the next implementation task.
3. Read `Uploads/civitfree-claude-design-instructions-3.md` for the locked design/interaction spec.
4. Use the exported personal prototype (`CivitFree Personal.html`) and screenshots in `Uploads/` as visual references. Treat `CivitFree.html` as legacy visual reference only.

## Runnable scaffold

A minimal Vite + React scaffold now lives alongside the exported mockups. It renders the personal-only app shell for Screens A–D and includes a stubbed ComfyUI service boundary for future backend wiring.

```bash
npm install
npm run dev
npm run build
```

The exported personal HTML file remains the visual reference; use the Vite app for implementation work.

## Key files

- `index.html`, `package.json`, `src/` — runnable Vite + React personal app scaffold
- `app.jsx` — design canvas entry point
- `variant-personal-classic.jsx` — Screen A, generation panel
- `variant-personal-gallery.jsx` — Screens B/C, queue and image feed
- `variant-personal-inpaint.jsx` — Screen D, inpainting editor
- `shell.jsx` — shared phone chrome/top bar/dock
- `icons.jsx` — icon set
- `controls.jsx` — shared controls
- `bottom-sheet.jsx` — action menu overlay
- `design-canvas.jsx`, `tweaks-panel.jsx` — prototype framework

## Notes

This bundle was prepared from `CivitFree (1).zip` on May 7, 2026.
