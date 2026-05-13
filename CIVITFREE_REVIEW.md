# CivitFree Code Review — Handoff to Next Claude Code Instance

> **You (next Claude) are picking up a code review on `lordmarrik/CivitFree`.** The user is the repo owner. They asked me to review their codebase with the highest possible detail so you can pick it up without re-doing the discovery work. This document is exhaustive on purpose.

---

## A.1 Mission

CivitFree is a local-first frontend that replaces a hosted-service generator UX with a similar UI pointed at the user's own ComfyUI server. The point is to keep the workflow ergonomics of a hosted generator while running everything locally.

## A.2 Tech stack

- Vite 5 + React 18 + plain JS (no TypeScript)
- No state library — state lives in `src/main.jsx`
- No router — tab state in `App` component
- ESLint configured, no enforcement in CI
- Polling-based ComfyUI integration (4-second tick), no websockets
- Targets ComfyUI v0.18.x
- Mobile-first; PWA-installable (manifest + SVG icon); iOS PNG icons still missing (READINESS.md flags as deprioritized — user is on Android)

## A.3 Repository boundary (CRITICAL — do not get this wrong)

| Path | Status |
|---|---|
| `src/` | **Active runnable app.** Edit here. |
| `_archive/legacy-nonpersonal/` | **Archived.** Reference only, never modify. |
| Loose `.jsx` files at repo root | **Mockup leftovers.** Not imported anywhere in active code. Should be archived/deleted; still present at time of review. **Do not edit them thinking they are the active source.** |
| `public/` | PWA assets (manifest, SVG icon) |
| `docs/` | Reference docs |
| `Uploads/` | (presumed user uploads — not inspected) |
| `.github/workflows/` | CI config (not inspected — READINESS.md says no CI enforcement) |

The 12 loose root JSX files are: `bottom-sheet.jsx`, `controls.jsx`, `drawer.jsx`, `icons.jsx`, `model-picker.jsx`, `onboarding.jsx`, `personal-mock-images.jsx`, `shell.jsx`, `sort-filter.jsx`, `variant-personal-classic.jsx`, `variant-personal-gallery.jsx`, `variant-personal-inpaint.jsx`. They mirror names that are properly placed under `src/components/`, `src/screens/`, and `src/shared/`. Confirm by grepping the import graph from `src/main.jsx`.

## A.4 Canonical docs in the repo (READ FIRST)

Read these in order before changing any code:

| File | Purpose |
|---|---|
| `CLAUDE.md` | **AI-agent rules for this repo. Read first and follow strictly.** |
| `AGENTS.md` | More AI-agent rules — likely overlaps with CLAUDE.md |
| `INTENT.md` | Project boundaries, non-goals, "personal-only" framing |
| `ROADMAP.md` | Phased plan (Phase 0–7). See A.5. |
| `READINESS.md` | Severity-tagged bug/gap audit with checkboxes. **The most useful single document in the repo.** Treat as canonical bug tracker. |
| `ANALYSIS.md` | Feature plans / details ROADMAP doesn't have room for |
| `NEXT_STEPS.md` | Tactical immediate next moves |
| `HANDOFF.md` | Existing handoff doc — may supersede parts of this file |
| `CODEX_TASK.md` | Task instructions (may be for a different agent) |
| `CivitFree Personal.html` | Visual mockup of the target design |
| `docs/` | Subdirectory with more reference material (not inspected in detail) |

**Important:** I was unable to fetch raw content for `CLAUDE.md`, `AGENTS.md`, `HANDOFF.md`, `INTENT.md`, `ANALYSIS.md`, and `NEXT_STEPS.md` during my review (raw.githubusercontent.com returned 404 in my session for those specific files, possibly transient, even though the file listing confirmed they exist). You have direct repo access — read them before acting. They almost certainly contain stricter rules than what I've captured here.

## A.5 Roadmap phases (from ROADMAP.md summary)

- **Phase 0** — Stabilize Text-to-Image loop with smoke testing and bug fixes
- **Phase 1** — Image metadata reliability + fullscreen viewer for generation params
- **Phase 2** — Mobile usability (keyboard handling, error states, accessibility)
- **Phase 3** — Image-to-image
- **Phase 4** — Inpaint
- **Phase 5** — Upscale
- **Phase 6** — Civitai integration as catalog/download source (deliberately decoupled from generation)
- **Phase 7** — Testing infrastructure + release readiness

Non-goals per ROADMAP: cloud generation, Civitai hosting, account requirements, wholesale UI copying.

