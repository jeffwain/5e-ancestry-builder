import { SummaryTraitCard } from '../SummaryTraitCard';
import './AncestryCard.css';

export function AncestryCard({ 
  ancestry, 
  allTraits = {}, 
  isExpanded, 
  onToggle, 
  onUse,      // Navigate to preview with ancestry+archetype loaded
  onCustomize // Navigate to builder with ancestry+archetype pre-populated
}) {
  const { name, summary, description, traits, archetypes } = ancestry;

  // Count shared traits
  const sharedTraitCount = traits?.length || 0;

  // Collect all resolved traits for an ancestry + archetype combo
  // Returns { traits: [...], options: { traitId: optionId, ... } }
  const getResolvedTraitsAndOptions = (archetype) => {
    const options = {};

    // Resolve traits and extract options
    const resolveTraitWithOptions = (traitDef) => {
      const resolved = resolveTrait(traitDef, allTraits);
      // If the trait definition has an option, store it
      if (traitDef.option && resolved.id) {
        options[resolved.id] = traitDef.option;
      }
      return resolved;
    };

    const ancestryTraits = (traits || []).map(t => resolveTraitWithOptions(t));
    const archetypeTraits = (archetype.traits || []).map(t => resolveTraitWithOptions(t));
    const combinedTraits = [...ancestryTraits, ...archetypeTraits];

    return { traits: combinedTraits, options };
  };

  const handleUse = (e, archetype) => {
    e.stopPropagation();
    if (onUse) {
      const { traits, options } = getResolvedTraitsAndOptions(archetype);
      onUse({
        ancestry,
        archetype,
        traits,
        options
      });
    }
  };

  const handleCustomize = (e, archetype) => {
    e.stopPropagation();
    if (onCustomize) {
      const { traits, options } = getResolvedTraitsAndOptions(archetype);
      onCustomize({
        ancestry,
        archetype,
        traits,
        options
      });
    }
  };

  return (
    <article className={`ancestry-card ${isExpanded ? 'expanded' : ''}`}>
      <div className="ancestry-card-header" onClick={onToggle}>
        <div className="ancestry-card-title">
          <h3>{name}</h3>
          <p className="ancestry-summary">{summary}</p>
        </div>
        <div className="ancestry-card-meta">
          <span className="pill type heritage">{sharedTraitCount} shared traits</span>
          {archetypes?.length > 0 && (
            <span className="pill">{archetypes.length} archetypes</span>
          )}
          <button 
            className="expand-toggle"
            aria-expanded={isExpanded}
            aria-label={isExpanded ? 'Collapse' : 'Expand'}
          >
            <svg 
              width="16" 
              height="16" 
              viewBox="0 0 16 16" 
              className={`chevron ${isExpanded ? 'rotated' : ''}`}
            >
              <path 
                fill="currentColor" 
                d="M4.646 5.646a.5.5 0 0 1 .708 0L8 8.293l2.646-2.647a.5.5 0 0 1 .708.708l-3 3a.5.5 0 0 1-.708 0l-3-3a.5.5 0 0 1 0-.708z"
              />
            </svg>
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="ancestry-card-content">
          {description && (
            <p className="ancestry-description">{description}</p>
          )}

          {/* Shared Traits */}
          {traits?.length > 0 && (
            <div className="traits-section">
              <h4>Shared Traits</h4>
              <p className="traits-note">All members of this ancestry gain these traits:</p>
              <div className="trait-list">
                {traits.map((trait, idx) => (
                  <TraitDisplay
                    key={`${trait.id || 'trait'}-${idx}`}
                    trait={trait}
                    allTraits={allTraits}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Archetypes */}
          {archetypes?.length > 0 && (
            <div className="archetypes-section">
              <h4>Archetypes</h4>
              <p className="traits-note">Choose one archetype for additional traits:</p>
              <div className="archetype-list">
                {archetypes.map((archetype) => (
                  <ArchetypeItem 
                    key={archetype.id} 
                    archetype={archetype}
                    allTraits={allTraits}
                    onUse={(e) => handleUse(e, archetype)}
                    onCustomize={(e) => handleCustomize(e, archetype)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </article>
  );
}

// Resolve a trait reference to its full data
// - If trait has just an ID, look it up in allTraits
// - If trait has overrides (name, description, etc.), store them separately
// - If trait has no ID, it's a custom trait - use as-is
// - Custom overrides from ancestry go into specific override fields
function resolveTrait(trait, allTraits) {
  // No ID means it's a fully custom trait
  if (!trait.id) {
    return trait;
  }

  // Look up base trait from database
  const baseTrait = allTraits[trait.id];

  // If not found in database, return what we have
  if (!baseTrait) {
    return trait;
  }

  // Start with base trait
  const resolved = { ...baseTrait };

  // Handle specific overrides from ancestry definition
  // If a custom name is provided, store as nameOverride (not replacing base name)
  if (trait.name && trait.name !== baseTrait.name) {
    resolved.nameOverride = trait.name;
  }

  // If custom description provided, store as descriptionOverride
  if (trait.description && trait.description !== baseTrait.description) {
    resolved.descriptionOverride = trait.description;
  }

  // If custom summary provided, store as summaryOverride
  if (trait.summary && trait.summary !== baseTrait.summary) {
    resolved.summaryOverride = trait.summary;
  }

  // If custom points provided, store as pointsOverride
  if (trait.points !== undefined && trait.points !== baseTrait.points) {
    resolved.pointsOverride = trait.points;
  }

  return resolved;
}

// Wrapper for trait display - resolves ID references from allTraits
// Also passes along any pre-selected option from the ancestry definition
function TraitDisplay({ trait, allTraits }) {
  const resolvedTrait = resolveTrait(trait, allTraits);

  // If we couldn't resolve and there's no name, show error state
  if (!resolvedTrait.name) {
    return (
      <div className="summary-trait-card compact trait-error">
        <div className="summary-trait-header">
          <span className="summary-trait-name">Unknown trait: {trait.id}</span>
        </div>
      </div>
    );
  }

  // Build selectedOptions from the trait definition's option field
  const selectedOptions = {};
  if (trait.option && trait.id) {
    selectedOptions[trait.id] = trait.option;
  }

  return (
    <SummaryTraitCard
      trait={resolvedTrait}
      selectedOptions={selectedOptions}
      showFooter={false}
      className="compact"
    />
  );
}

// Pencil icon for customize button
const PencilIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="14" height="14">
    <path fill="currentColor" d="M410.3 231l11.3-11.3-33.9-33.9-62.1-62.1L291.7 89.8l-11.3 11.3-22.6 22.6L58.6 322.9c-10.4 10.4-18 23.3-22.2 37.4L1 480.7c-2.5 8.4-.2 17.5 6.1 23.7s15.3 8.5 23.7 6.1l120.3-35.4c14.1-4.2 27-11.8 37.4-22.2L387.7 253.7 410.3 231zM160 399.4l-9.1 22.7c-4 3.1-8.5 5.4-13.3 6.9L59.4 452l23-78.1c1.4-4.9 3.8-9.4 6.9-13.3l22.7-9.1 0 32c0 8.8 7.2 16 16 16l32 0zM362.7 18.7L348.3 33.2 325.7 55.8 314.3 67.1l33.9 33.9 62.1 62.1 33.9 33.9 11.3-11.3 22.6-22.6 14.5-14.5c25-25 25-65.5 0-90.5L453.3 18.7c-25-25-65.5-25-90.5 0zm-47.4 168l-144 144c-6.2 6.2-16.4 6.2-22.6 0s-6.2-16.4 0-22.6l144-144c6.2-6.2 16.4-6.2 22.6 0s6.2 16.4 0 22.6z"/>
  </svg>
);

// Archetype card within ancestry
function ArchetypeItem({ archetype, allTraits, onUse, onCustomize }) {
  const { name, icon, description, traits } = archetype;

  return (
    <div className="archetype-item">
      <div className="archetype-header">
        <div className="archetype-header-content flex1">
          <h5>
            {icon && <span className="archetype-icon">{icon}</span>}
            {name}
          </h5>
          {description && (
            <p className="archetype-desc">{description}</p>
          )}
        </div>
        <div className="archetype-header-actions">
          <button 
            className="btn btn-secondary btn-icon-only"
            onClick={onCustomize}
            title="Customize in builder"
            aria-label="Customize in builder"
          >
            <PencilIcon />
          </button>
          <button 
            className="btn btn-primary"
            onClick={onUse}
          >
            Use
          </button>
        </div>
      </div>
      {traits?.length > 0 && (
        <div className="archetype-traits">
          {traits.filter(Boolean).map((trait, idx) => (
            <TraitDisplay
              key={`${trait.id || 'trait'}-${idx}`}
              trait={trait}
              allTraits={allTraits}
            />
          ))}
        </div>
      )}
    </div>
  );
}
