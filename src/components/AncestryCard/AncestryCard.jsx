import { SummaryTraitCard } from '../SummaryTraitCard';
import './AncestryCard.css';

export function AncestryCard({
  ancestry,
  allTraits = {},
  isExpanded,
  onToggle,
  selectedArchetype,
  onSelectArchetype,
  showDetails = false
}) {
  const { name, summary, description, traits, archetypes } = ancestry;

  // Count shared traits
  const sharedTraitCount = traits?.length || 0;

  return (
    <article className={`ancestry-card ${isExpanded ? 'expanded' : ''}`}>
      <div className="ancestry-card-header" onClick={onToggle}>
        <div className="ancestry-card-title">
          <h3>{name}</h3>
          {/* <p className="ancestry-summary">{summary}</p> */}
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
          {showDetails === true && traits?.length > 0 && (
            <div className="traits-section">
              <h4>Shared Traits</h4>
              <p className="traits-note">All members of this ancestry gain these traits:</p>
              <div className="trait-list">
                {traits.map((trait, idx) => (
                  <TraitDisplay
                    key={`${trait.id || 'trait'}-${idx}`}
                    trait={trait}
                    allTraits={allTraits}
                    showDetails={showDetails}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Archetypes — radio-style selection */}
          {archetypes?.length > 0 && (
            <div className="archetypes-section">
              <h4>Archetypes</h4>
              <div className="archetype-list">
                {archetypes.map((archetype) => (
                  <ArchetypeRadioItem
                    key={archetype.id}
                    archetype={archetype}
                    allTraits={allTraits}
                    isSelected={selectedArchetype === archetype.id}
                    onSelect={() => onSelectArchetype?.(archetype.id)}
                    showDetails={showDetails}
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
export function resolveTrait(trait, allTraits) {
  // No ID means it's a fully custom trait
  if (!trait.id) {
    return trait;
  }

  // Look up base trait from database
  const baseTrait = allTraits[trait.id];

  // If not found in database, generate a display name from the ID if missing
  if (!baseTrait) {
    if (!trait.name && trait.id) {
      return { ...trait, name: trait.id.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) };
    }
    return trait;
  }

  // Start with base trait
  const resolved = { ...baseTrait };

  // Handle specific overrides from ancestry definition
  if (trait.name && trait.name !== baseTrait.name) {
    resolved.nameOverride = trait.name;
  }
  if (trait.description && trait.description !== baseTrait.description) {
    resolved.descriptionOverride = trait.description;
  }
  if (trait.summary && trait.summary !== baseTrait.summary) {
    resolved.summaryOverride = trait.summary;
  }
  if (trait.points !== undefined && trait.points !== baseTrait.points) {
    resolved.pointsOverride = trait.points;
  }

  return resolved;
}

// Collect all resolved traits for an ancestry + archetype combo
// Returns { traits: [...], options: { traitId: optionId, ... } }
export function getResolvedTraitsAndOptions(ancestry, archetype, allTraits) {
  const options = {};

  const resolveTraitWithOptions = (traitDef) => {
    const resolved = resolveTrait(traitDef, allTraits);
    if (traitDef.option && resolved.id) {
      options[resolved.id] = traitDef.option;
    }
    return resolved;
  };

  const ancestryTraits = (ancestry.traits || []).map(t => resolveTraitWithOptions(t));
  const archetypeTraits = (archetype.traits || []).map(t => resolveTraitWithOptions(t));
  const combinedTraits = [...ancestryTraits, ...archetypeTraits];

  return { traits: combinedTraits, options };
}

// Wrapper for trait display - resolves ID references from allTraits
function TraitDisplay({ trait, allTraits, showDetails = false }) {
  const resolvedTrait = resolveTrait(trait, allTraits);

  // If we couldn't resolve and there's no name, show error state
  if (!resolvedTrait.name) {
    return (
      <div className="simple-trait-card trait-error">
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
      compact
      showDetails={false}
      showFooter={false}
    />
  );
}

// Radio-style archetype item (replaces the old ArchetypeItem with action buttons)
function ArchetypeRadioItem({ archetype, allTraits, isSelected, onSelect, showDetails = false }) {
  const { name, icon, description, traits } = archetype;

  return (
    <label
      className={`archetype-radio-item ${isSelected ? 'selected' : ''}`}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="archetype-radio-header">
        <input
          type="radio"
          name="archetype-selection"
          checked={isSelected}
          onChange={onSelect}
          className="archetype-radio-input"
        />
        <div className="archetype-radio-content">
          <span className="archetype-radio-name">
            {/* {icon && <span className="archetype-icon">{icon}</span>} */}
            {name}.
          </span>
          {description && (
            <span className="archetype-desc">{description}</span>
          )}
        </div>
      </div>
      {showDetails === true && isSelected && traits?.length > 0 && (
        <div className="archetype-traits">
          {traits.filter(Boolean).map((trait, idx) => (
            <TraitDisplay
              key={`${trait.id || 'trait'}-${idx}`}
              trait={trait}
              allTraits={allTraits}
              showDetails={showDetails}
            />
          ))}
        </div>
      )}
    </label>
  );
}
