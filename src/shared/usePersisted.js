import { useEffect, useState } from 'react';

const PREFIX = 'cf-personal:';

export function usePersisted(key, initial) {
  const storageKey = PREFIX + key;
  const [value, setValue] = useState(() => {
    try {
      const raw = typeof localStorage !== 'undefined' ? localStorage.getItem(storageKey) : null;
      if (raw === null || raw === undefined) return initial;
      return JSON.parse(raw);
    } catch {
      return initial;
    }
  });
  useEffect(() => {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(storageKey, JSON.stringify(value));
      }
    } catch {}
  }, [storageKey, value]);
  return [value, setValue];
}
