import { describe, it, expect } from 'vitest';
import {
  parseHistoryEntry,
  parseHistory,
  parseQueueEntry,
  parseQueue,
  mergeQueueAndHistory,
  paletteForFilename,
  seedHashForFilename,
} from '../historyParser.js';
import {
  historyT2ISuccess,
  historyT2IWithLoras,
  historyError,
  historyRunning,
  historyCyclicLora,
  queueRunning,
} from './fixtures/historySamples.js';

const firstEntry = (history) => {
  const [id, entry] = Object.entries(history)[0];
  return parseHistoryEntry(id, entry);
};

describe('parseHistoryEntry', () => {
  it('extracts prompt, params, and images from a plain T2I run', () => {
    const run = firstEntry(historyT2ISuccess);
    expect(run.promptId).toBe('abc-123');
    expect(run.status).toBe('success');
    expect(run.prompt).toBe('a serene mountain landscape, golden hour');
    expect(run.negPrompt).toBe('blurry, low quality');
    expect(run.checkpoint).toBe('epicrealism_v5.safetensors');
    expect(run.sampler).toBe('dpmpp_2m');
    expect(run.scheduler).toBe('karras');
    expect(run.cfg).toBe(7);
    expect(run.steps).toBe(30);
    expect(run.seed).toBe(1234567);
    expect(run.width).toBe(832);
    expect(run.height).toBe(1216);
    expect(run.images).toHaveLength(1);
    expect(run.images[0]).toMatchObject({
      filename: 'CF_00001_.png',
      type: 'output',
      subfolder: '',
      nodeId: '9',
    });
    expect(run.loras).toEqual([]);
    expect(run.loraNames).toEqual([]);
  });

  it('converts seconds-epoch timestamps into ms-epoch', () => {
    const run = firstEntry(historyT2ISuccess);
    expect(run.startedAt).toBe(1715641200 * 1000);
    expect(run.completedAt).toBe(1715641215.5 * 1000);
  });

  it('passes ms-epoch timestamps through unchanged', () => {
    const run = firstEntry(historyT2IWithLoras);
    expect(run.startedAt).toBe(1715641300_000);
    expect(run.completedAt).toBe(1715641340_000);
  });

  it('walks a LoraLoader chain back to the checkpoint and collects loras', () => {
    const run = firstEntry(historyT2IWithLoras);
    expect(run.checkpoint).toBe('dreamshaperXL_v2.safetensors');
    expect(run.loraNames).toEqual([
      'detail-tweaker-xl.safetensors',
      'lcm-xl.safetensors',
    ]);
    expect(run.loras).toEqual([
      { name: 'detail-tweaker-xl.safetensors', strength: 0.8, clipStrength: 1.0 },
      { name: 'lcm-xl.safetensors', strength: 0.6, clipStrength: 0.6 },
    ]);
  });

  it('flags error runs with status="error" and an execution_error completion time', () => {
    const run = firstEntry(historyError);
    expect(run.status).toBe('error');
    expect(run.completedAt).toBe(1715641405 * 1000);
    expect(run.images).toEqual([]);
  });

  it('flags in-progress runs with status="running" when not yet completed', () => {
    const run = firstEntry(historyRunning);
    expect(run.status).toBe('running');
    expect(run.completedAt).toBeNull();
    expect(run.startedAt).toBe(1715641500 * 1000);
  });

  it('terminates on a cyclic LoraLoader chain instead of stack-overflowing', () => {
    const run = firstEntry(historyCyclicLora);
    // Cycle protection prevents reaching the checkpoint via the model path,
    // so the fallback to "any node with ckpt_name" recovers it.
    expect(run.checkpoint).toBe('epicrealism_v5.safetensors');
    expect(run.loraNames).toEqual(['cycle-a.safetensors', 'cycle-b.safetensors']);
  });

  it('returns a sane default shape for an empty entry', () => {
    const run = parseHistoryEntry('empty-1', {});
    expect(run.promptId).toBe('empty-1');
    expect(run.status).toBe('queued');
    expect(run.prompt).toBe('');
    expect(run.negPrompt).toBe('');
    expect(run.checkpoint).toBe('');
    expect(run.cfg).toBe(0);
    expect(run.steps).toBe(0);
    expect(run.seed).toBe(0);
    expect(run.width).toBe(0);
    expect(run.height).toBe(0);
    expect(run.images).toEqual([]);
    expect(run.loras).toEqual([]);
  });
});