Three canonical docs per ROADMAP: `INTENT.md` (boundaries), `docs/NEXT_STEPS.md` (tactics), `ROADMAP.md` (strategic sequencing).

## A.6 Code structure (annotated file tree)

```
src/
├── main.jsx                        # App entry. Holds ALL top-level state (god-component, ~250 lines).
│                                   # Routes to one of 4 screens. localStorage persistence via usePersisted.
│                                   # Imports VariantPersonalClassic, VariantPersonalQueue, VariantPersonalFeed,
│                                   # VariantPersonalInpaint, OnboardingFlow, SAMPLER_LOOKUP, SCHEDULER_LOOKUP.
├── styles.css                      # Single global stylesheet. Mobile-first. @media block MUST be at end of file
│                                   # (cascade order matters — past bug fixed per READINESS.md).
├── screens/
│   ├── Generation.jsx              # Screen A (id 'brush'). Prompt/settings/Generate. Wired to ComfyUI:
│   │                               # builds workflow, submits /prompt, polls /history. Tab selectors for
│   │                               # Video/Music modalities exist but show the Image UI (READINESS notes this).
│   ├── QueueAndFeed.jsx            # Screens B (id 'clock') + C (id 'grid'). Queue (running/queued) and
│   │                               # Feed (completed images). Reads /queue + /history via useComfyHistory.
│   ├── Inpaint.jsx                 # Screen D (id 'inpaint'). Mostly mockup at time of review — mask painting
│   │                               # not yet functional. Top-bar still highlights 'brush' instead of D (bug).
│   └── Onboarding.jsx              # First-run wizard. Real /system_stats connection test, model picker;
│                                   # persists URL + default model name to settings on Done.
├── components/
│   ├── BottomSheet.jsx             # Modal sheet primitive
│   ├── Drawer.jsx                  # Hamburger drawer (Settings, Model Library, LoRA Manager, About)
│   ├── ModelPicker.jsx             # Local tab fetches real checkpoint filenames from
│   │                               # /object_info/CheckpointLoaderSimple. CivitAI tab is a stub.
│   └── SortFilter.jsx              # Sort + filter sheets — choices currently never leave the sheet
│                                   # (READINESS flags as 🔴).
├── shared/
│   ├── Shell.jsx                   # Phone-frame chrome wrapper
│   ├── controls.jsx                # Reusable UI controls
│   ├── icons.jsx                   # SVG icon set
│   ├── mockImages.jsx              # Mock image data — still used as fallback in some places. Grep before
│   │                               # deleting.
│   ├── useComfyHistory.js          # Polling hook. 4s interval. Returns { runs, loading, error, reload }.
│   ├── useComfyList.js             # Listing hook for models/loras (not deeply inspected)
│   └── usePersisted.js             # localStorage-backed state. Namespace prefix: 'cf-personal:'.
└── services/
    ├── comfyClient.js              # HTTP layer to ComfyUI. Backend profiles (local/cloud), URL normalization,
    │                               # ComfyError class with CORS hints, /system_stats /prompt /history /queue
    │                               # /view, AbortSignal support, configurable polling timeout, cancellation.
    ├── buildWorkflow.js            # Pure functions building ComfyUI workflow graphs.
    │                               # randomSeed() → 32-bit uint
    │                               # buildTextToImageWorkflow({checkpoint, prompts, sampler, scheduler, cfg,
    │                               #   steps, seed, size, batch, loras, filenamePrefix})
    │                               # Node layout: 3=checkpoint loader, 100+=LoRA chain, 4=empty latent,
    │                               # 5/6=CLIP encode, 7=KSampler, 8=VAE decode, 9=SaveImage.
    │                               # LoRA chains thread model+clip refs through successive loaders.
    ├── historyParser.js            # **Best file in the repo.** Parses arbitrary ComfyUI /history entries
    │                               # into ParsedRun. Tolerant — walks graph by class_type, recurses
    │                               # LoraLoader chains for checkpoint resolution with cycle protection.
    │                               # Exports: parseHistoryEntry, parseHistory, parseQueueEntry, parseQueue,
    │                               # mergeQueueAndHistory, paletteForFilename, seedHashForFilename.
    └── samplerMap.js               # Display ↔ internal sampler/scheduler name mappings (SAMPLER_LOOKUP,
                                    # SCHEDULER_LOOKUP). Should also own the DPM++ 2M Karras special case
                                    # that's currently in main.jsx (see A.8 issue #4).
```

