import { useState, useEffect } from 'react';
import { TraitCard } from '../TraitCard';
import { useCharacter } from '../../contexts/CharacterContext';
import styles from './TraitCategory.module.css';

export function TraitCategory({ 
  category, 
  categoryId, 
  type, 
  showBadge = true,
  forceExpanded // External control: true = expanded, false = collapsed, undefined = use local state
}) {
  const [localExpanded, setLocalExpanded] = useState(true);
  const { selectedTraitIds } = useCharacter();

  // Use external control if provided, otherwise use local state
  const isExpanded = forceExpanded !== undefined ? forceExpanded : localExpanded;

  const toggleExpand = () => {
    setLocalExpanded(!localExpanded);
  };

  // Sync local state when forceExpanded changes
  useEffect(() => {
    if (forceExpanded !== undefined) {
      setLocalExpanded(forceExpanded);
    }
  }, [forceExpanded]);

  // Get the required trait if there is one
  const requiredTrait = category.traits?.find(t => t.required);
  
  // Get selected traits from this category
  const selectedTraits = category.traits?.filter(t => selectedTraitIds.includes(t.id)) || [];
  const hasSelectedTraits = selectedTraits.length > 0;

  // Use category.label if available (e.g. "Planar Ancestry"), otherwise fall back to type
  const badgeText = category.label || type;

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
          {showBadge && badgeText && (
            <span className={`${styles.badge} ${styles[type]}`}>
              {badgeText}
            </span>
          )}
          {requiredTrait && (
            <span className={styles.requiredIndicator} title={`${requiredTrait.name} is required`}>
              ★
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

// Core attributes section (size, speed, darkvision)
export function CoreAttributeSection({ 
  attribute, 
  attributeId,
  forceExpanded // External control
}) {
  const [localExpanded, setLocalExpanded] = useState(true);
  const { selectedTraitIds } = useCharacter();

  const isExpanded = forceExpanded !== undefined ? forceExpanded : localExpanded;

  // Sync local state when forceExpanded changes
  useEffect(() => {
    if (forceExpanded !== undefined) {
      setLocalExpanded(forceExpanded);
    }
  }, [forceExpanded]);

  // Get selected traits from this attribute
  const selectedTraits = attribute.traits?.filter(t => selectedTraitIds.includes(t.id)) || [];
  const hasSelectedTraits = selectedTraits.length > 0;

  return (
    <div className={`${styles.category} ${styles.coreAttribute} ${!isExpanded ? styles.collapsed : ''}`}>
      <button 
        className={styles.header}
        onClick={() => setLocalExpanded(!localExpanded)}
        aria-expanded={isExpanded}
      >
        <div className={styles.headerContent}>
          <h3 className={styles.name}>{attribute.name}</h3>
          {attribute.required && (
            <span className={styles.requiredBadge}>Required</span>
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
            />
          ))}
        </div>
      )}
    </div>
  );
}
