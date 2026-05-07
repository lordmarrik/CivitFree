# CivitFree - Claude Design Instructions

You are continuing work on CivitFree, a local-first personal image generation UI. The project already has a CLAUDE.md in the project root with build history. Read it first.

## How to work with me

- Ask ONE clarifying question at a time. Never dump multiple questions.
- Do not ask me to make technical decisions. Make them and explain only if I ask.
- Do not generate walls of text. Keep responses short.
- When a button or element needs speccing, ask what it does, I answer, you move on.

## What exists

Four screens are visually designed (~98%):
- Screen A: Generation panel (txt2img/img2img/inpaint/upscale tabs)
- Screen B: Queue/runs feed
- Screen C: Flat image feed
- Screen D: Inpainting editor

## Interaction spec (locked decisions from May 4 session)

### Screen A - Generation Panel

- Hamburger menu: opens side drawer with Settings, Model Library, LoRA Manager, About
- Bookmark icon: save/load generation presets
- Nav icons: pencil = Screen A, clock = Screen B, grid = Screen C
- X button: REMOVED
- Tabs (txt2img/img2img/inpaint/upscale): swap fields on Screen A. All share model picker, LoRAs section, and Generate button
- Pipeline bar: static status indicator showing backend connection and GPU state. NOT a dropdown
- Model "Change" button: opens fullscreen picker with two tabs: "Local Models" and "Browse CivitAI"
- LoRA "+ Add": same two-tab pattern (local vs CivitAI browse)
- GPU status bar: shows local vs cloud GPU, state (idle/generating), estimated time. Supports cloud GPU fallback
- QTY: full-width number input ABOVE Generate button, range 1-9999

### Screen B - Queue/Runs

- Sort: Newest / Oldest via bottom sheet
- Filters: Favorited only (no liked/disliked), Generation Type (dynamically mirrors whatever tabs exist), Model, Date Range, Hide Failed
- Run card info icon: opens full run details/metadata
- Run card trash icon: deletes the run
- "+" buttons on model/LoRA rows: loads that resource into Screen A for a new generation
- Three-dot menu on image thumbnails: bottom sheet with Remix, Remix (with seed), Image Variations, Img2Img, Inpaint, Face Fix (maybe ADetailer), Upscale, Remove Background, Image to Video, Download, Delete
- Generate Again bar: REMOVED from Screen B. Remix in three-dot menu handles re-runs.
- Batch selection (checkboxes + Select All): batch download (as zip) and batch favorite ONLY. NO batch delete.

### Screen C - Image Feed

- Same sort/filter bar as Screen B
- Same three-dot menu per image as Screen B
- Quick action icons per image: heart (favorite), wand (opens same action menu as three-dots, muscle memory shortcut), download
- Same batch selection as Screen B (favorite + download only, no delete)
- Generate Again bar: REMOVED. Only exists on Screen A.

### Screen D - Inpainting Editor

- Tabs: Inpaint (designed), Outpaint (NOT YET DESIGNED), Variations (NOT YET DESIGNED). Tabs swap fields like Screen A.
- Canvas: source image with mask painting overlay
- Denoise slider: MOVED outside canvas area, below with other controls
- Tools left to right: brush (paint mask), eraser (erase mask, not clear all), lasso (freeform selection), magic wand (auto-select by color similarity)
- Undo + redo buttons in upper right of canvas
- Brush size: S/M/L preset buttons + slider with px input
- Fullscreen mode: translucent button in upper right of canvas. Expands to full screen with translucent overlay controls and exit button
- "Replace with" prompt field
- Match Source toggle: model matches surrounding style/lighting/color
- Soft Edges toggle: feathers mask border for seamless blending
- Screen D is entirely original (CivitAI has no inpainting editor)

### Global / Performance

- Image pagination: 256 thumbnails per page with virtual scrolling (only ~8 rendered at a time)
- Cross-page selection: selections persist across pages as stored IDs. Counter shows "N selected"
- Batch download: packages selected images as zip
- App may be accessed remotely via Tailscale (phone in Columbus, PC in Steubenville)

## Still to design

These screens/features have NOT been specced yet:
- Nothing. Full interaction spec is complete as of May 4, 2026.

## Drawer Screens

### About
- Version number + release date, app name
- System info: detected GPU, VRAM, ComfyUI version, connection status

### Settings
- ComfyUI backend URL
- Default model/sampler/scheduler/steps/CFG/dimensions
- Cloud GPU credentials
- PC image save path
- Phone download path (separate from PC path)
- Backend profiles: named configs for different PCs (e.g. "Steubenville PC" / "Columbus PC"), swap with a tap

### Model Library
- Same layout as model picker on Screen A
- Filter by base model type (SDXL, Illustrious, Flux, SD 1.5, etc.)
- Local / Browse CivitAI tabs
- All entries are checkpoints (no resource type filter needed)

### LoRA Manager
- Same dual-tab layout (Local / Browse CivitAI)
- Resource type filter: LoRA, DoRA, LyCORIS, Embedding
- Base model compatibility filter
- Compatibility warning on mismatch

## Backend Switcher
- Tapping the GPU status bar opens a bottom sheet/popup
- Switch between local and cloud GPU
- Shows connection status for each

## Onboarding (first-run)
- Screen 1: Enter ComfyUI backend URL + "Test Connection" button (green checkmark or error)
- Screen 2: Scans ComfyUI for installed models/LoRAs, shows summary ("12 checkpoints, 47 LoRAs detected"), pick default model, done

## Screen D - Remaining Tabs

### Outpaint
- Directional controls: top/bottom/left/right (toggleable individually)
- Pixel count to extend
- Prompt for fill content
- Denoise slider
- Generate button

### Variations
- Source image display
- Denoise slider (same parameter name as all other tabs for consistency)
- Optional prompt override
- QTY + Generate

## Technical context

- Backend: ComfyUI (API-first, workflow JSON submission)
- Key challenge: frontend UI changes (adding LoRAs, changing models) must modify the ComfyUI workflow JSON graph programmatically
- Hardware: RTX 3080 10GB VRAM (sufficient for SDXL, not for video gen, hence cloud GPU option)
- The integration code between frontend and ComfyUI API is the hardest part and should be handled entirely by Claude Code, not by me