## A.7 Architecture observations — what's well done

Preserve these in any refactor:

**`src/services/historyParser.js`:**
- Walks graph by `class_type` (`KSampler`, `KSamplerAdvanced`, `EmptyLatentImage`, `LoraLoader`, `CLIPTextEncode`) — does NOT hardcode node IDs. This is why workflows imported from Civitai or shared elsewhere parse correctly.
- `resolveCheckpointFromModel` recurses through LoraLoader chains with a `seen` Set to prevent cycles when tracing the model input back to the checkpoint loader.
- `mergeQueueAndHistory` produces a stable bucketed sort: running → queued → completed, newest-first within each bucket.
- `messageTime` handles both seconds-since-epoch and ms-since-epoch timestamps (`t > 1e12 ? t : t * 1000`).
- Pure functions, JSDoc types throughout, defensive null handling everywhere.

**`src/shared/useComfyHistory.js`:**
- Parallel `/queue` + `/history` via `Promise.all`
- `cancelled` flag pattern with proper cleanup on unmount/dep-change
- `firstAttempt` ref guards `setLoading(true)` so it only flashes on the first fetch, not every tick
- `reloadTick` state lets callers force a re-fetch
- Catches errors per-tick without breaking the polling loop

**`src/shared/usePersisted.js`:**
- Namespaced keys (`cf-personal:`)
- `try/catch` around localStorage access for SSR / private-mode / quota-exceeded safety
- Lazy initial state via function form of `useState`
- Effect-driven persistence on value change

**`READINESS.md`:**
- Severity tags (🔴 broken / 🟡 important / 🟢 polish)
- Checkbox status (`[ ]` / `[x]`)
- Walked screen-by-screen
- Differentiates "actively misleading button" from "honest not-done-yet gap"
- This is better gap-documentation than 95% of professional projects produce. Treat as canonical.

## A.8 Concrete issues — full inventory

Issues are numbered and labeled with priority. Some overlap with READINESS.md (noted where they do); items marked **NEW** are not in READINESS.md.

### Issue 1 — `src/main.jsx` is a god-component (HIGH, NEW)

`App()` in `src/main.jsx` (~250 lines) owns all top-level state:
- `screen` (active tab)
- `onboardingOpen` (modal flag)
- `inpaintSource` (cross-screen handoff for "send to inpaint")
- `prompt` (persisted)
- `negativePrompt` (persisted)
- `loras` (persisted, array)
- `model` (persisted, `{name, ver, size, base, filename}`)
- `settings` (persisted, full DEFAULT_SETTINGS shape)
- `pendingSeed` (remix flow)
- `pendingRemix` (remix flow)

Plus handlers: `handleTab`, `addLora`, `updateLora`, `removeLora`, `updateSettings`, `updateModel`, `remix` (~30 lines), `consumePendingSeed`, `consumePendingRemix`, `sendToInpaint`.

Plus prop-drilling: every screen receives 8–12 props.

This is already painful at 4 screens; ROADMAP wants 7 phases of additional features. By Phase 3 (img2img) every new screen will add 2–4 more state fields and 1–3 more handlers, all in this file.

**Recommended fix:** Lift to Zustand with `persist` middleware. Minimum-friction migration path:
1. `npm install zustand`
2. Create `src/store/index.js` with one store, slices organized by concern (`promptSlice`, `loraSlice`, `modelSlice`, `settingsSlice`, `routingSlice`, `remixSlice`).
3. Wrap settings/prompt/negativePrompt/loras/model with `persist` middleware using same `cf-personal:` namespace so existing localStorage carries over.
4. Convert one `usePersisted` consumer at a time; delete from `main.jsx` as you go.
5. Screens import directly from the store via `useStore` selectors — no more props.
6. Keep handlers colocated with state in the store.
7. `main.jsx` shrinks to ~50 lines: routing + screen mount + onboarding modal.

**Do not** fragment into multiple stores at this scale. One store with logical slices is plenty.

**Do not** rewrite all screens at once. Slice-by-slice migration with both patterns coexisting is fine for a few PRs.

### Issue 2 — Personal data leaked in `DEFAULT_SETTINGS` (HIGH, NEW)

