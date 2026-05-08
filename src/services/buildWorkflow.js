/**
 * Build a ComfyUI workflow graph (the API/dict format) from app state.
 *
 * Each node is { class_type, inputs }. Edges are encoded as
 * [sourceNodeId, outputSocket]. KSampler reads model from the
 * checkpoint (or the last LoRA in a chain) and clip likewise.
 *
 * Pure function. No I/O.
 */

import { resolveSampler, parseSize } from './samplerMap.js';

/**
 * Generate a 32-bit unsigned random seed.
 */
export function randomSeed() {
  return Math.floor(Math.random() * 0xffffffff);
}

/**
 * @param {Object} args
 * @param {string} args.checkpointFilename     - e.g. "homosimile_xl_v40.safetensors"
 * @param {string} args.prompt
 * @param {string} args.negativePrompt
 * @param {string} args.sampler                - UI display name e.g. "Euler a"
 * @param {string} args.scheduler              - UI display name e.g. "Normal"
 * @param {number} args.cfg
 * @param {number} args.steps
 * @param {number} args.seed
 * @param {string} args.size                   - "WIDTH×HEIGHT"
 * @param {number} [args.batchSize]            - number of images per submit
 * @param {Array<{filename:string, strength:number}>} [args.loras]
 * @param {string} [args.filenamePrefix]
 */
export function buildTextToImageWorkflow({
  checkpointFilename,
  prompt,
  negativePrompt = '',
  sampler,
  scheduler,
  cfg,
  steps,
  seed,
  size,
  batchSize = 1,
  loras = [],
  filenamePrefix = 'civitfree',
}) {
  const { sampler_name, scheduler: schedulerInternal } = resolveSampler(sampler, scheduler);
  const { width, height } = parseSize(size);

  const graph = {};

  // 3: Checkpoint
  graph['3'] = {
    class_type: 'CheckpointLoaderSimple',
    inputs: { ckpt_name: checkpointFilename },
  };

  // Chain LoRAs starting from the checkpoint's model+clip outputs.
  let modelRef = ['3', 0];
  let clipRef = ['3', 1];
  let nextId = 100;
  for (const l of loras) {
    if (!l?.filename) continue;
    const id = String(nextId++);
    graph[id] = {
      class_type: 'LoraLoader',
      inputs: {
        lora_name: l.filename,
        strength_model: l.strength ?? 1.0,
        strength_clip: l.strength ?? 1.0,
        model: modelRef,
        clip: clipRef,
      },
    };
    modelRef = [id, 0];
    clipRef = [id, 1];
  }

  // 4: Empty latent canvas
  graph['4'] = {
    class_type: 'EmptyLatentImage',
    inputs: { width, height, batch_size: Math.max(1, batchSize | 0) },
  };

  // 5: Positive prompt
  graph['5'] = {
    class_type: 'CLIPTextEncode',
    inputs: { text: prompt ?? '', clip: clipRef },
  };

  // 6: Negative prompt
  graph['6'] = {
    class_type: 'CLIPTextEncode',
    inputs: { text: negativePrompt ?? '', clip: clipRef },
  };

  // 7: KSampler
  graph['7'] = {
    class_type: 'KSampler',
    inputs: {
      seed,
      steps,
      cfg,
      sampler_name,
      scheduler: schedulerInternal,
      denoise: 1.0,
      model: modelRef,
      positive: ['5', 0],
      negative: ['6', 0],
      latent_image: ['4', 0],
    },
  };

  // 8: VAE decode
  graph['8'] = {
    class_type: 'VAEDecode',
    inputs: { samples: ['7', 0], vae: ['3', 2] },
  };

  // 9: Save to ComfyUI's output dir; we'll fetch via /view
  graph['9'] = {
    class_type: 'SaveImage',
    inputs: { images: ['8', 0], filename_prefix: filenamePrefix },
  };

  return graph;
}