describe('parseHistory', () => {
  it('returns runs sorted newest-first by completedAt', () => {
    const combined = {
      ...historyT2ISuccess,        // completed 1715641215.5 (older)
      ...historyT2IWithLoras,      // completed 1715641340_000  (newer)
    };
    const runs = parseHistory(combined);
    expect(runs.map(r => r.promptId)).toEqual(['lora-run-456', 'abc-123']);
  });

  it('returns [] for null / non-object inputs', () => {
    expect(parseHistory(null)).toEqual([]);
    expect(parseHistory(undefined)).toEqual([]);
    expect(parseHistory('nope')).toEqual([]);
  });
});

describe('parseQueueEntry', () => {
  it('marks running entries with startedAt = approximately now', () => {
    const before = Date.now();
    const entry = parseQueueEntry(queueRunning.queue_running[0], 'running');
    const after = Date.now();
    expect(entry.status).toBe('running');
    expect(entry.startedAt).toBeGreaterThanOrEqual(before);
    expect(entry.startedAt).toBeLessThanOrEqual(after);
    expect(entry.completedAt).toBeNull();
    expect(entry.prompt).toBe('queued running');
  });

  it('leaves startedAt null for queued entries', () => {
    const entry = parseQueueEntry(queueRunning.queue_pending[0], 'queued');
    expect(entry.status).toBe('queued');
    expect(entry.startedAt).toBeNull();
    expect(entry.prompt).toBe('queued pending');
  });

  it('returns null for malformed input', () => {
    expect(parseQueueEntry(null, 'queued')).toBeNull();
    expect(parseQueueEntry([], 'queued')).toBeNull();
    expect(parseQueueEntry([1, 'id'], 'queued')).toBeNull();
  });
});

describe('parseQueue', () => {
  it('parses queue_running and queue_pending in order', () => {
    const runs = parseQueue(queueRunning);
    expect(runs.map(r => r.promptId)).toEqual(['queue-run-aaa', 'queue-pending-bbb']);
    expect(runs.map(r => r.status)).toEqual(['running', 'queued']);
  });

  it('returns [] for null / malformed input', () => {
    expect(parseQueue(null)).toEqual([]);
    expect(parseQueue(undefined)).toEqual([]);
    expect(parseQueue({})).toEqual([]);
  });
});

describe('mergeQueueAndHistory', () => {
  it('orders running > queued > completed and dedupes by promptId', () => {
    const queueRuns = parseQueue(queueRunning);
    const historyRuns = parseHistory({
      ...historyT2ISuccess,
      ...historyT2IWithLoras,
      ...historyError,
    });
    // Inject a duplicate promptId into history that should be deduped by
    // the (earlier) queue entry.
    const duplicate = parseHistoryEntry('queue-run-aaa', historyT2ISuccess['abc-123']);
    const merged = mergeQueueAndHistory(queueRuns, [duplicate, ...historyRuns]);
    // Within the history bucket, the error fixture has the newest
    // completedAt, so it sorts ahead of the two success entries.
    expect(merged.map(r => r.status)).toEqual([
      'running', 'queued',           // queue bucket
      'error', 'success', 'success', // history bucket, newest-first
    ]);
    expect(merged.map(r => r.promptId)).toEqual([
      'queue-run-aaa',
      'queue-pending-bbb',
      'error-789',
      'lora-run-456',
      'abc-123',
    ]);
  });

  it('handles null/undefined inputs as empty arrays', () => {
    expect(mergeQueueAndHistory(null, null)).toEqual([]);
    expect(mergeQueueAndHistory(undefined, [])).toEqual([]);
  });
});

describe('paletteForFilename', () => {
  it('is deterministic for the same input', () => {
    expect(paletteForFilename('foo.png', 8)).toBe(paletteForFilename('foo.png', 8));
  });

  it('returns 0 for empty or missing filenames', () => {
    expect(paletteForFilename('', 8)).toBe(0);
    expect(paletteForFilename(undefined, 8)).toBe(0);
  });

  it('always returns a value in [0, n)', () => {
    for (const name of ['a', 'longer-filename.png', '00042_.png', 'sub/dir/file.png']) {
      const v = paletteForFilename(name, 8);
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(8);
    }
  });
});

describe('seedHashForFilename', () => {
  it('is deterministic for the same input', () => {
    expect(seedHashForFilename('foo.png')).toBe(seedHashForFilename('foo.png'));
  });

  it('produces a 32-bit unsigned integer', () => {
    const h = seedHashForFilename('CF_00001_.png');
    expect(Number.isInteger(h)).toBe(true);
    expect(h).toBeGreaterThanOrEqual(0);
    expect(h).toBeLessThanOrEqual(0xffffffff);
  });
});