In `src/main.jsx`:
```js
const DEFAULT_SETTINGS = {
  backendProfile: 'steubenville',                   // LEAKS: user's location/identifier
  backendUrl: 'http://192.168.1.42:8188',           // LEAKS: user's LAN IP
  defaultModelName: 'HomoSimile XL v4.0',           // LEAKS: user's default model
  checkpointFilename: '',
  sampler: 'Euler a',
  scheduler: 'Normal',
  steps: 30,
  cfg: 7,
  size: '832×1216',
  cloudGpuKey: '',
  civitaiKey: '',
  pcSavePath: '/home/user/civitfree/outputs',       // LEAKS: user's filesystem layout
  phoneSavePath: '/storage/emulated/0/CivitFree',
};
```

The repo is **public on GitHub**. None of this is sensitive, but it's leaking the user's network topology and personal preferences to anyone who clones it. Also, `backendProfile: 'steubenville'` is a Steubenville, Ohio reference clearly meaningful only to the user — meaningless to anyone else.

**Recommended fix:**
- Replace `backendProfile` with `'local'` (generic)
- Replace `backendUrl` with `''` (empty string — forces onboarding)
- Replace `defaultModelName` with `''`
- Replace `pcSavePath` with `''` or platform-detection-derived value
- Replace `phoneSavePath` with `''` or platform-detection-derived value
- Onboarding flow already persists URL + default model name on Done; this just removes the embarrassing fallbacks for fresh clones.

### Issue 3 — Repo-root mockup file pollution (MEDIUM, NEW)

Twelve loose `.jsx` files at the repo top level (listed in A.3). Not imported anywhere in `src/`. They duplicate names from `src/components/` and `src/shared/`. They confuse:
- The GitHub file tree view (longer scroll, ambiguous which is canonical)
- Anyone (human or AI) doing `grep -r` from repo root
- Newly cloned editors that surface them in fuzzy file finders

**Recommended fix:** Move them into `_archive/mockups/` to match the existing `_archive/legacy-nonpersonal/` pattern. Document the move in a commit message. If the canonical mockup is `CivitFree Personal.html`, mention that in the archive README.

Verify before deletion: `git grep -l <filename-stem>` from repo root for each file. They should have zero matches inside `src/`.

### Issue 4 — Hardcoded sampler-display special case (LOW, NEW)

In `src/main.jsx`:
```js
function displaySampler(sampler, scheduler) {
  if (sampler === 'dpmpp_2m' && scheduler === 'karras') return 'DPM++ 2M Karras';
  return SAMPLER_DISPLAY_BY_INTERNAL[sampler] || sampler;
}
```

This grows linearly with `if` statements as more sampler+scheduler combos need display names. Move into `src/services/samplerMap.js` as a bidirectional map keyed by composite `(sampler, scheduler)` tuples.

### Issue 5 — AbortSignal supported but unused (LOW, NEW)

`comfyClient` exposes AbortSignal support per its description. `useComfyHistory.js` uses only a `cancelled` JS-side flag; the underlying HTTP requests still run to completion server-side. Wire the AbortController through so that unmounting a screen actually cancels the in-flight fetch.

### Issue 6 — No TypeScript at the service boundary (MEDIUM, partially in READINESS as 🟡 "no TypeScript")

The ComfyUI workflow JSON shape and the `ParsedRun` type from `historyParser.js` are exactly the structures that benefit from TypeScript. `parseHistoryEntry` returns a 16-field object and any consumer can typo a key with no warning.

**Recommended fix (minimal):**
- Add `tsconfig.json` with `allowJs: true`, `checkJs: false`, `noEmit: true`
- Convert just `src/services/*.js` → `*.ts` (4 files)
- Write `.d.ts` for the ComfyUI history/queue API response shapes
- Type the `ParsedRun` export properly
- Leave UI code as JS for now

This catches a class of bugs at the service boundary without committing to a full migration.

### Issue 7 — No tests (MEDIUM, in READINESS as 🟡 "No ESLint, no TypeScript, no pre-commit hook, no CI")

`historyParser.js` is pure functions over well-defined inputs — the most testable file in the codebase and ironically has zero tests. Adding Vitest + a small fixture set of real `/history` and `/queue` responses would lock down the parser before any further work on it.

**Recommended setup:**
1. `npm install -D vitest`
2. Create `src/services/__tests__/historyParser.test.js`
3. Save 2–3 real `/history` responses from the user's ComfyUI as fixtures in `src/services/__tests__/fixtures/`
4. Cover: T2I-only run, T2I-with-LoRAs run, error-status run, in-progress run
5. Add `npm test` to scripts; later add a GitHub Actions workflow.

### Issue 8 — No retry on transient network failures (LOW-MEDIUM, in READINESS as 🟡)

