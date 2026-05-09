# Mockup intent map

This document translates the current CivitFree mockup into a practical product map: what each visible control is supposed to represent, what Civitai upstream helps clarify, and what CivitFree should do differently because it is a local-first ComfyUI app.

Use this with `docs/CIVITAI_GITHUB_REFERENCE.md`. Civitai is a semantics reference, not a binding UX/spec source. Controls such as CFG, steps, samplers, schedulers, quality presets, and defaults can intentionally diverge later.

## Core product model

CivitFree is supposed to be a mobile-first local ComfyUI control surface with three primary flows:

1. **Generate** — configure and submit a real local ComfyUI workflow.
2. **Queue** — watch submitted/running/completed ComfyUI jobs with generation metadata.
3. **Feed** — browse generated outputs and branch from an image into remix, img2img, inpaint, upscale, download, or delete flows.

Everything else should be understood as either:

- a **real control** that must affect the ComfyUI workflow/history state,
- a **navigation affordance** into one of those flows,
- a **metadata filter/view control** over local history,
- or a **future workflow** that should stay visible as a coming-soon roadmap item until implemented.

## Global shell

| Mockup element | Supposed to be | Current implementation implication |
| --- | --- | --- |
| Menu / CF logo | Opens the app drawer for settings, libraries, and about. | Real navigation affordance. |
| Bookmark icon | Presets/favorite generation settings entry point. | Future: saved prompt/workflow presets, not Civitai account bookmarks unless API integration is added. |
| Brush icon | Generate screen. | Real top-level route. |
| Clock icon | Queue/history screen. | Real top-level route backed by ComfyUI queue/history. |
| Grid icon | Feed/gallery screen. | Real top-level route backed by ComfyUI history images. |
| Dock GPU row | Backend/profile/status selector plus ETA/status summary. | For local CivitFree this should show selected ComfyUI endpoint/profile and actual availability if known; avoid fake cloud priority semantics. |
| Dock quantity | Batch size/count for the next submission. | For txt2img this maps to ComfyUI batch size. For variations it maps to number of variations. |
| Dock primary button | Submit the current workflow. | Must be blocked from submitting and marked coming soon when the active workflow has no real builder. |

## Generate screen

### Modality and workflow tabs

| Mockup element | Supposed to be | CivitFree behavior |
| --- | --- | --- |
| Image / Video / Music modality tabs | Select the media generation family. Civitai supports multiple workflow families; CivitFree currently only has image workflows. | Image should be enabled. Video/Music should stay visible with soon badges until real ComfyUI video/audio workflows exist. |
| Local pipeline pill | Indicates which backend/runtime will execute the workflow. | Should reflect the selected local ComfyUI backend/profile, not hardcoded CUDA/cloud language unless detected/configured. |
| Text → Image tab | Pure txt2img workflow: prompt + model/resources + sampler params produce new images. | This is the current supported happy path. |
| Image → Image tab | Source image + prompt + denoise controls reinterpret the input image. | Future ComfyUI img2img workflow requiring image upload/reference and denoise wiring. |
| Inpaint tab | Source image + mask editor + replacement prompt regenerate masked regions. | Future workflow; should route to/edit Screen D once real mask capture exists. |
| Upscale tab | Source image + scale/upscaler controls produce a larger image. | Future workflow requiring an upscale model/workflow and source image. |

### Model and resources

| Mockup element | Supposed to be | CivitFree behavior |
| --- | --- | --- |
| Model card | The base checkpoint/model used by the workflow. | Real: selected local checkpoint should feed `CheckpointLoaderSimple`. Later: add base-model/family metadata and compatibility warnings. |
| Change model | Opens a model picker. | Real for local ComfyUI checkpoints; Civitai browsing is later. |
| Additional Resources | Extra generation resources, primarily LoRAs at current scope. | Real for local LoRAs; should track filename, display name, strength, and compatibility metadata. |
| LoRA strength slider | Per-LoRA influence on model and CLIP. | Real: maps to ComfyUI `LoraLoader` strength values. Later: allow separate model/clip strengths only if needed. |
| LoRA filename field | Exact ComfyUI filename for workflow submission. | Should eventually be hidden behind reliable picker metadata, but remains useful for debugging. |

### Prompt and basic output

| Mockup element | Supposed to be | CivitFree behavior |
| --- | --- | --- |
| Prompt | Positive prompt text sent into the workflow. | Real required field. |
| Negative Prompt | Negative conditioning for SD-style workflows. | Real for SD/SDXL-style workflows; mark or adjust later for model families where negative prompt is not applicable. |
| Aspect Ratio | User-friendly size preset. | Real: maps to width/height. Later: make options model-family-aware. |
| PNG chip | Output format control. | Visible coming-soon/fixed-format reminder unless SaveImage/output format becomes configurable. |
| High chip | Removed. | This was Civitai shared-queue priority semantics and should not exist in the local-first UI. |

### Advanced generation controls

