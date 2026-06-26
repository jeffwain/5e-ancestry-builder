/**
 * Session-scoped in-memory cache for the static JSON data files.
 *
 * The data files (traits.json, converted-traits.json, converted-ancestries.json)
 * are static and fetched from multiple places. Without a cache, every in-app
 * navigation back to a page refetches and re-parses them. This caches the
 * fetch *promise* per URL so:
 *   - concurrent callers share one in-flight request (dedupe)
 *   - later callers get the resolved data instantly (no refetch this session)
 *
 * A full page reload clears this map; the browser's HTTP cache then serves the
 * files (a 304 at worst), so data is always fresh — no manual cache-busting.
 *
 * To make a file load eagerly, preload it at app start with preloadJson().
 */

const cache = new Map(); // url -> Promise<json>

export function loadJson(url) {
  if (cache.has(url)) return cache.get(url);

  const promise = fetch(url)
    .then((res) => {
      if (!res.ok) throw new Error(`Failed to load ${url}: ${res.status}`);
      return res.json();
    })
    .catch((err) => {
      // Drop the rejected promise so a later call can retry.
      cache.delete(url);
      throw err;
    });

  cache.set(url, promise);
  return promise;
}

/**
 * Warm the cache in the background (fire-and-forget). Safe to call repeatedly —
 * already-cached URLs are no-ops. Errors are swallowed here and surfaced when a
 * consumer actually awaits the data via loadJson().
 */
export function preloadJson(...urls) {
  for (const url of urls) {
    loadJson(url).catch(() => { /* surfaced on real consumption */ });
  }
}
