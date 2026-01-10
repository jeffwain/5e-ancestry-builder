import { useCharacter } from '../../contexts/CharacterContext';
import styles from './TraitCard.module.css';

export function TraitCard({ trait }) {
  const { 
    toggleTrait, 
    isTraitSelected, 
    canSelectTrait, 
    selectedOptions, 
    setTraitOption 
  } = useCharacter();
  
  const selected = isTraitSelected(trait.id);
  const { canSelect, reason } = canSelectTrait(trait);
  const disabled = !selected && !canSelect;
  const hasOptions = trait.options && trait.options.length > 0;
  const selectedOptionId = selectedOptions[trait.id];

  const handleClick = () => {
    if (disabled) return;
    toggleTrait(trait);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (!disabled) {
        toggleTrait(trait);
      }
    }
  };

  const handleOptionSelect = (e, optionId) => {
    e.stopPropagation(); // Don't toggle the trait
    setTraitOption(trait.id, optionId);
  };

  // Calculate display cost
  let displayCost = trait.points;
  if (hasOptions && trait.requiresOption) {
    if (selectedOptionId) {
      const opt = trait.options.find(o => o.id === selectedOptionId);
      displayCost = opt?.points ?? 0;
    } else {
      // Show range if no option selected
      const costs = trait.options.map(o => o.points || 0);
      const min = Math.min(...costs);
      const max = Math.max(...costs);
      displayCost = min === max ? min : `${min}-${max}`;
    }
  }

  const cardClass = [
    styles.card,
    selected && styles.selected,
    disabled && styles.disabled,
    trait.required && styles.required,
    hasOptions && styles.hasOptions
  ].filter(Boolean).join(' ');

  return (
    <div
      className={cardClass}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role="checkbox"
      aria-checked={selected}
      aria-disabled={disabled}
      tabIndex={disabled ? -1 : 0}
      title={disabled ? reason : undefined}
    >
      <div className={styles.header}>
        <h4 className={styles.name}>{trait.name}</h4>
        <span className={`${styles.cost} ${displayCost === 0 ? styles.free : ''}`}>
          {displayCost === 0 ? 'Free' : typeof displayCost === 'string' ? `${displayCost} pts` : `${displayCost} pts`}
        </span>
      </div>
      
      <p className={styles.description}>{trait.description}</p>
      
      {/* Options selection - shown when trait is selected */}
      {hasOptions && selected && (
        <div className={styles.options}>
          <div className={styles.optionsLabel}>
            {trait.requiresOption ? 'Choose one:' : 'Options:'}
          </div>
          {trait.options.map(option => (
            <label 
              key={option.id} 
              className={`${styles.option} ${selectedOptionId === option.id ? styles.optionSelected : ''}`}
              onClick={(e) => handleOptionSelect(e, option.id)}
            >
              <input
                type="radio"
                name={`${trait.id}-option`}
                checked={selectedOptionId === option.id}
                onChange={() => {}}
                className={styles.optionRadio}
              />
              <span className={styles.optionContent}>
                <span className={styles.optionName}>{option.name}</span>
                {option.points !== undefined && (
                  <span className={styles.optionCost}>
                    {option.points === 0 ? 'Free' : `${option.points} pts`}
                  </span>
                )}
              </span>
              {option.description && (
                <span className={styles.optionDesc}>{option.description}</span>
              )}
            </label>
          ))}
        </div>
      )}
      
      {disabled && reason && (
        <div className={styles.disabledReason}>
          {reason}
        </div>
      )}
      
      {trait.required && (
        <div className={styles.requiredBadge}>Required</div>
      )}
      
      {trait.sizeRequirement && (
        <div className={styles.sizeBadge}>
          {trait.sizeRequirement} only
        </div>
      )}
      
      {trait.armorRestriction && (
        <div className={styles.restrictionBadge}>
          No medium/heavy armor
        </div>
      )}
      
      <div className={styles.indicator}>
        {selected ? '✓' : disabled ? '✕' : '+'}
      </div>
    </div>
  );
}
