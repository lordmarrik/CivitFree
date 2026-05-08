/**
 * Parse a ComfyUI /history entry into a structured run object the UI
 * can render directly. Walks the workflow graph to extract prompt /
 * negative prompt / sampler / cfg / steps / seed / size, then pulls the
 * output image refs out of the outputs map.
 *
 * Tolerant of unfamiliar workflows — if a field can't be derived, it's
 * left as undefined rather than throwing.
 */

/**
 * @typedef {Object} ParsedRun
 * @property {string} promptId
 * @property {number|null} startedAt   - ms epoch from history.status.messages
 * @property {number|null} completedAt
 * @property {string} status           - 'success' | 'error' | 'running' | 'queued'
 * @property {string} prompt
 * @property {string} negPrompt
 * @property {string} sampler
 * @property {string} scheduler
 * @property {number} cfg
 * @property {number} steps
 * @property {number} seed
 * @property {number} width
 * @property {number} height
 * @property {Array<{filename:string,type:string,subfolder:string,nodeId:string}>} images
 * @property {string[]} loraNames      - filenames of any LoRAs in the chain
 */

const findNode = (graph, predicate) => {
  if (!graph || typeof graph !== 'object') return null;
  for (const [id, node] of Object.entries(graph)) {
    if (node && predicate(node, id)) return [id, node];
  }
  return null;
};

const findNodeByClass = (graph, className) =>
  findNode(graph, (n) => n.class_type === className);

const resolveTextNode = (graph, ref) => {
  if (!Array.isArray(ref)) return '';
  const [id] = ref;
  const node = graph?.[id];
  if (!node || node.class_type !== 'CLIPTextEncode') return '';
  return node.inputs?.text ?? '';
};

const collectLoras = (graph) => {
  const out = [];
  if (!graph) return out;
  for (const node of Object.values(graph)) {
    if (node?.class_type === 'LoraLoader') {
      const name = node.inputs?.lora_name;
      if (name) out.push(name);
    }
  }
  return out;
};

const messageTime = (status, kind) => {
  const messages = status?.messages;
  if (!Array.isArray(messages)) return null;
  for (const m of messages) {
    if (Array.isArray(m) && m[0] === kind) {
      const data = m[1];
      const t = data?.timestamp ?? data?.time;
      if (typeof t === 'number') return t > 1e12 ? t : t * 1000;
    }
  }
  return null;
};

const collectImages = (outputs) => {
  if (!outputs || typeof outputs !== 'object') return [];
  const all = [];
  for (const [nodeId, output] of Object.entries(outputs)) {
    const images = output?.images;
    if (!Array.isArray(images)) continue;
    for (const img of images) {
      if (img?.filename) {
        all.push({
          filename: img.filename,
          type: img.type ?? 'output',
          subfolder: img.subfolder ?? '',
          nodeId,
        });
      }
    }
  }
  return all;
};

/**
 * Parse one history entry. ComfyUI's /history shape is roughly
 *   {
 *     [promptId]: {
 *       prompt: [number, promptId, workflow, extra_data, outputs_to_execute],
 *       outputs: { [nodeId]: { images: [...] } },
 *       status: { status_str, completed, messages: [[kind, data], ...] }
 *     }
 *   }
 */
export function parseHistoryEntry(promptId, entry) {
  const promptArr = entry?.prompt;
  const workflow = Array.isArray(promptArr) ? promptArr[2] : null;
  const status = entry?.status;
  const outputs = entry?.outputs;

  const ks = findNodeByClass(workflow, 'KSampler') || findNodeByClass(workflow, 'KSamplerAdvanced');
  const ksInputs = ks?.[1]?.inputs ?? {};
  const empty = findNodeByClass(workflow, 'EmptyLatentImage');
  const emptyInputs = empty?.[1]?.inputs ?? {};

  const prompt = resolveTextNode(workflow, ksInputs.positive);
  const negPrompt = resolveTextNode(workflow, ksInputs.negative);

  const images = collectImages(outputs);
  const loraNames = collectLoras(workflow);

  let runStatus = 'queued';
  if (status?.completed) runStatus = status.status_str === 'error' ? 'error' : 'success';
  else if (Array.isArray(status?.messages) && status.messages.length > 0) runStatus = 'running';

  return {
    promptId,
    startedAt: messageTime(status, 'execution_start'),
    completedAt: messageTime(status, 'execution_success') ?? messageTime(status, 'execution_error'),
    status: runStatus,
    prompt: prompt || '',
    negPrompt: negPrompt || '',
    sampler: ksInputs.sampler_name ?? '',
    scheduler: ksInputs.scheduler ?? '',
    cfg: typeof ksInputs.cfg === 'number' ? ksInputs.cfg : 0,
    steps: typeof ksInputs.steps === 'number' ? ksInputs.steps : 0,
    seed: typeof ksInputs.seed === 'number' ? ksInputs.seed : 0,
    width: typeof emptyInputs.width === 'number' ? emptyInputs.width : 0,
    height: typeof emptyInputs.height === 'number' ? emptyInputs.height : 0,
    images,
    loraNames,
  };
}

/**
 * Parse a full /history response into an array of runs sorted newest-first.
 * Falls back to insertion order when timestamps aren't available.
 */
export function parseHistory(historyMap) {
  if (!historyMap || typeof historyMap !== 'object') return [];
  const runs = Object.entries(historyMap).map(([id, entry]) => parseHistoryEntry(id, entry));
  runs.sort((a, b) => {
    const aT = a.completedAt ?? a.startedAt ?? 0;
    const bT = b.completedAt ?? b.startedAt ?? 0;
    return bT - aT;
  });
  return runs;
}

/**
 * Quick palette index for a deterministic-but-friendly color tied to a
 * filename (used by the feed/queue cards as a fallback when we can't
 * actually fetch the thumbnail yet).
 */
export function paletteForFilename(filename, n = 8) {
  if (!filename) return 0;
  let h = 0;
  for (let i = 0; i < filename.length; i++) h = (h + filename.charCodeAt(i)) % n;
  return h;
}

export function seedHashForFilename(filename) {
  let h = 0;
  for (let i = 0; i < filename.length; i++) h = (h * 31 + filename.charCodeAt(i)) >>> 0;
  return h;
}
