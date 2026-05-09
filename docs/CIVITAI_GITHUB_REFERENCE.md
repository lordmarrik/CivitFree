# Civitai GitHub reference audit

This repo's mockup should use Civitai as a behavioral reference, but we should treat the upstream project as a source of product semantics rather than copy UI/source verbatim. Civitai behavior is a reference point, not a binding product spec; CivitFree can intentionally diverge where local ComfyUI use, mobile ergonomics, or the user's preferred generation workflow calls for different behavior.

## Sources checked

- Upstream repository: <https://github.com/civitai/civitai>
- README / architecture: <https://github.com/civitai/civitai/blob/main/README.md>
- Current generation form: <https://github.com/civitai/civitai/blob/main/src/components/generation_v2/GenerationForm.tsx>
- Advanced generation controls inventory: <https://github.com/civitai/civitai/blob/main/docs/advanced-section-controllers.md>
- Generation constants and Comfy sampler mappings: <https://github.com/civitai/civitai/blob/main/src/shared/constants/generation.constants.ts>
- Image resource tracking docs: <https://github.com/civitai/civitai/blob/main/docs/features/image-resources.md>
- Public REST API wiki: <https://github.com/civitai/civitai/wiki/REST-API-Reference>
- Comfy resource nodes: <https://github.com/civitai/civitai_comfy_nodes>

## High-level takeaways

1. Civitai is a full Next.js + tRPC + Prisma + Postgres application with Mantine UI and Cloudflare storage. CivitFree should not attempt to mirror that architecture; its scope remains a local-first React + ComfyUI client.
2. Upstream local development explicitly lists orchestration/generation as a service that does not work locally without external input. That means the GitHub repo explains UI behavior and data shapes, but it is not a drop-in local ComfyUI backend.
3. Upstream generation is moving toward a graph/controller model. Controls render only when the active workflow/ecosystem exposes that graph node. For CivitFree, this translates to: show only controls we actually send to ComfyUI, or visibly disable/badge them. It does **not** mean CivitFree must copy upstream defaults, presets, ordering, or tuning choices.
4. Upstream tracks resources used by generated images. Queue/feed cards in CivitFree should keep showing checkpoint, LoRA, strength, seed, dimensions, sampler, and source prompt metadata rather than just image URLs.

## Control-by-control mapping for CivitFree