| Mockup element | Supposed to be | CivitFree behavior |
| --- | --- | --- |
| CFG Scale | Conditioning strength / prompt adherence control. | Real KSampler input. Defaults/ranges/preset names may diverge from Civitai later. |
| Sampler shortcut chips | Removed. | Fast/Popular Civitai-style shortcuts are intentionally removed; use one deliberate sampler picker. |
| Sampler dropdown | Full sampler picker. | Real picker sourced from supported ComfyUI sampler mappings/options. |
| Steps | Number of denoising steps. | Real KSampler input. Civitai-style preset chips are removed; ranges/defaults can diverge by model family/hardware. |
| Seed Random/Custom | Reproducibility control. Random generates a new seed; Custom submits the typed seed. | Must be wired so custom seed changes the workflow, and submitted seed is visible in Queue/Feed. |
| CLIP Skip | SD-family CLIP layer skip. | Future/conditional. It should only appear if the workflow builder actually inserts the required ComfyUI node(s). |
| VAE selector | Optional VAE override resource. | Future/conditional. It should only appear if the workflow can load and route a selected VAE. |

## Queue screen

| Mockup element | Supposed to be | CivitFree behavior |
| --- | --- | --- |
| Sort row | Order queue/history by newest/oldest or other metadata. | Should sort the local `runs` array. If not wired, mark as future. |
| Filters | Filter by favorites, failure state, generation type, model, and date. | Should filter parsed ComfyUI history/queue metadata. Some filters require stored favorites or richer metadata. |
| Run card status | Shows pending/running/completed/failed job state. | Real via ComfyUI queue/history parser; should expose failures when parser can detect them. |
| Run card metadata | Shows model, LoRAs/resources, sampler, seed, size, time, and count. | Should remain metadata-rich for remix/reproducibility. |
| Run image strip | Shows output thumbnails for a run. | Real via ComfyUI `/view` URLs. Later: decide local caching/download strategy. |
| Run remix action | Starts a new Generate flow from run metadata. | Should copy prompt, resources, size, sampler, CFG, steps, and optionally seed. |
| Per-image action | Opens image action sheet. | Real branch point into remix/inpaint/etc. |

## Feed screen

| Mockup element | Supposed to be | CivitFree behavior |
| --- | --- | --- |
| Two-column image grid | Gallery of individual generated images, newest first. | Real: flatten ComfyUI history images into image tiles. |
| Check marker | Multi-select state for batch actions. | Future until selection/batch actions exist. |
| Heart | Favorite/save image locally. | Real local persisted favorite metadata; no Civitai account sync. |
| Wand | Opens image action sheet / transform actions. | Real branch point. |
| Download icon | Saves image to device/PC. | Real direct `/view` download; does not imply durable local cache. |

## Image action sheet

| Mockup action | Supposed to be | CivitFree behavior |
| --- | --- | --- |
| Remix | Open Generate with source prompt/settings but a fresh/random seed. | Should copy enough metadata to make a coherent new run. |
| Remix with seed | Open Generate with source prompt/settings and same seed. | Core reproducibility action. |
| Image Variations | Generate sibling images from selected image using img2img/variation workflow. | Future; route to variations screen only once workflow exists. |
| Image to Image | Use selected image as source for img2img. | Future workflow. |
| Inpaint | Open inpaint editor with selected image as source. | Navigation exists conceptually; generation requires real source image/mask workflow. |
| Face Fix | Specialized inpaint/ADetailer-like repair workflow. | Future and optional. |
| Upscale | Run selected image through upscale workflow. | Future. |
| Remove Background | Segmentation/background-removal workflow. | Future and likely a separate ComfyUI graph. |
| Image to Video | Video workflow seeded from the image. | Future. |
| Download | Save selected output. | Real direct `/view` download from the selected image. |
| Delete | Delete local record/cache or ComfyUI output if supported and confirmed. | Future; requires clear data ownership semantics. |

## Inpaint / Outpaint / Variations editor

