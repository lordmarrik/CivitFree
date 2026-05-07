# Next steps after the CivitFree Personal scaffold

The repository now includes a minimal Vite + React scaffold alongside the exported mockups. Use the scaffold for implementation work and keep `CivitFree Personal.html` as the visual reference while the JSX globals are gradually ported into real modules.

## Scaffold status

- `package.json` defines `npm run dev`, `npm run build`, and `npm run preview`.
- `index.html` mounts the React app from `src/main.jsx`.
- `src/main.jsx` renders the personal-only shell for Screens A–D and wires local UI state for tabs, sheets, drawer, backend selection, prompt text, and QTY.
- `src/services/comfyClient.js` defines the ComfyUI integration boundary with stubbed methods.
- `src/styles.css` contains the mobile-first dark UI styling for the scaffold.

## Next implementation passes

1. **Port prototype components into modules**
   - Move the reusable pieces from `shell.jsx`, `controls.jsx`, `bottom-sheet.jsx`, `drawer.jsx`, `model-picker.jsx`, `sort-filter.jsx`, and the `variant-personal-*` files into `src/components/`.
   - Keep the current scaffold behavior while replacing placeholder JSX with the exported prototype UI.

2. **Add lightweight tests**
   - Add a smoke test that renders the app without crashing.
   - Add checks for the locked personal decisions: Enter does not submit, QTY supports 1–9999, batch actions exclude delete, and Screen B/C do not expose a Generate Again bar.

3. **Wire the ComfyUI client transport**
   - Implement connection testing against a configurable ComfyUI base URL.
   - Load checkpoints and LoRAs from ComfyUI instead of hard-coded mock options.
   - Keep workflow graph mutation behind the service boundary until the UI shell is stable.

4. **Replace mock data with local app state**
   - Persist selected backend profile, model, LoRAs, prompt defaults, and recent runs locally.
   - Add a fullscreen image viewer and run metadata panel before adding backend queue polling.

## Non-goals for the next pass

- Do not revive community feeds, voting, credit pricing, leaderboards, or platform-tier features.
- Do not add batch delete.
- Do not remove the exported mockup files.
- Do not couple React components directly to ComfyUI HTTP calls; use `src/services/comfyClient.js`.
