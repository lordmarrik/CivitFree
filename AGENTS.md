# Repository instructions for AI agents

## Active app boundaries

- The active runnable app is **CivitFree Personal** in `src/`.
- Normal feature work happens in `src/`.
- `CivitFree Personal.html` and the repo-root `variant-personal-*.jsx`, `drawer.jsx`, `model-picker.jsx`, `sort-filter.jsx`, `bottom-sheet.jsx`, `onboarding.jsx`, `shell.jsx`, `controls.jsx`, `icons.jsx`, and `personal-mock-images.jsx` files are prototype/reference files, not the normal place for feature work.
- Prototype files must not be edited unless the user explicitly asks.
- `_archive/legacy-nonpersonal/` is archived backup/reference only for the old non-personal CivitFree demo.
- Archived files must not be edited unless the user explicitly asks.

## Change discipline

- Do not add features unless the user asks for features.
- Do not refactor unrelated code unless the user asks for that refactor.
- Keep changes focused on the requested task.
- Future agents must run `npm run build` before claiming done.
