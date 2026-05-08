import { useEffect, useState } from 'react';
import { listCheckpoints, listLoras } from '../services/comfyClient.js';

const KIND_FETCHERS = {
  checkpoints: listCheckpoints,
  loras: listLoras,
};

/**
 * Fetch checkpoint or LoRA filenames from ComfyUI's /object_info on
 * mount (and whenever the open flag flips true). Returns
 *   { items, loading, error, reload }
 *
 * Skips the fetch entirely if `enabled` is false (e.g. picker closed)
 * so we don't hit the network on every render.
 */
export function useComfyList(kind, baseUrl, { enabled = true } = {}) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [reloadTick, setReloadTick] = useState(0);

  useEffect(() => {
    if (!enabled) return;
    const fetcher = KIND_FETCHERS[kind];
    if (!fetcher) {
      setError(new Error(`Unknown list kind: ${kind}`));
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetcher(baseUrl)
      .then(list => {
        if (!cancelled) setItems(Array.isArray(list) ? list : []);
      })
      .catch(err => {
        if (!cancelled) setError(err);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [kind, baseUrl, enabled, reloadTick]);

  return {
    items,
    loading,
    error,
    reload: () => setReloadTick(t => t + 1),
  };
}
