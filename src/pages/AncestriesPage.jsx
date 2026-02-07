import { useState, useEffect } from 'react';
import { AncestryCard, resolveTrait, getResolvedTraitsAndOptions } from '../components/AncestryCard';
import { SummaryTraitCard } from '../components/SummaryTraitCard';
import './AncestriesPage.css';

export function AncestriesPage({
  allTraits = {},
  onUse,
  onCustomize
}) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedAncestry, setExpandedAncestry] = useState(null);
  const [selectedArchetypeId, setSelectedArchetypeId] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    async function loadAncestries() {
      try {
        const response = await fetch('/data/ancestries.json');
        if (!response.ok) throw new Error('Failed to load ancestries');
        const data = await response.json();
        setCategories(data.categories || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadAncestries();
  }, []);

  // Find the expanded ancestry object and selected archetype object
  const expandedAncestryObj = expandedAncestry
    ? categories.flatMap(c => c.ancestries).find(a => a.id === expandedAncestry)
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

  const handleUse = () => {
    if (onUse && expandedAncestryObj && selectedArchetypeObj) {
      const { traits, options } = getResolvedTraitsAndOptions(
        expandedAncestryObj, selectedArchetypeObj, allTraits
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
        expandedAncestryObj, selectedArchetypeObj, allTraits
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

      <div className="ancestries-two-col">
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

              <div className="ancestry-grid">
                {category.ancestries.map((ancestry) => (
                  <AncestryCard
                    key={ancestry.id}
                    ancestry={ancestry}
                    allTraits={allTraits}
                    isExpanded={expandedAncestry === ancestry.id}
                    onToggle={() => handleToggle(ancestry.id)}
                    selectedArchetype={selectedArchetypeId}
                    onSelectArchetype={handleSelectArchetype}
                    showDetails={showDetails}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>

        {/* Right Column — Summary (sticky) */}
        <div className="ancestries-summary-col">
          <AncestrySummary
            ancestry={expandedAncestryObj}
            archetype={selectedArchetypeObj}
            allTraits={allTraits}
            onUse={handleUse}
            onCustomize={handleCustomize}
          />
        </div>
      </div>
    </div>
  );
}

// Pencil icon for customize button
const PencilIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="14" height="14">
    <path fill="currentColor" d="M410.3 231l11.3-11.3-33.9-33.9-62.1-62.1L291.7 89.8l-11.3 11.3-22.6 22.6L58.6 322.9c-10.4 10.4-18 23.3-22.2 37.4L1 480.7c-2.5 8.4-.2 17.5 6.1 23.7s15.3 8.5 23.7 6.1l120.3-35.4c14.1-4.2 27-11.8 37.4-22.2L387.7 253.7 410.3 231zM160 399.4l-9.1 22.7c-4 3.1-8.5 5.4-13.3 6.9L59.4 452l23-78.1c1.4-4.9 3.8-9.4 6.9-13.3l22.7-9.1 0 32c0 8.8 7.2 16 16 16l32 0zM362.7 18.7L348.3 33.2 325.7 55.8 314.3 67.1l33.9 33.9 62.1 62.1 33.9 33.9 11.3-11.3 22.6-22.6 14.5-14.5c25-25 25-65.5 0-90.5L453.3 18.7c-25-25-65.5-25-90.5 0zm-47.4 168l-144 144c-6.2 6.2-16.4 6.2-22.6 0s-6.2-16.4 0-22.6l144-144c6.2-6.2 16.4-6.2 22.6 0s6.2 16.4 0 22.6z"/>
  </svg>
);

function AncestrySummary({ ancestry, archetype, allTraits, onUse, onCustomize }) {
  // Empty state — no ancestry selected
  if (!ancestry) {
    return (
      <div className="ancestry-summary empty">
        <p className="ancestry-summary-placeholder">
          Select an ancestry and archetype to see the full summary.
        </p>
      </div>
    );
  }

  // Resolve shared traits
  const sharedTraits = (ancestry.traits || []).map(t => ({
    resolved: resolveTrait(t, allTraits),
    raw: t
  }));

  // Resolve archetype traits
  const archetypeTraits = archetype
    ? (archetype.traits || []).filter(Boolean).map(t => ({
        resolved: resolveTrait(t, allTraits),
        raw: t
      }))
    : [];

  const archetypeName = archetype?.name;
  const archetypeIcon = archetype?.icon;
  const title = archetypeName
    ? `${ancestry.name} (${archetypeName})`
    : ancestry.name;

  return (
    <div className="ancestry-summary">
      <h2 className="ancestry-summary-title">
        {archetypeIcon && <span>{archetypeIcon} </span>}
        {title}
      </h2>

      {ancestry.description && (
        <p className="ancestry-summary-desc">{ancestry.description}</p>
      )}

      {/* Shared Traits */}
      {sharedTraits.length > 0 && (
        <div className="ancestry-summary-section">
          <h3>Shared Traits</h3>
          <div className="ancestry-summary-traits">
            {sharedTraits.map(({ resolved, raw }, idx) => {
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
                />
              );
            })}
          </div>
        </div>
      )}

      {/* Archetype Traits */}
      {archetype && archetypeTraits.length > 0 && (
        <div className="ancestry-summary-section">
          <h3>
            {archetypeIcon && <span>{archetypeIcon} </span>}
            {archetypeName} Traits
          </h3>
          <div className="ancestry-summary-traits">
            {archetypeTraits.map(({ resolved, raw }, idx) => {
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
                />
              );
            })}
          </div>
        </div>
      )}

      {/* Action buttons — shown when an archetype is selected */}
      {archetype && (
        <div className="ancestry-summary-actions">
          <button className="btn btn-primary" onClick={onUse}>
            Use
          </button>
          <button className="btn btn-secondary" onClick={onCustomize}>
            <PencilIcon />
            Customize
          </button>
        </div>
      )}

      {/* Prompt to select archetype if ancestry expanded but no archetype chosen */}
      {!archetype && (
        <p className="ancestry-summary-hint">
          Select an archetype for the full list of traits.
        </p>
      )}
    </div>
  );
}