| Mockup element | Supposed to be | CivitFree behavior |
| --- | --- | --- |
| Inpaint tab | Masked-image editing workflow. | Requires real source image, drawable mask canvas, prompt, denoise, and inpaint workflow builder. |
| Paint canvas | Shows source image and mask overlay. | Current static overlay should become pointer/touch mask data. |
| Brush / eraser / lasso / wand | Mask editing tools. | Brush/eraser are core; lasso/wand can be future but should not pretend to work. |
| Undo / redo | Mask edit history. | Future tied to mask strokes/actions. |
| Maximize | Fullscreen editor view. | Future convenience. |
| Brush size | Active brush radius for drawing/erasing mask. | Real once drawing exists. |
| Denoise | How strongly the masked/source area is regenerated. | Real in inpaint/img2img workflow. |
| Replace with | Inpaint prompt override for masked area. | Should be controlled state and sent to workflow. |
| Match source | Preserve source style/lighting. | Future preset that should map to concrete prompt/denoise/control settings, not magic. |
| Soft edges | Mask blur/feather control. | Future if mask processing supports blur/feather. |
| Outpaint tab | Expand canvas in chosen directions. | Requires padding/canvas expansion workflow. |
| Extend by | Pixel amount added to selected edges. | Real outpaint parameter once workflow exists. |
| Direction chips/arrows | Select which edges to expand. | Real outpaint parameter once workflow exists. |
| Fill with | Outpaint prompt for new canvas area. | Should be controlled state and sent to workflow. |
| Variations tab | Generate multiple variations from a source image. | Requires img2img/variation workflow. |
| Variation quantity | Number of variation outputs. | Real batch/count for variations workflow. |
| Prompt override | Optional prompt replacing or augmenting original prompt. | Should be sent to variations workflow if provided. |
| Editor dock button | Submit Inpaint/Outpaint/Variations workflow. | Must be blocked from submitting and badged until each workflow is real. |

## Drawer and settings

| Mockup element | Supposed to be | CivitFree behavior |
| --- | --- | --- |
| Settings | Local app/runtime configuration. | Real source of backend URL, checkpoint filename, sampler/scheduler, steps, CFG, and size. |
| Backend Profile | Named machine/profile shortcut. | Should select actual backend URL/profile values; currently just a label if not wired. |
| ComfyUI Backend URL | HTTP endpoint for local ComfyUI. | Real required setting. |
| Default Model display | Friendly model display preference. | Should not override real checkpoint filename unless explicitly selected. |
| Checkpoint filename | Exact checkpoint used to generate. | Real fallback/override for workflow submission. |
| Sampler/Scheduler settings | Defaults for generation. | Real if workflow builder maps names correctly. Future UX can diverge from Civitai. |
| Steps/CFG/Size settings | Defaults shared with Generate. | Real; should stay synchronized with Generate controls. |
| Cloud GPU credentials | Future remote backend support. | Do not imply current cloud generation unless implemented. |
| CivitAI API key | Future Civitai browsing/download/gated resource support. | Useful later; not required for local generation. |
| PC image save path | Future output sync/storage destination. | Requires download/cache strategy. |
| Model Library | Browse/select/manage checkpoints. | Local ComfyUI listing is real in picker; drawer library browsing remains future unless wired. |
| LoRA Manager | Browse/select/manage LoRAs. | Local ComfyUI listing is real in picker; drawer manager browsing remains future unless wired. |
| About | App version/backend info. | Real informational surface. |

## Model and LoRA pickers

| Mockup element | Supposed to be | CivitFree behavior |
| --- | --- | --- |
| On your ComfyUI tab | Lists local checkpoints/LoRAs from ComfyUI object info. | Real. This is the default local-first path. |
| Browse CivitAI tab | Search remote Civitai models/resources. | Future. Requires API key for gated/personalized features and download/install workflow. |
| Search | Filters current source list. | Real for local list; future for remote API. |
| ALL/FEATURED/RECENT/LIKED/MINE | Remote browse categories. | Future Civitai API categories; keep visibly marked as coming soon unless remote browsing is active. |
| Relevance sort / filters / gear | Remote browse sorting/filtering/settings. | Future. Local mode could instead sort by filename/date/family if metadata exists. |
| Picker cards | Resource previews/metadata cards. | Local cards are filename-derived placeholders now; later should include real metadata/previews where available. |

## Sort/filter/backend sheets

| Mockup element | Supposed to be | CivitFree behavior |
| --- | --- | --- |
| Sort newest/oldest | Changes Queue/Feed ordering. | Real Queue/Feed ordering by parsed run timestamps. |
| Favorited only | Shows locally favorited images/runs. | Real local persisted favorite filter. |
| Hide failed | Removes failed jobs from Queue/Feed. | Requires reliable failure status parsing. |
| Generation type | Filters txt2img/img2img/inpaint/upscale outputs. | Requires generation type metadata on run records. |
| Model filter | Filters by checkpoint/model. | Possible from parsed workflow metadata. |
| Date range | Filters by completion/submission time. | Possible from parsed history timestamps where available. |
| Backend switcher | Chooses local/remote execution backend. | For now should be local profile selection. Cloud should stay future unless real remote execution exists. |

## Implementation priority implied by the mockup

1. **Make current txt2img controls honest and complete:** custom seed, real sampler picker, scheduler visibility/choice, accurate backend label, removed Civitai priority/preset chips, and visible coming-soon badges.
2. **Make Queue/Feed actions meaningful:** richer remix metadata transfer, image download, favorites, sorting, and filtering.
3. **Implement source-image workflows in order:** img2img first, then inpaint with real mask drawing, then upscale, then variations/outpaint.
4. **Add resource metadata:** model family/base compatibility, LoRA compatibility warnings, local previews where available.
5. **Only then add remote Civitai browsing/downloading:** it is useful, but not required for the local-first core.
