# CivitFree Personal roadmap

This is the single master roadmap for CivitFree Personal. It consolidates the
product intent, current next steps, readiness checklist, Civitai reference notes,
and mockup intent into one step-by-step plan.

## Product target

CivitFree Personal should feel like the selected parts of Civitai's generator
experience, keep the custom CivitFree mobile-first interface, run generation
locally through the user's own ComfyUI server, and use Civitai only as a
model/resource catalog and download source.

The implementation rule is simple: visible enabled controls must be honest. A
control should either affect local generation, affect local app state, or be
clearly hidden, disabled, or marked as future work.

## Current state snapshot

Already built or recently completed:

- Custom seed validation and submission.
- Real sampler picker behavior.
- Unsupported Generate controls disabled, hidden, or marked coming soon.
- Local ComfyUI transport for Text → Image generation.
- Local checkpoint and LoRA listing from ComfyUI.
- Queue/Feed polling from ComfyUI queue/history.
- Queue/Feed local favorites, selection, batch actions, sort/filter state, and
  image download behavior.
- Remix metadata plumbing for available Text → Image run metadata.
- Product intent and Civitai parity boundaries documented.
- Basic lint/build tooling.

Do not treat the root `NEXT_STEPS.md` as the active roadmap. It is the old
scaffold plan. This file and `docs/NEXT_STEPS.md` are the current planning
sources.

## Phase 0 — Stabilize the current Text → Image loop

Goal: make the existing local Text → Image MVP boringly reliable before adding
new workflow types.

### 0.1 Manual smoke test against real ComfyUI

Use a real local ComfyUI instance and verify:

1. Start ComfyUI with CORS enabled.
2. Start CivitFree.
3. Complete onboarding / backend setup.
4. Confirm checkpoint listing works.
5. Confirm LoRA listing works.
6. Generate one image with random seed.
7. Generate one image with custom seed.
8. Confirm Queue shows running/queued/completed state.
9. Confirm Feed shows completed output.
10. Confirm image URLs load from ComfyUI `/view`.
11. Confirm one-image download works.
12. Confirm batch download works.
13. Confirm favorite/unfavorite works.
14. Confirm select-all and clear selection work.
15. Confirm Remix uses a fresh seed.
16. Confirm Remix with seed preserves the original seed.
17. Confirm editing the seed after remixing wins over the remix seed.
18. Confirm blank custom seed is rejected and does not become seed `0`.

Done when failures from this pass are written down as bugs or fixed.

### 0.2 Fix bugs found during smoke testing

Only fix bugs that block the current Text → Image loop:

- backend unreachable states;
- missing checkpoint / LoRA errors;
- failed generation visibility;
- broken image URLs;
- broken downloads;
- wrong remix metadata;
- seed/sampler/scheduler mismatches;
- obvious mobile layout blockers.

Do not start Image→Image, Inpaint, Civitai browsing, or cloud features in this
phase.

### 0.3 Make remaining settings honest

Audit settings/drawer/generate controls and classify each one:

- real local ComfyUI input;
- real local app state;
- label/status only;
- future feature;
- remove/hide for now.

Done when no enabled setting looks like it affects generation unless it actually
does.

## Phase 1 — Image cards, metadata, and gallery confidence

Goal: make generated outputs understandable and manageable.

### 1.1 Fullscreen image viewer

Add a focused image detail view for Queue/Feed images:

- full-size image preview;
- prompt and negative prompt;
- seed;
- checkpoint/model;
- LoRAs and strengths when available;
- size;
- sampler;
- scheduler;
- CFG;
- steps;
- status and timestamp;
- actions: Remix, Remix with seed, Download, Favorite.

Done when tapping an image opens useful run metadata without needing the action
sheet first.

### 1.2 Metadata reliability pass

Verify the app preserves and displays the metadata needed for reproducible runs:

- prompt;
- negative prompt;
- seed;
- checkpoint;
- LoRAs and strengths;
- size;
- sampler;
- scheduler;
- CFG;
- steps.

Done when generated images, action sheets, remix, and the future image viewer all
use the same metadata shape.

### 1.3 Local image ownership decision

Decide how CivitFree should treat generated files:

- continue relying on ComfyUI `/view` only;
- browser download only;
- IndexedDB/local browser cache;
- File System Access API where available;
- future local helper service;
- future ComfyUI extension/custom node.

Done when the app has a written storage/download decision and Delete can be
planned safely.

## Phase 2 — Mobile daily-driver polish

Goal: make the current app comfortable enough to use regularly on a phone.

### 2.1 Keyboard and layout audit

Fix or document:

- soft keyboard covering prompt/generate controls;
- landscape orientation behavior;
- safe-area handling on real devices;
- tap target size for icon buttons;
- scroll bounce / pull-to-refresh conflicts.

### 2.2 Error and loading states

Add clear UI for:

- backend offline;
- CORS blocked;
- model list loading;
- LoRA list loading;
- generation submission in progress;
- generation failed;
- queue/history polling failure;
- download failure;
- retry paths where appropriate.

### 2.3 Accessibility and PWA polish

Work through the important readiness gaps:

- image alt/labels;
- keyboard navigation;
- reduced motion;
- color contrast;
- text scaling;
- iOS icon/splash polish if iOS becomes important;
- optional service worker only if offline shell behavior becomes valuable.

## Phase 3 — First source-image workflow: Image → Image

Goal: add one source-image workflow without exploding scope.

Image→Image comes before Inpaint because it needs fewer moving parts: source
image + prompt/settings + denoise.

### 3.1 Design the local ComfyUI workflow

Define and test the exact ComfyUI graph for Image→Image:

- source image input;
- checkpoint;
- optional LoRA chain;
- positive/negative prompts;
- VAE encode/decode path;
- KSampler with denoise;
- SaveImage.

### 3.2 Add source image selection

Support one source image path first:

- upload from device, or
- reuse an existing Queue/Feed image.

Do not implement every source path at once.

### 3.3 Add denoise control

Expose denoise only for workflows where it is real. Keep it hidden or disabled
for Text → Image.

### 3.4 Route results through existing Queue/Feed

Image→Image outputs should reuse the same image card, metadata, download,
favorite, selection, and remix infrastructure where possible.

## Phase 4 — Inpaint

Goal: implement real inpaint only after Image→Image works.

Required pieces:

1. Source image selection.
2. Real mask drawing UI.
3. Mask export in the format expected by the workflow.
4. Inpaint-specific ComfyUI workflow builder.
5. Denoise/settings behavior appropriate to inpaint.
6. Queue/Feed metadata showing source/mask workflow type.

Do not treat the current Inpaint screen as done until mask data reaches ComfyUI.

## Phase 5 — Upscale, variations, and outpaint

Goal: add secondary image workflows after source-image foundations exist.

Recommended order:

1. Upscale — choose a concrete upscaler/workflow strategy first.
2. Variations — likely reuse Image→Image foundations.
3. Outpaint — likely reuse inpaint/mask foundations but needs canvas expansion.

Each workflow should be one PR-sized slice, not a bundle.

## Phase 6 — Civitai browsing and downloads

Goal: use Civitai as catalog/download source without depending on Civitai for
generation.

Do this only after local generation, downloads, and storage expectations are
stable enough to know where files should go.

### 6.1 Catalog browser design

Plan Civitai browsing around:

- checkpoints;
- LoRAs;
- model versions;
- base model compatibility;
- file names and sizes;
- preview images;
- resource metadata;
- download URLs;
- local installed/not-installed state.

### 6.2 Download/install strategy

Choose one initial download strategy:

- browser download with manual move to ComfyUI model folder;
- File System Access API folder picker;
- local helper app/service;
- ComfyUI extension/custom node.

Do not pretend browser-only code can silently write into arbitrary ComfyUI model
folders.

### 6.3 Local/Civitai resource matching

Map Civitai resources to local files:

- checkpoint filename;
- LoRA filename;
- model version;
- hashes if available;
- base model family;
- compatibility warnings.

Done when the app can tell the user whether a Civitai resource appears to be
installed locally.

## Phase 7 — Tooling, tests, and release confidence

Goal: stop relying only on manual checking.

### 7.1 CI

Add a GitHub Actions workflow that runs:

- `npm ci`;
- `npm run lint`;
- `npm run build`.

### 7.2 Unit tests for pure logic

Add tests for:

- sampler/scheduler mapping;
- history parsing;
- workflow building;
- persisted state helpers where practical;
- download URL construction.

### 7.3 Browser smoke tests

Add a small Playwright smoke suite once the app structure is stable:

- app renders;
- navigation works;
- key sheets open/close;
- Generate form validation works without a live ComfyUI backend;
- Queue/Feed empty/error states render.

### 7.4 Release checklist

Before calling the app a daily-driver build:

- build passes;
- lint passes;
- manual Text→Image test passes against real ComfyUI;
- downloads verified on the user's target browser/device;
- no known enabled fake controls;
- roadmap/checklists updated.

## Explicit non-goals unless direction changes

Do not prioritize these unless the user explicitly changes the product direction:

- Civitai-hosted generation;
- credits/Buzz/pro priority semantics;
- cloud GPU execution;
- public community feed, voting, leaderboards, or moderation;
- Video/Music generation;
- account-gated local generation;
- wholesale Civitai UI/source copying;
- Delete before storage ownership is clear.

## How to use this roadmap

- Keep `INTENT.md` as the product boundary.
- Keep `docs/NEXT_STEPS.md` as the short current tactical plan.
- Keep `READINESS.md` as the bug/polish checklist.
- Use this file for the big phased order.
- When a phase item is completed, update this roadmap in the same PR or in a
  small follow-up docs PR.