`comfyClient` fetches fail-fast on any network error. ComfyUI restarts when models are swapped; the 4-second polling tick smooths over most of this but a brief network blip surfaces as an error banner. Add backoff-retry (2 attempts, 500ms then 1500ms) inside `comfyClient` for idempotent GETs (`/history`, `/queue`, `/system_stats`, `/object_info`).

### Issue 9 — Onboarding modal inline-styled in `main.jsx` (LOW, NEW)

The onboarding overlay is built with an inline `style` prop object in `main.jsx`:
```js
<div style={{ position:'fixed', inset:0, zIndex: 200, background:'rgba(0,0,0,.6)', ... }}>
```
Reasonable for a one-off but if a second modal lands (likely — settings, image viewer, etc.) it should be lifted into a `<Modal>` primitive in `src/components/`.

### Issue 10 — Tab structure exposes inactive routes (LOW, in READINESS)

`main.jsx` defines four tabs: brush/clock/grid/inpaint. `handleTab` filter only forwards brush/clock/grid, suggesting inpaint shouldn't be a regular tab — it's a destination from Queue/Feed's "send to inpaint" action. The tab strip still shows inpaint as a tab, though. Either:
- Hide inpaint from the tab strip and rely on the cross-screen handoff only, or
- Allow inpaint as a first-class tab and remove the `handleTab` filter

Pick one. The current half-state is confusing.

## A.9 Hosted-generator feature gap analysis

Features a Civitai-style hosted generator offers that CivitFree doesn't yet:

### On the roadmap (correctly prioritized)
- Image metadata viewer (Phase 1)
- Image-to-image (Phase 3)
- Inpaint mask painting (currently mockup — Phase 4)
- Upscale (Phase 5)
- Civitai catalog browsing (Phase 6)

### NOT on the roadmap — should be added

**ControlNet / ControlLora (HIGH).** Single biggest omission for serious stylized generation work:
- **OpenPose** — pose composition; standard for character placement
- **Reference / IPAdapter** — character consistency across generations
- **Canny / Depth / Lineart / Scribble** — composition reference from input image
- **Tile** — upscale-time detail enhancement

ComfyUI supports these natively via `ControlNetLoader`, `ControlNetApplyAdvanced`, and various preprocessor nodes (`OpenposePreprocessor`, `CannyEdgePreprocessor`, etc.). Implementation:
1. Add `buildTextToImageWithControlNetWorkflow` (or extend existing) in `buildWorkflow.js` to insert ControlNet nodes between CLIP encode and KSampler
2. UI: file picker for ControlNet model, preprocessor selector, strength slider (0–1), start/end percent (0–1), input image picker
3. Multiple stacked ControlNets — chain `ControlNetApplyAdvanced` nodes
4. `historyParser.js` already walks the graph by `class_type` so parsing existing ControlNet workflows will Just Work

Slot ControlNet into the roadmap between Phase 4 (inpaint) and Phase 5 (upscale). Or even earlier — for stylized-model work it's more valuable than upscale.

**Textual inversion / embeddings (MEDIUM).** Often used as negative-prompt embeddings (`EasyNegative`, `BadDream`, `verybadimagenegative_v1.3`). Significantly improves output quality on stylized models. ComfyUI handles them via `embedding:` references inside `CLIPTextEncode` text — no graph changes needed. Just expose UI for managing a list of embeddings to inject into the negative prompt.

**Mid-generation cancel (LOW-MEDIUM, in READINESS as 🔴 "Failed generation invisible").** ComfyUI exposes `POST /interrupt` to abort the running prompt and `DELETE /queue` with a prompt_id to drop a queued job. Useful for obviously-bad generations. Add to `comfyClient`; wire to a cancel button on the Queue screen running-card.

**Prompt wildcards (LOW for sophisticated users, HIGH for prompt exploration).** Two flavors:
- Inline: `{red|blue|green}` → random pick among the three
- File-based: `__hair_colors__` → look up in a wildcard file
Both are pure client-side string expansion before workflow build. Cheap to implement and high-value for prompt iteration.

**Batch with seed variation (LOW).** Sequential seeds, single workflow submission. The KSampler node already supports `seed` and the EmptyLatentImage supports `batch_size`; the right pattern is multiple sequential prompts with seed+1 each, not a single batched workflow (because each output goes to its own /history entry, which `historyParser.js` is set up for).

