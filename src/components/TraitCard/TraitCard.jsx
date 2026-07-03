import ReactMarkdown from 'react-markdown';
import { useCharacter } from '../../contexts/CharacterContext';
import { TraitTooltip } from '../TraitTooltip';
import { TraitContent } from '../TraitContent';
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
    const targetId = trait.requires[0];
    const targetEl = document.querySelector(`[data-trait-id="${targetId}"]`);
    if (targetEl) {
      targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      targetEl.classList.remove('highlight-flash');
      void targetEl.offsetWidth; // Force reflow
      targetEl.classList.add('highlight-flash');
    }
  };

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

  // Cost pill for the per-option rows inside the options block.
  const renderOptionCostPill = (cost) => {
    if (cost === undefined || cost === null || cost === '') {
      return (
        <span className="pill pill-icon-only cost option-cost">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
            <path d="M434.8 70.1c14.3 10.4 17.5 30.4 7.1 44.7l-256 352c-5.5 7.6-14 12.3-23.4 13.1s-18.5-2.7-25.1-9.3l-128-128c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0l101.5 101.5 234-321.7c10.4-14.3 30.4-17.5 44.7-7.1z" />
          </svg>
        </span>
      );
    }
    return (
      <span className={`pill cost option-cost ${cost === 0 ? 'free' : ''}`}>
        {getPointsLabel(cost)}
      </span>
    );
  };

  // Compact view - shared header only (selected option name shown by TraitContent)
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
          <TraitContent trait={trait} selectedOptions={selectedOptions} variant="card-compact" />
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
      <TraitContent
        trait={trait}
        selectedOptions={selectedOptions}
        variant="card"
        headerExtra={trait.required ? <span className="pill required">Required</span> : null}
      >
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
                    {renderOptionCostPill(option.points)}
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
          <span className="pill restriction">
            {trait.restriction.label}
          </span>
        )}
      </TraitContent>
    </div>
  );
}
