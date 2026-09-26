import { useState, useEffect, useMemo, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { TraitContent } from '../components/TraitContent';
import {
  getResolvedTraitsAndOptions,
  resolveTrait,
  sumTraitCost,
  withoutOpenChoices,
  RECOMMENDED_PREFIX,
} from '../utils/ancestryResolve';
import { POINT_BUDGET } from '../utils/traitDisplay';
import { useConvertedTraits, combineTraitLookups } from '../hooks/useConvertedTraits';
import { usePersistentState } from '../hooks/usePersistentState';
import { loadJson } from '../utils/dataCache';
import { STORAGE_KEYS } from '../utils/storage';
import './AncestriesPage.css';

/**
 * The ancestries, read like a printed book: an index down the side, and the
 * chosen ancestry's entry written out in full — every shared trait, every
 * archetype and every archetype trait.
 *
 * Picking an archetype (its name, or its pill) narrows the entry to what that
 * archetype gets and offers Use / Customize; "All archetypes" goes back.
 */
export function AncestriesPage({ allTraits = {}, onUse, onCustomize }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [selectedAncestryId, setSelectedAncestryId] = usePersistentState(STORAGE_KEYS.ancestriesExpanded, null);
  const [selectedArchetypeId, setSelectedArchetypeId] = usePersistentState(STORAGE_KEYS.ancestriesArchetype, null);
  const entryRef = useRef(null);

  const { convertedTraitsById } = useConvertedTraits();
  const traitLookup = useMemo(
    () => combineTraitLookups(convertedTraitsById, allTraits),
    [convertedTraitsById, allTraits]
  );

  useEffect(() => {
    let active = true;
    loadJson('/data/converted-ancestries.json')
      .then((data) => { if (active) setCategories(data.categories || []); })
      .catch((err) => { if (active) setError(err.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  // Every ancestry with the category it is filed under, for the entry's kicker.
  const allAncestries = useMemo(() => categories.flatMap((category) => [
    ...(category.ancestries || []).map((ancestry) => ({ ancestry, categoryName: category.name })),
    ...(category.subcategories || []).flatMap((sub) =>
      (sub.ancestries || []).map((ancestry) => ({ ancestry, categoryName: sub.name }))
    ),
  ]), [categories]);

  // Nothing chosen yet (or a stale id) opens on the first ancestry, so the page
  // is never an empty frame.
  const current = allAncestries.find((entry) => entry.ancestry.id === selectedAncestryId) || allAncestries[0];
  const ancestry = current?.ancestry;
  const archetype = ancestry?.archetypes?.find((entry) => entry.id === selectedArchetypeId) || null;

  const selectAncestry = (ancestryId) => {
    setSelectedAncestryId(ancestryId);
    setSelectedArchetypeId(null);
    entryRef.current?.scrollIntoView({ block: 'start' });
  };

  const selectArchetype = (archetypeId) => {
    setSelectedArchetypeId(archetypeId);
    entryRef.current?.scrollIntoView({ block: 'start', behavior: 'smooth' });
  };

  // A choice the ancestry leaves open (Small or Medium Size) is the player's to
  // make, so it isn't loaded — `choices` tells the app to send them to the builder.
  const emit = (handler, chosen) => {
    if (!handler || !ancestry || !chosen) return;
    const resolved = getResolvedTraitsAndOptions(ancestry, chosen, traitLookup);
    const { traits, choices, openCategories } = withoutOpenChoices(resolved.traits);
    handler({ ancestry, archetype: chosen, traits, options: resolved.options, choices, openCategories });
  };

  // What the picked archetype leaves open, for the note beside Use / Customize.
  const openChoices = ancestry && archetype
    ? withoutOpenChoices(getResolvedTraitsAndOptions(ancestry, archetype, traitLookup).traits).choices
    : [];

  // Building from the shared traits alone is an archetype with nothing of its own.
  const sharedOnly = ancestry && { id: 'custom', name: 'Custom', traits: [] };

  if (loading || error) {
    return (
      <div className="ancestries-page">
        <p className={error ? 'error-message' : 'loading-message'}>
          {error ? `Error: ${error}` : 'Loading ancestries...'}
        </p>
      </div>
    );
  }

  const sharedCost = sumTraitCost(ancestry?.traits, traitLookup);

  return (
    <div className="ancestry-book">
      <AncestryIndex
        categories={categories}
        search={search}
        onSearchChange={setSearch}
        selectedId={ancestry?.id}
        onSelect={selectAncestry}
      />

      {ancestry && (
        <main className="ancestry-book-entry" ref={entryRef}>
          <header className="ancestry-book-header">
            <span className="ancestry-book-kicker">
              {current.categoryName}
              {ancestry.archetypes?.length > 0 && ` · ${countLabel(ancestry.archetypes.length, 'archetype')}`}
              {ancestry.traits?.length > 0 && ` · ${countLabel(ancestry.traits.length, 'shared trait')}`}
            </span>
            <h1 className="ancestry-book-name">{ancestry.name}</h1>
            {ancestry.summary && <p className="ancestry-book-summary">{ancestry.summary}</p>}
            {ancestry.description && (
              <div className="ancestry-book-description">
                <ReactMarkdown>{ancestry.description}</ReactMarkdown>
              </div>
            )}
          </header>

          {ancestry.archetypes?.length > 0 && (
            <nav className="ancestry-book-pills" aria-label="Archetypes">
              <button
                type="button"
                className="ancestry-book-pill"
                aria-pressed={!archetype}
                onClick={() => setSelectedArchetypeId(null)}
              >
                All archetypes
              </button>
              {ancestry.archetypes.map((entry) => (
                <button
                  key={entry.id}
                  type="button"
                  className="ancestry-book-pill"
                  aria-pressed={archetype?.id === entry.id}
                  onClick={() => selectArchetype(entry.id)}
                >
                  {entry.name}
                </button>
              ))}
            </nav>
          )}

          {archetype ? (
            <>
              <div className="ancestry-book-picked">
                <section className="ancestry-book-section">
                  <h4 className="ancestry-book-section-title">Shared Traits</h4>
                  <TraitList traits={ancestry.traits} lookup={traitLookup} />
                </section>
                <section className="ancestry-book-section">
                  <h4 className="ancestry-book-section-title">{archetype.name} adds</h4>
                  {archetype.description && (
                    <p className="ancestry-book-archetype-description">{archetype.description}</p>
                  )}
                  <TraitList traits={archetype.traits} lookup={traitLookup} designed={archetype.designed} />
                </section>
              </div>

              <footer className="ancestry-book-actions">
                <span className="ancestry-book-actions-text">
                  <strong>{ancestry.name} ({archetype.name})</strong>
                  {' · '}
                  {sharedCost + sumTraitCost(archetype.traits, traitLookup)} of {POINT_BUDGET} points
                  {openChoices.length > 0 && (
                    <span className="ancestry-book-actions-choice">
                      You'll choose {openChoices.join(' or ')} in the builder.
                    </span>
                  )}
                </span>
                <button type="button" className="btn btn-secondary" onClick={() => emit(onCustomize, archetype)}>
                  Customize in the builder
                </button>
                <button type="button" className="btn btn-primary" onClick={() => emit(onUse, archetype)}>
                  Use this ancestry
                </button>
              </footer>
            </>
          ) : (
            <>
              {ancestry.traits?.length > 0 && (
                <section className="ancestry-book-section">
                  <h4 className="ancestry-book-section-title">Shared Traits</h4>
                  <TraitList traits={ancestry.traits} lookup={traitLookup} columns />
                </section>
              )}

              {ancestry.archetypes?.length > 0 && (
                <section className="ancestry-book-section">
                  <h4 className="ancestry-book-section-title">Archetypes</h4>
                  <div className="ancestry-book-archetypes">
                    {ancestry.archetypes.map((entry) => {
                      const available = POINT_BUDGET - sharedCost - sumTraitCost(entry.traits, traitLookup);
                      return (
                        <article key={entry.id} className="ancestry-book-archetype">
                          <div className="ancestry-book-archetype-head">
                            <button
                              type="button"
                              className="ancestry-book-archetype-name"
                              onClick={() => selectArchetype(entry.id)}
                            >
                              {entry.name}
                            </button>
                            {entry.designed && (
                              <span className="ancestry-book-designed" title="Designed for the builder, not taken from the source">
                                Designed
                              </span>
                            )}
                            {/* A full build needs no count; leftover points are the reader's to fill. */}
                            {available > 0 && (
                              <span className="ancestry-book-available">
                                {countLabel(available, 'point')} available
                              </span>
                            )}
                          </div>
                          {entry.description && (
                            <p className="ancestry-book-archetype-description">{entry.description}</p>
                          )}
                          <TraitList traits={entry.traits} lookup={traitLookup} designed={entry.designed} />
                        </article>
                      );
                    })}
                  </div>
                </section>
              )}

              {ancestry.traits?.length > 0 && (
                <footer className="ancestry-book-actions">
                  <span className="ancestry-book-actions-text">
                    Choose an archetype above, or build your own from the shared traits.
                  </span>
                  <button type="button" className="btn btn-secondary" onClick={() => emit(onCustomize, sharedOnly)}>
                    Start from the shared traits
                  </button>
                </footer>
              )}
            </>
          )}
        </main>
      )}
    </div>
  );
}

/** The side index: a search box over every ancestry, filed by category. */
function AncestryIndex({ categories, search, onSearchChange, selectedId, onSelect }) {
  const term = search.trim().toLowerCase();
  const matches = (ancestry) => !term ||
    ancestry.name.toLowerCase().includes(term) ||
    ancestry.summary?.toLowerCase().includes(term);

  // Subcategories file under their own heading, same as the category they sit in.
  const groups = categories.flatMap((category) => [
    { id: category.id, name: category.name, ancestries: category.ancestries || [] },
    ...(category.subcategories || []).map((sub) => ({ id: sub.id, name: sub.name, ancestries: sub.ancestries || [] })),
  ]);

  return (
    <aside className="ancestry-book-index">
      <label className="ancestry-book-index-search">
        <span className="ancestry-book-index-label">Find an ancestry</span>
        <input
          type="search"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Name or description"
        />
      </label>

      {groups.map((group) => {
        const shown = group.ancestries.filter(matches);
        if (shown.length === 0) return null;
        return (
          <nav key={group.id} className="ancestry-book-index-group" aria-label={group.name}>
            <h2 className="ancestry-book-index-heading">{group.name}</h2>
            {shown.map((ancestry) => (
              <button
                key={ancestry.id}
                type="button"
                className="ancestry-book-index-item"
                aria-current={ancestry.id === selectedId ? 'true' : undefined}
                onClick={() => onSelect(ancestry.id)}
              >
                <span>{ancestry.name}</span>
                <span className="ancestry-book-index-count">{ancestry.archetypes?.length || '—'}</span>
              </button>
            ))}
          </nav>
        );
      })}
    </aside>
  );
}

// On a designed archetype the "Designed" tag already says its traits are
// suggestions, so the RECOMMENDED: prefix on each name would only repeat it.
/** Traits written out in full, "Name [cost]. Description." */
function TraitList({ traits, lookup, columns = false, designed = false }) {
  if (!traits?.length) return null;
  return (
    <div className={columns ? 'ancestry-book-traits ancestry-book-traits-columns' : 'ancestry-book-traits'}>
      {traits.filter(Boolean).map((raw, index) => {
        const resolved = withoutRecommended(resolveTrait(raw, lookup), designed);
        const selectedOptions = raw.option && raw.id ? { [raw.id]: raw.option } : {};
        return (
          <div key={`${resolved.id || 'trait'}-${index}`} className="ancestry-book-trait">
            <TraitContent trait={resolved} selectedOptions={selectedOptions} variant="paragraph" longName />
          </div>
        );
      })}
    </div>
  );
}

// The prefix can come from the archetype's own name for the trait or from the
// trait's name in traits.json — strip whichever is showing.
function withoutRecommended(trait, designed) {
  const shown = trait.nameOverride || trait.name;
  if (!designed || !shown?.startsWith(RECOMMENDED_PREFIX)) return trait;
  return { ...trait, nameOverride: shown.slice(RECOMMENDED_PREFIX.length) };
}

function countLabel(count, noun) {
  return `${count} ${noun}${count === 1 ? '' : 's'}`;
}
