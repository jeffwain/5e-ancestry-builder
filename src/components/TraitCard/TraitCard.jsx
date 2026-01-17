import { useCharacter } from '../../contexts/CharacterContext';
import './TraitCard.css';

export function TraitCard({ trait, compact = false }) {
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

  // Get selected option name for compact view
  const selectedOptionName = hasOptions && selectedOptionId 
    ? trait.options.find(o => o.id === selectedOptionId)?.name 
    : null;

  const cardClass = [
    'card-trait',
    selected && 'selected',
    disabled && 'disabled',
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
              <span className={pillClass('selected-option')}>{selectedOptionName}</span>
            )}
          </h4>
          <span className={pillClass('cost', displayCost === 0 && 'free')}>
            {getPointsLabel(displayCost)}
          </span>
        </div>
        <div className="indicator"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><path d="M530.8 134.1C545.1 144.5 548.3 164.5 537.9 178.8L281.9 530.8C276.4 538.4 267.9 543.1 258.5 543.9C249.1 544.7 240 541.2 233.4 534.6L105.4 406.6C92.9 394.1 92.9 373.8 105.4 361.3C117.9 348.8 138.2 348.8 150.7 361.3L252.2 462.8L486.2 141.1C496.6 126.8 516.6 123.6 530.9 134z"/></svg></div>
      </div>
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
      title={disabled ? reason : undefined}
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
                  <span className="option-desc">{option.description}</span>
                )}
              </span>
            </label>
          ))}
        </div>
      )}
      
      {disabled && reason && (
        <div className="pill requirement">
          {reason}
        </div>
      )}
      
      {/* {trait.sizeRequirement && (
        <span className={pillClass('size')}>
          {trait.sizeRequirement} only
        </span>
      )} */}
      
      {trait.armorRestriction && (
        <span className={pillClass('restriction')}>
          No medium/heavy armor
        </span>
      )}
      
      <div className="indicator">
        {selected ? (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" width="16" height="16" fill="currentColor">
            <path d="M530.8 134.1C545.1 144.5 548.3 164.5 537.9 178.8L281.9 530.8C276.4 538.4 267.9 543.1 258.5 543.9C249.1 544.7 240 541.2 233.4 534.6L105.4 406.6C92.9 394.1 92.9 373.8 105.4 361.3C117.9 348.8 138.2 348.8 150.7 361.3L252.2 462.8L486.2 141.1C496.6 126.8 516.6 123.6 530.9 134z"/>
          </svg>
        ) : disabled ? (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512" width="14" height="14" fill="currentColor">
            <path d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3l105.4 105.3c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256l105.3-105.4z"/>
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" width="14" height="14" fill="currentColor">
            <path d="M256 80c0-17.7-14.3-32-32-32s-32 14.3-32 32v144H48c-17.7 0-32 14.3-32 32s14.3 32 32 32h144v144c0 17.7 14.3 32 32 32s32-14.3 32-32V288h144c17.7 0 32-14.3 32-32s-14.3-32-32-32H256V80z"/>
          </svg>
        )}
      </div>
    </div>
  );
}
