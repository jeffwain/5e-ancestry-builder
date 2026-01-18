import { useCharacter } from '../../contexts/CharacterContext';
import { TraitTooltip } from '../TraitTooltip';
import './TraitCard.css';

export function TraitCard({ trait, compact = false }) {
  const { 
    toggleTrait, 
    isTraitSelected, 
    canSelectTrait,
    canDeselectTrait,
    selectedOptions, 
    setTraitOption,
    allTraits
  } = useCharacter();
  
  const selected = isTraitSelected(trait.id);
  const { canSelect, reason } = canSelectTrait(trait);
  const { canDeselect, reason: lockedReason } = canDeselectTrait(trait);
  const disabled = !selected && !canSelect;
  const locked = selected && !canDeselect; // Can't deselect (required category)
  const hasOptions = trait.options && trait.options.length > 0;
  const selectedOptionId = selectedOptions[trait.id];

  // Generate requirement label (shown always, not just when disabled)
  const requiresLabel = trait.requires?.length 
    ? `Requires ${trait.requires.map(id => allTraits[id]?.name || id).join(', ')}`
    : null;

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

  // Scroll to required trait and highlight it
  const scrollToRequiredTrait = (e) => {
    e.stopPropagation(); // Don't toggle this trait
    if (!trait.requires?.length) return;
    // Find the first required trait that's not selected
    const targetId = trait.requires[0];
    const targetEl = document.querySelector(`[data-trait-id="${targetId}"]`);
    if (targetEl) {
      targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      // Trigger highlight animation
      targetEl.classList.remove('highlight-flash');
      void targetEl.offsetWidth; // Force reflow
      targetEl.classList.add('highlight-flash');
    }
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

  // Get selected option name for compact view
  const selectedOptionName = hasOptions && selectedOptionId 
    ? trait.options.find(o => o.id === selectedOptionId)?.name 
    : null;

  const cardClass = [
    'card-trait',
    selected && 'selected',
    disabled && 'disabled',
    locked && 'locked',
    trait.required && 'required',
    hasOptions && 'has-options',
    compact && 'compact'
  ].filter(Boolean).join(' ');

  const getPointsLabel = (points) => {
    if (points === 0) return 'Free';
    if (points === 1) return <><span className="points">{points}</span>&nbsp;pt</>;
    return <><span className="points">{points}</span>&nbsp;pts</>;
  };

  // Helper for pill classes
  const pillClass = (...modifiers) => 
    ['pill', ...modifiers.filter(Boolean)].join(' ');

  // Compact view - just show name, selected option, and cost
  if (compact) {
    return (
      <TraitTooltip trait={trait} selectedOptions={selectedOptions}>
        <div
          className={cardClass}
          onClick={handleClick}
          onKeyDown={handleKeyDown}
          role="checkbox"
          aria-checked={selected}
          tabIndex={0}
        >
          <div className="header">
            <h4 className="flex1 name">
              {trait.name}
              {selectedOptionName && (
                <span className={'selected-option'}>{selectedOptionName}</span>
              )}
          </h4>
          <span className={pillClass('cost', displayCost === 0 && 'free')}>
            {getPointsLabel(displayCost)}
          </span>
        </div>
        </div>
      </TraitTooltip>
    );
  }

  return (
    <div
      className={cardClass}
      data-trait-id={trait.id}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role="checkbox"
      aria-checked={selected}
      aria-disabled={disabled}
      tabIndex={disabled ? -1 : 0}
      title={disabled ? reason : locked ? lockedReason : undefined}
    >
      <div className="header">
        <h4 className="flex1 name">{trait.name}</h4>
        {trait.required && (
          <span className={pillClass('required')}>Required</span>
        )}
        <span className={pillClass('cost', displayCost === 0 && 'free')}>
          {getPointsLabel(displayCost)}
        </span>
      </div>
      
      <p className="description">{trait.description}</p>
      
      {/* Options selection - shown when trait is selected */}
      {hasOptions && selected && (
        <div className="options">
          <div className="options-label">
            {trait.requiresOption ? 'Choose one:' : 'Options:'}
          </div>
          {trait.options.map(option => (
            <label 
              key={option.id} 
              className={`option ${selectedOptionId === option.id ? 'selected' : ''}`}
              onClick={(e) => handleOptionSelect(e, option.id)}
            >
              <input
                type="radio"
                name={`${trait.id}-option`}
                checked={selectedOptionId === option.id}
                onChange={() => {}}
                className="option-radio"
              />
              <span className="option-content-container">
                <span className="option-content">
                  <span className="option-name">{option.name}</span>
                  {option.points !== undefined && (
                    <span className={pillClass('option-cost')}>
                      {getPointsLabel(option.points)}
                    </span>
                  )}
                </span>
                {option.description && (
                  <span className="description">{option.description}</span>
                )}
              </span>
            </label>
          ))}
        </div>
      )}
      
      {requiresLabel && (
        <div 
          className={`pill requirement ${disabled ? 'unmet' : 'met'} clickable`}
          onClick={scrollToRequiredTrait}
        >
          {requiresLabel}
        </div>
      )}
      
      {trait.restriction && (
        <span className={pillClass('restriction')}>
          {trait.restriction.label}
        </span>
      )}
    </div>
  );
}
