/**
 * Versioned, namespaced, fail-safe localStorage wrapper.
 *
 * This is the single low-level persistence primitive for the app. Everything
 * that needs to survive a reload (UI prefs, the character build, future saved
 * slots) goes through here so we get, in one place:
 *   - a key namespace (avoids collisions with other apps on the same origin)
 *   - schema versioning (bump SCHEMA_VERSION to invalidate incompatible data)
 *   - safe failure when storage is unavailable (private mode, quota, SSR)
 *
 * To add a new persisted thing: add a key to STORAGE_KEYS and read/write it with
 * loadState/saveState. To evolve a stored shape incompatibly: bump SCHEMA_VERSION
 * (old entries are then ignored and fall back to defaults).
 */

const PREFIX = 'ancestry-builder:';

// Bump when a persisted shape changes incompatibly. Old entries are discarded.
export const SCHEMA_VERSION = 1;

// Central registry of storage keys — keeps all persisted state discoverable.
export const STORAGE_KEYS = {
  build: 'build',                                  // authored character build (#3)
  builderView: 'ui:builder-view',                  // builder list/grid view (#1)
  ancestriesShowDetails: 'ui:ancestries-show-details', // Ancestries "show details" (#1)
  ancestriesExpanded: 'ui:ancestries-expanded',    // currently expanded ancestry (#1)
  ancestriesArchetype: 'ui:ancestries-archetype',  // selected archetype (#1)
};

// Detect usable storage once. typeof guard keeps this safe in non-browser envs.
const storage = (() => {
  try {
    const probe = PREFIX + '__probe__';
    window.localStorage.setItem(probe, '1');
    window.localStorage.removeItem(probe);
    return window.localStorage;
  } catch {
    return null;
  }
})();

export function loadState(key, fallback = null) {
  if (!storage) return fallback;
  try {
    const raw = storage.getItem(PREFIX + key);
    if (raw == null) return fallback;
    const parsed = JSON.parse(raw);
    // Ignore entries written under a different schema version.
    if (!parsed || parsed.v !== SCHEMA_VERSION) return fallback;
    return parsed.data;
  } catch {
    return fallback;
  }
}

export function saveState(key, data) {
  if (!storage) return;
  try {
    storage.setItem(PREFIX + key, JSON.stringify({ v: SCHEMA_VERSION, data }));
  } catch {
    /* quota exceeded / disabled — ignore, app keeps working in-memory */
  }
}

export function removeState(key) {
  if (!storage) return;
  try {
    storage.removeItem(PREFIX + key);
  } catch {
    /* ignore */
  }
}
