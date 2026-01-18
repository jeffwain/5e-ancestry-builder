import { useState, useEffect, useRef } from 'react';
import { TraitCard } from '../TraitCard';
import { useCharacter } from '../../contexts/CharacterContext';
import './TraitCategory.css';

export function TraitCategory({ 
  category, 
  categoryId, 
  type, 
  showPill = true,
  expandSignal // { expanded: boolean, version: number } - triggers batch expand/collapse
}) {
  const [isExpanded, setIsExpanded] = useState(true);
  const { selectedTraitIds } = useCharacter();
  const lastSignalVersion = useRef(expandSignal?.version ?? 0);

  // Respond to parent expand/collapse signal (only when version changes)
  useEffect(() => {
    if (expandSignal && expandSignal.version !== lastSignalVersion.current) {
      setIsExpanded(expandSignal.expanded);
      lastSignalVersion.current = expandSignal.version;
    }
  }, [expandSignal]);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  // Get the required trait if there is one
  const requiredTrait = category.traits?.find(t => t.required);
  
  // Get selected traits from this category
  const selectedTraits = category.traits?.filter(t => selectedTraitIds.includes(t.id)) || [];
  const hasSelectedTraits = selectedTraits.length > 0;

  // Use category.label if available (e.g. "Planar Ancestry"), otherwise fall back to type
  const pillText = category.label || type;

  const categoryClass = [
    'category-trait',
    type,
    !isExpanded && 'collapsed'
  ].filter(Boolean).join(' ');

  return (
    <div className={categoryClass}>
      <button 
        className="header"
        onClick={toggleExpand}
        aria-expanded={isExpanded}
      >
        <div className="header-content">
          <h3 className="name">{category.name}</h3>
          {showPill && pillText && (
            <span className={`pill type on-dark ${type}`}>
              {pillText}
            </span>
          )}
        </div>
        <span className={`chevron ${isExpanded ? 'expanded' : ''}`}>
          ▼
        </span>
      </button>
      <div className="trait-category-content">
        {category.description && isExpanded && (
          <p className="description">{category.description}</p>
        )}

        {/* Show selected traits when collapsed */}
        {!isExpanded && hasSelectedTraits && (
          <div className="selected-traits">
            {selectedTraits.map(trait => (
              <TraitCard 
                key={trait.id} 
                trait={{
                  ...trait,
                  type: type,
                  categoryId: categoryId,
                  categoryName: category.name
                }}
                compact
              />
            ))}
          </div>
        )}

        {/* Show all traits when expanded */}
        {isExpanded && (
          <div className="trait-list">
            {category.traits?.map(trait => (
              <TraitCard 
                key={trait.id} 
                trait={{
                  ...trait,
                  type: type,
                  categoryId: categoryId,
                  categoryName: category.name
                }} 
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Core attributes section (size, speed, darkvision, sizeTraits)
export function CoreAttributeSection({ 
  attribute, 
  attributeId,
  expandSignal // { expanded: boolean, version: number } - triggers batch expand/collapse
}) {
  const [isExpanded, setIsExpanded] = useState(true);
  const { selectedTraitIds, selectedSize, warnings } = useCharacter();
  const lastSignalVersion = useRef(expandSignal?.version ?? 0);

  // Respond to parent expand/collapse signal (only when version changes)
  useEffect(() => {
    if (expandSignal && expandSignal.version !== lastSignalVersion.current) {
      setIsExpanded(expandSignal.expanded);
      lastSignalVersion.current = expandSignal.version;
    }
  }, [expandSignal]);

  // Get selected traits from this attribute
  const selectedTraits = attribute.traits?.filter(t => selectedTraitIds.includes(t.id)) || [];
  const hasSelectedTraits = selectedTraits.length > 0;

  // Check if this category has a required warning (nothing selected from required category)
  const hasRequiredWarning = attribute.required && 
    warnings.some(w => w.type === 'required-category' && w.categoryId === attributeId);

  // For sizeTraits section, filter traits based on selected size
  const isSizeTraitsSection = attributeId === 'sizeTraits';
  const shouldShowCompact = (trait) => {
    // Only apply compact logic to sizeTraits section when a size is selected
    if (isSizeTraitsSection && selectedSize && trait.requires?.length) {
      const sizeReq = trait.requires.find(r => r.startsWith('size-'));
      return sizeReq && sizeReq !== `size-${selectedSize}`;
    }
    return false;
  };

  const categoryClass = [
    'category-trait',
    'core-attribute',
    !isExpanded && 'collapsed',
    hasRequiredWarning && 'missing-required'
  ].filter(Boolean).join(' ');

  return (
    <div className={categoryClass}>
      <button 
        className="header"
        onClick={() => setIsExpanded(!isExpanded)}
        aria-expanded={isExpanded}
      >
        <div className="header-content">
          <h3 className="name">{attribute.name}</h3>
          {attribute.required && (
            <span className="pill required">Required</span>
          )}
        </div>
        <span className={`chevron ${isExpanded ? 'expanded' : ''}`}>
          ▼
        </span>
      </button>
      <div className="trait-category-content">
        {attribute.description && isExpanded && (
          <p className="description">{attribute.description}</p>
        )}

        {/* Show selected traits when collapsed */}
        {!isExpanded && hasSelectedTraits && (
          <div className="selected-traits">
            {selectedTraits.map(trait => (
              <TraitCard 
                key={trait.id} 
                trait={{
                  ...trait,
                  type: 'core',
                  categoryId: attributeId,
                  categoryName: attribute.name
                }}
                compact
              />
            ))}
          </div>
        )}

        {/* Show empty state when collapsed with no selections */}
        {!isExpanded && !hasSelectedTraits && (
          <div className="empty-state">No traits selected.</div>
        )}

        {/* Show all traits when expanded */}
        {isExpanded && (
          <div className="trait-list">
            {attribute.traits?.map(trait => (
              <TraitCard 
                key={trait.id} 
                trait={{
                  ...trait,
                  type: 'core',
                  categoryId: attributeId,
                  categoryName: attribute.name
                }}
                compact={shouldShowCompact(trait)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
