/**
 * @typedef {Object} BackendProfile
 * @property {string} id
 * @property {string} label
 * @property {string} baseUrl
 * @property {string} gpu
 * @property {'local' | 'cloud'} mode
 */

const notImplemented = (name) => async () => {
  throw new Error(`${name} is a ComfyUI stub. Wire the real transport after the UI shell is stable.`);
};

/** @type {BackendProfile} */
export const defaultBackendProfile = {
  id: 'steubenville-3080',
  label: 'Steubenville PC',
  baseUrl: 'http://127.0.0.1:8188',
  gpu: 'RTX 3080 10GB',
  mode: 'local'
};

/** @type {BackendProfile} */
export const cloudFallbackProfile = {
  id: 'cloud-fallback',
  label: 'Cloud GPU fallback',
  baseUrl: '',
  gpu: 'Remote CUDA',
  mode: 'cloud'
};

export const testConnection = notImplemented('testConnection');
export const listCheckpoints = notImplemented('listCheckpoints');
export const listLoras = notImplemented('listLoras');
export const submitWorkflow = notImplemented('submitWorkflow');
export const pollQueueHistory = notImplemented('pollQueueHistory');
export const downloadGeneratedImage = notImplemented('downloadGeneratedImage');

export const comfyClient = {
  testConnection,
  listCheckpoints,
  listLoras,
  submitWorkflow,
  pollQueueHistory,
  downloadGeneratedImage
};
