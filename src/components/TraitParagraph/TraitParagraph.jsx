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
export function TraitParagraph({ trait, exclusive = false }) {
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
  // A trait you can't take says why, in place of the plain requirement.
  const blockedNote = disabled && reason ? reason : null;

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
    exclusive && 'exclusive',
  ].filter(Boolean).join(' ');

  return (
    <div
      className={className}
      data-trait-id={trait.id}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role={exclusive ? 'radio' : 'checkbox'}
      aria-checked={selected}
      aria-disabled={disabled}
      tabIndex={disabled ? -1 : 0}
      title={disabled ? reason : locked ? lockedReason : undefined}
    >
      <span className="trait-paragraph-box" aria-hidden="true" />
      {/* No selectedOptions: the options are listed below as radios, so the
          trait's own line stays the trait rather than becoming the pick. */}
      <TraitContent trait={trait} variant="paragraph">
        {(restrictionNote || (!blockedNote && requiresNote)) && (
          <span className="trait-paragraph-note">
            {' '}
            {[restrictionNote, !blockedNote && requiresNote].filter(Boolean).join(' ')}
          </span>
        )}
        {blockedNote && (
          <span className="trait-paragraph-blocked"> {blockedNote}</span>
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
