import { useState, useEffect, useMemo } from 'react';
import { AncestryCard, getResolvedTraitsAndOptions } from '../components/AncestryCard';
import { AncestrySummary } from '../components/AncestrySummary';
import { useConvertedTraits, combineTraitLookups } from '../hooks/useConvertedTraits';
import { usePersistentState } from '../hooks/usePersistentState';
import { loadJson } from '../utils/dataCache';
import { STORAGE_KEYS } from '../utils/storage';
import './AncestriesPage.css';

export function AncestriesPage({
  allTraits = {},
  onUse,
  onCustomize
}) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedAncestry, setExpandedAncestry] = usePersistentState(STORAGE_KEYS.ancestriesExpanded, null);
  const [selectedArchetypeId, setSelectedArchetypeId] = usePersistentState(STORAGE_KEYS.ancestriesArchetype, null);
  const [showDetails, setShowDetails] = usePersistentState(STORAGE_KEYS.ancestriesShowDetails, false);

  // Ancestry trait IDs resolve against the imported vocabulary (converted-traits.json)
  // plus the curated shared traits (traits.json / allTraits).
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

  // Collect all ancestries from both direct and subcategory sources
  const allAncestries = categories.flatMap(c => [
    ...(c.ancestries || []),
    ...(c.subcategories || []).flatMap(sc => sc.ancestries || [])
  ]);

  // Find the expanded ancestry object and selected archetype object
  const expandedAncestryObj = expandedAncestry
    ? allAncestries.find(a => a.id === expandedAncestry)
    : null;

  const selectedArchetypeObj = expandedAncestryObj && selectedArchetypeId
    ? expandedAncestryObj.archetypes?.find(a => a.id === selectedArchetypeId)
    : null;

  const handleToggle = (ancestryId) => {
    if (expandedAncestry === ancestryId) {
      setExpandedAncestry(null);
      setSelectedArchetypeId(null);
    } else {
      setExpandedAncestry(ancestryId);
      setSelectedArchetypeId(null);
    }
  };

  const handleSelectArchetype = (archetypeId) => {
    setSelectedArchetypeId(archetypeId);
  };

  const handleClearArchetype = () => {
    setSelectedArchetypeId(null);
  };

  const handleUse = () => {
    if (onUse && expandedAncestryObj && selectedArchetypeObj) {
      const { traits, options } = getResolvedTraitsAndOptions(
        expandedAncestryObj, selectedArchetypeObj, traitLookup
      );
      onUse({
        ancestry: expandedAncestryObj,
        archetype: selectedArchetypeObj,
        traits,
        options
      });
    }
  };

  const handleCustomize = () => {
    if (onCustomize && expandedAncestryObj && selectedArchetypeObj) {
      const { traits, options } = getResolvedTraitsAndOptions(
        expandedAncestryObj, selectedArchetypeObj, traitLookup
      );
      onCustomize({
        ancestry: expandedAncestryObj,
        archetype: selectedArchetypeObj,
        traits,
        options
      });
    }
  };

  if (loading) {
    return (
      <div className="ancestries-page">
        <div className="ancestries-content">
          <p className="loading-message">Loading ancestries...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="ancestries-page">
        <div className="ancestries-content">
          <p className="error-message">Error: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="ancestries-page">
      <header className="ancestries-header">
        <h1>Prebuilt Ancestries</h1>
        <p>
          Browse pre-configured ancestry options. Each ancestry includes shared traits
          and archetypes that provide additional customization.
        </p>
        <label className="show-details-toggle">
          <input
            type="checkbox"
            checked={showDetails}
            onChange={(e) => setShowDetails(e.target.checked)}
          />
          Show trait details
        </label>
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

              {/* Direct ancestries */}
              {category.ancestries && category.ancestries.length > 0 && (
                <div className="ancestry-grid">
                  {category.ancestries.map((ancestry) => (
                    <AncestryCard
                      key={ancestry.id}
                      ancestry={ancestry}
                      allTraits={traitLookup}
                      isExpanded={expandedAncestry === ancestry.id}
                      onToggle={() => handleToggle(ancestry.id)}
                      selectedArchetype={selectedArchetypeId}
                      onSelectArchetype={handleSelectArchetype}
                      showDetails={showDetails}
                    />
                  ))}
                </div>
              )}

              {/* Subcategories */}
              {category.subcategories && category.subcategories.map((sub) => (
                <div key={sub.id} className="ancestry-subcategory">
                  <div className="subcategory-header">
                    <h3>{sub.name}</h3>
                    {sub.description && (
                      <p className="subcategory-desc">{sub.description}</p>
                    )}
                  </div>
                  <div className="ancestry-grid">
                    {(sub.ancestries || []).map((ancestry) => (
                      <AncestryCard
                        key={ancestry.id}
                        ancestry={ancestry}
                        allTraits={traitLookup}
                        isExpanded={expandedAncestry === ancestry.id}
                        onToggle={() => handleToggle(ancestry.id)}
                        selectedArchetype={selectedArchetypeId}
                        onSelectArchetype={handleSelectArchetype}
                        showDetails={showDetails}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </section>
          ))}
        </div>

        {/* Right Column — Summary (sticky) */}
        <div className="ancestries-summary-col">
          <AncestrySummary
            ancestry={expandedAncestryObj}
            archetype={selectedArchetypeObj}
            allTraits={traitLookup}
            onUse={handleUse}
            onCustomize={handleCustomize}
            onSelectArchetype={handleSelectArchetype}
            onClearArchetype={handleClearArchetype}
          />
        </div>
      </div>
    </div>
  );
}
