/**
 * ComfyUI HTTP client.
 *
 * Real transport against a ComfyUI server. ComfyUI doesn't send CORS
 * headers by default, so the user's ComfyUI must be started with
 *   --enable-cors-header '*'
 * (or with a specific origin). README has the full instructions.
 *
 * Targeted against ComfyUI v0.18.x. Endpoint shapes used:
 *   GET  /system_stats              - liveness + version
 *   GET  /object_info/{NodeClass}   - input choices for a node class
 *   POST /prompt                    - submit workflow, get { prompt_id }
 *   GET  /history/{prompt_id}       - poll job status / outputs
 *   GET  /view?filename=&type=…     - fetch a generated image
 */

/**
 * @typedef {Object} BackendProfile
 * @property {string} id
 * @property {string} label
 * @property {string} baseUrl
 * @property {string} gpu
 * @property {'local' | 'cloud'} mode
 */

/** @type {BackendProfile} */
export const defaultBackendProfile = {
  id: 'steubenville-3080',
  label: 'Steubenville PC',
  baseUrl: 'http://127.0.0.1:8188',
  gpu: 'RTX 3080 10GB',
  mode: 'local',
};

/** @type {BackendProfile} */
export const cloudFallbackProfile = {
  id: 'cloud-fallback',
  label: 'Cloud GPU fallback',
  baseUrl: '',
  gpu: 'Remote CUDA',
  mode: 'cloud',
};

/**
 * Normalize a user-provided baseUrl so fetch() handles it.
 * - Adds http:// if no protocol
 * - Strips trailing slash
 * - Returns empty string if falsy
 */
export function normalizeBaseUrl(input) {
  if (!input) return '';
  let s = String(input).trim();
  if (!s) return '';
  if (!/^https?:\/\//i.test(s)) s = 'http://' + s;
  return s.replace(/\/+$/, '');
}

export class ComfyError extends Error {
  constructor(message, { status, cause, hint } = {}) {
    super(message);
    this.name = 'ComfyError';
    this.status = status;
    this.cause = cause;
    this.hint = hint;
  }
}

/**
 * Wrap fetch with consistent error handling. Returns parsed JSON for
 * 2xx, throws ComfyError otherwise. Network errors get a CORS hint
 * because that's overwhelmingly the most common cause when this fails.
 */
async function callJson(url, init) {
  let res;
  try {
    res = await fetch(url, init);
  } catch (e) {
    throw new ComfyError(`Network error reaching ${url}`, {
      cause: e,
      hint:
        'Likely causes: ComfyUI is not running, the URL is wrong, or ComfyUI ' +
        "wasn't started with --enable-cors-header '*'. See README.",
    });
  }
  if (!res.ok) {
    let body = '';
    try { body = await res.text(); } catch {}
    throw new ComfyError(
      `ComfyUI returned ${res.status} ${res.statusText} for ${url}` +
      (body ? `: ${body.slice(0, 200)}` : ''),
      { status: res.status }
    );
  }
  try {
    return await res.json();
  } catch (e) {
    throw new ComfyError(`ComfyUI returned non-JSON response from ${url}`, { cause: e });
  }
}

/**
 * Lightweight ping. Hits /system_stats which ComfyUI always exposes.
 * Returns the parsed system_stats body on success, throws ComfyError on
 * failure.
 */
export async function testConnection(baseUrl) {
  const url = normalizeBaseUrl(baseUrl);
  if (!url) throw new ComfyError('No backend URL configured.', { hint: 'Set one in Settings or Onboarding.' });
  return await callJson(`${url}/system_stats`);
}

/**
 * List available checkpoint filenames. Reads /object_info for
 * CheckpointLoaderSimple and pulls the ckpt_name list out.
 */
export async function listCheckpoints(baseUrl) {
  const url = normalizeBaseUrl(baseUrl);
  if (!url) throw new ComfyError('No backend URL configured.');
  const info = await callJson(`${url}/object_info/CheckpointLoaderSimple`);
  const list = info?.CheckpointLoaderSimple?.input?.required?.ckpt_name?.[0];
  return Array.isArray(list) ? list : [];
}

/**
 * List available LoRA filenames via /object_info/LoraLoader.
 */
export async function listLoras(baseUrl) {
  const url = normalizeBaseUrl(baseUrl);
  if (!url) throw new ComfyError('No backend URL configured.');
  const info = await callJson(`${url}/object_info/LoraLoader`);
  const list = info?.LoraLoader?.input?.required?.lora_name?.[0];
  return Array.isArray(list) ? list : [];
}

/**
 * Submit a workflow graph for execution. Returns { prompt_id, number, node_errors }.
 * The graph shape is the dict-form ComfyUI accepts on /prompt
 * (each numeric key is a node with class_type + inputs).
 */
export async function submitWorkflow(baseUrl, workflow, clientId) {
  const url = normalizeBaseUrl(baseUrl);
  if (!url) throw new ComfyError('No backend URL configured.');
  const body = JSON.stringify({
    prompt: workflow,
    client_id: clientId || 'civitfree-personal',
  });
  const res = await callJson(`${url}/prompt`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
  });
  if (!res.prompt_id) {
    const dump = typeof res === 'object' ? JSON.stringify(res).slice(0, 300) : '';
    throw new ComfyError('ComfyUI accepted the request but returned no prompt_id', { hint: dump });
  }
  return res;
}

