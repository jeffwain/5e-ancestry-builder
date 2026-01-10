import { useCharacter } from '../../contexts/CharacterContext';
import styles from './TraitCard.module.css';

export function TraitCard({ trait }) {
  const { toggleTrait, isTraitSelected, canSelectTrait } = useCharacter();
  const selected = isTraitSelected(trait.id);
  const { canSelect, reason } = canSelectTrait(trait);
  const disabled = !selected && !canSelect;

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

  const cardClass = [
    styles.card,
    selected && styles.selected,
    disabled && styles.disabled,
    trait.required && styles.required
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
        <span className={`${styles.cost} ${trait.points === 0 ? styles.free : ''}`}>
          {trait.points === 0 ? 'Free' : `${trait.points} pts`}
        </span>
      </div>
      
      <p className={styles.description}>{trait.description}</p>
      
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