| CivitFree area | Upstream behavior reference | What it means here |
| --- | --- | --- |
| Image / Video / Music top tabs | Upstream generation graph supports image, video, and audio workflows with workflow-specific controllers. | Keep Image active. Hide or badge Video/Music until CivitFree has real ComfyUI workflows for those modes. |
| Text-to-image prompt | Prompt is a first-class graph controller; some ecosystems also expose prompt enhancement and trained words. | Current prompt field is valid. Prompt enhancement should be future work, not a fake button. |
| Negative prompt | Upstream notes this is SD-only. | Keep for SD checkpoint workflows; if Flux/other ecosystems are added, conditionally hide or disable it. |
| Model selector | Upstream treats checkpoint/model as the primary generation resource and changes compatible workflow/ecosystem behavior. | CivitFree's local checkpoint picker is conceptually correct. Next step is compatibility metadata, not a Civitai-style account model browser. |
| LoRA / resources | Upstream additional resources are separate generation resources and are tracked on images. | Current local LoRA list should continue to feed the ComfyUI LoRA chain and history parser. Add base-model compatibility warnings before adding Civitai browsing. |
| Output Settings: PNG | Upstream has an `outputFormat` controller. | CivitFree's PNG chip should either set SaveImage/output handling if ComfyUI supports alternate formats, or be disabled/badged. |
| Output Settings: High | Upstream has priority/quality/pro/draft controls depending on workflow and membership/ecosystem. | Do not imply cloud priority. For local ComfyUI, map this to concrete steps/size presets or remove it. |
| Aspect ratio / size | Upstream derives aspect ratios from generation config per ecosystem/resolution. | CivitFree's size chips should drive width/height exactly and be validated per model family. |
| CFG scale | Upstream Advanced uses a slider with presets and an info label. | Current CFG control is technically aligned because it feeds KSampler, but CivitFree may later choose different labels, ranges, defaults, or model-family-specific guidance. |
| Sampler | Upstream Advanced uses a real select input with sampler presets and maps Civitai names to Comfy sampler/scheduler values. | Replace the inert Sampler dropdown display with a real picker, but treat `samplerMap.js` and ComfyUI support as local truth. CivitFree can diverge from upstream sampler presentation. |
| Scheduler | Upstream has a scheduler controller for some ecosystems. | CivitFree currently hides scheduler; okay unless exposing non-normal/karras scheduling as a real Comfy input. Scheduler UX/defaults are an intentional future design choice, not something inherited from Civitai. |
| Steps | Upstream Advanced uses a slider with presets. | Current steps UI is technically aligned because it feeds KSampler, but CivitFree may later use different step presets, ranges, model-specific recommendations, or simplified modes. |
| Seed | Upstream Advanced uses SeedInput for reproducibility. | Custom seed must be wired into workflow generation; random mode should generate and display the actual submitted seed. |
| CLIP Skip | Upstream exposes CLIP Skip only for SD workflows. | Not currently in CivitFree. Add later only if workflow builder supports it. |
| Denoise | Upstream exposes denoise for img2img only. | Do not show for txt2img; required for real img2img/inpaint later. |
| VAE | Upstream uses a resource select input and only renders where supported. | Current Select VAE button should be disabled/badged until the Comfy workflow can load a selected VAE. |
| Queue / Feed | Upstream statuses distinguish pending, completed, failed/expired/canceled and image cards retain generation metadata/resources. | CivitFree should keep polling ComfyUI queue/history and preserve metadata in cards/action sheets. |
| Remix / remix with seed | Upstream uses remix store/state to seed a new generation from prior metadata. | Current remix actions are directionally right; verify prompt, resources, size, sampler, CFG, steps, and seed transfer. |
| Inpaint / image editing | Upstream image edit workflows are workflow-specific and can enable drawing/source-image inputs. | CivitFree's Screen D should be considered incomplete until it has a real mask/source-image workflow builder and drawing mask data. |
| Sort / filters | Upstream uses process tags/resources/status data for filtering. | CivitFree should sort/filter local Comfy history by timestamp/status/model/resource once wired; otherwise label as coming soon. |


## Intentional divergence policy

Use upstream Civitai to answer questions like "what is this control generally for?" and "what metadata should this action carry?" Do **not** use it to lock in CivitFree's final tuning model. CFG, steps, samplers, schedulers, quality presets, default values, and model-family guidance are all allowed to differ later.

When implementing a control, prefer this decision order:

1. What does local ComfyUI actually support for the selected workflow?
2. What behavior makes sense for a single-user, mobile-first app?
3. What defaults/presets does the user want for their models and hardware?
4. What does Civitai do for the same concept?

"Civitai does it this way" is useful context, but it should not override the first three questions.

## Product direction after this audit

Before adding features, make CivitFree follow the upstream rule: **a control should appear enabled only when it is backed by real workflow data**.

Recommended order:

1. Wire Custom Seed and real Sampler selection because these are core reproducibility controls and CivitFree already has ComfyUI workflow inputs for them; do not assume Civitai's exact presets/defaults are the desired long-term UX.
2. Disable or badge Output Format, High, VAE, Video, Music, Sort, Filter, and Inpaint actions until they are real.
3. Keep Queue/Feed metadata-rich and make remix transfer all relevant generation parameters.
4. Defer Civitai browsing/API integration. The public REST API is useful for model metadata and downloads, but CivitFree's immediate backend remains local ComfyUI.

## Legal/design note

Civitai is Apache-2.0, but the mockup being a direct visual rip is still a product/design risk. Prefer using upstream for feature semantics and state behavior while making CivitFree's visual language distinct over time.