/**
 * Fetch the history entry for a given prompt_id.
 * Returns null if the prompt isn't in history yet (still queued/running).
 * Returns { outputs, status, ... } once it lands.
 */
export async function pollHistory(baseUrl, promptId) {
  const url = normalizeBaseUrl(baseUrl);
  if (!url) throw new ComfyError('No backend URL configured.');
  const res = await callJson(`${url}/history/${encodeURIComponent(promptId)}`);
  return res?.[promptId] ?? null;
}

/**
 * Fetch the full /history map. Returns the raw object keyed by
 * prompt_id (each value is a history entry). Order is server-defined.
 */
export async function listHistory(baseUrl) {
  const url = normalizeBaseUrl(baseUrl);
  if (!url) throw new ComfyError('No backend URL configured.');
  return await callJson(`${url}/history`);
}

/**
 * Build a /view URL for a generated image. Used as <img src=…>.
 */
export function imageUrl(baseUrl, { filename, type = 'output', subfolder = '' } = {}) {
  const url = normalizeBaseUrl(baseUrl);
  if (!url || !filename) return '';
  const params = new URLSearchParams();
  params.set('filename', filename);
  params.set('type', type);
  params.set('subfolder', subfolder);
  return `${url}/view?${params.toString()}`;
}

/**
 * Convenience: poll /history every `intervalMs` until the prompt has
 * outputs, with a hard timeout. Resolves with the history entry, rejects
 * on timeout. Used by the Generate flow.
 */
export async function waitForResult(baseUrl, promptId, { intervalMs = 1500, timeoutMs = 5 * 60 * 1000, signal } = {}) {
  const start = Date.now();
  /* eslint-disable no-constant-condition */
  while (true) {
    if (signal?.aborted) throw new ComfyError('Generation cancelled.');
    const entry = await pollHistory(baseUrl, promptId);
    if (entry?.outputs && Object.keys(entry.outputs).length > 0) return entry;
    if (Date.now() - start > timeoutMs) {
      throw new ComfyError(`Timed out after ${Math.round(timeoutMs / 1000)}s waiting for generation result.`);
    }
    await new Promise(r => setTimeout(r, intervalMs));
  }
  /* eslint-enable */
}

/**
 * Pull image refs out of a /history entry.
 * Returns array of { filename, type, subfolder, nodeId }.
 */
export function extractImagesFromHistory(historyEntry) {
  const outputs = historyEntry?.outputs ?? {};
  const out = [];
  for (const [nodeId, output] of Object.entries(outputs)) {
    const images = output?.images ?? [];
    for (const img of images) {
      if (img?.filename) {
        out.push({
          filename: img.filename,
          type: img.type ?? 'output',
          subfolder: img.subfolder ?? '',
          nodeId,
        });
      }
    }
  }
  return out;
}

export const comfyClient = {
  testConnection,
  listCheckpoints,
  listLoras,
  submitWorkflow,
  pollHistory,
  waitForResult,
  imageUrl,
  extractImagesFromHistory,
  normalizeBaseUrl,
};
