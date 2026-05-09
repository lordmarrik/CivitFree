# Next steps

This is the practical implementation order after the Civitai reference audit and mockup intent map. The goal is not to copy Civitai feature-for-feature; it is to make the current CivitFree UI honest, useful, and backed by real local ComfyUI workflows.

## Immediate next PR: make text-to-image controls honest

Do this before adding any new workflow type.

### 1. Wire Custom Seed

**Why:** Seed is a core reproducibility control, and the UI already exposes Random/Custom.

**Current issue:** Random/Custom changes visual state, but the typed custom value is not submitted to ComfyUI.

**Expected result:**

- Random mode submits a generated seed.
- Custom mode validates and submits the typed seed.
- Queue/Feed display the submitted seed.
- Remix with seed reliably reuses that seed.

### 2. Replace the fake sampler dropdown with a real picker

**Why:** The current sampler row should be the only sampler selection affordance now that the Civitai-style shortcut chips are removed.

**Expected result:**

- Tapping the sampler row opens a real sheet/list.
- Selecting a sampler updates shared settings.
- The submitted workflow uses the selected sampler/scheduler mapping.
- CivitFree remains free to use local ComfyUI-oriented sampler labels/defaults rather than Civitai defaults.

### 3. Mark unsupported controls as visible coming-soon roadmap items

**Why:** The mockup is also a roadmap, so future controls should stay visible but must not look operational or submit the wrong workflow.

Badge these as coming soon until wired:

- Video / Music modality tabs
- Image→Image / Inpaint / Upscale tabs on Generate
- Output Settings: PNG, if alternate format selection is planned
- CLIP Skip, unless the workflow builder supports it
- Select VAE
- Inpaint / Outpaint / Variations dock submit buttons
- Sort / Filter options that do not affect Queue/Feed
- Cloud GPU backend selection

### 4. Fix backend/status copy

**Why:** CivitFree is currently local-first, but several surfaces still imply cloud execution.

**Expected result:**

- Dock backend row reflects the configured local ComfyUI endpoint/profile.
- Any cloud GPU labels are marked coming soon unless real remote execution exists.
- Settings backend profile actually changes backend values or is marked as a label-only future feature.

## Current Queue/Feed action status

Download, local favorites, Newest/Oldest sort, Favorited only, and Hide failed are now wired. Remaining Queue/Feed work should stay focused and avoid destructive actions until storage semantics are clear.

### 1. Improve remix metadata transfer

Remix should carry enough metadata for a coherent rerun:

- prompt
- negative prompt, when available
- seed, only for Remix with seed
- checkpoint/model
- LoRAs and strengths
- size/aspect ratio
- sampler
- scheduler
- CFG
- steps

### 2. Finish Queue/Feed metadata actions

Already wired:

- Download saves the selected ComfyUI `/view` image.
- Heart toggles local persisted favorite metadata.
- Newest/Oldest sort reorders Queue and Feed.
- Favorited only and Hide failed filters affect displayed data.

Still remaining:

- model/checkpoint filter, if parsed from workflow metadata
- date range, if timestamps are available
- richer Info sheet
- richer Remix payload

## Third PR: choose the first source-image workflow

Implement only one source-image workflow at a time. Recommended order:

1. **Image→Image** — simplest source-image workflow: source image + prompt + denoise.
2. **Inpaint** — requires real mask drawing, mask export, source image routing, and an inpaint workflow builder.
3. **Upscale** — requires choosing a concrete upscale workflow/model strategy.
4. **Variations / Outpaint** — useful, but should come after img2img/inpaint foundations.

## What not to do next

Avoid these until the core local flow is stable:

- Do not build remote Civitai browsing first.
- Do not add Video/Music workflows first.
- Do not build cloud GPU support before local backend/profile behavior is clear.
- Do not copy Civitai CFG/steps/sampler/scheduler defaults or preset chips just because they exist upstream.
- Do not implement Delete before Download and storage ownership are clear.

## Definition of done for the next useful milestone

The next milestone is complete when:

- Generate text-to-image has no fake enabled controls; future controls remain visible with soon badges.
- Custom seed works.
- Sampler selection is real.
- Backend labels accurately describe local ComfyUI execution.
- Queue/Feed show generated outputs and enough metadata to remix reproducibly.
- Download works for generated images.
