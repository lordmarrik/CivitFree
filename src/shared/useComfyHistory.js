import { useEffect, useRef, useState } from 'react';
import { listHistory, listQueue } from '../services/comfyClient.js';
import { parseHistory, parseQueue, mergeQueueAndHistory } from '../services/historyParser.js';

/**
 * Polls /history and /queue while enabled. Returns
 *   { runs, loading, error, reload }
 *
 * runs: combined newest-first list. Currently-running jobs come first,
 * then queued/pending, then completed. Each entry is a ParsedRun.
 * loading: only true on the very first fetch.
 * error: only set if the most recent fetch round failed.
 */
export function useComfyHistory(baseUrl, { enabled = true, intervalMs = 4000 } = {}) {
  const [runs, setRuns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [reloadTick, setReloadTick] = useState(0);
  const hasFetchedRef = useRef(false);

  useEffect(() => {
    if (!enabled || !baseUrl) return;
    let cancelled = false;
    let timeoutId = null;
    let firstAttempt = !hasFetchedRef.current;

    const tick = async () => {
      if (firstAttempt) setLoading(true);
      try {
        // /queue is small + per-tick critical for active runs to feel
        // responsive; /history is bigger but only changes on completion.
        // Run them in parallel.
        const [queueData, historyMap] = await Promise.all([
          listQueue(baseUrl),
          listHistory(baseUrl),
        ]);
        if (cancelled) return;
        const queueRuns = parseQueue(queueData);
        const historyRuns = parseHistory(historyMap);
        setRuns(mergeQueueAndHistory(queueRuns, historyRuns));
        setError(null);
        hasFetchedRef.current = true;
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
