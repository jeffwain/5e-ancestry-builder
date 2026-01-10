import { useState, useEffect, useRef } from 'react';
import { TraitCard } from '../TraitCard';
import { useCharacter } from '../../contexts/CharacterContext';
import styles from './TraitCategory.module.css';

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
    styles.category,
    type && styles[type],
    !isExpanded && styles.collapsed
  ].filter(Boolean).join(' ');

  return (
    <div className={categoryClass}>
      <button 
        className={styles.header}
        onClick={toggleExpand}
        aria-expanded={isExpanded}
      >
        <div className={styles.headerContent}>
          <h3 className={styles.name}>{category.name}</h3>
          {showPill && pillText && (
            <span className={`${styles.pill} ${styles[type]}`}>
              {pillText}
            </span>
          )}
          {!isExpanded && hasSelectedTraits && (
            <span className={styles.selectedCount}>{selectedTraits.length} selected</span>
          )}
        </div>
        <span className={`${styles.chevron} ${isExpanded ? styles.expanded : ''}`}>
          ▼
        </span>
      </button>

      {category.description && isExpanded && (
        <p className={styles.description}>{category.description}</p>
      )}

      {/* Show selected traits when collapsed */}
      {!isExpanded && hasSelectedTraits && (
        <div className={styles.selectedTraits}>
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
        <div className={styles.traitList}>
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
  );
}

// Core attributes section (size, speed, darkvision, sizeTraits)
export function CoreAttributeSection({ 
  attribute, 
  attributeId,
  expandSignal // { expanded: boolean, version: number } - triggers batch expand/collapse
}) {
  const [isExpanded, setIsExpanded] = useState(true);
  const { selectedTraitIds, selectedSize } = useCharacter();
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

  // For sizeTraits section, check if trait's sizeRequirement matches selected size
  const isSizeTraitsSection = attributeId === 'sizeTraits';
  const shouldShowCompact = (trait) => {
    // Only apply compact logic to sizeTraits section when a size is selected
    if (isSizeTraitsSection && selectedSize && trait.sizeRequirement) {
      return trait.sizeRequirement !== selectedSize;
    }
    return false;
  };

  return (
    <div className={`${styles.category} ${styles.coreAttribute} ${!isExpanded ? styles.collapsed : ''}`}>
      <button 
        className={styles.header}
        onClick={() => setIsExpanded(!isExpanded)}
        aria-expanded={isExpanded}
      >
        <div className={styles.headerContent}>
          <h3 className={styles.name}>{attribute.name}</h3>
          {attribute.required && (
            <span className={styles.requiredPill}>Required</span>
          )}
          {!isExpanded && hasSelectedTraits && (
            <span className={styles.selectedCount}>{selectedTraits.length} selected</span>
          )}
        </div>
        <span className={`${styles.chevron} ${isExpanded ? styles.expanded : ''}`}>
          ▼
        </span>
      </button>

      {attribute.description && isExpanded && (
        <p className={styles.description}>{attribute.description}</p>
      )}

      {/* Show selected traits when collapsed */}
      {!isExpanded && hasSelectedTraits && (
        <div className={styles.selectedTraits}>
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

      {/* Show all traits when expanded */}
      {isExpanded && (
        <div className={styles.traitList}>
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
  );
}
