import { SummaryTraitCard } from '../SummaryTraitCard';
import { Accordion } from '../Accordion';
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
  const { name, description, traits, archetypes } = ancestry;

  // Count shared traits
  const sharedTraitCount = traits?.length || 0;

  const meta = (
    <>
      <span className="pill count heritage">{sharedTraitCount} shared traits</span>
      {archetypes?.length > 0 && (
        <span className="pill type on-dark">{archetypes.length} archetypes</span>
      )}
    </>
  );

  return (
    <Accordion
      type="heritage"
      className="ancestry-accordion"
      title={<h3 className="name">{name}</h3>}
      meta={meta}
      isOpen={isExpanded}
      onToggle={onToggle}
    >
      {(expanded) => (expanded ? (
        <div className="ancestry-accordion-body">
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
      ) : null)}
    </Accordion>
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
function TraitDisplay({ trait, allTraits }) {
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

// Radio-style archetype item
function ArchetypeRadioItem({ archetype, allTraits, isSelected, onSelect, showDetails = false }) {
  const { name, description, traits } = archetype;

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
