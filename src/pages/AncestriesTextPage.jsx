import { useState, useEffect, useMemo } from 'react';
import { Accordion } from '../components/Accordion';
import { AncestrySummary } from '../components/AncestrySummary';
import { SummaryTraitCard } from '../components/SummaryTraitCard';
import { getResolvedTraitsAndOptions, resolveTrait } from '../utils/ancestryResolve';
import { useConvertedTraits, combineTraitLookups } from '../hooks/useConvertedTraits';
import { usePersistentState } from '../hooks/usePersistentState';
import { loadJson } from '../utils/dataCache';
import { STORAGE_KEYS } from '../utils/storage';
// Layout and sidebar styling are shared with /ancestries — reused, not duplicated.
import './AncestriesPage.css';
import './AncestriesTextPage.css';

/**
 * Split a descriptors string into individual tags.
 * The data uses two separators: "Waterborn – Marine, Aquatic, Fishlike".
 */
function toTags(descriptors) {
  if (!descriptors) return [];
  return descriptors
    .split(/[–—,]/)
    .map(s => s.trim().replace(/\.$/, ''))
    .filter(Boolean);
}

/** Collapsed header: name, one-sentence summary, then tags. */
function AncestryHeading({ ancestry }) {
  const tags = toTags(ancestry.descriptors);
  const archetypeCount = ancestry.archetypes?.length || 0;
  const sharedCount = ancestry.traits?.length || 0;

  return (
    <div className="ancestry-text-heading">
      <h3 className="name">{ancestry.name}</h3>
      {ancestry.summary && (
        <p className="ancestry-text-summary">{ancestry.summary}</p>
      )}
      <div className="ancestry-text-tags">
        {tags.map((tag) => (
          <span key={tag} className="pill type on-dark">{tag}</span>
        ))}
        {archetypeCount > 0 && (
          <span className="pill count heritage">{archetypeCount} archetypes</span>
        )}
        {sharedCount > 0 && (
          <span className="pill count heritage">{sharedCount} shared traits</span>
        )}
      </div>
    </div>
  );
}

/**
 * Trait references rendered the same way the sidebar renders them —
 * compact "Name. description points" rows.
 */
function TraitList({ traits, allTraits }) {
  if (!traits?.length) return null;

  return (
    <div className="ancestry-summary-traits">
      {traits.filter(Boolean).map((raw, idx) => {
        const resolved = resolveTrait(raw, allTraits);
        const selectedOptions = {};
        if (raw.option && raw.id) {
          selectedOptions[raw.id] = raw.option;
        }
        return (
          <SummaryTraitCard
            key={`${resolved.id || 'trait'}-${idx}`}
            trait={resolved}
            selectedOptions={selectedOptions}
            showFooter={false}
            showDetails={false}
            compact={true}
          />
        );
      })}
    </div>
  );
}

/**
 * Expanded body: two columns of archetypes, each listed in full — the name
 * (still the only click target) followed by every trait it grants.
 */
function ArchetypeColumns({ archetypes, allTraits, selectedArchetype, onSelectArchetype }) {
  if (!archetypes?.length) {
    return <p className="ancestry-text-empty">No archetypes defined yet.</p>;
  }

  return (
    <ul className="ancestry-text-archetypes">
      {archetypes.map((archetype) => {
        const isSelected = selectedArchetype === archetype.id;
        return (
          <li key={archetype.id} className="ancestry-text-archetype">
            <div className="ancestry-text-archetype-head">
              <button
                type="button"
                className={`ancestry-text-archetype-name${isSelected ? ' selected' : ''}`}
                onClick={() => onSelectArchetype?.(archetype.id)}
                aria-pressed={isSelected}
              >
                {archetype.icon && <span className="ancestry-text-archetype-icon">{archetype.icon}</span>}
                {archetype.name}
              </button>
              {archetype.designed && (
                <span className="ancestry-text-designed" title="Designed for the builder, not taken from the source">
                  designed
                </span>
              )}
            </div>
            {archetype.description && (
              <p className="ancestry-text-archetype-desc">{archetype.description}</p>
            )}
            <TraitList traits={archetype.traits} allTraits={allTraits} />
          </li>
        );
      })}
    </ul>
  );
}

