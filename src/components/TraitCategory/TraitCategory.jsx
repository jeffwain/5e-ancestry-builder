import { useState } from 'react';
import { TraitCard } from '../TraitCard';
import styles from './TraitCategory.module.css';

export function TraitCategory({ category, categoryId, type, showBadge = true }) {
  const [isExpanded, setIsExpanded] = useState(true);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  // Get the required trait if there is one
  const requiredTrait = category.traits?.find(t => t.required);

  const categoryClass = [
    styles.category,
    type && styles[type]
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
          {showBadge && type && (
            <span className={`${styles.badge} ${styles[type]}`}>
              {type}
            </span>
          )}
          {requiredTrait && (
            <span className={styles.requiredIndicator} title={`${requiredTrait.name} is required`}>
              ★
            </span>
          )}
        </div>
        <span className={`${styles.chevron} ${isExpanded ? styles.expanded : ''}`}>
          ▼
        </span>
      </button>

      {category.description && isExpanded && (
        <p className={styles.description}>{category.description}</p>
      )}

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

// Sub-category for heritage groups (planar, bestial, other)
export function HeritageGroup({ groupId, groupName, categories }) {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className={styles.heritageGroup}>
      <button 
        className={styles.groupHeader}
        onClick={() => setIsExpanded(!isExpanded)}
        aria-expanded={isExpanded}
      >
        <h2 className={styles.groupName}>{groupName}</h2>
        <span className={`${styles.chevron} ${isExpanded ? styles.expanded : ''}`}>
          ▼
        </span>
      </button>

      {isExpanded && (
        <div className={styles.groupContent}>
          {Object.entries(categories).map(([catId, category]) => (
            <TraitCategory 
              key={catId}
              category={category}
              categoryId={catId}
              type="heritage"
              showBadge={false}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// Core attributes section (size, speed, darkvision)
export function CoreAttributeSection({ attribute, attributeId }) {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className={`${styles.category} ${styles.coreAttribute}`}>
      <button 
        className={styles.header}
        onClick={() => setIsExpanded(!isExpanded)}
        aria-expanded={isExpanded}
      >
        <div className={styles.headerContent}>
          <h3 className={styles.name}>{attribute.name}</h3>
          {attribute.required && (
            <span className={styles.requiredBadge}>Required</span>
          )}
        </div>
        <span className={`${styles.chevron} ${isExpanded ? styles.expanded : ''}`}>
          ▼
        </span>
      </button>

      {attribute.description && isExpanded && (
        <p className={styles.description}>{attribute.description}</p>
      )}

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
