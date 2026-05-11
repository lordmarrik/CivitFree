/**
 * Map between human-readable sampler/scheduler names used in the UI
 * and the internal names ComfyUI expects in KSampler.
 *
 * Some "samplers" in the UI are actually a sampler+scheduler combo
 * (e.g. "DPM++ 2M Karras" => sampler dpmpp_2m + scheduler karras).
 * resolveSampler returns both pieces so the workflow builder can
 * apply them correctly even when only the sampler name was set.
 */

// Display name -> { sampler_name, scheduler_override? }
export const SAMPLER_OPTIONS = [
  'Euler a',
  'Euler',
  'Heun',
  'LCM',
  'DPM++ 2M',
  'DPM++ 2M Karras',
  'DPM++ SDE',
  'DDIM',
  'UniPC',
];

export const SAMPLER_LOOKUP = {
  'Euler a':         { sampler_name: 'euler_ancestral' },
  'Euler':           { sampler_name: 'euler' },
  'Heun':            { sampler_name: 'heun' },
  'LCM':             { sampler_name: 'lcm' },
  'DPM++ 2M':        { sampler_name: 'dpmpp_2m' },
  'DPM++ 2M Karras': { sampler_name: 'dpmpp_2m', scheduler_override: 'karras' },
  'DPM++ SDE':       { sampler_name: 'dpmpp_sde' },
  'DDIM':            { sampler_name: 'ddim' },
  'UniPC':           { sampler_name: 'uni_pc' },
};

export const SCHEDULER_OPTIONS = [
  'Normal',
  'Karras',
  'Exponential',
  'SGM Uniform',
  'Simple',
  'DDIM Uniform',
  'Beta',
];

export const SCHEDULER_LOOKUP = {
  'Normal':       'normal',
  'Karras':       'karras',
  'Exponential':  'exponential',
  'SGM Uniform':  'sgm_uniform',
  'Simple':       'simple',
  'DDIM Uniform': 'ddim_uniform',
  'Beta':         'beta',
};

/**
 * Resolve a UI sampler+scheduler choice to ComfyUI internal names.
 * If the sampler name carries a scheduler hint (e.g. "DPM++ 2M Karras"),
 * the hint wins over the explicit scheduler so the result matches the
 * label.
 */
export function resolveSampler(samplerDisplay, schedulerDisplay) {
  const samplerText = typeof samplerDisplay === 'string' ? samplerDisplay.trim() : '';
  const schedulerText = typeof schedulerDisplay === 'string' ? schedulerDisplay.trim() : '';
  const sLookup = SAMPLER_LOOKUP[samplerText];
  const scheduler = sLookup?.scheduler_override ?? SCHEDULER_LOOKUP[schedulerText] ?? schedulerText;
  const samplerName = sLookup?.sampler_name ?? samplerText;
  return { sampler_name: samplerName || 'euler', scheduler: scheduler || 'normal' };
}

/**
 * Parse a "832×1216" (or "832x1216") size string into { width, height }.
 * Falls back to 1024x1024 if the string doesn't parse.
 */
export function parseSize(sizeStr) {
  if (!sizeStr) return { width: 1024, height: 1024 };
  const match = String(sizeStr).match(/(\d+)\s*[x×]\s*(\d+)/i);
  if (!match) return { width: 1024, height: 1024 };
  return { width: parseInt(match[1], 10), height: parseInt(match[2], 10) };
}