export function AncestriesTextPage({ allTraits = {}, onUse, onCustomize }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedAncestry, setExpandedAncestry] = usePersistentState(STORAGE_KEYS.ancestriesTextExpanded, null);
  const [selectedArchetypeId, setSelectedArchetypeId] = usePersistentState(STORAGE_KEYS.ancestriesTextArchetype, null);

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

  const allAncestries = categories.flatMap(c => [
    ...(c.ancestries || []),
    ...(c.subcategories || []).flatMap(sc => sc.ancestries || [])
  ]);

  const expandedAncestryObj = expandedAncestry
    ? allAncestries.find(a => a.id === expandedAncestry)
    : null;

  const selectedArchetypeObj = expandedAncestryObj && selectedArchetypeId
    ? expandedAncestryObj.archetypes?.find(a => a.id === selectedArchetypeId)
    : null;

  const handleToggle = (ancestryId) => {
    if (expandedAncestry === ancestryId) {
      setExpandedAncestry(null);
    } else {
      setExpandedAncestry(ancestryId);
    }
    setSelectedArchetypeId(null);
  };

  const handleSelectArchetype = (archetypeId) => setSelectedArchetypeId(archetypeId);
  const handleClearArchetype = () => setSelectedArchetypeId(null);

  const emit = (handler) => {
    if (!handler || !expandedAncestryObj || !selectedArchetypeObj) return;
    const { traits, options } = getResolvedTraitsAndOptions(
      expandedAncestryObj, selectedArchetypeObj, traitLookup
    );
    handler({
      ancestry: expandedAncestryObj,
      archetype: selectedArchetypeObj,
      traits,
      options
    });
  };

  if (loading) {
    return (
      <div className="ancestries-page ancestries-text-page">
        <div className="ancestries-content">
          <p className="loading-message">Loading ancestries...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="ancestries-page ancestries-text-page">
        <div className="ancestries-content">
          <p className="error-message">Error: {error}</p>
        </div>
      </div>
    );
  }

  const renderAncestry = (ancestry) => (
    <Accordion
      key={ancestry.id}
      type="heritage"
      className="ancestry-text-accordion"
      title={<AncestryHeading ancestry={ancestry} />}
      isOpen={expandedAncestry === ancestry.id}
      onToggle={() => handleToggle(ancestry.id)}
    >
      {(expanded) => (expanded ? (
        <div className="ancestry-text-body">
          {ancestry.description && (
            <p className="ancestry-text-description">{ancestry.description}</p>
          )}

          {ancestry.traits?.length > 0 && (
            <section className="ancestry-text-section">
              <h4 className="ancestry-text-section-title">Shared Traits</h4>
              <TraitList traits={ancestry.traits} allTraits={traitLookup} />
            </section>
          )}

          <section className="ancestry-text-section">
            <h4 className="ancestry-text-section-title">Archetypes</h4>
            <ArchetypeColumns
              archetypes={ancestry.archetypes}
              allTraits={traitLookup}
              selectedArchetype={selectedArchetypeId}
              onSelectArchetype={handleSelectArchetype}
            />
          </section>
        </div>
      ) : null)}
    </Accordion>
  );

  return (
    <div className="ancestries-page ancestries-text-page">
      <header className="ancestries-header">
        <h1>Ancestries</h1>
        <p>
          Every ancestry and its archetypes as a plain list. Open an ancestry, then
          click an archetype name to load it into the summary.
        </p>
      </header>

      <div className="ancestries-two-col list-view">
        {/* Left Column — Browse */}
        <div className="ancestries-browse">
          {categories.map((category) => (
            <section key={category.id} className="ancestry-category">
              <div className="category-header">
                <h2>{category.name}</h2>
                {category.description && (
                  <p className="category-desc">{category.description}</p>
                )}
              </div>

              {category.ancestries?.length > 0 && (
                <div className="ancestry-text-list">
                  {category.ancestries.map(renderAncestry)}
                </div>
              )}

              {category.subcategories?.map((sub) => (
                <div key={sub.id} className="ancestry-subcategory">
                  <div className="subcategory-header">
                    <h3>{sub.name}</h3>
                    {sub.description && (
                      <p className="subcategory-desc">{sub.description}</p>
                    )}
                  </div>
                  <div className="ancestry-text-list">
                    {(sub.ancestries || []).map(renderAncestry)}
                  </div>
                </div>
              ))}
            </section>
          ))}
        </div>

        {/* Right Column — Summary (sticky), shared with /ancestries */}
        <div className="ancestries-summary-col">
          <AncestrySummary
            ancestry={expandedAncestryObj}
            archetype={selectedArchetypeObj}
            allTraits={traitLookup}
            onUse={() => emit(onUse)}
            onCustomize={() => emit(onCustomize)}
            onSelectArchetype={handleSelectArchetype}
            onClearArchetype={handleClearArchetype}
          />
        </div>
      </div>
    </div>
  );
}
