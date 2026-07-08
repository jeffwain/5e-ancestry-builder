import ReactMarkdown from 'react-markdown';
import { SummaryTraitCard } from '../SummaryTraitCard';
import { Accordion } from '../Accordion';
import { resolveTrait } from '../../utils/ancestryResolve';
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
            <div className="ancestry-description">
              <ReactMarkdown>{description}</ReactMarkdown>
            </div>
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
          <div className="archetype-radio-text">
            <span className="archetype-radio-name">{name}.</span>
            {description && (
              <div className="archetype-desc">
                <ReactMarkdown>{description}</ReactMarkdown>
              </div>
            )}
          </div>
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
