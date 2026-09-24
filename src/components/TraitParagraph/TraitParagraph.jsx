import ReactMarkdown from 'react-markdown';
import { useCharacter } from '../../contexts/CharacterContext';
import { TraitContent } from '../TraitContent';
import { formatBracketCost } from '../../utils/traitDisplay';
import './TraitParagraph.css';

/**
 * One selectable trait, written as a paragraph rather than a card:
 *
 *   Fire Resistance [2]. You have resistance to fire damage.
 *
 * The builder's selectable trait, read as prose. Options are bullets that double as radio buttons, and stay
 * visible whether or not the trait is selected so a block still reads as a
 * complete list of what is on offer.
 */
export function TraitParagraph({ trait }) {
  const {
    toggleTrait,
    selectTrait,
    isTraitSelected,
    canSelectTrait,
    canDeselectTrait,
    selectedOptions,
    setTraitOption,
    allTraits,
  } = useCharacter();

  const selected = isTraitSelected(trait.id);
  const { canSelect, reason } = canSelectTrait(trait);
  const { canDeselect, reason: lockedReason } = canDeselectTrait(trait);
  const disabled = !selected && !canSelect;
  const locked = selected && !canDeselect;
  const hasOptions = trait.options?.length > 0;
  const selectedOptionId = selectedOptions[trait.id];

  // Named requirements and restrictions read as a trailing note rather than a
  // pill — pills would break the paragraph back into a card.
  const requiresNote = trait.requires?.length
    ? `Requires ${trait.requires.map(id => allTraits[id]?.name || id).join(', ')}.`
    : null;
  const restrictionNote = trait.restriction?.label || trait.restriction || null;

  const handleClick = () => {
    if (disabled) return;
    toggleTrait(trait);
  };

  const handleKeyDown = (e) => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    e.preventDefault();
    handleClick();
  };

  // Picking an option is also a way to pick the trait, so an unselected trait
  // gets selected first — otherwise the choice would go nowhere.
  const handleOptionSelect = (e, optionId) => {
    e.stopPropagation();
    if (disabled) return;
    if (!selected) selectTrait(trait);
    setTraitOption(trait.id, optionId);
  };

  const handleOptionKeyDown = (e, optionId) => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    e.preventDefault();
    handleOptionSelect(e, optionId);
  };

  const className = [
    'trait-paragraph',
    selected && 'selected',
    disabled && 'disabled',
    locked && 'locked',
    hasOptions && 'has-options',
  ].filter(Boolean).join(' ');

  return (
    <div
      className={className}
      data-trait-id={trait.id}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role="checkbox"
      aria-checked={selected}
      aria-disabled={disabled}
      tabIndex={disabled ? -1 : 0}
      title={disabled ? reason : locked ? lockedReason : undefined}
    >
      <TraitContent trait={trait} selectedOptions={selectedOptions} variant="paragraph">
        {(requiresNote || restrictionNote) && (
          <span className="trait-paragraph-note">
            {' '}
            {[restrictionNote, requiresNote].filter(Boolean).join(' ')}
          </span>
        )}

        {hasOptions && (
          <ul className="trait-paragraph-options">
            {trait.options.map((option) => {
              const chosen = selectedOptionId === option.id;
              return (
                <li
                  key={option.id}
                  className={`trait-paragraph-option${chosen ? ' selected' : ''}`}
                >
                  <label onClick={(e) => handleOptionSelect(e, option.id)}>
                    <input
                      type="radio"
                      name={`${trait.id}-paragraph-option`}
                      checked={chosen}
                      disabled={disabled}
                      onChange={() => {}}
                      onKeyDown={(e) => handleOptionKeyDown(e, option.id)}
                      className="trait-paragraph-option-radio"
                    />
                    <span className="trait-paragraph-option-text">
                      <span className="trait-paragraph-option-name">{option.name}</span>
                      {formatBracketCost(option.points) && (
                        <span className="trait-content-cost"> [{formatBracketCost(option.points)}]</span>
                      )}
                      {option.description && (
                        <span className="trait-paragraph-option-desc">
                          . <ReactMarkdown>{option.description}</ReactMarkdown>
                        </span>
                      )}
                    </span>
                  </label>
                </li>
              );
            })}
          </ul>
        )}
      </TraitContent>
    </div>
  );
}
