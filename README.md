# CivitFree Personal

Local-first personal image generation UI for ComfyUI. Single-user mobile-first
React app that talks to your own ComfyUI server.

## Status

- **Mockup**: `CivitFree Personal.html` (canonical visual reference, untouched).
- **Runnable app**: `src/` — Vite + React 18, ported from the mockup.
- **Backend transport**: real (`src/services/comfyClient.js`), targeted at
  ComfyUI **v0.18.x**.

The backlog (features still to add) is in `ANALYSIS.md`. The gap list (things
that are wrong, missing, or untested) is in `READINESS.md`.

## Run it

**Easy mode (Windows / Mac / Linux)** — double-click `start.bat`
(Windows) or run `./start.sh` (Mac / Linux). On first run it installs
dependencies; on subsequent runs it just starts the dev server and
opens the app in your browser. Requires [Node.js LTS](https://nodejs.org/)
installed.

**Manual:**

```sh
npm install
npm run dev    # http://localhost:5173 (or 0.0.0.0:5173 for LAN)
npm run build  # produces dist/
```

The dev server binds to `0.0.0.0` by default so you can reach it from
another device on the same Wi-Fi (e.g. open it on your phone using your
laptop's LAN IP).

## Connecting to ComfyUI

The app fetches directly from your ComfyUI server in the browser. ComfyUI
**does not send CORS headers by default**, so the browser will block every
request unless you start ComfyUI with the `--enable-cors-header` flag.

```sh
# Allow any origin (simplest for personal use):
python main.py --enable-cors-header '*'

# Or pin to your dev server origin specifically:
python main.py --enable-cors-header 'http://192.168.1.5:5173'

# Bind ComfyUI to your LAN IP if you want to hit it from another device:
python main.py --listen 0.0.0.0 --enable-cors-header '*'
```

Then in the app:

1. Hit the dev page (e.g. `http://localhost:5173`).
2. Open **First-run setup** (the small button above the phone frame on
   desktop, or the side drawer's Backend setup on mobile).
3. Type your ComfyUI URL (e.g. `http://192.168.1.42:8188`) and tap
   **Test Connection**. A successful response means CORS is set up
   correctly and ComfyUI is reachable.
4. Pick a checkpoint from the Model card's **Change** picker, or open
   the side drawer → **Settings** and type an exact checkpoint filename as
   a manual override.
5. On Screen A (Generate), type a prompt and tap **Generate**. The app
   submits a Text → Image workflow, polls `/history`, and shows outputs
   in Queue / Feed.

If anything fails, the error banner shows the actual error message from
ComfyUI plus a CORS hint when network errors hit. The most common
failures and fixes:

| Symptom                                    | Likely cause                                    |
| ------------------------------------------ | ----------------------------------------------- |
| "Network error reaching …"                 | ComfyUI not running, or CORS not enabled        |
| "ComfyUI returned 400 …" with node errors  | Wrong checkpoint filename or sampler name       |
| "Timed out after 300s …"                   | Generation too slow, or VRAM issue              |

## Repo layout

- `src/main.jsx` — App shell, persistent state, screen routing
- `src/screens/` — Generation (A), Queue + Feed (B/C), Inpaint (D), Onboarding
- `src/components/` — Drawer, ModelPicker, BottomSheet, SortFilter
- `src/shared/` — Shell (TopBar/StatusBar/Dock), controls, icons,
  `usePersisted` (localStorage hook), mock images
- `src/services/comfyClient.js` — ComfyUI HTTP transport
- `src/services/buildWorkflow.js` — Text-to-image graph builder
- `src/services/samplerMap.js` — UI name ↔ ComfyUI internal name mappings
- `src/styles.css` — full stylesheet, responsive at 767 px breakpoint
- `public/manifest.webmanifest`, `public/icon.svg` — PWA install assets

Legacy reference (do not extend):

- `CivitFree Personal.html` — canonical mockup, Babel-CDN globals
- `CivitFree.html` and the non-`personal` `variant-*.jsx` files — original
  CivitAI-style demo, kept for visual reference per `CLAUDE.md`

## Known follow-ups

- **iOS PWA icons** — the SVG icon at `public/icon.svg` covers desktop
  and Android. iOS Safari prefers raster PNGs (180×180, 192×192,
  512×512) for the home-screen icon; currently iOS will use a screenshot
  of the page when "Add to Home Screen" is used. Generate the PNGs from
  the SVG and add them to `public/`, then re-add the
  `<link rel="apple-touch-icon">` and PNG manifest entries.
- **Real model / LoRA listing** — done. ModelPicker, LoraPicker, and
  the onboarding step 2 list all fetch from
  `/object_info/CheckpointLoaderSimple` and `/object_info/LoraLoader`.
  Selected items carry their real filename through to generation.
- See `READINESS.md` for the full list.
