# Product intent

CivitFree Personal is a Civitai-style generator experience implemented in the
custom CivitFree mobile-first interface, with generation executed locally through
ComfyUI.

The point is not to clone Civitai wholesale. The point is to reproduce the
selected parts of Civitai's generator experience that are useful for personal
local generation, while avoiding the hosted-platform behavior the user does not
want.

## North star

CivitFree Personal should let the user:

1. Browse and download models, checkpoints, LoRAs, and related resource metadata
   from Civitai when catalog access is needed.
2. Generate locally through the user's own ComfyUI server.
3. Use a familiar Civitai-like generation flow for prompts, resources, remixing,
   seeds, settings, Queue, Feed, and image actions.
4. Keep the custom CivitFree Personal visual style and mobile-first interaction
   model.

In one sentence:

> CivitFree Personal recreates the selected Civitai generator experience inside
> the CivitFree interface, uses Civitai as a model/resource catalog and download
> source, and uses local ComfyUI as the generation backend.

## What should match Civitai

Use Civitai as the reference for generator behavior and product semantics where
parity is wanted:

- generator control concepts and terminology;
- model/checkpoint and resource/LoRA mental models;
- prompt and negative prompt behavior;
- seed, random seed, custom seed, Remix, and Remix with seed behavior;
- sampler, scheduler, CFG, steps, size, and quantity concepts;
- image action menu concepts;
- generated-image metadata and resource tracking;
- model/resource browsing and download expectations.

These should be translated into CivitFree's interface and local ComfyUI
workflows. They should not require Civitai-hosted generation.

## What should not match Civitai

Do not import Civitai's hosted-platform baggage unless the user explicitly
changes direction:

- Civitai-hosted generation;
- credits, Buzz, paid priority, or Pro generation semantics;
- cloud queue behavior;
- account-gated local generation;
- platform moderation flows for private local outputs;
- Civitai server architecture, database assumptions, or storage assumptions;
- UI replacement that abandons the CivitFree Personal visual language.

## Implementation rule

For each Civitai-like feature, classify it before building:

| Category | Meaning |
| --- | --- |
| **CivitFree-style parity** | Match the selected Civitai behavior, but keep the CivitFree interface. |
| **Local ComfyUI implementation** | The control is enabled only when it maps to an actual local ComfyUI workflow/input. |
| **Civitai catalog/download** | The feature uses Civitai for discovery, metadata, or downloads, not generation. |
| **Excluded platform behavior** | The feature belongs to Civitai's hosted platform and should not be implemented. |
| **Future / coming soon** | The feature is valid but not wired yet, so it must be hidden, disabled, or clearly badged. |

A visible enabled control must be honest: if the user can interact with it, it
should either affect local generation, affect local app state, or clearly explain
that it is not implemented yet.

## Reference priority

When implementing behavior, use this order:

1. The user's stated feature decisions.
2. What local ComfyUI actually supports for the active workflow.
3. The CivitFree Personal mobile-first interface and interaction model.
4. Civitai generator behavior, terminology, and metadata patterns.

Civitai is an important reference, but it does not override local ComfyUI truth
or the user's explicit exclusions.

## Generator parity matrix

| Area | Desired relationship to Civitai | Backend/source | Current status |
| --- | --- | --- | --- |
| Prompt | Same core concept, CivitFree styling | Local ComfyUI | Implemented for Text → Image |
| Negative prompt | Same core concept, CivitFree styling | Local ComfyUI | Implemented for Text → Image |
| Checkpoint/model selection | Civitai-like resource concept, local filename truth | Local ComfyUI now; Civitai catalog later | Local listing/selection exists |
| LoRAs/resources | Civitai-like resource concept with local filename truth | Local ComfyUI now; Civitai catalog later | Local listing/selection exists |
| Seed / custom seed | Same reproducibility concept | Local ComfyUI | Implemented |
| Remix / Remix with seed | Same user-facing concept | Local ComfyUI metadata rerun | Implemented for available Text → Image metadata |
| Sampler / scheduler / CFG / steps / size | Same class of controls when ComfyUI supports them | Local ComfyUI | Implemented for Text → Image |
| Queue / Feed | Similar generation-result workflow, CivitFree presentation | Local ComfyUI queue/history | Implemented for current local runs |
| Download / favorite / selection | Similar image-management concepts | Browser/local app state + ComfyUI `/view` | Implemented; needs real-device validation |
| Image→Image | Desired future parity in CivitFree style | Local ComfyUI | Future |
| Inpaint / upscale / variations | Desired future parity in CivitFree style | Local ComfyUI | Future |
| Civitai browsing/downloads | Desired catalog behavior, not generation | Civitai API/downloads | Future |
| Hosted generation credits/priority/cloud queue | Not wanted | Excluded | Excluded |
