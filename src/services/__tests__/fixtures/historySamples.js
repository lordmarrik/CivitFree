/**
 * Hand-built ComfyUI /history and /queue fixtures.
 *
 * Shaped to match what ComfyUI v0.18.x returns. Replace any of these with
 * a real recorded response (`curl http://<comfy>/history | jq`) — the
 * parser is intentionally graph-walking, not node-id-pinned, so real
 * exports drop in without code changes.
 *
 * Node layout matches src/services/buildWorkflow.js:
 *   3 = CheckpointLoaderSimple
 *   100+ = LoraLoader chain
 *   4 = EmptyLatentImage
 *   5 = positive CLIPTextEncode
 *   6 = negative CLIPTextEncode
 *   7 = KSampler
 *   8 = VAEDecode
 *   9 = SaveImage
 */

const baseT2IWorkflow = ({
  ckpt = 'epicrealism_v5.safetensors',
  positive = 'a serene mountain landscape, golden hour',
  negative = 'blurry, low quality',
  sampler = 'dpmpp_2m',
  scheduler = 'karras',
  cfg = 7,
  steps = 30,
  seed = 1234567,
  width = 832,
  height = 1216,
  batchSize = 1,
} = {}) => ({
  '3': {
    class_type: 'CheckpointLoaderSimple',
    inputs: { ckpt_name: ckpt },
  },
  '4': {
    class_type: 'EmptyLatentImage',
    inputs: { width, height, batch_size: batchSize },
  },
  '5': {
    class_type: 'CLIPTextEncode',
    inputs: { text: positive, clip: ['3', 1] },
  },
  '6': {
    class_type: 'CLIPTextEncode',
    inputs: { text: negative, clip: ['3', 1] },
  },
  '7': {
    class_type: 'KSampler',
    inputs: {
      model: ['3', 0],
      positive: ['5', 0],
      negative: ['6', 0],
      latent_image: ['4', 0],
      sampler_name: sampler,
      scheduler,
      cfg,
      steps,
      seed,
      denoise: 1.0,
    },
  },
  '8': { class_type: 'VAEDecode', inputs: { samples: ['7', 0], vae: ['3', 2] } },
  '9': { class_type: 'SaveImage', inputs: { images: ['8', 0], filename_prefix: 'CF' } },
});

// Workflow with two LoRAs chained between the checkpoint and KSampler.
// KSampler.model points at the tail of the chain; the parser must walk
// back through both LoraLoader nodes to recover the checkpoint name.
const loraWorkflow = () => {
  const wf = baseT2IWorkflow({
    ckpt: 'dreamshaperXL_v2.safetensors',
    positive: 'cyberpunk cityscape',
    negative: 'blurry',
    sampler: 'euler_ancestral',
    scheduler: 'normal',
    cfg: 6,
    steps: 25,
    seed: 999999,
    width: 1024,
    height: 1024,
    batchSize: 2,
  });
  wf['100'] = {
    class_type: 'LoraLoader',
    inputs: {
      model: ['3', 0],
      clip: ['3', 1],
      lora_name: 'detail-tweaker-xl.safetensors',
      strength_model: 0.8,
      strength_clip: 1.0,
    },
  };
  wf['101'] = {
    class_type: 'LoraLoader',
    inputs: {
      model: ['100', 0],
      clip: ['100', 1],
      lora_name: 'lcm-xl.safetensors',
      strength_model: 0.6,
      strength_clip: 0.6,
    },
  };
  wf['5'].inputs.clip = ['101', 1];
  wf['6'].inputs.clip = ['101', 1];
  wf['7'].inputs.model = ['101', 0];
  return wf;
};

// Workflow with a self-referential LoraLoader cycle. The parser must
// terminate via its `seen` set instead of stack-overflowing.
const cyclicLoraWorkflow = () => {
  const wf = baseT2IWorkflow();
  wf['200'] = {
    class_type: 'LoraLoader',
    inputs: {
      model: ['201', 0],
      clip: ['3', 1],
      lora_name: 'cycle-a.safetensors',
      strength_model: 0.5,
    },
  };
  wf['201'] = {
    class_type: 'LoraLoader',
    inputs: {
      model: ['200', 0],
      clip: ['3', 1],
      lora_name: 'cycle-b.safetensors',
      strength_model: 0.5,
    },
  };
  wf['7'].inputs.model = ['201', 0];
  return wf;
};

const wrapHistory = (promptId, workflow, { status, outputs, startedAt, completedAt }) => ({
  [promptId]: {
    prompt: [1, promptId, workflow, {}, ['9']],
    outputs: outputs ?? {},
    status: {
      status_str: status === 'error' ? 'error' : status === 'success' ? 'success' : '',
      completed: status === 'success' || status === 'error',
      messages: [
        startedAt != null && ['execution_start', { prompt_id: promptId, timestamp: startedAt }],
        completedAt != null && status === 'success' && ['execution_success', { prompt_id: promptId, timestamp: completedAt }],
        completedAt != null && status === 'error' && ['execution_error', { prompt_id: promptId, timestamp: completedAt }],
      ].filter(Boolean),
    },
  },
});

export const historyT2ISuccess = wrapHistory('abc-123', baseT2IWorkflow(), {
  status: 'success',
  // Seconds-epoch — parser must convert to ms.
  startedAt: 1715641200,
  completedAt: 1715641215.5,
  outputs: {
    '9': {
      images: [
        { filename: 'CF_00001_.png', subfolder: '', type: 'output' },
      ],
    },
  },
});

export const historyT2IWithLoras = wrapHistory('lora-run-456', loraWorkflow(), {
  status: 'success',
  // Already in ms-epoch — parser must NOT multiply.
  startedAt: 1715641300_000,
  completedAt: 1715641340_000,
  outputs: {
    '9': {
      images: [
        { filename: 'CF_00042_.png', subfolder: '', type: 'output' },
        { filename: 'CF_00043_.png', subfolder: 'sub', type: 'output' },
      ],
    },
  },
});

export const historyError = wrapHistory('error-789', baseT2IWorkflow({ seed: 7 }), {
  status: 'error',
  startedAt: 1715641400,
  completedAt: 1715641405,
  outputs: {},
});

export const historyRunning = {
  'running-555': {
    prompt: [4, 'running-555', baseT2IWorkflow({ seed: 42 }), {}, ['9']],
    outputs: {},
    status: {
      status_str: '',
      completed: false,
      messages: [
        ['execution_start', { prompt_id: 'running-555', timestamp: 1715641500 }],
      ],
    },
  },
};

export const historyCyclicLora = wrapHistory('cycle-001', cyclicLoraWorkflow(), {
  status: 'success',
  startedAt: 1715641600,
  completedAt: 1715641610,
  outputs: { '9': { images: [{ filename: 'CF_cycle.png', type: 'output' }] } },
});

export const queueRunning = {
  queue_running: [
    [10, 'queue-run-aaa', baseT2IWorkflow({ seed: 111, positive: 'queued running' }), {}, ['9']],
  ],
  queue_pending: [
    [11, 'queue-pending-bbb', baseT2IWorkflow({ seed: 222, positive: 'queued pending' }), {}, ['9']],
  ],
};
