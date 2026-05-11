# Next steps

This is the practical implementation order after the Civitai reference audit and mockup intent map. The goal is not to copy Civitai feature-for-feature; it is to make the current CivitFree UI honest, useful, and backed by real local ComfyUI workflows.

## Recently completed

These items are no longer part of the active next-PR plan:

- Custom seed validation and submission.
- Sampler picker behavior.
- Unsupported Generate controls are disabled, hidden, or marked coming soon.
- Queue/Feed local favorites.
- Queue/Feed selection and batch actions.
- Queue/Feed sort/filter state.
- Image download behavior.

## Next active milestone

Do these in order before expanding into additional workflow types:

1. Verify Queue/Feed download behavior against real ComfyUI `/view` output.
2. Improve remix metadata transfer beyond prompt/seed.
3. Disable or clearly future-label settings fields that do not affect generation.
4. Then choose Image→Image as the first source-image workflow.

## Remix metadata transfer targets

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

## First source-image workflow

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
- Do not copy Civitai CFG/steps/sampler/scheduler defaults just because they exist upstream.
- Do not implement Delete before Download and storage ownership are clear.

## Definition of done for the next useful milestone

The next milestone is complete when:

- Queue/Feed downloads have been verified against real ComfyUI `/view` image responses.
- Remix carries generation metadata beyond prompt and seed where available.
- Settings fields that do not affect generation are disabled or clearly marked as future/label-only.
- The first Image→Image workflow path is chosen and ready for implementation.
