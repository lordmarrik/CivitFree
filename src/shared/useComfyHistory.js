import { useEffect, useState } from 'react';
import { listHistory } from '../services/comfyClient.js';
import { parseHistory } from '../services/historyParser.js';

/**
 * Polls /history while enabled. Returns
 *   { runs, loading, error, reload }
 *
 * runs: ParsedRun[] sorted newest-first.
 * loading: only true on the very first fetch (subsequent polls are silent).
 * error: only set if the most recent fetch failed.
 */
export function useComfyHistory(baseUrl, { enabled = true, intervalMs = 4000 } = {}) {
  const [runs, setRuns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [reloadTick, setReloadTick] = useState(0);
  const [hasFetched, setHasFetched] = useState(false);

  useEffect(() => {
    if (!enabled || !baseUrl) return;
    let cancelled = false;
    let timeoutId = null;
    let firstAttempt = !hasFetched;

    const tick = async () => {
      if (firstAttempt) setLoading(true);
      try {
        const map = await listHistory(baseUrl);
        if (cancelled) return;
        setRuns(parseHistory(map));
        setError(null);
        setHasFetched(true);
      } catch (err) {
        if (cancelled) return;
        setError(err);
      } finally {
        if (!cancelled && firstAttempt) setLoading(false);
        firstAttempt = false;
      }
      if (!cancelled) {
        timeoutId = setTimeout(tick, intervalMs);
      }
    };

    tick();

    return () => {
      cancelled = true;
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [baseUrl, enabled, intervalMs, reloadTick]);

  return {
    runs,
    loading,
    error,
    reload: () => setReloadTick(t => t + 1),
  };
}
