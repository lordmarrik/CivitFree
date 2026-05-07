# Codex task: turn CivitFree prototype into a runnable app scaffold

You are working on CivitFree Personal, a local-first personal image generation UI for ComfyUI. The personal product is the only implementation target.

## Required reading first

- `CLAUDE.md`
- `Uploads/civitfree-claude-design-instructions-3.md`

## Goal

Convert the existing personal prototype files into a clean, runnable React app scaffold while preserving the current visual design and locked interaction decisions.

## Constraints

- Keep the mobile-first UI look intact.
- Do not remove the existing prototype/exported HTML files. Keep `CivitFree Personal.html` as the canonical visual reference; treat `CivitFree.html` as legacy reference only.
- Do not invent new product behavior that conflicts with `Uploads/civitfree-claude-design-instructions-3.md`.
- Make technical decisions without asking the user unless the behavior is truly undefined.
- Keep the project local-first, with ComfyUI as the backend target.

## Suggested first implementation pass

1. Create a minimal Vite + React project structure.
2. Move/re-export the personal JSX components into `src/` with proper imports. Use non-personal `variant-*.jsx` files only as legacy visual references if needed.
3. Preserve the four current screens:
   - Screen A: Generation panel
   - Screen B: Queue/runs feed
   - Screen C: Flat image feed
   - Screen D: Inpainting editor
4. Implement the interaction shell for already-specced UI:
   - Hamburger opens side drawer.
   - Model Change opens a fullscreen picker.
   - LoRA + Add opens the same local/browse pattern.
   - Image three-dot and wand open the action bottom sheet.
   - Sort/filter controls open bottom sheets.
   - Remove the Screen B “Generate Again” bar if still present.
   - Remove the top-bar X button if still present.
5. Add a placeholder ComfyUI client module with typed functions/stubs for:
   - testing backend connection
   - listing checkpoints and LoRAs
   - submitting workflow JSON
   - polling queue/history
   - downloading generated images
6. Add README run instructions.
7. Add smoke tests or at least `npm run build` validation.

## Deliverable

Open a PR with:

- runnable personal app scaffold
- preserved personal prototype visual state
- implemented shell interactions where no backend is required
- placeholder/stubbed backend integration boundary
- clear notes on what remains for real ComfyUI workflow graph mutation

## Important product decisions

- Enter inserts newline and never triggers Generate.
- QTY is full-width above Generate and supports 1–9999.
- Screen B has no Generate Again bar; remix lives in image action menus.
- Batch selection supports favorite and download only, no delete.
- GPU status bar is a static status indicator; tapping opens backend switcher.
- Backend profiles support different PCs, e.g. Steubenville PC / Columbus PC.
- RTX 3080 10GB is the local hardware target; cloud GPU fallback is needed for heavier jobs.
