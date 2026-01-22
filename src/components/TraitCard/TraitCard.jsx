import ReactMarkdown from 'react-markdown';
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

  // Calculate display cost (0 is valid, undefined/null/'' means no cost to show)
  let displayCost = trait.points;
  if (trait.points === undefined || trait.points === null || trait.points === '') {
    displayCost = null;
  }
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

  // Get selected option for compact view
  const selectedOption = hasOptions && selectedOptionId 
    ? trait.options.find(o => o.id === selectedOptionId) 
    : null;
  
  // For compact view: show option name as main label if selected
  const compactDisplayName = selectedOption ? selectedOption.name : trait.name;

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
    if (!points || points === '') return null;
    if (points === 1) return <><span className="points">{points}</span>&nbsp;pt</>;
    return <><span className="points">{points}</span>&nbsp;pts</>;
  };

  // Render cost pill with appropriate styling
  const renderCostPill = (cost, className = '') => {
    // Don't render if cost is undefined/null/empty
    if (cost === undefined || cost === null || cost === '') return (
      
      <span className={`pill pill-icon-only cost ${cost === 0 ? 'free' : ''} ${className}`}>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"> /*Font Awesome Free v7.1.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2026 Fonticons, Inc.*/ <path d="M434.8 70.1c14.3 10.4 17.5 30.4 7.1 44.7l-256 352c-5.5 7.6-14 12.3-23.4 13.1s-18.5-2.7-25.1-9.3l-128-128c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0l101.5 101.5 234-321.7c10.4-14.3 30.4-17.5 44.7-7.1z"/></svg>
      </span>
    )
    return (
      <span className={`pill cost ${cost === 0 ? 'free' : ''} ${className}`}>
        {getPointsLabel(cost)}
      </span>
    );
  };

  // Compact view - show option name as primary label if selected
  if (compact) {
    return (
      <TraitTooltip trait={trait} selectedOptions={selectedOptions}>
        <div
          className={cardClass}
          data-trait-id={trait.id}
          onClick={handleClick}
          onKeyDown={handleKeyDown}
          role="checkbox"
          aria-checked={selected}
          tabIndex={0}
        >
          <div className="header">
            <h4 className="flex1 name">{compactDisplayName}</h4>
            {renderCostPill(displayCost)}
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
        {trait.required && <span className={`pill required`}>Required</span>}
        {renderCostPill(displayCost)}
      </div>
      
      <div className="description">
        <ReactMarkdown>{trait.description}</ReactMarkdown>
      
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
                    {renderCostPill(option.points, 'option-cost')}
                </span>
                {option.description && (
                  <span className="description">
                    <ReactMarkdown>{option.description}</ReactMarkdown>
                  </span>
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
        <span className={`pill restriction`}>
          {trait.restriction.label}
        </span>
      )}
      </div>
    </div>
  );
}
