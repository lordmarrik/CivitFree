# CivitFree Personal — handoff

Plain-English snapshot for the next session (a new chat, a new agent,
or future you). Goal: replace the need to re-derive context from a
long working session.

## What this is

CivitFree Personal is a local-first, single-user, mobile-first React
app for generating images with **ComfyUI** running on the user's own
GPU. The locked design spec lives at
`Uploads/civitfree-claude-design-instructions-3.md`. The HTML mockup
at `CivitFree Personal.html` is the canonical visual reference.

The runnable code lives in `src/`. The user runs it on Windows
against ComfyUI Portable (v0.18.2 frontend v1.41.21) on an RTX 3080.

## What works (verified end-to-end on 2026-05-07)

The user successfully generated 2 images today via this flow.

- `start.bat` (Windows) / `start.sh` (Mac/Linux) launches the dev
  server. Browser opens to `http://localhost:5173`.
- **Onboarding** lists the user's real checkpoint filenames from
  `models/checkpoints/` (via `/object_info/CheckpointLoaderSimple`).
- **Settings drawer** is fully editable; values persist across reloads
  via `localStorage`.
- **Generate** on Screen A actually generates: builds Text→Image
  workflow JSON, submits to `/prompt`, polls `/history`, displays the
  result. CORS works once ComfyUI is started with
  `--enable-cors-header '*'`.
- **LoRA picker** lists real LoRA filenames from
  `/object_info/LoraLoader`; loaded LoRAs persist with strength
  sliders.
- The mobile-responsive frame works on phones (full-bleed,
  iOS-notch / dynamic-island safe areas honored).

## What's built but NOT yet verified end-to-end

Built today *after* the only successful smoke test. Likely working,
but the user hasn't re-tested:

- **Queue (Screen B) + Feed (Screen C)** wired to `/history` and
  `/queue`. Should show real generations newest-first; running and
  queued jobs should appear while in flight.
- **Settings checkpoint override precedence** fix — manual filename
  in Settings should now win over the model-picker selection.
- **Start script partial-install detection** — `start.bat`/`start.sh`
  should now re-run `npm install` if a previous install was
  interrupted (detected via missing `node_modules/.package-lock.json`).

If any of these break, suspects in order:
1. ComfyUI version differences (we target v0.18.x).
2. CORS preflight quirks (Firefox specifically; if /history works but
   /queue doesn't, this is the most likely cause).
3. History/queue parser edge cases — it walks the workflow graph;
   workflows submitted from ComfyUI's own web UI may use unfamiliar
   nodes and yield empty fields.

## Design ambiguities — things in the UI with no defined purpose

These are present in the React app but **not specified in the locked
spec**. The current human decision is: keep roadmap controls visible as
`soon`, but remove Civitai queue-priority/preset shortcuts that do not
fit local ComfyUI.

1. **Modality bar at top of Screen A — Image / Video / Music tabs.**
   Image works; Video and Music stay visible with `soon` badges and do
   not become active modes.
2. **Output Settings: `PNG` chip.** `High` was removed because it was
   Civitai shared-queue priority. `PNG` remains as a coming-soon/fixed-
   format reminder until alternate output formats are real.
3. **CLIP Skip display** in Advanced. Standard SD parameter, now marked
   coming soon because the workflow does not wire it yet.
4. **"Select VAE" button** at the bottom of Advanced. Visible as coming
   soon until a VAE loader workflow exists.
5. **Seed Random/Custom toggle.** Random submits a generated seed;
   Custom validates and submits the typed seed.
6. **Pipeline bar text** ("Local pipeline · ComfyUI · local"). Spec
   says it's a static status indicator; the actual text content is
   undefined.

These were not in `READINESS.md` or `ANALYSIS.md` until this handoff
because the assistant was treating "unwired button" the same as
"button without specified purpose" — which the user pushed back on at
the end of the session, rightly.

## Features in the spec but missing from the app

Tracked in `READINESS.md` per-screen audit. Highlights:

- Cross-page selection counter ("N selected")
- Batch download as zip
- Batch favorite
- 256-per-page virtual scrolling pagination
- LoRA compatibility warning on base-model mismatch
- Backend profile **list** in Settings (one toggle exists; full
  multi-profile manager doesn't)
- Filters on Model Library / LoRA Manager are visual only
- Per-image Download button has no handler
- Run card Info / Trash buttons still inert
- Inpaint editor's tools (brush/eraser/lasso/wand) don't actually
  paint anything; the canvas mask is decorative

## Document map

- `CLAUDE.md` — project instructions for AI agents. Locked product
  decisions.
- `Uploads/civitfree-claude-design-instructions-3.md` — authoritative
  design spec.
- `README.md` — how to run the app, CORS setup for ComfyUI,
  troubleshooting table.
- `ANALYSIS.md` — repo audit; backlog of features.
- `READINESS.md` — gaps + per-screen interaction audit, with
  checkboxes ticked as items close.
- **This file** — quick-scan handoff.

## How today's working pattern unfolded

For continuity:

1. AI proposes a small focused change in chat.
2. AI commits to a branch and opens a PR via the GitHub MCP.
3. Codex auto-reviews and flags P1/P2 issues as PR review comments.
4. User merges via the GitHub web UI.
5. AI fixes Codex flags in follow-up PRs.

This worked but **several patterns failed**:

- AI added UI in the wrong place once (a "Latest result" panel on
  Screen A when it should have been on Queue/Feed). User caught this
  and rightly insisted on a separate PR for the cleanup.
- AI did not proactively flag design ambiguities. They only surfaced
  when the user asked at the end of the session. Future sessions
  should list these *as they're found*, not on demand.
- The only real end-to-end test was performed by the user. Bugs that
  need a real ComfyUI to surface may still be lurking, especially in
  the queue/feed code shipped post-test.
- The session was long. The user repeatedly stated they were tired
  and that the back-and-forth felt like an ordeal. Future sessions
  should aim for fewer, larger increments and earlier honest
  flagging of "this is going to be a slog because…".

## Open questions for the user

In rough priority:

1. **Decide the six design ambiguities above.** Each one is a quick
   yes/no/scope.
2. Should the missing-from-spec features (batch download, pagination,
   per-image download) be built next, deferred, or dropped?
3. Image storage strategy: keep using ComfyUI's `/view` URLs (live,
   server-dependent), or download to IndexedDB / phone gallery
   (durable, more work)?
4. Should there be a CI check (GitHub Actions running `npm run build`
   on every PR)? Currently no automated checks.

## Suggested next concrete step for whoever picks this up

If working with the user (non-programmer):

1. Start by reading **this file** + `READINESS.md` Section 8.
2. Confirm the post-smoke-test code (queue/feed + the three Codex
   fixes) actually works on the user's machine. Easiest: run the
   app, switch to Screen B, generate something on Screen A, watch it
   appear in queue. If anything fails, ask for the red error banner
   text.
3. Then decide whether to tackle the design ambiguities (needs user
   input) or the missing-from-spec features (doesn't).

Avoid: shipping more code without ever testing against the user's
real server. Avoid: dumping long lists of "things wrong" without
prioritization.

— end —
