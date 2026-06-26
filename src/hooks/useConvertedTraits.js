import { useState, useEffect, useMemo } from 'react';

/**
 * Loads the ancestry-pool trait vocabulary from converted-traits.json.
 *
 * The prebuilt ancestries in converted-ancestries.json reference trait IDs that
 * live in this file (the imported "Dice Monster" vocabulary). A handful of shared
 * structural traits (size, darkvision, etc.) live in the curated traits.json
 * instead, so consumers should resolve against the COMBINED lookup — see
 * `useCombinedTraitLookup` for the merged map.
 */
export function useConvertedTraits() {
  const [traits, setTraits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/data/converted-traits.json');
        if (!res.ok) {
          throw new Error(`Failed to load converted traits: ${res.status}`);
        }
        const json = await res.json();
        // File is a flat array of trait objects; tolerate a wrapped shape too.
        setTraits(Array.isArray(json) ? json : (json.traits || []));
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const convertedTraitsById = useMemo(() => {
    const map = {};
    for (const t of traits) {
      if (t && t.id) map[t.id] = t;
    }
    return map;
  }, [traits]);

  return { convertedTraits: traits, convertedTraitsById, loading, error };
}

/**
 * Merge the curated point-buy traits (traits.json, via useTraitData -> allTraits)
 * with the imported ancestry-pool traits (converted-traits.json) into a single
 * id -> trait lookup. The curated traits win on the rare overlapping id, since
 * they carry the hand-refined point costs and category metadata.
 */
export function combineTraitLookups(convertedTraitsById, allTraits) {
  return { ...convertedTraitsById, ...allTraits };
}