### Stylized-model quality-of-life additions
- **Negative-embedding presets.** Quick-add buttons for the common negative embeddings.
- **Tag autocomplete (Danbooru-style).** Booru-trained models respond to comma-separated booru tags. There are public tag lists (a1111-sd-webui-tagcomplete format). Modest implementation cost.
- **Bookmarkable prompt+seed combinations.** Existing `usePersisted` pattern extends naturally to a `bookmarks` array. The bookmark icon in the Generate screen (currently dead, READINESS notes this) is the right home.

## A.10 Recommended work order

Sequencing matters here — do the structural cleanup before adding features.

### Sprint 1 — hygiene (ship today, low risk)
1. Move 12 loose root JSX files to `_archive/mockups/` (Issue 3)
2. Scrub personal data from `DEFAULT_SETTINGS` (Issue 2)
3. Move `displaySampler` special case into `samplerMap.js` (Issue 4)
4. Add Vitest + tests for `historyParser.js` against fixture data (Issue 7)
5. Add a top-level error boundary (READINESS 🟡 "No real error boundary")

### Sprint 2 — state architecture (before adding more features)
1. Introduce Zustand with `persist` middleware
2. Migrate one slice at a time: settings → prompt/negPrompt → loras → model → remix
3. Reduce `main.jsx` to routing + screen mount + onboarding modal
4. Add JSDoc types for the store (or convert store to TS as on-ramp to Issue 6)

### Sprint 3 — service-layer typing (optional but recommended)
1. Add `tsconfig.json` with `allowJs`
2. Convert `src/services/*.js` to TS (Issue 6)
3. Type `ParsedRun` and the ComfyUI history/queue response shapes

### Sprint 4 — mobile UX (READINESS items)
1. Soft-keyboard handling on prompt textarea (🟡)
2. Tap-target audit for icons (🟡)
3. Landscape orientation (🟡)
4. Splash screen (🟡)
5. iOS PNG icons — only if iOS becomes a target (🟢, deprioritized)

### Sprint 5 — error/loading UX (READINESS items)
1. ComfyUI-unreachable error state (🔴)
2. Loading spinner on Generate (🔴)
3. Failed generation visible (🔴)
4. Retry logic for transient network failures (🟡 — Issue 8)
5. Offline detection (🟡)

### Sprint 6 — feature parity (roadmap order, with ControlNet inserted)
1. Image metadata viewer (Phase 1)
2. Image-to-image (Phase 3)
3. Inpaint mask painting (Phase 4)
4. **ControlNet (new — insert here)**
5. Upscale (Phase 5)
6. Civitai catalog (Phase 6)

### Sprint 7 — power-user
1. Textual inversion / embeddings
2. Mid-generation cancel
3. Prompt wildcards
4. Booru tag autocomplete
5. Bookmarkable prompt+seed

## A.11 Pitfalls / things not to do

- **Do not edit `_archive/legacy-nonpersonal/`.** Reference only.
- **Do not edit the loose root JSX files** (`bottom-sheet.jsx` etc.) thinking they're active. The active source is under `src/`. Confirm via import graph from `src/main.jsx`.
- **Do not break the mobile CSS cascade.** READINESS notes the responsive `@media` block must come AFTER base rules. Append new styles; don't insert in the middle of `src/styles.css`.
- **Do not test the live integration without `--enable-cors-header`.** ComfyUI must be launched with this flag; otherwise every fetch fails with a CORS error and looks like a code bug.
- **Do not waste effort on iOS-only polish.** Per READINESS, the user is on Android. iOS support is deprioritized.
- **Do not delete `src/shared/mockImages.jsx` without grepping.** It's still used as fallback in some places.
- **Do not assume `main` is the only branch.** Check before pushing.
- **Do not commit without reading CLAUDE.md.** The user's AI-agent rules live there; they may forbid things I haven't anticipated.
- **Do not change the workflow node numbering scheme** in `buildWorkflow.js`. Existing parser logic depends on `class_type` not node IDs, but other tooling (the user's own ComfyUI clients, anyone importing the workflows) may rely on the current node layout (3=ckpt, 100+=lora chain, 4=latent, 5/6=clip, 7=ksampler, 8=vae, 9=save).
- **Do not introduce dependencies casually.** Current dependency list is `react` + `react-dom` and that's it. The user has been disciplined about this; respect it.

## A.12 Quick reference — load-bearing files

If you only have time to read 5 files before changing code:
1. `CLAUDE.md` — rules
2. `READINESS.md` — known gaps
3. `src/main.jsx` — state shape and routing
4. `src/services/historyParser.js` — best-written file, sets the bar
5. `src/services/buildWorkflow.js` — what gets sent to ComfyUI

