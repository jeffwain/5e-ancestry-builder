import { useState, useEffect } from 'react';
import { loadState, saveState } from '../utils/storage';

/**
 * Drop-in replacement for useState that persists to localStorage.
 *
 * Survives reloads; degrades gracefully to plain in-memory state when storage
 * is unavailable. One call per persisted UI preference, e.g.:
 *
 *   const [expanded, setExpanded] = usePersistentState(STORAGE_KEYS.ancestriesExpanded, null);
 *
 * @param {string} key   storage key (use a STORAGE_KEYS constant)
 * @param {*} defaultValue value used when nothing is stored yet
 */
export function usePersistentState(key, defaultValue) {
  const [value, setValue] = useState(() => loadState(key, defaultValue));

  useEffect(() => {
    saveState(key, value);
  }, [key, value]);

  return [value, setValue];
}
